# ZNR ERP — Projektna dokumentacija
## Standalone SaaS sustav za upravljanje zaštitom na radu

> Verzija 2.0 — Travanj 2026.  
> Status: **Faza 0 — Validacija tržišta | Tehnički temelj postavljen**  
> Developer: Atila Vadoci | vadociatila@gmail.com  
> GitHub: github.com/vadociatila-source/znr-erp  
> Production: https://znr-erp.pages.dev

---

## O projektu

**ZNR ERP je standalone SaaS produkt** za upravljanje zaštitom na radu, dizajniran specifično za hrvatsko zakonodavstvo (ZZnR) i ~150.000 tvrtki koje imaju zakonsku obvezu vođenja ZNR evidencija.

### Veza s Carta ERP

Carta ERP je potpuno odvojen projekt s vlastitom bazom podataka. ZNR ERP i Carta ERP **ne dijele kod** — arhitekturalno su neovisni.

Kada ZNR ERP bude zreo kao SaaS produkt, ZNR funkcionalnost će biti integrirana kao **modul unutar Carta ERP-a** — kao zasebna implementacija koja koristi iste koncepte ali zasebnu bazu i kod.

---

## 1. Problem koji rješavamo

### Zakonska stvarnost poslodavca

Svaki poslodavac koji ima barem jednog zaposlenog mora po ZZnR:

1. Izraditi **Procjenu rizika** — temeljni dokument, živi dokument
2. **Osposobiti** svakog radnika za rad na siguran način (u roku 30 dana od zaposlenja)
3. Voditi **evidenciju osposobljavanja** s rokovima
4. Organizirati **zdravstvene preglede** (prethodni + periodički) za poslove s posebnim uvjetima
5. Provoditi **preglede i ispitivanja radne opreme** svake 3 godine
6. Provoditi **ispitivanje radnog okoliša** svake 2-3 godine
7. Imati **Plan evakuacije** i provoditi vježbe
8. Voditi **Registar ozljeda na radu** i prijavljivati ih HZZO-u (rok 48h!)
9. **Osigurati prvu pomoć** (1 osoba na 50 radnika)
10. Imati **SDS listove** za sve opasne kemikalije
11. Organizirati **poslove ZNR** — sam, stručnjak ili ovlaštena osoba

### Tko to danas radi

```
Mali poslodavac (5-50 radnika):
    → Plati ovlaštenoj ZNR tvrtki godišnji paušal
    → Dobije fascikl dokumenata
    → Fascikl stoji na polici
    → Rokovi ističu, nitko ne prati
    → Inspektor dođe → kazna 5.000–50.000 EUR
```

**Kazne za nepoštivanje ZNR:** Od 5.000 do 50.000 EUR za pravnu osobu.  
Inspekcija rada je aktivna — u 2023. provedeno >10.000 inspekcijskih pregleda.

### Problem ovlaštenih ZNR stručnjaka

Trenutni workflow ZNR stručnjaka:
- Excel tablice po klijentu
- Papirni dosjei
- Osobno pamćenje rokova
- Teško skaliraju (jedan stručnjak = max 30-50 klijenata)
- Nema automatskih podsjetnika

ZNR stručnjak koji koristi naš sustav može upravljati 2-3× više klijenata.

---

## 2. Pravni okvir

Pravni okvir je detaljno dokumentiran u zasebnom dokumentu: **ZNR_PRAVNI_OKVIR.md**

### Krovni zakon

**Zakon o zaštiti na radu** (NN 71/14, 118/14, 94/18, 96/18)

### Ključni rokovi (pregled)

| Obveza | Rok | [ZAK] |
|--------|-----|-------|
| Osposobljavanje novog radnika | 30 dana od zaposlenja | čl. 27 ZZnR |
| Usavršavanje ZNR | Svake 4 godine | čl. 27 + PR-02 |
| Periodički zdravstveni pregled | 1-3 god (po procjeni) | čl. 34 ZZnR |
| Pregled radne opreme | Max. 3 god | PR-04 NN 16/16 |
| Ispitivanje okoliša (fizikalni) | Max. 3 god | PR-05 |
| Ispitivanje okoliša (kemijski) | Max. 2 god | PR-05 |
| Vježba evakuacije | Min. 1x/god | čl. 45 ZZnR |
| Revizija procjene rizika | Min. svake 2 god | čl. 18 ZZnR |
| Odbor ZNR (50+ radnika) | Min. 2x/god | čl. 70 ZZnR |
| Prijava ozljede HZZO | 48 sati — HITNO! | čl. 62 ZZnR |

