# ZNR ERP — Claude Code upute

> **Ovo je tvoja biblija.** Pročitaj cijeli dokument prije svakog zadatka.  
> Projekt: ZNR ERP — Standalone SaaS za zaštitu na radu (HR tržište)  
> Developer: Atila Vadoci | GitHub: vadociatila-source | Email: vadociatila@gmail.com  
> Stack verzija: Travanj 2026 | **CLAUDE.md v2.0**

## 🔑 Ključni podaci projekta

| Resurs | Vrijednost |
|--------|-----------|
| GitHub | github.com/vadociatila-source/znr-erp |
| Production | https://znr-erp.pages.dev |
| Supabase | https://nezvlavmduedcaiaumgi.supabase.co (vadociatila@gmail.com) |
| Resend | simpliapp4 account (simpliapp4@gmail.com) — key u GitHub Secrets |
| Cloudflare | Pages → znr-erp.pages.dev → Connect to Git |

## 📊 Status projekta (2026-04-06)

> **MVP+ KOMPLETIRAN — svih 12 modula funkcionalno, 0 stub stranica.**  
> Pilot tenant: **Carta d.o.o.** (Osijek, prerađivačka industrija)  
> 52 aktivna + 9 bivša djelatnika importirana iz CSV-a.  
> Dashboard sa statistikama, Postavke s korisnicima/ulogama/zakonima.

**Implementirano:**
- M01 Djelatnici CRUD + profil + PDF dosje (EK-1, EK-2, EK-4)
- M02 Radna mjesta + procjena rizika (čl. 18 ZZnR)
- M03 Osposobljavanja CRUD + status engine + auto-alarm trigger
- M04 Zdravstveni pregledi CRUD + auto next_check_date
- M05 Radna oprema CRUD + inspection status + vatrogasni aparati
- M06 Radni okoliš — ispitivanja fizikalni/kemijski (PR-05)
- M07 OZO — osobna zaštitna oprema (PR-06 NN 5/21)
- M08 Ozljede na radu — 48h HZZO alarm (čl. 62 ZZnR)
- M09 Evakuacija — vježbe evakuacije (čl. 45 ZZnR)
- M10 SDS listovi — sigurnosno-tehnički listovi opasnih tvari
- M11 Akcijski centar — agregacija alarma iz 6 izvora
- M12 Izvješća + Inspekcijska mapa + PDF obrasci (EK-1..5, ZOS)
- Dashboard — statistike svih modula + hitni alarmi + quick links
- Postavke — tvrtka, korisnici, uloge/dozvole, zakonske reference

**Tehnički dug (preostalo za Fazu 2):**
- Email alarmi (Resend) — Edge Function nije implementirana, pg_cron pending
- QR kod za opremu — `qr_code_token` postoji u tablici, UI nije implementiran
- Digitalni potpis flow — polja postoje, email link "Potvrđujem" nije implementiran
- OIR-1 / ER-2 PDF obrasci — HZZO specifični obrasci za ozljede
- Email pozivnice za nove korisnike (Resend integracija)

## ⚠️ Arhitekturne napomene

**ZNR ERP je standalone SaaS produkt** — generičan multi-tenant kod, bez hardkodiranog klijenta.  
**Carta ERP** = potpuno odvojen projekt s vlastitom bazom. ZNR će biti modul u Carta ERP.  
**Carta d.o.o.** = pilot tenant u ZNR ERP SaaS-u (plaća pretplatu kao svaki drugi klijent).  
**UI terminologija:** korisnik vidi **"Djelatnici"** (ne "Radnici"). Interni nazivi (rute, moduli, tablice) mogu ostati `workers`.

---

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
**NIKAD** ne hard-kodiraj rokove u aplikacijski kod.
Razlog: kad se zakon promijeni → samo `UPDATE` u tablici, bez deplooya.

