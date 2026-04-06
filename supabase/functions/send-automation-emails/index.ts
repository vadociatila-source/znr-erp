// Supabase Edge Function: send-automation-emails
// Poziva se dnevno kroz pg_cron (07:00 UTC = 09:00 HR ljeti)
// Za svaki tenant provjerava automation_settings i šalje emailove
// za sve module čiji rokovi ističu u sljedećih X dana.
//
// [ZAK] Svaki email referencira zakonsku osnovu i rok.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY")!
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

// FROM adresa — dok nema verificirane domene koristi Resend test
const FROM_EMAIL = "ZNR ERP <onboarding@resend.dev>"

interface EmailPayload {
  from: string
  to: string
  subject: string
  html: string
}

async function sendEmail(payload: EmailPayload): Promise<boolean> {
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    })
    return res.ok
  } catch {
    return false
  }
}

async function logEmail(
  tenantId: string, emailType: string, recipient: string,
  subject: string, entityType?: string, entityId?: string, status = "sent"
) {
  await supabase.from("automation_log").insert({
    tenant_id: tenantId, email_type: emailType, recipient, subject,
    entity_type: entityType ?? null, entity_id: entityId ?? null, status,
  })
}

// ── Zdravstveni pregledi ────────────────────────────────────────
async function processHealthChecks(tenantId: string, settings: Record<string, unknown>, tenantName: string, tenantOib: string) {
  if (!settings.health_check_enabled) return

  const advanceDays = (settings.health_check_advance_days as number) ?? 14
  const cutoff = new Date()
  cutoff.setDate(cutoff.getDate() + advanceDays)

  const { data: checks } = await supabase
    .from("health_checks")
    .select("*, worker:workers!worker_id(first_name, last_name, oib, email, department)")
    .eq("tenant_id", tenantId)
    .lte("next_check_date", cutoff.toISOString().slice(0, 10))
    .gte("next_check_date", new Date().toISOString().slice(0, 10))
    .is("automation_email_sent_at", null)

  for (const check of checks ?? []) {
    const w = check.worker as Record<string, string> | null
    if (!w) continue
    const workerName = `${w.first_name} ${w.last_name}`

    // Email medicini rada
    const recipientMedicine = settings.health_check_recipient_medicine as string
    if (recipientMedicine) {
      const subject = `Narudžba na periodički zdravstveni pregled — ${workerName}`
      const html = `
        <p>Poštovani,</p>
        <p>Tvrtka <strong>${tenantName}</strong> (OIB: ${tenantOib}) naručuje:</p>
        <table style="border-collapse:collapse;margin:16px 0">
          <tr><td style="padding:4px 12px;color:#666">DJELATNIK:</td><td style="padding:4px 12px"><strong>${workerName}</strong></td></tr>
          <tr><td style="padding:4px 12px;color:#666">OIB:</td><td style="padding:4px 12px">${w.oib ?? "—"}</td></tr>
          <tr><td style="padding:4px 12px;color:#666">Odjel:</td><td style="padding:4px 12px">${w.department ?? "—"}</td></tr>
          <tr><td style="padding:4px 12px;color:#666">Vrsta pregleda:</td><td style="padding:4px 12px">Periodički zdravstveni pregled</td></tr>
          <tr><td style="padding:4px 12px;color:#666">Zadnji pregled:</td><td style="padding:4px 12px">${check.check_date}</td></tr>
          <tr><td style="padding:4px 12px;color:#666">Rok isteka:</td><td style="padding:4px 12px">${check.next_check_date}</td></tr>
        </table>
        <p>Molimo vas da predložite termin u roku od 10 dana.</p>
        <p style="color:#888;font-size:12px">Zakonska osnova: čl. 34 Zakona o zaštiti na radu (NN 71/14)<br>
        Ovu poruku generirao je ZNR ERP sustav.</p>
      `
      const ok = await sendEmail({ from: FROM_EMAIL, to: recipientMedicine, subject, html })
      await logEmail(tenantId, "health_check_order", recipientMedicine, subject, "health_check", check.id, ok ? "sent" : "failed")
    }

    // Email HR/ZNR
    const recipientHr = settings.health_check_recipient_hr as string
    if (recipientHr) {
      const subject = `[ZNR] Zdravstveni pregled — ${workerName} ističe za ${advanceDays} dana`
      const html = `<p>Djelatnik <strong>${workerName}</strong> ima zdravstveni pregled koji ističe ${check.next_check_date}.</p>
        <p>Narudžba je automatski poslana medicini rada.</p>
        <p style="color:#888;font-size:12px">ZNR ERP — ${tenantName}</p>`
      await sendEmail({ from: FROM_EMAIL, to: recipientHr, subject, html })
      await logEmail(tenantId, "health_check_internal", recipientHr, subject, "health_check", check.id)
    }

    // Email djelatniku
    if (settings.health_check_notify_worker && w.email) {
      const subject = `Obavijest — Vaš zdravstveni pregled istječe za ${advanceDays} dana`
      const html = `<p>Poštovani/a ${w.first_name},</p>
        <p>Obavještavamo Vas da Vaš periodički zdravstveni pregled istječe: <strong>${check.next_check_date}</strong></p>
        <p>Tvrtka je kontaktirala medicinsku ordinaciju radi narudžbe termina.</p>
        <p style="color:#888;font-size:12px">ZNR ERP | ${tenantName}</p>`
      await sendEmail({ from: FROM_EMAIL, to: w.email, subject, html })
    }

    // Označi da je email poslan
    await supabase.from("health_checks")
      .update({ automation_email_sent_at: new Date().toISOString(), automation_email_sent_for_date: check.next_check_date })
      .eq("id", check.id)
  }
}

