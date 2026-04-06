# ZNR ERP — Setup Guide
## Sve što trebaš je već kreiran — samo pokreni redom

---

## Što imaš

| Servis | Account | Projekt/Repo |
|--------|---------|-------------|
| GitHub | vadociatila-source | kreirati: znr-erp |
| Supabase | vadociatila@gmail.com | ZNR (https://nezvlavmduedcaiaumgi.supabase.co) |
| Resend | simpliapp4@gmail.com | API key: re_i6NP4HDn_... |
| Cloudflare | postojeći account | spojiti s GitHub repo |

---

## KORAK 1 — Pokreni SQL migracije u Supabase ZNR projektu

Otvori: https://nezvlavmduedcaiaumgi.supabase.co  
Lijevo → **SQL Editor** → **New query**

Pokreni **redom** (svaku datoteku posebno, čekaj "Success" između):

```
supabase/migrations/001_schema.sql         ← tablice + tenant_id
supabase/migrations/002_rls_policies.sql   ← RLS izolacija (ključno!)
supabase/migrations/003_legal_seed.sql     ← 16 zakonskih referenci [ZAK]
supabase/migrations/004_audit_triggers.sql ← GDPR audit log
```

---

## KORAK 2 — Dohvati anon key

Supabase ZNR projekt → **Settings → API**  
Kopiraj **anon public** key (dugi JWT koji počinje s `eyJ...`)

---

## KORAK 3 — Popuni .env lokalno

```bash
cp .env.example .env
```

Otvori `.env` i popuni:
```bash
VITE_SUPABASE_URL=https://nezvlavmduedcaiaumgi.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...ANON_KEY_IZ_SETTINGS_API...
VITE_APP_URL=http://localhost:5173
VITE_APP_ENV=development
```

---

## KORAK 4 — Lokalni test

```bash
npm install
npm run dev
```

Otvori http://localhost:5173 → trebao bi vidjeti login ekran.

---

## KORAK 5 — Kreiraj GitHub repo

Na https://github.com/vadociatila-source:
1. **New repository** → naziv: `znr-erp` → **Private** → **Create**
2. Ne inicijaliziraj s README

```bash
cd znr-erp
git init
git add .
git commit -m "feat: initial ZNR ERP — Model 1 multi-tenant [Sprint 001]"
git branch -M main
git remote add origin https://github.com/vadociatila-source/znr-erp.git
git push -u origin main
```

---

## KORAK 6 — GitHub Secrets

https://github.com/vadociatila-source/znr-erp/settings/secrets/actions  
→ **New repository secret** za svaki:

| Secret name | Vrijednost |
|-------------|-----------|
| `VITE_SUPABASE_URL` | `https://nezvlavmduedcaiaumgi.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | eyJ... (iz Settings → API) |
| `CLOUDFLARE_API_TOKEN` | (vidi Korak 7) |
| `CLOUDFLARE_ACCOUNT_ID` | (vidi Korak 7) |
| `RESEND_API_KEY` | `re_i6NP4HDn_iNnfLsmbC7aPXCiKGnQ78bNi` |

---

## KORAK 7 — Cloudflare Pages

### Dohvati Account ID:
1. https://dash.cloudflare.com → desno dole → **Account ID** (kopiraj)

### Kreiraj API Token:
1. https://dash.cloudflare.com/profile/api-tokens
2. **Create Token** → Use template: **Edit Cloudflare Workers**
3. Dodaj permission: `Cloudflare Pages:Edit`
4. Create → kopiraj token → stavi u GitHub Secret `CLOUDFLARE_API_TOKEN`

### Spoji s GitHubom:
1. Cloudflare → **Pages** → **Create a project** → **Connect to Git**
2. Autorizi GitHub → odaberi `vadociatila-source/znr-erp`
3. Build settings:
   ```
   Framework preset:   None
   Build command:      npm run build
   Build output dir:   dist
   ```
4. Environment variables (dodaj u CF dashboard):
   ```
   VITE_SUPABASE_URL      = https://nezvlavmduedcaiaumgi.supabase.co
   VITE_SUPABASE_ANON_KEY = eyJ...
   VITE_APP_ENV           = production
   VITE_APP_URL           = https://znr-erp.pages.dev
   ```
5. **Save and Deploy**

---

## KORAK 8 — Resend test mode (za sada)

Resend simpliapp4 account nema verificiranu domenu.  
Za razvoj i testiranje emailovi idu s `onboarding@resend.dev` — to je Resend-ov test domain i radi bez verifikacije.

Supabase Edge Function za email alarme (Sprint 004+) koristit će:
```javascript
from: 'onboarding@resend.dev'  // ← dok nema vlastite domene
to: korisnikov_email
```

Kad budeš spreman za produkciju → Resend → **Domains** → dodaj svoju domenu.

---

## Checklist

- [ ] SQL migracije 001→004 pokrenute u Supabase ZNR projektu
- [ ] `.env` popunjen s anon key-em
- [ ] `npm run dev` → login ekran na localhost:5173
- [ ] GitHub repo `znr-erp` kreiran, kod pushutan
- [ ] GitHub Secrets postavljeni (5 secretsa)
- [ ] Cloudflare Pages spojeno na GitHub repo
- [ ] Push na `main` → automatski deploy → https://znr-erp.pages.dev

---

## Nakon deploymenta — Sprint 001

Kad sve zelene kuke prođu, reci Claude Codeu:  
> "Pročitaj CLAUDE.md i nastavi sa Sprintom 001"

Claude Code implementira: auth flow, onboarding wizard, tenant kreiranje.

---

*SETUP_GUIDE.md v3.0 — konkretni podaci, bez nepotrebnih koraka*