### PRAVILO #4 — ZAK TAG U KODU
```typescript
// [ZAK: čl.27 ZZnR NN71/14] Osposobljavanje u roku 30 dana od zaposlenja
// [ZAK: PR-04 NN16/16] Pregled radne opreme max. svake 3 godine
// [ZAK: GDPR čl.5(2)] Audit log — accountability princip
// [ZAK: čl.62 ZZnR] Prijava ozljede HZZO u roku 48 sati
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
Svaka tablica ima Row Level Security (RLS).
Nikad ne ostavljaj tablicu bez RLS politike.

### PRAVILO #8 — TYPESCRIPT STRICT
```typescript
// tsconfig: "strict": true — UVIJEK
// Nikad: any (osim u edge casevima s komentarom zašto)
// Uvijek: explicit return types na funkcijama
```

### PRAVILO #9 — UI TERMINOLOGIJA
Korisnik uvijek vidi **"Djelatnici"** u sučelju.  
Interni kod, rute i SQL tablice mogu koristiti `workers`.

---

## 2. STACK I VERZIJE

```
Frontend:
  React 18.3+          Komponente, hooks
  TypeScript 5.4+      Strict mode, no-any
  Vite 5.2+            Build tool, dev server
  Wouter 3.x           Router (lightweight)
  Zustand 4.x          State management (store per domain)
  Tailwind CSS 3.4+    Styling (utility-first)

Backend:
  Supabase             PostgreSQL, Auth, Storage, Realtime
  pg_cron              Scheduled alarm jobs (PENDING — Faza 2)
  Supabase RLS         Row Level Security na svakoj tablici

Email:
  Resend               Transakcijski emailovi — Edge Function PENDING

PDF:
  @react-pdf/renderer  Generiranje PDF dokumenata (client-side)

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
JEDAN Supabase projekt
└── Jedna PostgreSQL baza
    ├── tenants                  ← sve registrirane tvrtke
    ├── tenant_users             ← tko ima pristup čemu (uloge)
    ├── znr_specialist_clients   ← ZNR stručnjak → N klijenata
    ├── workers                  ← svi djelatnici [tenant_id + RLS]
    ├── trainings                ← sva osposobljavanja [tenant_id + RLS]
    ├── health_checks            ← svi pregledi [tenant_id + RLS]
    ├── equipment                ← sva oprema [tenant_id + RLS]
    ├── incidents                ← ozljede na radu [tenant_id + RLS]
    ├── work_positions           ← radna mjesta [tenant_id + RLS]
    ├── tasks                    ← alarm taskovi [tenant_id + RLS]
    ├── legal_references         ← globalno (ZZnR vrijedi za sve u HR)
    └── audit_log                ← GDPR [tenant_id + RLS]
```

**RLS — helper funkcija:**
```sql
CREATE OR REPLACE FUNCTION auth_tenant_ids()
RETURNS SETOF UUID LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT tenant_id FROM tenant_users WHERE user_id = auth.uid()
$$;

-- Primjer RLS politike:
CREATE POLICY "workers_read" ON workers
  FOR SELECT USING (tenant_id IN (SELECT auth_tenant_ids()));
```

### Implementacija u kodu

```typescript
// src/lib/supabase.ts — JEDAN client za cijelu aplikaciju
import { createClient } from '@supabase/supabase-js'
export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
)
// RLS automatski filtrira podatke po tenantu.
// .eq('tenant_id', ...) NIJE POTREBNO u upitima.
```

### Uloge korisnika

```typescript
type UserRole =
  | 'owner'           // vlasnik/direktor — puna prava
  | 'hr'              // HR osoba — gotovo puna prava
  | 'znr_specialist'  // interni ZNR stručnjak — puna prava
  | 'delegate'        // povjerenik radnika — read-only ZNR
  | 'worker'          // radnik — read-only vlastiti dosje
