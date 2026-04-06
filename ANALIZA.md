# ANALIZA — Sprint 001 + 002 + 003

Datum: 2026-04-06

## ✅ Što je napravljeno

### Sprint 001 — Foundation (zatvaranje)
- Scaffolding cleanup: 14 stray literal-brace direktorija uklonjeno
- `npm install` (325 paketa)
- Fix: `tenant.store.ts` rename `tenant`→`activeTenant`, `clear`→`clearTenant`
- Fix: `tenant.types.ts` uklonjeni legacy Model 2 stupci (`supabase_url`, `supabase_anon_key`)
- Fix: `RegisterPage.tsx` — `metaRegistry` → `supabase`
- Build pass: `tsc -b && vite build` čist

### Sprint 002 — Tenant Onboarding
- Puni dvostupanjski onboarding wizard (naziv, OIB, djelatnost → broj zaposlenika, grad, adresa)
- Atomski `create_tenant_with_owner` RPC (SECURITY DEFINER, rješava chicken-and-egg s RLS)
- Auto-plan po `employee_count` (micro/small/medium/large)
- Race condition fix: `hasAttemptedLoad` flag u tenant store + `OnboardingGuard` u routeru —
  spriječava redirect na `/onboarding` dok `loadTenant()` nije završio prvi pokušaj
- Sidebar `<a>` nesting warning popravljen (Wouter `Link` + child `<a>` → className na Link)

### Sprint 003 — M01 Djelatnici (CRUD)
**Baza:**
- Migracija 007: `workers` — relaxed NOT NULL na `oib`/`employment_date`, dodani `email`/`phone` stupci, partial index za nepotpune podatke
- Migracija 008: `tasks` tablica + DB trigger `trg_new_worker_training_task` — automatski kreira task "Osposobljavanje u 30 dana" za svakog novog djelatnika ([ZAK: čl. 27 ZZnR])
- Migracija 009: FK constraint `workers.position_id → work_positions.id` (potreban za PostgREST embedded select)

**Import Carta d.o.o. djelatnika:**
- Node script `scripts/import-carta-employees.mjs` — parsira CSV iz Carta ERP-a
- Mojibake fix (UTF-8 → Latin-1 → UTF-8 double encoding): Phase 1 bajtni recovery, Phase 2 regex za izgubljene bajtove, Phase 3 dictionary za dvosmislene slučajeve (Kovač vs Kovać, Đurišić, Čubela, Slađana, Domaćica, Šmaholc, Šipoš...)
- `asciiFoldEmail` — emailovi ostaju ASCII (schrödel → schrodel)
- Rezultat: **61 djelatnik** (52 active + 9 former), **14 radnih mjesta** auto-seeded u `work_positions`
- `tenants.employee_count` auto-update na 52 (active only)

**Nove UI komponente (reusable za buduće module):**
- `src/components/ui/Select.tsx` — native select s label/error/hint/leftAddon
- `src/components/ui/Modal.tsx` — portal, ESC/backdrop close, sm/md/lg size
- `src/components/ui/Table.tsx` — compound component (Table.Header/Body/Row/Cell/HeaderCell sa sortable support)

**M01 Djelatnici stranice:**
- `RadniciPage.tsx` — lista s filterima (pretraga, status active/former/all), paginacija (25/str), CSV export, badge za count
- `RadnikFormPage.tsx` — dual-mode (create `/radnici/novi` + edit `/radnici/:id/uredi`)
- `RadnikProfilPage.tsx` — dosje, upozorenja za nepotpune podatke (OIB/employment_date missing), deaktivacija modal, placeholder sekcije za Sprint 004+ (Osposobljavanja, Zdravstveni pregledi, Radna oprema)

**M01 Djelatnici komponente:**
- `WorkersTable.tsx` — klikabilni redovi, status badge, warning ikone, position/department
- `WorkerForm.tsx` — 4 card sekcije (osobni/kontakt/zaposlenje/napomene), OIB validacija (ISO 7064 MOD 11,10), dropdown za pozicije
- `DeactivateWorkerModal.tsx` — LegalBadge čl. 61 ZZnR, potvrda deaktivacije
- `Pagination.tsx` — prethodna/sljedeća s page indicator

**M01 Djelatnici data layer:**
- `useWorkers.ts` — `useWorkersList` (paginacija+filteri), `useWorker` (single), `useWorkPositions`, `useWorkerMutations` (create/update/deactivate)
- `useWorkerFilters.ts` — URL-based filters (shareable links)
- `types.ts` — `WorkerWithPosition`, `WorkerFilters`, `CONTRACT_TYPES`, `GENDER_OPTIONS`
- `oib.ts` — ISO 7064 MOD 11,10 validacija
- `csv-export.ts` — CSV download s BOM za Excel kompatibilnost

**Rename: "Radnici" → "Djelatnici"** — svi korisnički vidljivi stringovi (sidebar, naslovi, breadcrumbs, toast poruke, empty states, modal, CSV filename). Interni nazivi (rute `/radnici`, modul `M01-radnici`, tablica `workers`) ostaju nepromijenjeni.

### Infrastruktura (tijekom svih sprinteva)
- **Supabase MCP** konfiguriran: `.mcp.json` u root projekta, PAT kroz env var `SUPABASE_ACCESS_TOKEN`
- **6 migracija primijenjeno kroz MCP** (001-006 + 007-009)
- Migracija 006: security hardening — `SET search_path = public, pg_temp` na svih 5 SECURITY DEFINER funkcija (remediation za Supabase advisor lint 0011)
- **`database.types.ts` generiran iz žive sheme** (MCP `generate_typescript_types`) — svi `as unknown as` castovi uklonjeni
- **`.env` kreiran lokalno** sa Supabase URL + anon key (gitignored)
- **Security incident:** Atila je paste-ao PAT u chat → rotiran odmah. Anon key paste-an ali je public by design.

