# ZNR ERP — Claude Code upute

> **Ovo je tvoja biblija.** Pročitaj cijeli dokument prije svakog zadatka.  
> Projekt: ZNR ERP — Standalone SaaS za zaštitu na radu (HR tržište)  
> Developer: Atila Vadoci | GitHub: vadociatila-source | Email: vadociatila@gmail.com  
> Stack verzija: April 2026

## 🔑 Ključni podaci projekta

| Resurs | Vrijednost |
|--------|-----------|
| GitHub | github.com/vadociatila-source/znr-erp |
| Production | https://znr-erp.pages.dev |
| Supabase | https://nezvlavmduedcaiaumgi.supabase.co (ZNR projekt, vadociatila@gmail.com) |
| Resend | simpliapp4 account (simpliapp4@gmail.com) — key u GitHub Secrets |
| Cloudflare | Pages → Connect to Git → vadociatila-source/znr-erp |

## ⚠️ Arhitekturna napomena

**ZNR ERP je standalone SaaS produkt** — nije vezan za Cartu.  
ZNR ERP je standalone SaaS — nema hardkodiranog klijenta u kodu.  
Carta ERP = potpuno odvojen projekt s vlastitom bazom. Integracija je opcionalna budućnost, ne hard requirement.  
Claude Code piše generičan multi-tenant kod — bez hardkodiranja ikojeg klijenta.  
**UI terminologija:** korisnik vidi "Djelatnici" (ne "Radnici"). Interni nazivi (rute, modul, tablica) ostaju nepromijenjeni.  
**Pilot tenant:** Carta d.o.o. (Osijek, prerađivačka industrija, 52 active + 9 former djelatnika).

## 0. MISIJA PROJEKTA

ZNR ERP rješava jedan konkretan problem: **~150.000 hrvatskih tvrtki mora po zakonu voditi evidenciju zaštite na radu — nitko to ne radi kako treba, rokovi ističu, inspektori dolaze, kazne su 5.000–50.000 EUR.**

Mi smo jedino rješenje koje:
- Je dizajnirano za **HR zakone** (ZZnR + pravilnici) — ne generički EHS
- Prikazuje **zakonski okvir uz svaki alarm** (čl. + rok + kazna)
- Ima **proaktivni Akcijski centar** — jedno mjesto, sve hitno
- Ima **ZNR stručnjak multi-klijent dashboard** — distribucijski kanal
- Generira **Inspekcijsku mapu jednim klikom** — ZIP za inspektora

---

## 1. NEPROMJENJIVA PRAVILA (nikad ne krši)

### PRAVILO #1 — ZAKON PRVI
Za svaki novi feature, model, alarm ili dokument:
1. Navedi koji zakon/pravilnik ga pokriva (npr. `čl. 27 ZZnR NN 71/14`)
2. Navedi točan zakonski rok (dani, godine)
3. Predloži UI poruku koja korisniku objašnjava zakonsku osnovu
4. Označi u kodu: `// [ZAK: čl.27 ZZnR NN71/14] Osposobljavanje 30 dana od zaposlenja`

### PRAVILO #2 — ROKOVI SU NEPROMJENJIVI
Rokovi nisu "best practice" — to su kazne 5.000–50.000 EUR.
**Nikad** ne zaobidji alarm. **Nikad** ne skrati rok bez zakonske osnove.

### PRAVILO #3 — LEGAL_REFERENCES TABLICA
Svaki zakonski rok mora biti u `legal_references` tablici u Supabase.
**NIKAD** ne hard-kodiraj rokove u aplikacijski kod. Uvijek referencirati tablicu.
Razlog: kad se zakon promijeni → samo `UPDATE` u tablici, bez deploya.

### PRAVILO #4 — ZAK TAG U KODU
```typescript
// [ZAK: čl.27 ZZnR NN71/14] Osposobljavanje u roku 30 dana od zaposlenja
// [ZAK: PR-04 NN16/16] Pregled radne opreme max. svake 3 godine  
// [ZAK: GDPR čl.5(2)] Audit log — accountability princip
```

