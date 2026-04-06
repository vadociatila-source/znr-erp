# ZNR ERP — Arhitekturalne odluke

## Multi-tenant model: Model 1

**Odluka:** Jedna baza, svi klijenti izolirani RLS-om po `tenant_id`.

**Razlog:**
- Ekonomično: jedan Supabase projekt = ~$25/mj bez obzira na broj klijenata
- Sigurno: Supabase RLS je robustan i dizajniran za ovo (Supabase ga koristi za vlastiti dashboard)
- Jednostavno: jedna SQL migracija za sve klijente, jedan Supabase client u kodu
- Skalabilno: PostgreSQL podnosi tisuće tenanata bez problema

**Alternativa odbačena (Model 3 — N baza):**  
N klijenata × $25/mj = neodrživo za SaaS s pretplatama 15-199 EUR/mj.

## [ZAK] Legal references tablica

**Odluka:** Svi zakonski rokovi u `legal_references` tablici — nikad u kodu.

**Razlog:** Kad se zakon promijeni → `UPDATE` u tablici, bez deplooya.  
Sve tvrtke odmah dobivaju ispravni rok. Arhitekturalni differentiator.

## State management: Zustand

**Odluka:** Zustand s domain stores (auth, tenant, legal).

**Razlog:** Minimalan boilerplate, TypeScript-friendly, devtools podrška.

## Router: Wouter

**Odluka:** Wouter umjesto React Router.

**Razlog:** <2kb, isti API, bez bloataa za naš jednostavan routing.

## PDF generiranje: @react-pdf/renderer

**Odluka:** Client-side PDF generiranje.

**Razlog:** Nema serverske ovisnosti, radi offline, klijent odmah dobiva PDF.

## Email: Resend

**Odluka:** Resend za transakcijske emailove (alarmi, pozivnice).

**Razlog:** Moderna API, dobra hrvatska IP reputacija, jednostavna integracija sa Supabase Edge Functions.  
**Napomena:** Dok nema verificirane domene → `from: onboarding@resend.dev` (Resend test domain).

## Deployment: Cloudflare Pages + GitHub

**Odluka:** CF Pages s automatskim deployem iz GitHub main grane.

**Razlog:** Besplatni tier s CDN-om, automatski preview deploji za PR-ove, nula konfiguracije za Vite build.

## Infrastruktura (konkretno)

```
GitHub:     vadociatila-source/znr-erp (private)
Supabase:   nezvlavmduedcaiaumgi (vadociatila@gmail.com)
Resend:     simpliapp4 account
Cloudflare: znr-erp.pages.dev → Connect to Git
```
