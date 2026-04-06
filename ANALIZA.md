# ANALIZA — Produkcija Live

Datum: 2026-04-06

## ✅ Što je napravljeno (2 sesije, 1 dan)

### Sesija 1 (sinoć): Sprint 001–012 MVP
- Foundation, auth, onboarding, tenant kreiranje
- M01–M12 svi moduli (CRUD + zakonske reference + alarmi)
- PDF obrasci (EK-1, EK-2, EK-4, EK-5, ZOS)
- Import 61 djelatnika Carta d.o.o. iz CSV

### Sesija 2 (danas): Post-MVP + Sprint 013 + Deploy

**Code review i popravke:**
- Akcijski centar — agregacija proširena na 6 izvora (dodani M08 ozljede + M02 procjena rizika)
- Error handling konzistentnost u hookovima
- ESLint config (npm run lint radi)
- Lokalne SQL migracije 010-011 kreirane

**Dashboard + Postavke + M06/M07/M09/M10:**
- Dashboard sa statistikama svih modula, hitni alarmi, quick links
- Postavke: tvrtka, korisnici, uloge/dozvole, zakonske reference, automatizacija
- M06 Radni okoliš, M07 OZO, M09 Evakuacija, M10 SDS — puni CRUD (0 stubova)

**Sprint 013 — ZOP + Automatizacija:**
- Ispravak rokova vatrogasnih aparata: 90d/365d/1825d (Pr. NN 101/11)
- 6 novih ZOP equipment tipova (hidrant, vatrodojava, sprinkler, CO₂, sig. rasvjeta, plin)
- 9 novih legal_references za ZOP sustave
- automation_settings tablica + automation_log
- Tracking stupci na 6 tablica (sprječava duplikate)
- UI tab "Automatizacija" u Postavkama (9 sekcija)

**Email automatizacija:**
- Supabase Edge Function `send-automation-emails` — deployano, v3
- Resend integracija s verificiranom domenom **znr-erp.com**
- FROM: `noreply@znr-erp.com`
- pg_cron job: svaki dan 07:00 UTC (09:00 HR)
- Testirano: emailovi stižu na vadociatila@gmail.com ✅
- automation_log bilježi sve poslane emailove

**Deploy:**
- Cloudflare Pages: https://znr-erp.pages.dev — **LIVE**
- Auto-deploy na svaki push na main
- SPA _redirects za client-side routing
- GitHub Actions: samo TypeScript check (deploy handled by CF)

## 📊 Statistike

| Metrika | Vrijednost |
|---------|-----------|
| Git commitova | 23 |
| Supabase migracije | 13 lokalnih fajlova (001–013) |
| Supabase tablice | 18 |
| Legal references | 25 (16 original + 9 ZOP) — 23 active, 2 deaktivirane |
| Edge Functions | 1 (send-automation-emails) |
| pg_cron jobs | 1 (daily 07:00 UTC) |
| Djelatnici (Carta d.o.o.) | 61 (52 active + 9 former) |
| PDF obrasci | 5 |
| Funkcionalni moduli | 12 + Dashboard + Postavke |
| Email domena | znr-erp.com (Resend verified) |
| Produkcija | https://znr-erp.pages.dev |
| Build | ✅ |
| ESLint | ✅ |
| Deploy | ✅ auto (CF Pages) |

## 📋 Zakonska usklađenost

| Modul | [ZAK] | Status |
|-------|-------|--------|
| M01 | čl. 61 ZZnR — evidencija trajno | ✅ |
| M02 | čl. 18 ZZnR — procjena rizika 2 god | ✅ |
| M03 | čl. 27 ZZnR — 30d novi / 4god usavršavanje | ✅ |
| M04 | čl. 34 ZZnR — periodički pregledi | ✅ |
| M05 | PR-04 NN 16/16 — oprema 3 god | ✅ |
| M05 | Pr. NN 101/11 — VA 90d/365d/1825d | ✅ (Sprint 013) |
| M05 | ZoZP NN 92/10 čl.40 — ZOP sustavi godišnje | ✅ (Sprint 013) |
| M06 | PR-05 — fizikalni 3god / kemijski 2god | ✅ |
| M07 | PR-06 NN 5/21 — OZO | ✅ |
| M08 | čl. 62 ZZnR — 48h HZZO | ✅ |
| M09 | čl. 45 ZZnR — evakuacija godišnje | ✅ |
| M10 | SDS/REACH | ✅ |
| M11 | Akcijski centar — 6 izvora | ✅ |
| M12 | Inspekcijska mapa + 5 PDF | ✅ |
| — | GDPR čl. 5(2) — audit log | ✅ |
| — | RLS na svim tablicama | ✅ |
| AUTO | Email automatizacija (Resend + pg_cron) | ✅ |

## ⚠️ Preostali tehnički dug (Faza 2)

1. QR kod za opremu (generiranje + public scan endpoint)
2. Digitalni potpis flow (email link "Potvrđujem")
3. OIR-1 / ER-2 HZZO PDF obrasci za ozljede
4. Email pozivnice za nove korisnike
5. Seed pravih ZNR podataka iz Atilinog Excel-a
6. Rotirati Resend API key (stari bio u SETUP_GUIDE.md — maknut ali key treba rotirati)

---

*ANALIZA.md v5.0 — Produkcija live | znr-erp.pages.dev | noreply@znr-erp.com | 2026-04-06*