// ── Vatrogasni aparati — servis ─────────────────────────────────
async function processFireExtService(tenantId: string, settings: Record<string, unknown>, tenantName: string) {
  if (!settings.fire_ext_service_enabled) return

  const advanceDays = (settings.fire_ext_service_advance_days as number) ?? 14
  const cutoff = new Date()
  cutoff.setDate(cutoff.getDate() + advanceDays)

  const { data: equipment } = await supabase
    .from("equipment")
    .select("*")
    .eq("tenant_id", tenantId)
    .eq("equipment_type", "fire_extinguisher")
    .eq("status", "active")
    .lte("next_inspection_date", cutoff.toISOString().slice(0, 10))
    .gte("next_inspection_date", new Date().toISOString().slice(0, 10))
    .is("automation_email_sent_at", null)

  if (!equipment?.length) return

  const recipient = settings.fire_ext_service_recipient_external as string
  if (recipient) {
    const rows = equipment.map(e => `<tr><td style="padding:4px 8px">${e.name}</td><td style="padding:4px 8px">${e.serial_number ?? "—"}</td><td style="padding:4px 8px">${e.next_inspection_date}</td></tr>`).join("")
    const subject = `Narudžba godišnjeg servisa vatrogasnih aparata — ${tenantName}`
    const html = `
      <p>Poštovani,</p>
      <p>Tvrtka <strong>${tenantName}</strong> naručuje godišnji periodički pregled i servis vatrogasnih aparata.</p>
      <table style="border-collapse:collapse;margin:16px 0;width:100%">
        <tr style="background:#f1f5f9"><th style="padding:6px 8px;text-align:left">Aparat</th><th style="padding:6px 8px;text-align:left">Ser. br.</th><th style="padding:6px 8px;text-align:left">Rok</th></tr>
        ${rows}
      </table>
      <p>Molimo potvrdu termina.</p>
      <p style="color:#888;font-size:12px">Zakonska osnova: čl. 7 Pravilnika o vatrogasnim aparatima (NN 101/11)<br>ZNR ERP</p>
    `
    const ok = await sendEmail({ from: FROM_EMAIL, to: recipient, subject, html })
    await logEmail(tenantId, "fire_ext_service", recipient, subject, "equipment", undefined, ok ? "sent" : "failed")
  }

  // Označi sve kao poslane
  for (const e of equipment) {
    await supabase.from("equipment")
      .update({ automation_email_sent_at: new Date().toISOString() })
      .eq("id", e.id)
  }
}

// ── Osposobljavanja ─────────────────────────────────────────────
async function processTrainings(tenantId: string, settings: Record<string, unknown>, tenantName: string) {
  if (!settings.training_enabled) return

  const advanceDays = (settings.training_advance_days as number) ?? 30
  const cutoff = new Date()
  cutoff.setDate(cutoff.getDate() + advanceDays)

  const { data: trainings } = await supabase
    .from("trainings")
    .select("*, worker:workers!worker_id(first_name, last_name, email)")
    .eq("tenant_id", tenantId)
    .lte("valid_until", cutoff.toISOString().slice(0, 10))
    .gte("valid_until", new Date().toISOString().slice(0, 10))
    .is("automation_email_sent_at", null)

  for (const t of trainings ?? []) {
    const w = t.worker as Record<string, string> | null
    if (!w) continue

    const recipientHr = settings.training_recipient_hr as string
    if (recipientHr) {
      const subject = `[ZNR] Osposobljavanje ističe — ${w.first_name} ${w.last_name}`
      const html = `<p>Osposobljavanje <strong>${t.training_name}</strong> za djelatnika ${w.first_name} ${w.last_name} ističe ${t.valid_until}.</p>
        <p style="color:#888;font-size:12px">čl. 27 ZZnR | ZNR ERP — ${tenantName}</p>`
      await sendEmail({ from: FROM_EMAIL, to: recipientHr, subject, html })
      await logEmail(tenantId, "training_expiry", recipientHr, subject, "training", t.id)
    }

    if (settings.training_notify_worker && w.email) {
      const subject = `Obavijest — Vaše osposobljavanje istječe za ${advanceDays} dana`
      const html = `<p>Poštovani/a ${w.first_name},</p>
        <p>Vaše osposobljavanje <strong>${t.training_name}</strong> istječe ${t.valid_until}.</p>
        <p style="color:#888;font-size:12px">ZNR ERP | ${tenantName}</p>`
      await sendEmail({ from: FROM_EMAIL, to: w.email, subject, html })
    }

    await supabase.from("trainings")
      .update({ automation_email_sent_at: new Date().toISOString() })
      .eq("id", t.id)
  }
}

// ── Main handler ────────────────────────────────────────────────
serve(async (_req) => {
  try {
    const { data: allSettings } = await supabase
      .from("automation_settings")
      .select("*, tenant:tenants!tenant_id(id, name, oib)")

    let processed = 0

    for (const row of allSettings ?? []) {
      const tenant = row.tenant as Record<string, string> | null
      if (!tenant) continue

      const tenantId = tenant.id
      const tenantName = tenant.name ?? "—"
      const tenantOib = tenant.oib ?? "—"
      const settings = row as Record<string, unknown>

      await processHealthChecks(tenantId, settings, tenantName, tenantOib)
      await processFireExtService(tenantId, settings, tenantName)
      await processTrainings(tenantId, settings, tenantName)
      // TODO: processEnvironment, processEvacuations, processOzo, processFireSystems
      processed++
    }

    return new Response(JSON.stringify({ ok: true, tenants_processed: processed }), {
      headers: { "Content-Type": "application/json" },
    })
  } catch (err) {
    return new Response(JSON.stringify({ ok: false, error: String(err) }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }
})
