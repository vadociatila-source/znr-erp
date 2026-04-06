# ANALIZA — MVP Kompletiran (Sprint 001–012)

Datum: 2026-04-06

## ✅ Što je napravljeno

### Sprint 001–003 (Foundation + Onboarding + M01 Djelatnici)
- Vite + React 18 + TS strict + Tailwind + Wouter + Zustand + Supabase
- Auth (login/register), session management, onboarding wizard
- `create_tenant_with_owner` RPC (SECURITY DEFINER)
- Race condition fix (`hasAttemptedLoad` + `OnboardingGuard`)
- M01 Djelatnici CRUD: lista/profil/dodaj/uredi/deaktiviraj
- Import 61 djelatnika Carta d.o.o. iz CSV (mojibake fix)
- 14 radnih mjesta auto-seeded, OIB validacija (ISO 7064)
- UI komponente: Button, Input, Card, Badge, Spinner, Alert, Select, Modal, Table

### Sprint 004 — M03 Osposobljavanja
- CRUD hooks + status engine (valid/expiring_soon/expired)
- Auto-fill: initial=trajno, refresher=+4god, legal ref auto-link
- Integracija u profil djelatnika (live lista + "Dodaj" gumb)

### Sprint 005 — M04 Zdravstveni pregledi
- CRUD hooks + auto next_check_date (+3god za periodički)
- Result badge (Sposoban/S ograničenjima/Nesposoban)
- Integracija u profil djelatnika

### Sprint 006 — M05 Radna oprema
- CRUD + inspection status engine
- Auto next_inspection: stroj +3god, vatrogasni aparat +1god
- Equipment types: 8 vrsta (stroj, vatrogasni aparat, PP, tlačna posuda...)

### Sprint 007 — M11 Akcijski centar
- Agregacija alarma iz tasks + trainings + health_checks + equipment
- 4 statistička kartice (critical/urgent/warning/info), klik = filter
- AlarmCard s LegalBadge, rok, navigacija na entitet
- 52 backfilled taska za existing djelatnike

### Sprint 008 — PDF obrasci
- EK-1: Evidencijski karton zaposlenika (čl. 61 ZZnR)
- EK-2: Evidencija o osposobljavanju (čl. 27 ZZnR)
- EK-4: Evidencija o zdravstvenim pregledima (čl. 34 ZZnR)
- EK-5: Evidencija o radnoj opremi (PR-04 NN 16/16)
- ZOS: Zapisnik o ocjeni osposobljenosti (čl. 27 ZZnR)
- "PDF dosje" gumb na profilu djelatnika → EK-1 + EK-2 + EK-4
- Zajednički stilovi, download helper (@react-pdf/renderer)

### Sprint 009 — M02 Radna mjesta + Procjena rizika
- CRUD + risk assessment status engine
- Auto next revision: +2god (čl. 18 ZZnR)
- Posebni uvjeti rada checkbox

### Sprint 010 — M08 Ozljede na radu
- Migracija 010: incidents tablica + auto-task trigger (48h HZZO)
- 48h status engine (ok/urgent/critical)
- Alert "HITNO — 48h za prijavu HZZO" s kaznom
- Auto report_deadline = incident_date + 48h

### Sprint 011 — ZNR stručnjak multi-klijent
- Migracija 011: invite_znr_specialist + accept_specialist_invite RPC
- Stručnjak dashboard: lista klijenata, switch between tenants, alarm indikatori

### Sprint 012 — M12 Inspekcijska mapa
- Jedan klik → download svih ZNR evidencija (CSV + JSON bundle)
- Djelatnici, osposobljavanja, pregledi, oprema, ozljede, radna mjesta

## 📊 Statistike

| Metrika | Vrijednost |
|---------|-----------|
| Git commitova | 10 |
| Supabase migracije | 11 (001–011) |
| Supabase tablice | 12 (+ audit_log) |
| Legal references seeded | 16 |
| Djelatnici (Carta d.o.o.) | 61 (52 active + 9 former) |
| Radna mjesta seeded | 14 |
| PDF obrasci | 5 (EK-1, EK-2, EK-4, EK-5, ZOS) |
| UI komponente (reusable) | 8 (Button, Input, Card, Badge, Spinner, Alert, Select, Modal, Table) |
| Build | ✅ čist (0 errors) |

## 📋 Zakonska usklađenost

| Modul | [ZAK] | Implementacija |
|-------|-------|----------------|
| M01 | čl. 61 ZZnR — evidencija trajno | Soft delete, LegalBadge, warning za missing data |
| M03 | čl. 27 ZZnR — 30 dana + 4 god | DB trigger auto-task, status engine, PDF EK-2/ZOS |
| M04 | čl. 34 ZZnR — periodički pregledi | Auto +3god, result badge, PDF EK-4 |
| M05 | PR-04 NN 16/16 — oprema 3 god | Auto +3god/+1god (vatrogasni), inspection status, PDF EK-5 |
| M08 | čl. 62 ZZnR — 48h HZZO | DB trigger HITNI task, 48h countdown, kazna badge |
| M02 | čl. 18 ZZnR — procjena rizika 2 god | Auto +2god, risk assessment status |
| M11 | Akcijski centar | Agregacija svih alarma s [ZAK] referencama |
| — | GDPR čl. 5(2) | audit_log trigger na svim ZNR tablicama |
| — | RLS | Sve tablice imaju RLS + auth_tenant_ids() |

## ⚠️ Poznati tehnički dug / preostali rad

1. **Email alarmi (Resend)** — hooks i data layer postoje, ali Supabase Edge Function za slanje emailova nije implementirana. Treba: pg_cron job koji provjerava tasks due_date i poziva Edge Function.
2. **QR kod za opremu** — `qr_code_token` postoji u tablici ali QR generiranje/prikazivanje nije implementirano.
3. **Digitalni potpis flow** — ZOS/uputnica imaju polja za potpis ali email link "Potvrđujem" nije implementiran.
4. **OIR-1 / ER-2 obrasci** — specifični HZZO PDF obrasci za ozljede nisu implementirani (samo generička forma).
5. **Lokalne SQL datoteke** za migracije 010-011 ne postoje u `supabase/migrations/`.
6. **M06 Radni okoliš, M07 OZO, M09 Evakuacija, M10 SDS** — stub stranice, nisu implementirani (izvan MVP opsega).
7. **Seed stvarnih podataka** — čekamo Atilin Excel sutra za popunjavanje osposobljavanja, pregleda, opreme.

## 🔧 Potrebne akcije od Atile

### 1) Testiraj MVP
- http://localhost:5173 → prođi kroz svaki modul u sidebaru
- Profil djelatnika → "PDF dosje" → provjeri generirane PDFove
- Akcijski centar → trebao bi vidjeti 52 pending taska za osposobljavanje
- Inspekcijska mapa (Izvješća) → "Preuzmi" → provjeri downloadane CSV-ove

### 2) Sutra: donesi Excel s ZNR podacima
- Osposobljavanja (tko, kada, vrsta, rok)
- Zdravstveni pregledi (tko, kada, rezultat, sljedeći)
- Radna oprema (naziv, vrsta, serijski, zadnji/sljedeći pregled)
- Ja ću napraviti seed skriptu kao za Carta CSV import

### 3) Push na GitHub
Ako GitHub repo još nije spojen:
```bash
git remote add origin https://github.com/vadociatila-source/znr-erp.git
git push -u origin main
```

---

*ANALIZA.md v3.0 — MVP kompletiran | 12 sprintova | 2026-04-06*