### PRAVILO #5 — KORISNIK VIDI ZAKON
Svaka obavijest, alarm, tooltip u UI sadrži:
- Zakonsku referencu: `čl. 27 ZZnR`
- Rok: `30 dana od zaposlenja`
- Sankciju gdje relevantno: `Kazna: 5.000–50.000 EUR`

### PRAVILO #6 — AUDIT LOG UVIJEK
Svaka tablica koja sadrži osobne/ZNR podatke ima trigger za `audit_log`.
Nije opcija — to je **GDPR čl. 5(2) obveza**.

### PRAVILO #7 — RLS NA SVEMU
Svaka tablica u tenant Supabase projektu ima Row Level Security (RLS).
Nikad ne ostavljaj tablicu bez RLS politike.

### PRAVILO #8 — TYPESCRIPT STRICT
```typescript
// tsconfig: "strict": true — UVIJEK
// Nikad: any (osim u edge casevima s komentarom)
// Uvijek: explicit return types na funkcijama
```

---

## 2. STACK I VERZIJE

```
Frontend:
  React 18.3+          Komponente, hooks
  TypeScript 5.4+      Strict mode, no-any
  Vite 5.2+            Build tool, dev server
  Wouter 3.x           Router (lagani, bez React Router bloataa)
  Zustand 4.x          State management (store per domain)
  Tailwind CSS 3.4+    Styling (utility-first)

Backend:
  Supabase             PostgreSQL, Auth, Storage, Realtime
  pg_cron              Scheduled alarm jobs
  Supabase RLS         Row Level Security na svakoj tablici

Email:
  Resend               Transakcijski emailovi (alarmi, pozivnice)

PDF:
  @react-pdf/renderer  Generiranje PDF dokumenata (klijentska strana)
  jsPDF (fallback)     Za jednostavnije dokumente

Deployment:
  Cloudflare Pages     Frontend hosting
  GitHub Actions       CI/CD pipeline

Package manager: npm
Node: 20+ (LTS)
```

---

## 3. MULTI-TENANT ARHITEKTURA

### Model 1: jedna baza, RLS izolacija

```
JEDAN Supabase projekt (novi, odvojeni account)
└── Jedna PostgreSQL baza
    ├── tenants              ← sve registrirane tvrtke
    ├── tenant_users         ← tko ima pristup čemu
    ├── znr_specialist_clients ← ZNR stručnjak → N klijenata
    ├── workers              ← svi radnici, filtrirani RLS-om
    ├── trainings            ← sva osposobljavanja, filtrirani RLS-om
    ├── health_checks        ← svi pregledi, filtrirani RLS-om
    ├── equipment            ← sva oprema, filtrirani RLS-om
    ├── legal_references     ← globalno (ZZnR vrijedi za sve u HR)
    └── audit_log            ← GDPR, filtrirano po tenant_id
```

**RLS (Row Level Security)** — svaka tablica ima politiku:
```sql
-- Primjer: user vidi samo radnike svoje tvrtke
CREATE POLICY "workers_read" ON workers
  FOR SELECT USING (tenant_id IN (SELECT auth_tenant_ids()));
-- auth_tenant_ids() = helper funkcija koja vraća tenant_id-ove
-- kojima je autenticirani user član
```

### Implementacija u kodu

```typescript
// src/lib/supabase.ts — JEDAN client za cijelu aplikaciju
import { createClient } from '@supabase/supabase-js'
export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
)
// Nema factory funkcija. Nema dinamičkih klijenata.
// RLS automatski filtrira podatke po tenantu.

// Svaki upit automatski vidi samo podatke svog tenanta:
const { data } = await supabase
  .from('workers')
  .select('*')
  // .eq('tenant_id', ...) — NIJE POTREBNO! RLS to radi automatski.
```

### Uloge korisnika

```typescript
type UserRole = 
  | 'owner'           // vlasnik/direktor — puna prava
  | 'hr'              // HR osoba — gotovo puna prava
  | 'znr_specialist'  // interni ZNR stručnjak — puna prava
  | 'delegate'        // povjerenik radnika — read-only za ZNR
  | 'worker'          // radnik — read-only vlastiti dosje

// Posebno:
type ExternalSpecialist = {
  // ZNR stručnjak koji vodi VIŠE klijenata
  // Nema radni odnos s klijentom
  // Pristupa kroz znr_specialist_clients tablicu u zajedničkoj bazi
}
```