---

## 3. Korisnici i uloge

### Tri tipa korisnika sustava

**Tip A: Poslodavac koji sam vodi ZNR** (1-49 radnika)
- Vlasnik ili HR osoba
- Treba: podsjetnici, dosjei radnika, generiranje dokumenata
- Plaća: SaaS pretplata (Micro/Small/Medium paket)

**Tip B: Poslodavac s vanjskim ZNR stručnjakom**
- Poslodavac vidi samo svoje podatke
- ZNR stručnjak ima pristup putem invite sustava
- Model: Stručnjak plaća, klijent koristi

**Tip C: ZNR stručnjak / ovlaštena osoba** ← distribucijski kanal
- Portfolio klijenata (10-50+ tvrtki)
- Treba: dashboard svih klijenata s alarm statusom, generiranje dokumenata
- Plaća: ZNR Partner ili ZNR Pro paket
- Ključan za B2B distribuciju — jedan stručnjak = N klijenata

### Uloge unutar jedne tvrtke

```
owner (vlasnik/direktor)
  ↓ puna prava
hr (HR / ovlaštenik poslodavca)
  ↓ gotovo puna prava
znr_specialist (interni ili vanjski stručnjak)
  ↓ puna ZNR prava
delegate (povjerenik radnika)
  ↓ read-only ZNR teme
worker (radnik)
     read-only vlastiti dosje
```

---

## 4. Moduli sustava

### M01 — Evidencija radnika i dosjei
**[ZAK: čl. 61 ZZnR] Rok čuvanja: TRAJNO**

Što se prati: ime/prezime/OIB, radno mjesto, datum zaposlenja, vrsta ugovora, osposobljavanja, zdravstveni pregledi, OZO, dosje dokumenata.

Automatika: novi radnik → alarm za osposobljavanje (30 dana), alarm 60/30 dana pred istekom pregleda.

### M02 — Radna mjesta i procjena rizika
**[ZAK: čl. 18 ZZnR] Revizija min. svake 2 godine**

Što se definira: naziv radnog mjesta, posebni uvjeti rada (šifarnik iz PR-03 NN 5/84), opasnosti, mjere zaštite, preostali rizik, datum revizije.

Automatika: alarm 3 mj. prije isteka roka revizije.

### M03 — Osposobljavanja
**[ZAK: čl. 27 ZZnR + PR-02 NN 142/21]**

Po radniku: vrsta, datum, izvoditelj, rok obnove, status (Važeće/Uskoro ističe/Isteklo).  
Po tvrtki: grupna osposobljavanja, kalendar, evidencija neosvjetljenosti.

Automatika: 30 dana za novog radnika, 4 godine za usavršavanje, email alarmi.

PDF: ZOS obrazac, Potvrda o osposobljenosti, Digitalni potpis (email "Potvrđujem").

### M04 — Zdravstveni pregledi
**[ZAK: čl. 34 ZZnR + PR-03 NN 5/84]**

Tipovi: prethodni, periodički, izvanredni.  
Po radniku: datum, specijalista, nalaz (sposoban/ograničenja/nesposoban), rok sljedećeg.

Automatika: alarm 90/60/30 dana, odmah ako "nesposoban".

PDF: Uputnica za zdravstveni pregled, EK-4 karton.

### M05 — Radna oprema i strojevi
**[ZAK: PR-04 NN 16/16] Max. svake 3 godine**  
**Uključuje vatrogasne aparate [ZAK: ZOP NN 92/10]**

Tipovi opreme: stroj/uređaj, vatrogasni aparat (vizualni 1/god, servis 2/god), PP oprema, tlačne posude, dizala, elektro, vozila.

Automatika: alarm 60 dana, odmah ako isteklo. QR kod po opremi — skenira inspektor.

### M06 — Ispitivanje radnog okoliša
**[ZAK: PR-05] Fizikalni: 3 god | Kemijski: 2 god**

Fizikalni čimbenici: mikroklima, buka, rasvjeta.  
Kemijski: prašine, plinovi, dimovi.

### M07 — Osobna zaštitna oprema (OZO)
**[ZAK: PR-06 NN 5/21]**

Po radniku: vrsta OZO, datum izdavanja, rok zamjene, potvrda o primitku.  
Automatika: alarm 30 dana.

### M08 — Ozljede na radu i nezgode
**[ZAK: čl. 62 ZZnR] Prijava HZZO u 48 SATI**