```

---

## 4. FOLDER STRUKTURA

```
znr-erp/
├── CLAUDE.md                        ← OVO ČITAŠ
├── ANALIZA.md                       ← feedback od zadnjeg sprinta
├── README.md
├── SETUP_GUIDE.md
├── package.json
├── vite.config.ts
├── tsconfig.json / tsconfig.app.json / tsconfig.node.json
├── tailwind.config.ts
├── postcss.config.js
├── .env.example
├── .gitignore
├── index.html
│
├── src/
│   ├── main.tsx
│   ├── App.tsx
│   ├── index.css
│   ├── vite-env.d.ts
│   │
│   ├── lib/
│   │   ├── supabase.ts              # Jedan Supabase client (Model 1)
│   │   └── legal-references.ts      # [ZAK] Legal references loader + cache
│   │
│   ├── store/
│   │   ├── auth.store.ts            # User, session
│   │   ├── tenant.store.ts          # Aktivni tenant, uloga
│   │   └── legal.store.ts           # Loaded legal_references
│   │
│   ├── router/
│   │   └── index.tsx                # Wouter routes
│   │
│   ├── hooks/
│   │   ├── useAuth.ts
│   │   ├── useTenant.ts
│   │   ├── useLegalRef.ts           # Hook za zakonske reference
│   │   └── useAlarms.ts             # Hook za alarm engine
│   │
│   ├── components/
│   │   ├── ui/                      # Design system
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
│   │   │   ├── AppLayout.tsx        # Glavni layout sa Sidebarom
│   │   │   ├── Sidebar.tsx          # Navigacija — "Djelatnici" u UI
│   │   │   └── Header.tsx
│   │   └── legal/
│   │       ├── LegalBadge.tsx       # "čl. 27 ZZnR" badge
│   │       └── LegalTooltip.tsx     # Hover → zakonski okvir
│   │
│   ├── modules/                     # ZNR moduli
│   │   ├── M01-radnici/             # UI: "Djelatnici"
│   │   ├── M02-radna-mjesta/
│   │   ├── M03-osposobljavanja/
│   │   ├── M04-zdravstveni-pregledi/
│   │   ├── M05-radna-oprema/
│   │   ├── M06-radni-okolis/        # STUB — Faza 2
│   │   ├── M07-ozo/                 # STUB — Faza 2
│   │   ├── M08-ozljede/
│   │   ├── M09-evakuacija/          # STUB — Faza 2
│   │   ├── M10-sds/                 # STUB — Faza 2
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
│       ├── database.types.ts        # Supabase generated types
│       ├── legal.types.ts           # LegalReference, AlarmLevel
│       └── tenant.types.ts          # Tenant, UserRole, TenantUser
│
├── supabase/
│   └── migrations/                  # Sve migracije u jednom folderu
│       ├── 001_schema.sql
│       ├── 002_rls_policies.sql
│       ├── 003_legal_seed.sql
│       ├── 004_audit_triggers.sql
│       ├── 005–009_...              # Moduli i features
│       ├── 010_incidents.sql        # M08 Ozljede (lokalni file pending)
│       └── 011_znr_specialist.sql   # Multi-klijent (lokalni file pending)
│
├── docs/
│   ├── SPRINT_PLAN.md
│   ├── ARCHITECTURE.md
│   ├── ZNR_ERP_PROJEKTNA_DOKUMENTACIJA.md
│   ├── ZNR_PRAVNI_OKVIR.md
│   └── ZNR_KONKURENCIJA_FEATURES.md
│
└── .github/
    └── workflows/
        └── deploy.yml
