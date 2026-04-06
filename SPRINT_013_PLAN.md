# SPRINT 013 — ZOP Evidencije + Automatizacija email narudžbi
## Plan za Claude Code

> Datum: Travanj 2026.  
> Prioritet: 🔴 VISOK — zakonska obveza + ključna diferencijacija vs konkurencije  
> Procijenjeni opseg: 3-4 dana Claude Code rada  
> Temelj: Hrvatski zakoni (verificirani iz NN)

---

## KONTEKST: Zašto ovo radimo

ZNR.admin cloud (naš glavni konkurent) već pokriva ZNR + ZOP + Zaštita okoliša u startu.  
Mi imamo samo djelomičnu ZOP pokrivenost (vatrogasni aparat kao tip opreme, ali **netočni rokovi**).  
Automatizacija email narudžbi = naš jedini differentiator koji **nijedan HR konkurent nema**.

---

## DIO 1: ISPRAVAK ZAKONSKIH ROKOVA (HITNO!)

### Problem: Rokovi za vatrogasne aparate su KRIVI u sustavu

Trenutno u M05: vizualni 1x/god, servis 2x/god — **OVO JE POGREŠNO.**

### Aktualni zakon:

**Pravilnik o vatrogasnim aparatima (NN 101/11, 74/13)**

| Vrsta pregleda | Tko obavlja | Rok | Zakon |
|---------------|-------------|-----|-------|
| Redovni pregled | Vlasnik/korisnik sam | **Svaka 3 MJESECA** | čl. 6 Pr. NN 101/11 |
| Periodički servis | Ovlašteni serviser | Min. **1x godišnje** | čl. 7 Pr. NN 101/11 |
| Kontrolno ispitivanje | Ovlaštena pravna osoba | Svake **5 godina** | čl. 13 Pr. NN 101/11 |

### Akcija za Claude Code:

```sql
-- Ispravak rokova u legal_references tablici
UPDATE legal_references 
SET deadline_days = 90, deadline_description = 'Redovni pregled svakih 90 dana (3 mjeseca) — obavlja vlasnik'
WHERE code = 'ZOP-VA-redovni';

UPDATE legal_references 
SET deadline_days = 365, deadline_description = 'Periodički servis jednom godišnje — ovlašteni serviser'
WHERE code = 'ZOP-VA-servis';

-- Dodati novi zapis za kontrolno ispitivanje (nedostaje)
INSERT INTO legal_references (code, title, article, nn_number, deadline_days, deadline_description, module_codes)
VALUES ('ZOP-VA-kontrolno', 'Pravilnik o vatrogasnim aparatima', 'čl. 13', 'NN 101/11, 74/13', 
        1825, 'Kontrolno ispitivanje svake 5 godina — ovlaštena pravna osoba', ARRAY['M05']);
```

U M05 tablici `equipment`, dodati za `fire_extinguisher` tip tri odvojena datuma:
- `last_owner_check` + `next_owner_check` (90 dana)
- `last_service` + `next_service` (365 dana)  
- `last_control_test` + `next_control_test` (1825 dana)

---

## DIO 2: NOVI ZOP TIPOVI OPREME (M05 proširenje)

### Pravna osnova za sve sustave:

**Zakon o zaštiti od požara (NN 92/10, 114/22), čl. 40:**
> "Ispravnost i funkcionalnost izvedenih stabilnih sustava... provjerava... pravna osoba ovlaštena od strane ministra, **najmanje jednom godišnje**, o čemu se izdaje uvjerenje."

**Pravilnik o provjeri ispravnosti stabilnih sustava zaštite od požara (NN 44/12, 98/21, 89/22)**

### Novi equipment_type-ovi koje Claude Code treba dodati:

```typescript
// Proširenje EquipmentType enum-a
type EquipmentType =
  // Postojeći:
  | 'machine'              // Stroj/uređaj — PR-04, 3 god
  | 'fire_extinguisher'   // Vatrogasni aparat — NOVO: 3 roka
  | 'pressure_vessel'     // Tlačna posuda
  | 'electrical'          // Elektro oprema
  | 'vehicle'             // Vozilo
  | 'lifting'             // Dizalo/viličar
  | 'ppe_equipment'       // PP oprema (maska, kombinezon)
  | 'other'

  // NOVI — ZOP stabilni sustavi:
  | 'hydrant_network'         // Hidrantska mreža
  | 'fire_alarm_system'       // Sustav za dojavu požara (vatrodojava)
  | 'sprinkler_system'        // Sprinkler / stabilni sustav gašenja vodom
  | 'co2_suppression'         // CO2 / prah stabilni sustav gašenja
  | 'emergency_lighting'      // Protupanična / sigurnosna rasvjeta
  | 'gas_detection'           // Detekcija zapaljivih plinova i para
```