```
Ozljeda → unos u sustav → ALARM odmah: "48 sati za prijavu HZZO-u!"
  → Generiranje OIR-1 (interni) i ER-2 (HZZO)
  → Praćenje statusa (prijavljena → na obradi → zaključena)
  → Analiza uzroka → provedene mjere
```

### M09 — Evakuacija i vježbe
**[ZAK: čl. 45 ZZnR] Min. 1x godišnje**

Upload PDF plana, evidencija vježbi (datum, sudionici, trajanje).  
Alarm ako vježba nije provedena u tekućoj godini.

### M10 — SDS listovi kemikalija

Lista kemikalija, upload SDS lista, evidencija informiranih radnika, alarm za zastarjele.

### M11 — Akcijski centar ← killer feature
**Jedini ekran koji korisnik treba svaki dan otvoriti**

```
🔴 HITNO:
   Marko Horvat — zdravstveni pregled ISTEKAO (3 dana) [čl.34 ZZnR]
   Ozljeda jučer — HZZO prijava ističe za 31 sat! [čl.62 ZZnR]

🟠 USKORO (<30 dana):
   Pregled tlakomjera — ističe za 14 dana [PR-04]
   Ana Perić — osposobljavanje nije provedeno (11 dana) [čl.27 ZZnR]

🟡 NA VIDIKU (<60 dana):
   Vježba evakuacije — nije provedena u 2026. [čl.45 ZZnR]
```

Svaki alarm prikazuje zakonsku referencu, rok i kaznu.

### M12 — Izvješća i inspekcijska priprema ← differentiator
**"Inspekcijska mapa" — jednim klikom**

ZIP arhiva za inspektora: procjena rizika, osposobljavanja, zdravstveni pregledi, oprema, okoliš, evakuacija, OZO. Inspektoru daš USB. Kraj panike.

Godišnje izvješće: statistika, rokovi za iduću godinu, troškovi ZNR.

---

## 5. ZNR stručnjak — poseban flow (Tip C)

### Dashboard stručnjaka

```
Moji klijenti (12 tvrtki):

Kovačić Gradnja d.o.o.   🔴 2 hitne akcije
Ugostiteljstvo Petar     🟠 4 uskoro ističe
AutoServis Markus        ✅ Sve uredno
Tekstilna Zlatna Igla    ⚠️ Procjena rizika zastarjela
...
```

Klik na klijenta → potpuni ZNR prikaz tog klijenta.

### Stručnjakov workflow

1. Klijent šalje invite → stručnjak prihvaća
2. Stručnjak vidi sve dokumente, alarme, evidencije klijenta
3. Stručnjak generira dokumente → klijent ih odmah vidi
4. Oboje primaju alarme (stručnjak = podsjetnik da kontaktira klijenta)

---

## 6. Tehnička arhitektura

### Stack

| Tehnologija | Uloga |
|---|---|
| React 18 + TypeScript | Frontend, strict mode |
| Vite | Build tool |
| Wouter | Router (lightweight) |
| Zustand | State management |
| Tailwind CSS | Styling |
| Supabase | PostgreSQL, Auth, Storage, RLS |
| @react-pdf/renderer | PDF generiranje (client-side) |
| Resend | Email alarmi |
| Cloudflare Pages | Hosting, CDN |

### Multi-tenant: Model 1

**Jedna baza, svi klijenti izolirani RLS-om.**

```
Jedan Supabase projekt
└── Jedna PostgreSQL baza
    ├── tenants            ← registrirane tvrtke
    ├── tenant_users       ← tko ima pristup čemu (uloge)
    ├── znr_specialist_clients ← Tip C stručnjak → N klijenata
    ├── workers            ← svi radnici [tenant_id + RLS]
    ├── trainings          ← sva osposobljavanja [tenant_id + RLS]
    ├── health_checks      ← svi pregledi [tenant_id + RLS]
    ├── equipment          ← sva oprema [tenant_id + RLS]
    ├── legal_references   ← globalno (ZZnR jednak za sve)
    └── audit_log          ← GDPR [tenant_id + RLS]
```

RLS (Row Level Security) osigurava da svaka tvrtka vidi **isključivo** svoje podatke. Nema rizika data leaka između klijenata.

**Zašto Model 1, ne N baza:**
- Ekonomično: jedan Supabase projekt = fiksni trošak, bez $25/mj po klijentu
- Jednostavno: jedna SQL migracija za sve klijente
- Sigurno: Supabase RLS je robustan, koristi ga i Supabase za vlastiti dashboard
- Skalabilno: Supabase PostgreSQL može podnijeti tisuće tenanata