```

---

## 5. SPRINT PLAN — STATUS

> **MVP KOMPLETIRAN 2026-04-06. Svih 12 sprintova dovršeno.**

| Sprint | Modul | Status |
|--------|-------|--------|
| 001 | Foundation: Auth + CF deploy | ✅ |
| 002 | Onboarding wizard + `create_tenant_with_owner` RPC | ✅ |
| 003 | M01 Djelatnici CRUD + 61 Carta CSV import | ✅ |
| 004 | M03 Osposobljavanja + status engine | ✅ |
| 005 | M04 Zdravstveni pregledi + auto next_check | ✅ |
| 006 | M05 Radna oprema + vatrogasni aparati | ✅ |
| 007 | M11 Akcijski centar + 52 backfilled taska | ✅ |
| 008 | PDF: EK-1, EK-2, EK-4, EK-5, ZOS | ✅ |
| 009 | M02 Radna mjesta + procjena rizika | ✅ |
| 010 | M08 Ozljede + 48h HZZO alarm | ✅ |
| 011 | ZNR stručnjak multi-klijent (Tip C) | ✅ |
| 012 | M12 Inspekcijska mapa (CSV + JSON bundle) | ✅ |

### Faza 2 — Sljedeće (nakon validacije)

| Prioritet | Feature | Napomena |
|-----------|---------|---------|
| 🔴 Visok | Email alarmi (Resend Edge Function) | pg_cron → trigger → email |
| 🔴 Visok | Lokalni SQL za migracije 010-011 | Backfill u supabase/migrations/ |
| 🟠 Srednji | OIR-1 / ER-2 PDF obrasci | HZZO specifični za ozljede |
| 🟠 Srednji | QR kod na opremi | qr_code_token postoji u tablici |
| 🟠 Srednji | Digitalni potpis flow | Email link "Potvrđujem" |
| 🟡 Nizak | M06 Radni okoliš | PR-05 — ispitivanja |
| 🟡 Nizak | M07 OZO | PR-06 NN 5/21 |
| 🟡 Nizak | M09 Evakuacija | čl. 45 ZZnR |
| 🟡 Nizak | M10 SDS listovi | REACH EU |

---

## 6. BAZA PODATAKA — KONVENCIJE

### Tablice (sve u jednoj bazi)

```
tenants, tenant_users, znr_specialist_clients,
workers, work_positions, trainings, health_checks,
equipment, incidents, tasks,
legal_references (globalno),
audit_log (GDPR)
```

### SQL konvencije

```sql
-- Snake_case za sve
-- UUID primary keys (gen_random_uuid())
-- created_at / updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
-- created_by / updated_by UUID (auth.uid())
-- status TEXT s enum check (NIKAD ne brisati — soft delete!)
-- tenant_id UUID NOT NULL REFERENCES tenants(id) na svakoj ZNR tablici
-- RLS na svakoj tablici
-- audit_log trigger na svakoj tablici s osobnim podacima
```

### [ZAK] Tablica legal_references — srce sustava

```typescript
interface LegalReference {
  id: string
  code: string                    // 'ZZnR-27-novi-radnik-30d'
  title: string                   // 'Zakon o zaštiti na radu'
  article: string | null          // 'čl. 27'
  nn_number: string | null        // 'NN 71/14, 118/14, 94/18, 96/18'
  deadline_days: number | null    // 30 (null = nije fiksni rok)
  deadline_description: string | null // '30 dana od dana zaposlenja'
  module_codes: string[]          // ['M03']
  is_active: boolean
  source_url: string | null
}
```

Ažuriranje: `UPDATE legal_references SET deadline_days = X WHERE code = '...'`  
Efekt: sve tvrtke odmah dobivaju novi rok — **bez deplooya**.

---

## 7. UI KONVENCIJE

### Boje alarma (konzistentno kroz cijeli sustav)
```typescript
const ALARM_COLORS = {
  critical: 'bg-red-50 border-red-500 text-red-800',      // isteklo, 48h
  urgent:   'bg-orange-50 border-orange-400 text-orange-800', // <30 dana
  warning:  'bg-yellow-50 border-yellow-400 text-yellow-800', // <60 dana
  info:     'bg-blue-50 border-blue-400 text-blue-800',    // <90 dana
  ok:       'bg-green-50 border-green-400 text-green-800', // uredno
} as const
```

### LegalBadge — UVIJEK uz alarm
```tsx
<LegalBadge
  article="čl. 27 ZZnR"
  deadline="30 dana od zaposlenja"
  penalty="Kazna: 5.000–50.000 EUR"  // samo za kritične
/>
```

### UI terminologija
- **"Djelatnici"** — korisnik uvijek vidi ovaj naziv
- **"Osposobljavanja"**, **"Zdravstveni pregledi"**, **"Radna oprema"** — nepromijenjeno
- Svaki popis: pretraživanje + filtriranje + paginacija (25/str)

---

## 8. GITHUB + DEPLOYMENT

### GitHub workflow

```bash
main branch         # production — CF Pages deploya automatski
develop branch      # integracijska grana
feature/sprint-XXX  # sprint grane

# Commit konvencija:
feat(M03): add training deadline alarm [ZAK: čl.27 ZZnR]
fix(M04): health check date validation
chore: update dependencies
docs: update ANALIZA.md sprint 012
```

### Cloudflare Pages

```
Pages → Connect to Git → vadociatila-source/znr-erp
Build command: npm run build
Build output: dist
```

---

## 9. ENVIRONMENT VARIJABLE

```bash
# Supabase — jedan projekt, jedna baza
VITE_SUPABASE_URL=https://nezvlavmduedcaiaumgi.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...   # iz Settings → API → anon public