### Rokovi po tipu (sve u legal_references tablici):

```
Tip                    | Rok      | Zakon
-----------------------|----------|------------------------------------------
hydrant_network        | 365 dana | ZoZP NN 92/10 čl.40 + Pr. NN 44/12
fire_alarm_system      | 365 dana | ZoZP NN 92/10 čl.40 + Pr. NN 44/12
sprinkler_system       | 365 dana | ZoZP NN 92/10 čl.40 + Pr. NN 44/12
co2_suppression        | 365 dana | ZoZP NN 92/10 čl.40 + Pr. NN 44/12
emergency_lighting     | 365 dana | čl. 42 ZZnR + NN 5/10
gas_detection          | 365 dana | ZoZP NN 92/10 čl.40 + Pr. NN 44/12
electrical (existing)  | 1460 dana| čl. 42 ZZnR + NN 5/10 (4 god)
machine (existing)     | 1095 dana| PR-04 NN 16/16 (3 god)
```

### Kazne ZOP (za alarm UI):
**Zakon o zaštiti od požara (NN 92/10, čl. 62):**
- Pravna osoba: **1.990 — 19.900 EUR**
- Odgovorna osoba: 260 — 1.990 EUR

---

## DIO 3: AUTOMATIZACIJA EMAIL NARUDŽBI — NOVA FUNKCIONALNOST

### Koncept: "Sustav radi sam"

ZNR ERP nije samo evidencija — **aktivno radi umjesto korisnika**.  
Kada se bliži rok, sustav automatski šalje email relevantnoj strani s predloškom narudžbe.

### 3.1 Postavke automatizacije (nova sekcija u /postavke)

**Nova tablica u Supabase: `automation_settings`**

```sql
CREATE TABLE automation_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  
  -- Zdravstveni pregledi
  health_check_enabled BOOLEAN DEFAULT true,
  health_check_advance_days INTEGER DEFAULT 14,        -- koliko dana unaprijed šalje
  health_check_recipient_medicine TEXT,               -- email medicine rada
  health_check_recipient_hr TEXT,                     -- email kadrovske
  health_check_recipient_worker BOOLEAN DEFAULT true, -- šalje i djelatniku
  health_check_template TEXT,                         -- prilagodljivi predložak emaila
  
  -- Vatrogasni aparati - servis
  fire_ext_service_enabled BOOLEAN DEFAULT true,
  fire_ext_service_advance_days INTEGER DEFAULT 14,
  fire_ext_service_recipient TEXT,                    -- email servisa/JVP
  fire_ext_service_recipient_internal TEXT,           -- interni email (sigurnosni)
  
  -- Vatrogasni aparati - redovni pregled (90 dana)
  fire_ext_check_enabled BOOLEAN DEFAULT true,
  fire_ext_check_advance_days INTEGER DEFAULT 7,
  fire_ext_check_recipient_internal TEXT,             -- samo interni (vlasnik obavlja sam)
  
  -- Stabilni sustavi (hidrant, vatrodojava, sprinkler...)
  fire_systems_enabled BOOLEAN DEFAULT true,
  fire_systems_advance_days INTEGER DEFAULT 30,
  fire_systems_recipient TEXT,                        -- email ovlaštene tvrtke za ispitivanje
  fire_systems_recipient_internal TEXT,
  
  -- Radna oprema - strojevi
  equipment_enabled BOOLEAN DEFAULT true,
  equipment_advance_days INTEGER DEFAULT 30,
  equipment_recipient TEXT,                           -- email ovlaštene osobe/servisa
  equipment_recipient_internal TEXT,
  
  -- Osposobljavanja
  training_enabled BOOLEAN DEFAULT true,
  training_advance_days INTEGER DEFAULT 30,
  training_recipient_worker BOOLEAN DEFAULT true,     -- šalje djelatniku
  training_recipient_hr TEXT,                         -- email kadrovske/ZNR stručnjaka
  
  -- Radni okoliš - ispitivanja
  environment_enabled BOOLEAN DEFAULT true,
  environment_advance_days INTEGER DEFAULT 30,
  environment_recipient TEXT,                         -- email ovlaštene mjeriteljske tvrtke
  environment_recipient_internal TEXT,
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(tenant_id)
);

-- RLS
ALTER TABLE automation_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "automation_settings_tenant" ON automation_settings
  FOR ALL USING (tenant_id IN (SELECT auth_tenant_ids()));
```