### Infrastruktura

| Servis | Account | Projekt |
|--------|---------|---------|
| GitHub | vadociatila-source | znr-erp (private) |
| Supabase | vadociatila@gmail.com | ZNR (nezvlavmduedcaiaumgi) |
| Resend | simpliapp4@gmail.com | API key u GitHub Secrets |
| Cloudflare | postojeći account | Pages → znr-erp.pages.dev |

### [ZAK] Arhitekturalni princip — legal_references tablica

Svi zakonski rokovi žive u `legal_references` tablici u bazi — **nikad u kodu**.

```sql
-- Primjer: rok za osposobljavanje
code: 'ZZnR-27-novi-radnik-30d'
deadline_days: 30
deadline_description: '30 dana od dana zaposlenja'
module_codes: ['M03']
```

Kad se zakon promijeni → samo `UPDATE` u tablici. Bez deplooya. Svaki klijent odmah dobiva ispravni rok.

---

## 7. Biznis model

### Cijene

| Paket | Za koga | Cijena/mj |
|---|---|---|
| **Micro** | Do 5 radnika | 15 EUR |
| **Small** | 6-20 radnika | 29 EUR |
| **Medium** | 21-50 radnika | 49 EUR |
| **Large** | 51+ radnika | 79 EUR |
| **ZNR Partner** | ZNR stručnjak, do 10 klijenata | 99 EUR |
| **ZNR Pro** | ZNR stručnjak, neograničeno | 199 EUR |

**Logika:** Kazna od 5.000 EUR = 14 godina Small pretplate. Prodajni argument je trivijalan.

### Distribucijski kanali

**Kanal 1 — Direktna prodaja online**  
Registracija, onboarding, plaćanje bez prodajnog razgovora.  
Akvizicija: Google Ads ("zaštita na radu softver hrvatska"), SEO.

**Kanal 2 — ZNR stručnjaci (Tip C) ← prioritet**  
Jedan stručnjak = N klijenata. ZNR Partner paket (99 EUR/mj) donosi mu 10 tvrtki.  
Stručnjak štedi 10+ sati/tjedan → snažan ROI argument.  
Partnerski program: 30% provizija od pretplate klijenata koje dovede.

**Kanal 3 — Računovodstveni servisi**  
Već imaju kontakt s klijentima. Prirodna ekstenzija uz računovodstvo.

**Kanal 4 — Branše s visokim rizicima**  
Građevinarstvo, industrija, automehaničari — obveza ZNR-a je najrigoroznija.  
Pristup: obrtnička komora, HOK, sektorske udruge.

---

## 8. Plan razvoja i sprint plan

### Faza 0 — Validacija (u tijeku)

**Status:** Paralelno s tehničkim postavljanjem.

1. Razgovor s ZNR stručnjacima — što im nedostaje u sadašnjem workflowu?
2. Razgovor s vlasnicima malih tvrtki — plaćaju li ZNR paušal? Koliko? Što boli?
3. Potvrditi platežno sposoban problem PRIJE puštanja u produkciju.

**Pilot za MVP:** ZNR stručnjak kojeg kontaktiramo u Fazi 0 validacije.

### Faza 1 — MVP (Sprintovi 001-008, ~2-3 mj)

| Sprint | Fokus |
|--------|-------|
| 001 | Foundation: Auth + tenant onboarding + CF deploy |
| 002 | Tenant registracija — onboarding wizard |
| 003 | M01 Radnici — CRUD + dosje |
| 004 | M03 Osposobljavanja + alarmi + ZOS PDF |
| 005 | M04 Zdravstveni pregledi + uputnica PDF |
| 006 | M05 Radna oprema + vatrogasni aparati + QR |
| 007 | M11 Akcijski centar |
| 008 | PDF komplet: EK-1, EK-2, EK-4, EK-5, ZOS |

**MVP opseg:** M01, M03, M04, M05 (djelomično), M11, PDF obrasci.  
**Van MVP-a:** M02 (procjena rizika), M06, M07, M08, M09, M10, multi-klijent Tip C.

### Faza 2 — Kompletni sustav (Sprintovi 009-012, ~3-6 mj od MVP)

| Sprint | Fokus |
|--------|-------|
| 009 | M02 Radna mjesta + procjena rizika |
| 010 | M08 Ozljede + OIR-1 + ER-2 (48h alarm) |
| 011 | ZNR stručnjak multi-klijent flow (Tip C) |
| 012 | M12 Inspekcijska mapa (ZIP export) |