---

## 4. FOLDER STRUKTURA

```
znr-erp/
├── CLAUDE.md                    ← OVO ČITAŠ
├── README.md
├── package.json
├── vite.config.ts
├── tsconfig.json
├── tailwind.config.ts
├── .env.example
├── .gitignore
├── index.html
│
├── src/
│   ├── main.tsx
│   ├── App.tsx
│   ├── vite-env.d.ts
│   │
│   ├── lib/
│   │   ├── supabase.ts           # Meta-registry Supabase client
│   │   ├── supabase.ts           # Jedan client za cijelu aplikaciju
│   │   └── legal-references.ts  # [ZAK] Legal references loader
│   │
│   ├── store/
│   │   ├── auth.store.ts         # User, session
│   │   ├── tenant.store.ts       # Active tenant, tenant client
│   │   └── legal.store.ts        # Loaded legal_references
│   │
│   ├── router/
│   │   └── index.tsx             # Wouter routes
│   │
│   ├── hooks/
│   │   ├── useAuth.ts
│   │   ├── useTenant.ts
│   │   ├── useLegalRef.ts        # Hook za dohvat zakonskih referenci
│   │   └── useAlarms.ts          # Hook za alarm engine
│   │
│   ├── components/
│   │   ├── ui/                   # Design system
│   │   │   ├── Button.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Badge.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Select.tsx
│   │   │   ├── Modal.tsx
│   │   │   ├── Table.tsx
│   │   │   ├── Alert.tsx
│   │   │   └── Spinner.tsx
│   │   ├── layout/
│   │   │   ├── AppLayout.tsx     # Glavni layout s Sidebarom
│   │   │   ├── Sidebar.tsx       # Navigacija po modulima
│   │   │   └── Header.tsx        # Top bar s alarmima
│   │   └── legal/
│   │       ├── LegalBadge.tsx    # "čl. 27 ZZnR" badge
│   │       └── LegalTooltip.tsx  # Hover → zakonski okvir
│   │
│   ├── modules/                  # ZNR moduli
│   │   ├── M01-radnici/
│   │   ├── M02-radna-mjesta/
│   │   ├── M03-osposobljavanja/
│   │   ├── M04-zdravstveni-pregledi/
│   │   ├── M05-radna-oprema/
│   │   ├── M06-radni-okolis/
│   │   ├── M07-ozo/
│   │   ├── M08-ozljede/
│   │   ├── M09-evakuacija/
│   │   ├── M10-sds/
│   │   ├── M11-akcijski-centar/
│   │   └── M12-izvjesca/
│   │
│   ├── pages/
│   │   ├── auth/
│   │   │   ├── LoginPage.tsx
│   │   │   └── RegisterPage.tsx
│   │   ├── onboarding/
│   │   │   └── OnboardingPage.tsx
│   │   └── dashboard/
│   │       └── DashboardPage.tsx
│   │
│   └── types/
│       ├── database.types.ts     # Supabase generated (ažuriraj nakon migracija)
│       ├── legal.types.ts        # LegalReference, AlarmLevel tipovi
│       └── tenant.types.ts       # Tenant, UserRole, TenantUser tipovi
│
├── supabase/
│   
│   │   └── migrations/
│   │       └── 001_initial.sql   # Tenants, users, specialists
│   └── tenant/
│       └── migrations/
│           ├── 001_legal_references.sql  # [ZAK] Seed data
│           ├── 002_workers.sql
│           ├── 003_workplaces.sql
│           ├── 004_trainings.sql
│           ├── 005_health_checks.sql
│           └── 006_equipment.sql
│
└── docs/
    ├── SPRINT_PLAN.md
    ├── ARCHITECTURE.md
    └── LEGAL_FRAMEWORK.md
```

---

## 5. SPRINT PLAN — STATUS

> **Svih 12 sprintova dovršeno (2026-04-06).** MVP je kompletiran.
> Detaljan status i commitovi u `docs/SPRINT_PLAN.md`.