### 3.2 UI za Postavke — novi tab "Automatizacija"

**Lokacija:** `/postavke` → novi tab "Automatizacija" (pored Tvrtka, Korisnici, Uloge, Zakonske reference)

**Layout po sekcijama:**

```
┌─────────────────────────────────────────────────────┐
│  🩺 ZDRAVSTVENI PREGLEDI                             │
│  ✅ Uključeno                                        │
│  Pošalji [14] dana pred istek                       │
│  Medicina rada: [medicinska@ordinacija.hr        ]  │
│  Kadrovska:     [hr@moja-tvrtka.hr              ]  │
│  ✅ Pošalji i djelatniku                            │
│  [Uredi predložak emaila]                           │
├─────────────────────────────────────────────────────┤
│  🧯 VATROGASNI APARATI — Godišnji servis             │
│  ✅ Uključeno                                        │
│  Pošalji [14] dana pred istek                       │
│  Serviser/JVP:  [servis@jvp-osijek.hr           ]  │
│  Sigurnosni:    [znr@moja-tvrtka.hr             ]  │
├─────────────────────────────────────────────────────┤
│  🧯 VATROGASNI APARATI — Tromjesečni pregled (vlasnik)│
│  ✅ Uključeno                                        │
│  Pošalji [7] dana pred istek                        │
│  Interni: [znr@moja-tvrtka.hr                  ]  │
├─────────────────────────────────────────────────────┤
│  🔥 STABILNI ZOP SUSTAVI (hidrant, vatrodojava...)  │
│  ✅ Uključeno                                        │
│  Pošalji [30] dana pred istek                       │
│  Ispitivač:  [inspekcija@ovlastena-tvrtka.hr   ]  │
│  Interni:    [znr@moja-tvrtka.hr               ]  │
├─────────────────────────────────────────────────────┤
│  ⚙️ RADNA OPREMA — Pregled strojeva                  │
│  ✅ Uključeno                                        │
│  Pošalji [30] dana pred istek                       │
│  Servis:  [servis@tvrtka.hr                    ]  │
│  Interni: [znr@moja-tvrtka.hr                  ]  │
├─────────────────────────────────────────────────────┤
│  📋 OSPOSOBLJAVANJA                                  │
│  ✅ Uključeno                                        │
│  Pošalji [30] dana pred istek                       │
│  ✅ Pošalji djelatniku                              │
│  ZNR/HR: [znr@moja-tvrtka.hr                   ]  │
└─────────────────────────────────────────────────────┘
```

### 3.3 Email predlošci (HTML, šalje Resend)

**A) Narudžba liječničkog pregleda — medicina rada**

```
Predmet: Narudžba na periodički zdravstveni pregled — [IME DJELATNIKA]

Poštovani,

Tvrtka [NAZIV TVRTKE] (OIB: [OIB]) naručuje:

DJELATNIK: [Ime Prezime]
OIB: [OIB djelatnika]
Radno mjesto: [naziv radnog mjesta]
Posebni uvjeti rada: [DA/NE — opis]
Vrsta pregleda: Periodički zdravstveni pregled
Zadnji pregled: [datum]
Rok isteka: [datum]

Molimo vas da predložite termin u roku od 10 dana.
Uputnica (NR-1) bit će dostupna pri dolasku / priložena.

Zakonska osnova: čl. 34 Zakona o zaštiti na radu (NN 71/14)

S poštovanjem,
[Puno ime odgovornog - owner/hr uloga]
[NAZIV TVRTKE]
[email] | [telefon]

---
Ovu poruku generirao je ZNR ERP sustav.
```

**B) Obavijest djelatniku o predstojećem pregledu**

```
Predmet: Obavijest — Zdravstveni pregled istječe za [X] dana

Poštovani/a [Ime],

Obavještavamo Vas da Vaš periodički zdravstveni pregled 
istječe: [datum]

Tvrtka je kontaktirala medicinsku ordinaciju radi narudžbe termina.
O terminu pregleda bit ćete pravovremeno obaviješteni.

Dokumente potrebne za pregled (uputnicu) dobit ćete od 
odgovorne osobe za ZNR.

ZNR ERP | [NAZIV TVRTKE]
```

**C) Narudžba servisa vatrogasnih aparata — serviser/JVP**

