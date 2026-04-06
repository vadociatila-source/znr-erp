# ZNR ERP — Sprint Plan

## Status

| Sprint | Fokus | Status |
|--------|-------|--------|
| 001 | Foundation: Auth + Supabase + Vite + Tailwind + deploy | ✅ Završeno |
| 002 | Onboarding wizard — registracija tvrtke | ✅ Završeno |
| 003 | M01 Djelatnici — CRUD + dosje + import Carta d.o.o. | ✅ Završeno |
| 004 | M03 Osposobljavanja + alarmi + ZOS PDF | ⏳ Sljedeći |
| 005 | M04 Zdravstveni pregledi + uputnica PDF | 📋 |
| 006 | M05 Radna oprema + vatrogasni aparati + QR | 📋 |
| 007 | M11 Akcijski centar | 📋 |
| 008 | PDF komplet: EK-1, EK-2, EK-4, EK-5, ZOS | 📋 |
| 009 | M02 Radna mjesta + procjena rizika | 📋 |
| 010 | M08 Ozljede + OIR-1 + ER-2 (48h alarm) | 📋 |
| 011 | ZNR stručnjak multi-klijent flow (Tip C) | 📋 |
| 012 | M12 Inspekcijska mapa (ZIP) — MVP ✅ | 📋 |

## Legenda
- ✅ Završeno
- 🚧 U toku
- ⏳ Sljedeći
- 📋 Planiran

## Što je napravljeno

### Sprint 001 (2026-04-05)
- Vite + React 18 + TS strict + Tailwind setup
- Supabase projekt (nezvlavmduedcaiaumgi) — migracije 001-006
- Auth: Login/Register (Supabase Auth), session management (Zustand)
- RLS na svim tablicama, audit_log triggeri (GDPR čl. 5(2))
- 16 zakonskih referenci seeded (legal_references)
- Cloudflare Pages inicijalni deploy setup

### Sprint 002 (2026-04-05)
- Onboarding wizard (2 koraka: tvrtka + veličina/lokacija)
- `create_tenant_with_owner` RPC (SECURITY DEFINER, atomsko kreiranje)
- Auto-plan po employee_count, OIB validacija
- Race condition fix: `hasAttemptedLoad` + `OnboardingGuard`
- Pilot tenant: **Carta d.o.o.** (Osijek, prerađivačka industrija, 52 djelatnika)

### Sprint 003 (2026-04-06)
- M01 Djelatnici CRUD (lista, profil/dosje, dodaj/uredi, deaktiviraj)
- Filteri (pretraga, status), paginacija (25/str), CSV export
- Import 61 djelatnika iz Carta ERP CSV (mojibake fix za HR znakove)
- 14 radnih mjesta auto-seeded u work_positions
- DB trigger za auto-alarm "Osposobljavanje 30 dana" (čl. 27 ZZnR)
- Nove UI komponente: Select, Modal, Table (compound)
- OIB validacija (ISO 7064 MOD 11,10)
- Supabase MCP integracija (migracije 007-009 kroz MCP)

## Supabase migracije

| # | Naziv | Opis |
|---|-------|------|
| 001 | schema | 10 tablica, triggeri, indeksi |
| 002 | rls_policies | RLS + auth_tenant_ids() helper |
| 003 | legal_seed | 16 zakonskih referenci |
| 004 | audit_triggers | GDPR čl. 5(2) audit log |
| 005 | onboarding_rpc | create_tenant_with_owner |
| 006 | harden_search_path | Security remediation (advisor lint) |
| 007 | workers_import_prep | Relax NOT NULL, add email/phone |
| 008 | tasks_alarm | tasks tablica + auto-alarm trigger |
| 009 | workers_position_fk | FK constraint za PostgREST join |

## Pravilo za svaki sprint

1. Claude Code čita `CLAUDE.md` i ovaj plan
2. Implementira sprint prema specifikaciji
3. Na kraju piše `ANALIZA.md`:
   - Što je napravljeno
   - Što ne radi / blokirano
   - Zakonska usklađenost ([ZAK] tagovi)
   - Što treba Atila (credentials, odluke)
4. Atila učitava `ANALIZA.md` u ovaj Claude project → nastavak

## Faza 0 — Paralelno s razvojem

Razgovori s ZNR stručnjacima i poslodavcima.  
Cilj: potvrditi platežno sposoban problem.  
Pilot: ZNR stručnjak kojeg kontaktiramo u Fazi 0.