# App
VITE_APP_URL=http://localhost:5173
VITE_APP_NAME=ZNR ERP
VITE_APP_ENV=development

# Resend — SAMO u GitHub Secrets i Supabase Edge Functions
# NIKAD ne dodavati VITE_ prefiks — bio bi javan u browseru!
# GitHub Secret name: RESEND_API_KEY
# Vrijednost: re_i6NP4HDn_iNnfLsmbC7aPXCiKGnQ78bNi
```

### GitHub Secrets (za CI/CD deploy)

| Secret | Vrijednost |
|--------|-----------|
| `VITE_SUPABASE_URL` | https://nezvlavmduedcaiaumgi.supabase.co |
| `VITE_SUPABASE_ANON_KEY` | eyJ... |
| `CLOUDFLARE_API_TOKEN` | iz Cloudflare API Tokens |
| `CLOUDFLARE_ACCOUNT_ID` | iz Cloudflare dashboard |
| `RESEND_API_KEY` | re_i6NP4HDn_iNnfLsmbC7aPXCiKGnQ78bNi |

---

## 10. KAKO RADITI S CLAUDE CODE

### Na početku svake sesije:
1. Pročitaj ovaj CLAUDE.md
2. Pročitaj ANALIZA.md (feedback od zadnjeg sprinta)
3. Pročitaj docs/SPRINT_PLAN.md za kontekst

### Na kraju svakog sprinta:
Napravi `ANALIZA.md` u root direktoriju:
```markdown
# ANALIZA — Sprint XXX

## ✅ Što je napravljeno

## ⚠️ Što ne radi / nije kompletno

## 📋 Zakonska usklađenost
- Koje [ZAK] tagove smo implementirali
- Koje RLS politike su postavljene

## 🔧 Potrebne akcije od Atile
- Supabase credentials
- GitHub access
- Odluke koje zahtijevaju human input
```

### Nikad:
- Ne brisati podatke (soft-delete: `status = 'former'/'deleted'/'inactive'`)
- Ne hard-kodirati zakonske rokove (uvijek iz `legal_references`)
- Ne commitati `.env` (samo `.env.example`)
- Ne ostavljati tablicu bez RLS
- Ne ostavljati `any` u TypeScriptu bez komentara
- Ne pisati "Radnici" u UI — uvijek **"Djelatnici"**

---

## 11. ZAKONSKI ROKOVI — BRZA REFERENCA

| Obveza | Rok | Alarm | [ZAK] |
|--------|-----|-------|-------|
| Osposobljavanje novog radnika | 30 dana | Dan 1 | čl. 27 ZZnR |
| Usavršavanje ZNR | 4 god | 60 dana unaprijed | čl. 27 + PR-02 |
| Periodički zdravstveni pregled | 1-3 god | 90/60/30 dana | čl. 34 ZZnR |
| Pregled radne opreme | 3 god | 60 dana | PR-04 NN 16/16 |
| Vatrogasni aparat (vizualni) | 1 god | 30 dana | ZOP NN 92/10 |
| Vatrogasni aparat (servis) | 2 god | 60 dana | ZOP NN 92/10 |
| Ispitivanje okoliša (fizikalni) | 3 god | 90 dana | PR-05 |
| Ispitivanje okoliša (kemijski) | 2 god | 90 dana | PR-05 |
| Vježba evakuacije | 1 god | 60 dana | čl. 45 ZZnR |
| Revizija procjene rizika | 2 god | 90 dana | čl. 18 ZZnR |
| Odbor ZNR (50+ radnika) | 2x/god | 30 dana | čl. 70 ZZnR |
| Prijava ozljede HZZO | 48 sati | ODMAH | čl. 62 ZZnR |
| OZO zamjena | Po procjeni | 30 dana | PR-06 NN 5/21 |

---

*CLAUDE.md v2.0 | Datum: Travanj 2026 | MVP kompletiran 2026-04-06*  
*Ažuriraj ovaj dokument kad se promijeni arhitektura, dodaju moduli ili završe faze.*