```
Predmet: Narudžba godišnjeg servisa vatrogasnih aparata — [NAZIV TVRTKE]

Poštovani,

Tvrtka [NAZIV TVRTKE] (OIB: [OIB]) naručuje godišnji periodički 
pregled i servis vatrogasnih aparata.

LOKACIJA: [adresa tvrtke]

APARATI:
[dinamična tablica: naziv, serijski broj, tip, zadnji servis, rok]

Rok isteka: [najraniji datum]
Molimo potvrdu termina do [datum - 7 dana od slanja].

Zakonska osnova: čl. 7 Pravilnika o vatrogasnim aparatima (NN 101/11)

[potpis]
```

**D) Interni podsjetnik — redovni tromjesečni pregled aparata (vlasnik)**

```
Predmet: ⚠️ Podsjetnik — Tromjesečni pregled vatrogasnih aparata

Interni podsjetnik — ZADATAK ZA ZNR ODGOVORNU OSOBU

Datum sljedeće provjere: [datum]

Aparati koji dolaze na provjeru:
[tablica]

Što provjeriti (čl. 6 Pravilnika NN 101/11):
✓ Uočljivost i dostupnost aparata
✓ Opće stanje i kompletnost
✓ Stanje plombe na zatvaraču
✓ Čitljivost uputa
✓ Masa aparata (vaganje)

Nakon pregleda zabilježite u ZNR ERP sustavu.
```

**E) Narudžba ispitivanja stabilnog ZOP sustava**

```
Predmet: Narudžba godišnjeg ispitivanja [NAZIV SUSTAVA] — [NAZIV TVRTKE]

Poštovani,

Tvrtka [NAZIV TVRTKE] naručuje godišnje periodičko ispitivanje:

SUSTAV: [npr. Sustav za dojavu požara / Hidrantska mreža / Sprinkler]
LOKACIJA: [adresa]
ZADNJE ISPITIVANJE: [datum]
ROK ISTEKA: [datum]

Molimo prijedlog termina do [datum].
Po obavljenom ispitivanju izdaje se uvjerenje o ispravnosti.

Zakonska osnova: čl. 40 Zakona o zaštiti od požara (NN 92/10)
                 Pravilnik NN 44/12, 98/21, 89/22

[potpis]
```

### 3.4 Backend implementacija — Supabase Edge Function + pg_cron

**Edge Function: `send-automation-emails`**

```typescript
// supabase/functions/send-automation-emails/index.ts

import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'

const resend = new Resend(Deno.env.get('RESEND_API_KEY'))
const supabase = createClient(...)

Deno.serve(async () => {
  // Dohvati sve tenante s uključenom automatizacijom
  const { data: settings } = await supabase
    .from('automation_settings')
    .select('*, tenants(*)')
    .eq('health_check_enabled', true)

  for (const setting of settings) {
    const advanceDays = setting.health_check_advance_days // npr. 14
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() + advanceDays)

    // Pronađi preglede koji ističu točno za advanceDays dana
    const { data: expiring } = await supabase
      .from('health_checks')
      .select('*, workers(*), work_positions(*)')
      .eq('tenant_id', setting.tenant_id)
      .eq('status', 'active')
      .lte('next_check_date', cutoffDate.toISOString().split('T')[0])
      .gte('next_check_date', new Date().toISOString().split('T')[0])
      // Dodati provjeru da email nije već poslan za ovaj ciklus
      .is('automation_email_sent_at', null)

    for (const check of expiring) {
      // Pošalji email medicini rada
      if (setting.health_check_recipient_medicine) {
        await resend.emails.send({
          from: 'znr@znr-erp.hr', // ili onboarding@resend.dev dok nema domene
          to: setting.health_check_recipient_medicine,
          subject: `Narudžba na periodički zdravstveni pregled — ${check.workers.first_name} ${check.workers.last_name}`,
          html: buildHealthCheckOrderEmail(check, setting.tenants)
        })
      }

      // Pošalji email kadrovskoj
      if (setting.health_check_recipient_hr) {
        await resend.emails.send({
          from: 'znr@znr-erp.hr',
          to: setting.health_check_recipient_hr,
          subject: `[ZNR] Zdravstveni pregled — ${check.workers.first_name} ${check.workers.last_name} ističe za ${advanceDays} dana`,
          html: buildInternalNotificationEmail(check, setting.tenants)
        })
      }

      // Pošalji email djelatniku
      if (setting.health_check_recipient_worker && check.workers.email) {
        await resend.emails.send({
          from: 'znr@znr-erp.hr',
          to: check.workers.email,
          subject: `Obavijest — Vaš zdravstveni pregled istječe za ${advanceDays} dana`,
          html: buildWorkerNotificationEmail(check, setting.tenants)
        })
      }

      // Označi da je email poslan (spriječava duplikate)
      await supabase
        .from('health_checks')
        .update({ automation_email_sent_at: new Date().toISOString() })
        .eq('id', check.id)
    }
  }

  // TODO: Isto za fire_extinguisher, equipment, trainings, fire_systems...
  
  return new Response(JSON.stringify({ ok: true }))
})
```