| Sprint | Modul | Status |
|--------|-------|--------|
| 001 | Foundation + Auth | ✅ |
| 002 | Onboarding wizard | ✅ |
| 003 | M01 Djelatnici CRUD | ✅ |
| 004 | M03 Osposobljavanja | ✅ |
| 005 | M04 Zdravstveni pregledi | ✅ |
| 006 | M05 Radna oprema | ✅ |
| 007 | M11 Akcijski centar | ✅ |
| 008 | PDF: EK-1, EK-2, EK-4, EK-5, ZOS | ✅ |
| 009 | M02 Radna mjesta + procjena rizika | ✅ |
| 010 | M08 Ozljede 48h HZZO | ✅ |
| 011 | ZNR stručnjak multi-klijent | ✅ |
| 012 | M12 Inspekcijska mapa | ✅ |

### Sprint 012 — M12 Inspekcijska mapa
**Cilj:** Jedan klik → ZIP za inspektora — killer feature.
- [ ] Agregira sve zakonski obvezne dokumente
- [ ] Generira ZIP arhivu s PDFovima
- [ ] Godišnje izvješće (statistika, rokovi)
- [ ] M09 Evakuacija i vježbe (osnove)
- **Output:** Inspekcijska mapa radi. MVP je kompletan.

---

## 6. BAZA PODATAKA — KONVENCIJE

### Tablice u zajedničkoj bazi
tenants, tenant_users, znr_specialist_clients, legal_references, workers, trainings, health_checks, equipment, audit_log

### Tablice u tenant projektu
```sql
-- Konvencije:
-- Snake_case za sve
-- UUID primary keys (gen_random_uuid())
-- created_at / updated_at TIMESTAMPTZ na svakoj tablici
-- created_by / updated_by UUID (user ID)
-- status TEXT s enum check (active/inactive/deleted — nikad brisati!)
-- Svaka tablica ima odgovarajući RLS
-- Svaka promjena ide u audit_log

-- Standardni stupci na svakoj tablici:
id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
created_by UUID,  -- Supabase auth.users().id
updated_by UUID
```

### [ZAK] Tablica legal_references
Ovo je srce sustava. Svaki alarm, svaki rok, svaka UI poruka uzima podatke odavde.

```typescript
interface LegalReference {
  id: string
  code: string              // npr. "ZZnR-27-30d"
  title: string             // "Zakon o zaštiti na radu"
  article: string | null    // "čl. 27"
  nn_number: string | null  // "NN 71/14, 118/14, 94/18, 96/18"
  effective_date: string | null
  description: string | null // "Osposobljavanje novog radnika"
  deadline_days: number | null // 30 (null = nije fiksni rok)
  deadline_description: string | null // "30 dana od dana zaposlenja"
  module_codes: string[]    // ["M03"]
  is_active: boolean
  superseded_by: string | null
  last_verified: string | null
  source_url: string | null
}
```

---

## 7. UI KONVENCIJE

### Boje alarma (uvijek konzistentno)
```typescript
const ALARM_COLORS = {
  critical: 'bg-red-50 border-red-500 text-red-800',    // isteklo, 48h
  urgent:   'bg-orange-50 border-orange-400 text-orange-800', // uskoro (<30d)
  warning:  'bg-yellow-50 border-yellow-400 text-yellow-800', // nadomak (<60d)
  info:     'bg-blue-50 border-blue-400 text-blue-800',  // informacija
  ok:       'bg-green-50 border-green-400 text-green-800' // uredano
} as const
```

### LegalBadge — UVIJEK uz alarm
```tsx
// Svaki alarm mora imati zakonsku referencu vidljivu korisniku
<LegalBadge 
  article="čl. 27 ZZnR" 
  deadline="30 dana od zaposlenja"
  penalty="Kazna: 5.000–50.000 EUR"  // samo za kritične
/>
```

### Paginacija, filtriranje, pretraživanje
- Svaki popis (tablica) ima: pretraživanje, filtre, paginaciju (25 po stranici)
- Filteri su URL-based (shareable links)
- Export: CSV + PDF za sve popise

---

## 8. GITHUB + DEPLOYMENT

### GitHub workflow
```bash
main branch       # production — Cloudflare Pages deploya automatski
develop branch    # integracijska grana
feature/sprint-XXX # sprint grane

# Commit konvencija:
feat(M03): add training deadline alarm [ZAK: čl.27 ZZnR]
fix(M04): health check date validation
chore: update dependencies
docs: add sprint 003 analysis
```