### Faza 3 — Skaliranje (6+ mj od MVP)

- M06 Radni okoliš, M07 OZO, M09 Evakuacija, M10 SDS
- IS ZNR integracija (obavezno za Tip C)
- HZZO API — direktna prijava ozljeda (killer feature)
- Mobilna aplikacija — radnik vidi vlastiti dosje
- Praćenje izmjena propisa (NN RSS feed + alert)
- CSV/Excel uvoz radnika (onboarding friction)
- Praćenje troškova ZNR

---

## 9. Konkurentska pozicija

Detaljnu analizu vidi u: **ZNR_KONKURENCIJA_FEATURES.md**

### Sažetak

| Konkurent | Pozicija | Naša prednost |
|-----------|----------|---------------|
| WebZNR | Market leader, 500+ korisnika | Star UX (2007), bez AI, bez proaktivnog centra |
| ZNR.admin | Moderan, ISO 45001 | Složen za SME, bez ZNR stručnjak dashboarda |
| SafetyCulture | Mobile-first, globalan | Nije za HR ZZnR, nema HR obrasca |
| Cority/Intelex/Sphera | Enterprise, skupo | Previše kompleksno i skupo za SME |

**Mi jedini:**
- Prikazujemo zakonsku referencu uz svaki alarm (čl. + rok + kazna)
- Imamo Akcijski centar kao proaktivni ZNR hub
- Imamo ZNR stručnjak multi-klijent dashboard s alarm statusom
- Generiramo Inspekcijsku mapu jednim klikom (nijedna HR konkurencija)
- Pratimo broj radnika i upozoravamo na zakonske pragove (50+)
- Roadmap: HZZO API integracija, automatsko praćenje izmjena NN

---

## 10. Rizici

### Validacijski rizik (visoki) ← trenutno najvažniji

Ne znamo sigurno je li poslodavac / ZNR stručnjak spreman platiti 29-199 EUR/mj.  
Kazne su visoke, ali "svi riskiraju" mentalitet je raširen.

**Mitigacija:** Faza 0 razgovori PRIJE puštanja u produkciju. Fokus na Tip C (ZNR stručnjake) koji imaju jasnu ROI kalkulaciju.

### Zakonski rizik (srednji)

ZZnR zadnji put mijenjan 2018. PR-03 (NN 5/84) i PR-07 (NN 56/83) su stari 40+ godina, kandidati za reviziju.

**Mitigacija:** `legal_references` tablica u bazi — izmjena zakona = UPDATE, bez deplooya. Partnerstvo s ZNR stručnjacima koji prate NN.

### Konkurentski rizik (niski-srednji)

WebZNR (500+ korisnika, 15+ godina) ima veliku bazu lojalnih korisnika.

**Mitigacija:** Fokus na ZNR stručnjake (Tip C) koji trenutno nemaju softver koji ih podržava. Bolji UX, proaktivni alarmi, inspekcijska mapa.

### Certificiranost (nepoznanica)

Treba verificirati: mora li softver biti odobren od ZUZN-a za zakonski valjanu digitalnu evidenciju?

**Istraživanje:** Zakon dopušta digitalnu evidenciju. Nema eksplicitnog zahtjeva za certificiranost (verificirati direktno s ZUZN-om).

---

## 11. Sljedeći koraci

### Odmah (Faza 0 — paralelno s razvojem)

1. **Razgovor s ZNR stručnjacima** (Tip C) — 45 min, otvorena pitanja:
   - Koliko klijenata vode? Što koriste danas?
   - Koliko sati/tjedan troše na administraciju?
   - Bi li platili 99 EUR/mj za alat koji im uštedi 10+ sati?
2. **Razgovor s poslodavcima** — plaćaju li ZNR paušal? Koliko? Znaju li za rokove?

### Tehnički (Sprint 001)

1. Pokreni SQL migracije u Supabase ZNR projektu (001→004)
2. Popuni `.env` s anon key-em
3. `npm install && npm run dev` — login ekran
4. Kreiraj GitHub repo `znr-erp` → push
5. Cloudflare Pages → Connect to Git
6. GitHub Secrets (5 secretsa)
7. Claude Code → Sprint 001

Detalji su u **SETUP_GUIDE.md**.

---

*Dokument: ZNR ERP Projektna dokumentacija v2.0*  
*Autor: Atila Vadoci + Claude (Anthropic)*  
*Datum: Travanj 2026.*  
*Sljedeći pregled: Nakon Faze 0 validacije*