**pg_cron job (pokrenuti jednom dnevno u 07:00):**

```sql
-- U Supabase SQL Editoru:
SELECT cron.schedule(
  'automation-emails-daily',
  '0 7 * * *',  -- svaki dan u 07:00 UTC (09:00 HR ljeti)
  $$
  SELECT net.http_post(
    url := 'https://nezvlavmduedcaiaumgi.supabase.co/functions/v1/send-automation-emails',
    headers := jsonb_build_object(
      'Authorization', 'Bearer ' || current_setting('app.service_role_key'),
      'Content-Type', 'application/json'
    ),
    body := '{}'::jsonb
  );
  $$
);
```

**Polje za praćenje poslanog emaila (dodati u migraciji):**

```sql
-- Migracija 013a: automation tracking
ALTER TABLE health_checks ADD COLUMN automation_email_sent_at TIMESTAMPTZ;
ALTER TABLE equipment ADD COLUMN automation_email_sent_at TIMESTAMPTZ;
ALTER TABLE trainings ADD COLUMN automation_email_sent_at TIMESTAMPTZ;
-- Reset polje kad korisnik unese novi datum (trigger)
```

---

## DIO 4: KOMPLETNA LISTA AUTOMATIZACIJA

### Sve što sustav može raditi SAM:

| # | Okidač | Primatelji | Akcija sustava | Zakon |
|---|--------|-----------|----------------|-------|
| 1 | Zdravstveni pregled ističe za X dana | Medicina rada + HR + Djelatnik | Email narudžba s podacima o djelatniku | čl. 34 ZZnR |
| 2 | Vatrogasni aparat — servis ističe | Serviser/JVP + ZNR odgovorna osoba | Email narudžba s listom aparata | Pr. NN 101/11 |
| 3 | Vatrogasni aparat — 3mj pregled | ZNR odgovorna osoba (interni) | Email podsjetnik sa checklistom što provjeriti | Pr. NN 101/11 |
| 4 | Stabilni ZOP sustav ističe | Ovlaštena ispitivačka tvrtka + ZNR | Email narudžba ispitivanja s podacima o sustavu | ZoZP čl. 40 |
| 5 | Radna oprema ističe | Ovlašteni serviser + ZNR interni | Email narudžba pregleda s listom opreme | PR-04 NN 16/16 |
| 6 | Osposobljavanje ističe | Djelatnik + ZNR/HR | Email obavijest o predstojećem usavršavanju | čl. 27 ZZnR |
| 7 | Novi djelatnik (bez osposobljavanja 30d) | ZNR stručnjak + HR | Email upozorenje: rokovi se bliže | čl. 27 ZZnR |
| 8 | Ispitivanje radnog okoliša ističe | Ovlaštena mjeriteljska tvrtka + ZNR | Email narudžba mjerenja | PR-05 |
| 9 | OZO rok zamjene | HR + Djelatnik | Email podsjetnik za narudžbu OZO | PR-06 NN 5/21 |
| 10 | Vježba evakuacije — nije provedena (god.) | ZNR + Uprava | Email upozorenje: rok istječe | čl. 45 ZZnR |
| 11 | Procjena rizika — rok revizije | ZNR stručnjak | Email podsjetnik za reviziju | čl. 18 ZZnR |
| 12 | Ozljeda na radu — HZZO 48h | ZNR + HR + Uprava | Email ODMAH s podsjetnikom i uputom za prijavu | čl. 62 ZZnR |
| 13 | 50+ radnika — novi radnik peta deseta | Uprava + ZNR | Email obavijest: aktivirale se nove zakonske obveze | čl. 20 ZZnR |
| 14 | Odbor ZNR — rok sjednice | Predsjednik odbora + ZNR | Email podsjetnik za sazivanje sjednice | čl. 70 ZZnR |

### Automatizacije koje rade ODMAH (ne po rasporedu):

- **#12 Ozljeda** → trigger na `INSERT` u `incidents` tablicu → Edge Function odmah
- **#13 Prag 50 radnika** → trigger na `UPDATE workers SET status='active'` kad COUNT = 50