### GitHub account setup (za Atilu)
1. Kreiraj GitHub account na: https://github.com/signup
2. Preporučeno korisničko ime: `vadociatila-source`
3. Kreiraj repo: `znr-erp` (private za sad)
4. Dodaj SSH key ili koristi HTTPS s personal access tokenom

### Cloudflare Pages setup
1. Cloudflare account: https://dash.cloudflare.com
2. Pages → Connect to Git → GitHub repo `znr-erp`
3. Build settings:
   ```
   Build command: npm run build
   Build output directory: dist
   Root directory: /
   ```
4. Environment variables: sve iz `.env.example` (bez `VITE_` prefiksa nije potrebno)

---

## 9. ENVIRONMENT VARIJABLE

Vidi `.env.example` za kompletnu listu. Kritično:

```bash
# META-REGISTRY (jedan Supabase projekt)
VITE_SUPABASE_URL=      # Supabase URL
VITE_SUPABASE_ANON_KEY= # anon key


# Email (Resend)
VITE_RESEND_API_KEY=             # samo za server-side (Supabase Edge Functions)

# App
VITE_APP_URL=http://localhost:5173
```

---

## 10. KAKO RADITI S CLAUDE CODE

### Na početku svake sesije:
1. Pročitaj ovaj CLAUDE.md
2. Provjeri koji sprint radimo (docs/SPRINT_PLAN.md)
3. Pročitaj ANALIZA.md ako postoji (feedback od prethodnog sprinta)

### Na kraju svakog sprinta:
Napravi `ANALIZA.md` u root direktoriju s ovom strukturom:
```markdown
# ANALIZA — Sprint XXX

## ✅ Što je napravljeno
- Lista konkretnih feature-a koji rade

## ⚠️ Što ne radi / nije kompletno
- Lista blokatora ili nedovršenih stavki

## 🔴 Block issues
- Specifični problemi koji blokiraju napredak

## 📋 Zakonska usklađenost
- Koje [ZAK] tagove smo implementirali
- Koje RLS politike su postavljene

## 💡 Prijedlozi za sljedeći sprint
- Što bi trebalo uzeti u obzir

## 🔧 Potrebne akcije od Atile
- Supabase credentials
- GitHub access
- Odluke koje zahtijevaju human input
```

### Nikad:
- Ne brisati podatke (uvijek soft-delete: `status = 'former'/'deleted'`)
- Ne hard-kodirati zakonske rokove (uvijek iz `legal_references`)
- Ne commitat `.env` (samo `.env.example`)
- Ne ostavljati tablicu bez RLS
- Ne ostavljati `any` u TypeScriptu bez komentara zašto

---

## 11. ZAKONSKI ROKOVI — BRZA REFERENCA

| Obveza | Rok | Alarm | [ZAK] |
|--------|-----|-------|-------|
| Osposobljavanje novog radnika | 30 dana | Dan 1 + Dan 20 | čl. 27 ZZnR |
| Usavršavanje ZNR | 4 god | 60 dana unaprijed | čl. 27 ZZnR + PR-02 |
| Periodički zdravstveni pregled | 1-3 god | 90/60/30 dana | čl. 34 ZZnR |
| Pregled radne opreme | 3 god | 60 dana | PR-04 NN 16/16 |
| Ispitivanje okoliša (fizikalni) | 3 god | 90 dana | PR-05 |
| Ispitivanje okoliša (kemijski) | 2 god | 90 dana | PR-05 |
| Vježba evakuacije | 1 god | 60 dana | čl. 45 ZZnR |
| Revizija procjene rizika | 2 god | 90 dana | čl. 18 ZZnR |
| Odbor ZNR (50+ radnika) | 2x/god | 30 dana | čl. 70 ZZnR |
| Prijava ozljede HZZO | 48 sati | ODMAH | čl. 62 ZZnR |
| OZO zamjena | Po procjeni | 30 dana | PR-06 NN 5/21 |

---

*CLAUDE.md verzija: 1.0 | Datum: Travanj 2026.*
*Ažuriraj ovaj dokument kad se promijeni arhitektura ili dodaju moduli.*