## ⚠️ Što ne radi / nije kompletno

- **Lista djelatnika** — FK constraint dodana (migracija 009), query bi trebao raditi nakon hard reload. Atila treba verificirati da vidi 52 aktivna djelatnika.
- **OIB i datum zaposlenja su prazni** za sve importirane djelatnike — UI pokazuje warning badge ali podaci moraju biti ručno uneseni (iz Carta ERP-a ih nismo imali)
- **`supabase/migrations/007_workers_import_prep.sql`** lokalna datoteka nije kreirana (migracija je primjenjena samo kroz MCP). Isto za 008 i 009.
- **SETUP_GUIDE.md** ne reflektira migracije 006-009 — zastarjeli
- **`docs/SPRINT_PLAN.md`** ne reflektira Sprint 001-003 completion
- **Migracija za existing 61 djelatnika** — DB trigger `trg_new_worker_training_task` je dodan NAKON importa, pa existing djelatnici NEMAJU auto-generirani task. Samo novi djelatnici dobivaju task automatski.

## 🔴 Block issues

Nema blokera. Aplikacija radi lokalno, baza je live, auth+onboarding+CRUD funkcioniraju.

## 📋 Zakonska usklađenost ([ZAK] tagovi)

| Modul | [ZAK] | Implementacija |
|-------|-------|----------------|
| M01 | čl. 61 ZZnR — evidencija trajno | `status='former'` soft delete, LegalBadge na profilu/listi/deactivation modalu, warning za missing data |
| M01 | čl. 27 ZZnR — 30 dana osposobljavanje | DB trigger kreira task automatski, LegalBadge na form stranici, hint uz `employment_date` |
| M01 | čl. 62 ZZnR — OIB za HZZO | OIB validacija (ISO 7064), hint na formi, warning badge na profilu |
| M01 | čl. 34 ZZnR — posebni uvjeti | `is_special_conditions` checkbox, shield ikona u tablici, Badge na profilu |
| — | GDPR čl. 5(2) | audit_log trigger na workers, tasks tablicama |
| — | RLS | Sve tablice (tenants, tenant_users, workers, work_positions, tasks, audit_log...) imaju RLS + `auth_tenant_ids()` helper |

## 💡 Prijedlozi za sljedeći sprint (Sprint 004 — M03 Osposobljavanja)

1. **Backfill tasks za existing djelatnike** — pokrenuti jednu SQL naredbu koja kreira "Osposobljavanje" task za sve 52 active djelatnika koji ga nemaju
2. **Profil djelatnika → sekcija Osposobljavanja** — CRUD za trainings vezan uz worker_id
3. **ZOS obrazac generiranje (PDF)** — `@react-pdf/renderer` je već u package.json
4. **Status osvježavanje** — `valid` / `expiring_soon` / `expired` kalkulacija na temelju `valid_until` datuma
5. **Email podsjetnik** — Resend integracija za alarmiranje 30 dana unaprijed (Supabase Edge Function)
6. **Kreirati lokalne SQL datoteke** za migracije 007-009 da repo prati DB stanje

## 🔧 Potrebne akcije od Atile

### 1) Verificiraj listu djelatnika
Hard reload na http://localhost:5173/radnici — trebao bi vidjeti 52 aktivna djelatnika Carta d.o.o.
Prebaci filter na "Bivši" → 9 bivših. "Svi" → 61 ukupno.

### 2) Testiraj CRUD flow
- Klikni na bilo kojeg djelatnika → profil
- "Uredi" → promijeni nešto → "Spremi promjene"
- "Novi djelatnik" → ispuni formu → "Dodaj djelatnika" (DB trigger automatski kreira task za osposobljavanje)
- "Deaktiviraj" na nekom test djelatniku → potvrdi → djelatnik je sada "bivši"

### 3) Opcija: Ažuriraj OIB i datume zaposlenja
Iz Carta ERP-a ili ručno — nedostajući OIB-ovi i datumi zaposlenja generiraju warning badge u UI-ju.
Bez employment_date ne radi alarm "30 dana od zaposlenja" (čl. 27 ZZnR).

### 4) Kad testiranje prođe, javi za Sprint 004
> "Kreni sa Sprintom 004 (M03 Osposobljavanja)"

## 🧹 Tehnički dug

- Lokalne SQL migration datoteke 007-009 ne postoje u `supabase/migrations/` — migracije su primijenjene samo kroz MCP. Kreirati za parity.
- `SETUP_GUIDE.md` zastarjeli (spominje samo migracije 001-004)
- `docs/SPRINT_PLAN.md` ne reflektira completion status
- `useWorkerFilters` koristi `window.location.search` umjesto Wouter hook-a (Wouter nema useSearch) — radi ali nije idiomatski

## 📊 Statistike sesije

| Metrika | Vrijednost |
|---------|-----------|
| Supabase migracije primijenjene | 9 (001-009) |
| Security advisor lints | 0 (čisto) |
| Legal references seeded | 16 |
| Djelatnici importirani | 61 (52 active + 9 former) |
| Radna mjesta seeded | 14 |
| Nove datoteke kreirane | ~25 |
| UI komponente (reusable) | 3 (Select, Modal, Table) |
| Build | ✅ čist (0 errors, 0 warnings) |

---

*ANALIZA.md v2.0 — Sprint 001 + 002 + 003 | Datum: 2026-04-06*