---

## DIO 5: BAZA PODATAKA — MIGRACIJE

### Migracija 013a — automation_settings tablica

```sql
-- [ZAK: automatizacija ne zahtijeva poseban propis — implementacija zakonskih rokova]
CREATE TABLE automation_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  
  -- Zdravstveni pregledi
  health_check_enabled BOOLEAN DEFAULT true,
  health_check_advance_days INTEGER DEFAULT 14,
  health_check_recipient_medicine TEXT,
  health_check_recipient_hr TEXT,
  health_check_notify_worker BOOLEAN DEFAULT true,
  health_check_email_template TEXT,
  
  -- PP aparati
  fire_ext_service_enabled BOOLEAN DEFAULT true,
  fire_ext_service_advance_days INTEGER DEFAULT 14,
  fire_ext_service_recipient_external TEXT,
  fire_ext_service_recipient_internal TEXT,
  
  fire_ext_quarterly_enabled BOOLEAN DEFAULT true,
  fire_ext_quarterly_advance_days INTEGER DEFAULT 7,
  fire_ext_quarterly_recipient_internal TEXT,

  -- Stabilni ZOP sustavi  
  fire_systems_enabled BOOLEAN DEFAULT true,
  fire_systems_advance_days INTEGER DEFAULT 30,
  fire_systems_recipient_external TEXT,
  fire_systems_recipient_internal TEXT,
  
  -- Radna oprema
  equipment_enabled BOOLEAN DEFAULT true,
  equipment_advance_days INTEGER DEFAULT 30,
  equipment_recipient_external TEXT,
  equipment_recipient_internal TEXT,
  
  -- Osposobljavanja
  training_enabled BOOLEAN DEFAULT true,
  training_advance_days INTEGER DEFAULT 30,
  training_notify_worker BOOLEAN DEFAULT true,
  training_recipient_hr TEXT,
  
  -- Radni okoliš
  environment_enabled BOOLEAN DEFAULT true,
  environment_advance_days INTEGER DEFAULT 30,
  environment_recipient_external TEXT,
  environment_recipient_internal TEXT,
  
  -- OZO
  ozo_enabled BOOLEAN DEFAULT true,
  ozo_advance_days INTEGER DEFAULT 30,
  ozo_notify_worker BOOLEAN DEFAULT true,
  ozo_recipient_hr TEXT,
  
  -- Evakuacija
  evacuation_enabled BOOLEAN DEFAULT true,
  evacuation_advance_days INTEGER DEFAULT 60,
  evacuation_recipient_internal TEXT,

  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(tenant_id)
);

ALTER TABLE automation_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "automation_settings_all" ON automation_settings
  FOR ALL USING (tenant_id IN (SELECT auth_tenant_ids()));

-- Auto-kreiraj za svaki novi tenant
CREATE OR REPLACE FUNCTION create_default_automation_settings()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  INSERT INTO automation_settings (tenant_id) VALUES (NEW.id)
  ON CONFLICT DO NOTHING;
  RETURN NEW;
END;
$$;

CREATE TRIGGER tenant_automation_settings_trigger
  AFTER INSERT ON tenants
  FOR EACH ROW EXECUTE FUNCTION create_default_automation_settings();
```

### Migracija 013b — tracking stupci za sprječavanje duplikata

```sql
-- Dodaj tracking na sve relevantne tablice
ALTER TABLE health_checks 
  ADD COLUMN automation_email_sent_at TIMESTAMPTZ,
  ADD COLUMN automation_email_sent_for_date DATE; -- za koji rok je email poslan

ALTER TABLE equipment 
  ADD COLUMN automation_email_sent_at TIMESTAMPTZ,
  ADD COLUMN automation_email_sent_for_date DATE;

ALTER TABLE trainings 
  ADD COLUMN automation_email_sent_at TIMESTAMPTZ,
  ADD COLUMN automation_email_sent_for_date DATE;

ALTER TABLE environment_tests
  ADD COLUMN automation_email_sent_at TIMESTAMPTZ,
  ADD COLUMN automation_email_sent_for_date DATE;

ALTER TABLE evacuations
  ADD COLUMN automation_email_sent_at TIMESTAMPTZ;

ALTER TABLE ozo_records
  ADD COLUMN automation_email_sent_at TIMESTAMPTZ;

-- Trigger: resetiraj sent_at kad se unese novi datum
CREATE OR REPLACE FUNCTION reset_automation_tracking()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.next_check_date != OLD.next_check_date THEN
    NEW.automation_email_sent_at = NULL;
    NEW.automation_email_sent_for_date = NULL;
  END IF;
  RETURN NEW;
END;
$$;
-- (Primijeniti na svaku tablicu)
```

