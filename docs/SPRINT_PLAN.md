# ZNR ERP — Sprint Plan

## Status

| Sprint | Fokus | Status |
|--------|-------|--------|
| 001 | Foundation: Auth + Supabase + Vite + Tailwind + deploy | ✅ Završeno |
| 002 | Onboarding wizard — registracija tvrtke | ✅ Završeno |
| 003 | M01 Djelatnici — CRUD + dosje + import Carta d.o.o. | ✅ Završeno |
| 004 | M03 Osposobljavanja + alarmi + status engine | ✅ Završeno |
| 005 | M04 Zdravstveni pregledi + auto next_check | ✅ Završeno |
| 006 | M05 Radna oprema + vatrogasni aparati | ✅ Završeno |
| 007 | M11 Akcijski centar — agregacija alarma | ✅ Završeno |
| 008 | PDF: EK-1, EK-2, EK-4, EK-5, ZOS (@react-pdf) | ✅ Završeno |
| 009 | M02 Radna mjesta + procjena rizika | ✅ Završeno |
| 010 | M08 Ozljede na radu — 48h HZZO alarm | ✅ Završeno |
| 011 | ZNR stručnjak multi-klijent flow | ✅ Završeno |
| 012 | M12 Inspekcijska mapa (CSV/JSON export) | ✅ Završeno |

## MVP kompletiran: 2026-04-06

## Git commitovi

| Commit | Opis |
|--------|------|
| `4ccdcaf` | Sprint 001-003: foundation, onboarding, M01 djelatnici |
| `f36a624` | Sprint 004: M03 osposobljavanja CRUD |
| `1444c2f` | Sprint 005: M04 zdravstveni pregledi CRUD |
| `17ed7d5` | Sprint 006: M05 radna oprema CRUD |
| `2ea37b1` | Sprint 007: M11 akcijski centar |
| `c414e5b` | Sprint 009: M02 radna mjesta + procjena rizika |
| `bf3727b` | Sprint 010: M08 ozljede na radu |
| `ba1487c` | Sprint 011: ZNR stručnjak multi-klijent |
| `ca94087` | Sprint 012: M12 inspekcijska mapa |
| `d70ce3f` | Sprint 008: PDF obrasci (EK-1, EK-2, EK-4, EK-5, ZOS) |
| `9445b14` | Dashboard, postavke, M06/M07/M09/M10 puni CRUD |
| `3eb4fb4` | Akcijski centar agregacija fix + eslint + migracije 010-011 |
| `2702fda` | Sprint 013: ZOP evidencije + automatizacija email narudžbi |
| `7e27472` | Edge Function send-automation-emails deployed |
| `ed764e3` | Deploy prep — SPA redirects, remove API key |
| `822925e` | CF redeploy trigger |
| `954eced` | Email FROM → noreply@znr-erp.com |
| `30b598b` | Remove GH Actions deploy job (CF auto-deploys) |
| `40dcc6e` | Docs update v5 |

## Supabase migracije

| # | Naziv | Opis |
|---|-------|------|
| 001 | schema | 10 tablica, triggeri, indeksi |
| 002 | rls_policies | RLS + auth_tenant_ids() helper |
| 003 | legal_seed | 16 zakonskih referenci (2 deaktivirane u 013) |
| 004 | audit_triggers | GDPR čl. 5(2) audit log |
| 005 | onboarding_rpc | create_tenant_with_owner |
| 006 | harden_search_path | Security remediation (advisor lint) |
| 007 | workers_import_prep | Relax NOT NULL, add email/phone |
| 008 | tasks_alarm | tasks tablica + auto-alarm trigger |
| 009 | workers_position_fk | FK constraint za PostgREST join |
| 010 | incidents | Ozljede tablica + 48h HZZO trigger |
| 011 | specialist_invite_rpc | invite + accept RPC za stručnjake |
| 012 | environment_evacuations_ozo_sds | M06/M07/M09/M10 tablice |
| 013 | zop_automation | 9 ZOP legal refs, automation_settings, automation_log, tracking stupci, fire_ext polja |

## Preostali rad (post-MVP)

- Email alarmi (Resend + Supabase Edge Function + pg_cron)
- QR kod za opremu (generiranje + public endpoint)
- Digitalni potpis flow (email link "Potvrđujem")
- OIR-1 / ER-2 HZZO obrasci (PDF)
- M06 Radni okoliš, M07 OZO, M09 Evakuacija, M10 SDS
- Inspekcijska mapa kao pravi ZIP (JSZip biblioteka)
- Seed stvarnih ZNR podataka iz Atiline Excel tablice

## Pravilo za svaki sprint

1. Claude Code čita `CLAUDE.md` i ovaj plan
2. Implementira sprint prema specifikaciji
3. Na kraju piše `ANALIZA.md`
4. Atila učitava `ANALIZA.md` u idući razgovor

## Faza 0 — Paralelno s razvojem

Razgovori s ZNR stručnjacima i poslodavcima.
Cilj: potvrditi platežno sposoban problem.
Pilot tenant: Carta d.o.o. (Osijek, 52 djelatnika).
