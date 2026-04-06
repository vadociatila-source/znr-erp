# ANALIZA — MVP+ Kompletiran

Datum: 2026-04-06

## ✅ Što je napravljeno

### Sesija 1 (sinoć): Sprint 001–012 MVP
- Foundation, auth, onboarding, tenant kreiranje
- M01 Djelatnici CRUD + import 61 djelatnika Carta d.o.o.
- M03 Osposobljavanja, M04 Zdravstveni pregledi, M05 Radna oprema
- M11 Akcijski centar (agregacija alarma iz 4 izvora)
- M08 Ozljede na radu (48h HZZO alarm)
- M02 Radna mjesta + procjena rizika
- M11 ZNR stručnjak multi-klijent flow
- M12 Inspekcijska mapa + PDF obrasci (EK-1, EK-2, EK-4, EK-5, ZOS)

### Sesija 2 (danas): Code review + popravke + novi moduli

**Code review (procjena 8/10 → 9/10):**
- Akcijski centar — dodana agregacija M08 (ozljede) i M02 (procjena rizika) → sada 6 izvora
- useIncidents — dodan error state (konzistentnost s ostalim hookovima)
- eslint.config.js kreiran (ESLint 9.0+ flat config) — `npm run lint` prolazi
- Lokalne SQL migracije 010-011 kreirane (incidents + specialist RPC)

**Dashboard (bio prazan → pune statistike):**
- 8 stat kartica: djelatnici, osposobljavanja, pregledi, oprema, ozljede, radna mjesta, zadaci, inspekcijska mapa
- Hitni alarmi banner (critical tasks + neprijavljene ozljede HZZO-u)
- Quick links za brze akcije (novi djelatnik, nova oprema, prijava ozljede)
- Tenant info kartica (naziv, OIB, plan, trial)

**Postavke (/postavke — potpuno nova stranica):**
- Tab Tvrtka: edit naziv, OIB, djelatnost, grad, adresa
- Tab Korisnici: lista tenant_users, inline promjena uloga (Select dropdown)
- Tab Uloge i dozvole: matrica ROLE_PERMISSIONS (canEdit/canDelete/canManageUsers/canViewAll)
- Tab Zakonske reference: pregled svih 16 zakona s kodovima, člancima, rokovima, NN brojevima, modulima

**M06 Radni okoliš (bio stub → puni CRUD):**
- Ispitivanja fizikalnih čimbenika (mikroklima, buka, rasvjeta) — [ZAK: PR-05, max 3 god]
- Ispitivanja kemijskih čimbenika (prašine, plinovi) — [ZAK: PR-05, max 2 god]
- Auto next_test_date po tipu, modal forma, result badge (sukladno/nesukladno/djelomično)

**M07 OZO (bio stub → puni CRUD):**
- Evidencija izdavanja osobne zaštitne opreme — [ZAK: PR-06 NN 5/21]
- 9 tipova OZO (kaciga, rukavice, naočale, obuća, odjeća, sluh, dišni, pad, ostalo)
- Po djelatniku: datum izdavanja, zamjena, količina, veličina

**M09 Evakuacija (bio stub → puni CRUD):**
- Vježbe evakuacije i spašavanja — [ZAK: čl. 45 ZZnR, min. jednom godišnje]
- 3 tipa vježbi (potpuna, djelomična, teorijska)
- Auto next_drill_date +1 godina, broj sudionika, trajanje, nalazi, korektivne mjere

**M10 SDS listovi (bio stub → puni CRUD):**
- Sigurnosno-tehnički listovi za opasne tvari
- CAS broj, dobavljač, lokacija skladištenja, datum zaprimanja, rok isteka
- Status: aktivan/istekao/arhiviran

**Infrastruktura:**
- Migracija 012: 4 nove tablice (environment_tests, evacuations, ozo_records, sds_documents) + RLS + audit
- database.types.ts ažuriran s 4 nove tablice
- Router: dodan /postavke + sve M06-M10 rute funkcionalne
- Sidebar: dodan link Postavke

## 📊 Statistike

| Metrika | Vrijednost |
|---------|-----------|
| Git commitova | 14 |
| Supabase migracije | 12 (001-012) |
| Supabase tablice | 16 |
| Legal references | 16 |
| Djelatnici (Carta d.o.o.) | 61 (52 active + 9 former) |
| Radna mjesta | 14 |
| PDF obrasci | 5 (EK-1, EK-2, EK-4, EK-5, ZOS) |
| UI komponente (reusable) | 8 |
| Funkcionalni moduli | 12/12 + Dashboard + Postavke |
| Stub stranice | **0** (sve implementirano) |
| Build | ✅ |
| ESLint | ✅ |

## 📋 Zakonska usklađenost

| Modul | [ZAK] | Status |
|-------|-------|--------|
| M01 | čl. 61 ZZnR — evidencija trajno | ✅ |
| M02 | čl. 18 ZZnR — procjena rizika 2 god | ✅ |
| M03 | čl. 27 ZZnR — 30d novi / 4god usavršavanje | ✅ |
| M04 | čl. 34 ZZnR — periodički pregledi | ✅ |
| M05 | PR-04 NN 16/16 — oprema 3 god | ✅ |
| M06 | PR-05 — fizikalni 3god / kemijski 2god | ✅ |
| M07 | PR-06 NN 5/21 — OZO | ✅ |
| M08 | čl. 62 ZZnR — 48h HZZO | ✅ |
| M09 | čl. 45 ZZnR — evakuacija godišnje | ✅ |
| M10 | SDS/REACH | ✅ |
| M11 | Akcijski centar — 6 izvora | ✅ |
| M12 | Inspekcijska mapa + 5 PDF-ova | ✅ |
| — | GDPR čl. 5(2) — audit log | ✅ |
| — | RLS na svim tablicama | ✅ |

## ⚠️ Preostali tehnički dug (Faza 2)

1. Email alarmi (Resend + Supabase Edge Function + pg_cron)
2. QR kod za opremu (generiranje + public scan endpoint)
3. Digitalni potpis flow (email link "Potvrđujem")
4. OIR-1 / ER-2 HZZO PDF obrasci za ozljede
5. Email pozivnice za nove korisnike
6. Seed stvarnih ZNR podataka iz Atilinog Excel-a

## 🔧 Potrebne akcije od Atile

1. **`git push`** iz PowerShell-a (zadnji commit čeka push)
2. **Testiraj Dashboard** — http://localhost:5173
3. **Testiraj Postavke** → svi tabovi
4. **Testiraj M06/M07/M09/M10** — dodaj testni zapis u svaki modul
5. **Donesi Excel** s pravim ZNR podacima
6. **Cloudflare Pages** — spoji s GitHub repom za automatski deploy

---

*ANALIZA.md v4.0 — MVP+ kompletiran | 0 stubova | 2026-04-06*