### Migracija 013c — novi ZOP equipment tipovi + ispravak rokova

```sql
-- Ispravak vatrogasnih aparata — 3 odvojena datuma
ALTER TABLE equipment
  ADD COLUMN fire_ext_last_owner_check DATE,
  ADD COLUMN fire_ext_next_owner_check DATE,      -- redovni, 90 dana
  ADD COLUMN fire_ext_last_service DATE,
  ADD COLUMN fire_ext_next_service DATE,          -- periodički, 365 dana
  ADD COLUMN fire_ext_last_control_test DATE,
  ADD COLUMN fire_ext_next_control_test DATE;     -- kontrolno, 1825 dana (5 god)

-- Ispravak legal_references (vatrogasni aparati)
-- [ZAK: Pravilnik o vatrogasnim aparatima NN 101/11, čl. 6, 7, 13]
INSERT INTO legal_references (code, title, article, nn_number, deadline_days, deadline_description, module_codes, is_active)
VALUES 
  ('ZOP-VA-redovni-90d', 'Pravilnik o vatrogasnim aparatima', 'čl. 6', 'NN 101/11, 74/13', 
   90, 'Redovni pregled svakih 90 dana — obavlja vlasnik/korisnik sam', ARRAY['M05'], true),
  ('ZOP-VA-servis-365d', 'Pravilnik o vatrogasnim aparatima', 'čl. 7', 'NN 101/11, 74/13',
   365, 'Periodički servis min. jednom godišnje — ovlašteni serviser', ARRAY['M05'], true),
  ('ZOP-VA-kontrolno-1825d', 'Pravilnik o vatrogasnim aparatima', 'čl. 13', 'NN 101/11, 74/13',
   1825, 'Kontrolno ispitivanje svake 5 godina — ovlaštena pravna osoba', ARRAY['M05'], true),
  ('ZOP-hidrant-365d', 'Zakon o zaštiti od požara', 'čl. 40', 'NN 92/10, 114/22',
   365, 'Ispitivanje hidrantske mreže min. jednom godišnje — ovlaštena pravna osoba', ARRAY['M05'], true),
  ('ZOP-vatrodojava-365d', 'Pravilnik o provjeri ispravnosti stabilnih sustava', 'čl. 40 ZoZP', 'NN 44/12, 98/21, 89/22',
   365, 'Periodičko ispitivanje sustava vatrodojave min. jednom godišnje', ARRAY['M05'], true),
  ('ZOP-sprinkler-365d', 'Zakon o zaštiti od požara', 'čl. 40', 'NN 92/10, 114/22',
   365, 'Ispitivanje sprinkler/stabilnih sustava gašenja min. jednom godišnje', ARRAY['M05'], true),
  ('ZOP-co2-365d', 'Zakon o zaštiti od požara', 'čl. 40', 'NN 92/10, 114/22',
   365, 'Ispitivanje CO2/prah stabilnih sustava gašenja min. jednom godišnje', ARRAY['M05'], true),
  ('ZOP-sig-rasvjeta-365d', 'Zakon o zaštiti na radu', 'čl. 42', 'NN 71/14 + NN 5/10',
   365, 'Ispitivanje protupaničke/sigurnosne rasvjete jednom godišnje', ARRAY['M05'], true),
  ('ZOP-plin-detekcija-365d', 'Zakon o zaštiti od požara', 'čl. 40', 'NN 92/10, 114/22',
   365, 'Ispitivanje sustava detekcije zapaljivih plinova jednom godišnje', ARRAY['M05'], true)
ON CONFLICT (code) DO UPDATE SET 
  deadline_days = EXCLUDED.deadline_days,
  deadline_description = EXCLUDED.deadline_description;
```

---

## DIO 6: UI KOMPONENTE

### 6.1 Novi tab u Postavkama — "Automatizacija"

**Komponenta:** `src/modules/M00-postavke/AutomatizacijaTab.tsx`

Prikazuje sve sekcije iz `automation_settings`.  
Svaka sekcija: toggle, advance_days slider, email input polja, preview predloška.

### 6.2 Indikator u Akcijskom centru

Kada je automatizacija poslala email → prikaži badge "📧 Narudžba poslana X dana"  
Korisnik vidi da je sustav već reagirao.

### 6.3 Log automatizacije (bonus)

