# ZNR ERP

> Standalone SaaS za upravljanje zaštitom na radu — HR tržište, ~150.000 tvrtki.

**Repo:** github.com/vadociatila-source/znr-erp  
**Production:** https://znr-erp.pages.dev  
**Status:** Sprint 001 — Foundation

---

## Arhitektura: Model 1 Multi-tenant

```
Jedan Supabase account + jedan projekt
└── Jedna baza, svi klijenti izolirani RLS-om po tenant_id
    Nema N projekata. Nema N baza. Jednostavno i jeftino.
```

Carta ERP = potpuno odvojen projekt s vlastitom bazom.  
ZNR ERP je samostalan SaaS. ZNR će biti integriran kao modul u Carta ERP kad za to dođe red.

## Brzi start

```bash
git clone https://github.com/vadociatila-source/znr-erp.git
cd znr-erp && npm install
cp .env.example .env   # popuni prema SETUP_GUIDE.md
npm run dev
```

## Stack

React 18 + TypeScript + Vite · Wouter + Zustand · Tailwind CSS  
Supabase (Model 1 RLS) · @react-pdf/renderer · Cloudflare Pages · Resend

## Migracije (pokrenuti redom u Supabase SQL Editoru)

```
001_schema.sql         ← tablice s tenant_id
002_rls_policies.sql   ← RLS izolacija (ključno!)
003_legal_seed.sql     ← zakonski rokovi [ZAK]
004_audit_triggers.sql ← GDPR audit log
```

---
*ZNR ERP — Atila Vadoci | vadociatila@gmail.com*