Nova tablica `automation_log` koja bilježi svaki poslani email:
```
tenant_id | email_type | recipient | sent_at | entity_id | entity_type | status
```
Korisnik može u Postavkama vidjeti history poslanog:  
"📧 14.04.2026 — Narudžba medicine rada za Ana Perić (zdravstveni pregled 28.04.2026)"

---

## DIO 7: REDOSLIJED IMPLEMENTACIJE

### Prioriteti za Claude Code:

**ODMAH (Sprint 013a) — 1 dan:**
1. Ispravak rokova vatrogasnih aparata u legal_references (kritično — zakon!)
2. Migracija 013a — automation_settings tablica
3. UI tab "Automatizacija" u Postavkama — forma s email adresama
4. Osnovi: pošalji email za zdravstveni pregled (health_check_enabled)

**TJEDAN 2 (Sprint 013b) — 2 dana:**
5. Migracija 013b i 013c — tracking stupci + novi equipment tipovi
6. UI za novi tipovi opreme u M05 (hidrant, vatrodojava, sprinkler...)
7. Automation za vatrogasne aparate (service + quarterly check)
8. Automation za stabilne ZOP sustave

**TJEDAN 3 (Sprint 013c) — 1 dan:**
9. Automation za opremu, osposobljavanja, okoliš, OZO
10. Automation log (history poslanog)
11. Badge u Akcijskom centru ("Narudžba poslana")
12. pg_cron setup + testiranje svih flowova

---

## DIO 8: POSTAVKE → EMAILOVI — Kompletna lista adresa

Za svaki tenant u Postavkama → Automatizacija, korisnik unosi:

```
MEDICINA RADA (za narudžbe pregleda):
└── Adresa ordinacije medicine rada: [email]

KADROVSKI / ZNR (interni):
└── Kadrovska služba / HR: [email]
└── ZNR odgovorna osoba: [email]
└── Uprava / direktor (za hitne alarme): [email]

VANJSKI SERVISERI / ISPITIVAČI:
└── Serviser vatrogasnih aparata / JVP: [email]
└── Ovlaštena tvrtka za ZOP ispitivanja: [email]
└── Ovlaštena tvrtka za radni okoliš: [email]
└── Serviser radne opreme: [email]
```

---

## ZAKONSKI SAŽETAK — Za audit i inspekciju

| Sustav | Zakon | Rok | Kazna |
|--------|-------|-----|-------|
| VA redovni pregled | Pr. NN 101/11 čl. 6 | 90 dana | ZoZP: 1.990–19.900 EUR |
| VA servis | Pr. NN 101/11 čl. 7 | 365 dana | ZoZP: 1.990–19.900 EUR |
| VA kontrolno ispitivanje | Pr. NN 101/11 čl. 13 | 5 god | ZoZP: 1.990–19.900 EUR |
| Vatrodojava | ZoZP NN 92/10 čl.40 | 365 dana | ZoZP: 1.990–19.900 EUR |
| Hidrantska mreža | ZoZP NN 92/10 čl.40 | 365 dana | ZoZP: 1.990–19.900 EUR |
| Sprinkler/CO2 sustavi | ZoZP NN 92/10 čl.40 | 365 dana | ZoZP: 1.990–19.900 EUR |
| Sig. rasvjeta | ZZnR čl.42 + NN 5/10 | 365 dana | ZZnR: 5.000–50.000 EUR |
| El. instalacije | ZZnR čl.42 + NN 5/10 | 4 god | ZZnR: 5.000–50.000 EUR |
| Zdravstveni pregled | čl. 34 ZZnR | 1-3 god | ZZnR: 5.000–50.000 EUR |
| Osposobljavanja | čl. 27 ZZnR | 4 god | ZZnR: 5.000–50.000 EUR |
| Radna oprema | PR-04 NN 16/16 | 3 god | ZZnR: 5.000–50.000 EUR |
| Radni okoliš | PR-05 | 2-3 god | ZZnR: 5.000–50.000 EUR |
| Evakuacijska vježba | čl. 45 ZZnR | 1 god | ZZnR: 5.000–50.000 EUR |
| Ozljeda HZZO | čl. 62 ZZnR | 48 sati | ZZnR: 5.000–50.000 EUR |

---

*SPRINT_013_PLAN.md — ZOP + Automatizacija email narudžbi*  
*Autor: Atila Vadoci + Claude (Anthropic) | Travanj 2026.*  
*Zakonska provjera: NN verifikacija iz baze Narodnih novina RH*
