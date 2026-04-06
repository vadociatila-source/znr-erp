# ZNR ERP — Analiza konkurencije i feature checklist
## Što moramo imati da ne zaboravimo ništa

> Datum istraživanja: Travanj 2026.
> Osnova: Analiza 12 konkurentskih sustava — HR i globalni
> Svrha: Ne kopirati — provjeriti da ništa ne propustimo

---

## 1. KONKURENTI — PREGLED

### 🇭🇷 HR TRŽIŠTE (direktna konkurencija)

---

#### WebZNR (Linija koda d.o.o.) — MARKET LEADER u Hrvatskoj
> **Pozicija:** 500+ korisnika, 300+ tvrtki, 60.000 djelatnika. 15+ godina iskustva. Najveći HR ZNR projekt.

**Što imaju:**
- Evidencija radnika, strojeva, vatrogasnih aparata
- Evidencijski kartoni: EK-1, EK-2, EK-4, EK-5 (HR standardni obrasci)
- Osposobljavanja s isticanjem rokova (email obavijesti)
- Digitalni arhiv (PDF, Word, Excel, JPG attachmenti uz svaki zapis)
- Modul procjene rizika → generira Word dokument
- ISZNR modul (za ovlaštene kuće — dostava podataka Ministarstvu)
- Modul online osposobljavanja (teorijsko + praktično, izdaje uvjerenja)
- Korisnički portal za zaposlenike (read-only vlastiti podaci)
- Multi-tvrtka switching (ZNR stručnjak vodi više firmi)
- Praćenje troškova (cijena po pregledu/ispitivanju, budžetiranje)
- CSV uvoz radnika iz kadrovskog softvera (+ auto-sinkronizacija)
- OIR-1 obrazac (obavijest o težoj ozljedi / smrtnom slučaju)
- ZOS obrazac (Zapisnik o ocjeni osposobljenosti)
- 2FA autentikacija
- Transparentni audit log (tko je kada pristupio/promijenio)
- Instalacija na vlastiti server (on-premise opcija)
- Vatrogasni aparati kao posebna evidencija

**Slabosti WebZNR-a:**
- Star UX (2007. dizajn)
- Nema mobilne aplikacije
- Nema automatizacije / AI-a
- Nema proaktivnog akcijskog centra
- Procjena rizika je Word export, nije integrirana

---

#### ZNR.admin cloud (Internet arhiva d.o.o.)
> **Pozicija:** Modernije rješenje. Jedino koje pokriva ZNR + ZOP + Zaštita okoliša + ISO 45001 u startu.

**Što imaju:**
- Sve što WebZNR + zaštita od požara u startu
- Kolorirani kalendar rokova (vizualni pregled po mjesecima)
- Automatizirana izrada ZOS, EK kartona, uputnica, prijava ozljeda
- Grupni uvoz iz Excel/Word/IS ZNR/WebZNR (migracija!)
- Barcode skeniranje inventurnog broja radne opreme
- Grupna izmjena podataka (bulk operacije)
- RCFA analiza incidenata (Root Cause Failure Analysis)
- ONTO očevidnik + automatsko generiranje ONTO obrasca (zaštita okoliša)
- Analiza radnog mjesta po opasnostima → automatizirana procjena rizika u Word formatu
- ISO 45001:2018 modul (međunarodna norma)
- Vlastiti Word predlošci kao obrasci (prilagodba)
- Višestruke lokacije i organizacijske jedinice
- Kontrolirani pristup vanjskim korisnicima

**Slabosti ZNR.admin:**
- Nema mobilne aplikacije
- Bez automatizacije i AI-a
- Kompleksno — puno toga = steep learning curve za malog poslodavca

---

#### IS ZNR (Ministarstvo rada)
> **Pozicija:** Državni registry — NIJE komercijalni konkurent. Ali je važan jer se integrira s njim.
- Evidencija ovlaštenih osoba za ZNR
- Ovlaštene kuće dostavljaju podatke o obavljenim poslovima
- **Za nas:** WebZNR i ZNR.admin imaju ISZNR modul → mi trebamo razmotriti u Fazi 2

---

#### ZIRS (Zavod za istraživanje i razvoj sigurnosti)
> **Pozicija:** Ovlaštena tvrtka za usluge ZNR + organizator konferencija. **Nemaju vlastiti softver.** Partner, ne konkurent.

---

#### Centar za zaštitu na radu
> **Pozicija:** Ovlaštena tvrtka za usluge ZNR. **Nemaju softver.** Potencijalni distributer Tip C.

---

#### HUSZNR (Hrvatska udruga stručnjaka ZNR)
> **Pozicija:** Udruga. Novosti, edukacije, propisi. Nije softver. **Ključan kanal za doseg Tip C korisnika (ZNR stručnjaci).**

---

#### Sigurnost (ZIRS časopis / portal)
> **Pozicija:** Stručni časopis i informacijski portal. Nije direktan konkurent.

---

### 🌍 GLOBALNI IGRAČI (nisu realna prijetnja za HR SME, ali imaju ideje)

---

#### SafetyCulture (iAuditor) — Australija, 70.000+ org.
> **Pozicija:** Mobile-first inspekcijska platforma. Fokus na terenski rad, audite, checkliste.

**Što imaju (relevantno za nas):**
- Drag-and-drop builder za forme/checkliste
- Offline rad (sync kad dođe internet)
- Foto i video dokazi direktno iz mobitela
- QR kod reporting (radnik skenira → prijavi opasnost)
- Corrective actions: assign osobi, prioritet, deadline
- Automated report generation odmah po inspekciji
- Training modul (LMS) — kreiranje i deploy treninga
- Sensor i weather feed integracije (IoT)
- "Heads Up" — video poruke timu
- AI template generator (opiši, dobij predložak)
- Template library s tisućama predložaka
- Integracije: Tableau, PowerBI, SAP
- Analytics dashboard u realnom vremenu
- Besplatna verzija za timove do 10

**Za ZNR ERP — ideje:**
- QR kod na radnoj opremi → skeniraš → vidiš status pregleda
- Foto dokaz pri ozljedi (mobile upload)
- Offline mode za terenski rad

---

#### EcoOnline — Norveška, 10.000+ brandova, Verdantix Leader
> **Pozicija:** Sveobuhvatna EHS + Chemical Safety + Environmental + Training platforma.

**Što imaju (relevantno za nas):**
- Automatsko sourcing SDS listova od proizvođača (baza 750.000+ COSHH procjena)
- Chemical inventory → skeniraj barcode → sustav vuče SDS, klasificira po GHS
- Incident management s grafikonima trenda
- Risk assessment softver
- Emergency response & critical event management
- Lone Worker zaštita (24/7 praćenje)
- ESG reporting / Carbon accounting
- LMS (Learning Management System) za e-learning
- Access Control / verifikacija kvalifikacija osoblja
- QR code reporting za frontline radnike
- Automatsko praćenje zakonskih izmjena (notification kad se promijeni propis)
- Multi-country compliance (multi-jurisdikcija)
- "Audit-ready" izvješća jednim klikom

**Za ZNR ERP — ideje:**
- Automatsko praćenje izmjena ZZnR / pravilnika (integriraj s NN RSS?)
- SDS barcode skeniranje za kemikalije
- "Audit-ready" → naš "Inspekcijska mapa" feature je ekvivalent

---

#### Sphera — Enterprise, kemija/energija/manufacturing
> **Pozicija:** EHS + Operational Risk + Product Stewardship za industriju s visokim rizicima.

**Relevantno za nas:**
- Process Safety Management (PSM) za opasne tvrtke
- Lifecycle Analysis (LCA)
- Third-party / supplier risk management
- Product stewardship

**Za ZNR ERP:** Previše enterprise za naš target. Ali PSM → manji poslodavci ne trebaju.

---

#### Intelex — Kanada, Enterprise EHS + Quality
> **Pozicija:** Sveobuhvatan EHS + Quality management. 2025 → Intelex Essentials za SME!

**Što imaju (relevantno):**
- Hazard identification + risk assessment + mitigation planning
- Compliance management (praćenje regulatornih obveza)
- Corrective and preventive actions (CAPA)
- Document control (version management, approval workflow)
- Training management (tko je prošao, tko nije)
- Analytics dashboards real-time
- Legal applicability tracking
- ehsAI akvizicija (AI u EHS)
- **Intelex Essentials** (2025) — pre-konfiguriran za SME, guided onboarding

**Za ZNR ERP — ideje:**
- CAPA sustav (Corrective and Preventive Actions) — planiranje mjera poboljšanja
- Document version control (procjena rizika v1, v2, v3...)
- Guided onboarding za novog korisnika

---

#### Cority — Kanada/SAD, Enterprise EHS + Occupational Health
> **Pozicija:** Najkompletniji EHS + zdravlje radnika sustav. AI-driven. Enterprise.

**Što imaju (relevantno):**
- Predictive analytics — AI predviđa incident PRIJE nego se dogodi (Q4 2024)
- Video AI za ergonomske rizike (analiza pokreta radnika)
- Bow-tie risk visualization (vizualni prikaz uzroka → događaj → posljedice)
- Chemical management
- Occupational health — zdravstveni kartoni, surveillance programi
- Telemedicine / virtual care integracija
- FedRAMP sigurnosni standardi
- AI-based incident anomaly detection
- myCority mobilna aplikacija

**Za ZNR ERP — ideje:**
- Bow-tie vizualizacija rizika — odlično za procjenu rizika u budućnosti
- Predictive alarm: "Radna oprema X ima povijest kvarova — pregled uskoro!"

---

## 2. FEATURE MATRICA — ŠTO SMO PLANIRALI vs. ŠTO KONKURENCIJA IMA

### Legenda
- ✅ = U našem planu (MVP ili Faza 2)
- ❌ = Nije u planu, razmisliti
- 🔵 = Samo globalni (enterprise) — ne trebamo sada
- ⭐ = Naša prednost / differentiator
- 🚨 = Rupa — zaboravljeno, dodati!

---

### A) CORE EVIDENCIJE (zakonska obveza)

| Feature | Mi | WebZNR | ZNR.admin | SafetyCulture | Status |
|---|---|---|---|---|---|
| Evidencija radnika | ✅ M01 | ✅ | ✅ | ✅ | OK |
| Radna mjesta | ✅ M02 | ✅ | ✅ | — | OK |
| Osposobljavanja | ✅ M03 | ✅ | ✅ | ✅ | OK |
| Zdravstveni pregledi | ✅ M04 | ✅ | ✅ | — | OK |
| Radna oprema | ✅ M05 | ✅ | ✅ | — | OK |
| Radni okoliš | ✅ M06 | ✅ | ✅ | — | OK |
| OZO | ✅ M07 | — | ✅ | — | OK |
| Ozljede na radu | ✅ M08 | ✅ | ✅ | — | OK |
| Evakuacija | ✅ M09 | — | — | — | ⭐ Naša prednost |
| SDS listovi | ✅ M10 | — | ✅ | ✅ | OK |
| Vatrogasni aparati | ❌ | ✅ | ✅ | — | 🚨 ZABORAVLJENO! |

---

### B) ALARMI I OBAVIJESTI

| Feature | Mi | WebZNR | ZNR.admin | Globalni |
|---|---|---|---|---|
| Email alarmi za istječe rok | ✅ | ✅ | ✅ | ✅ |
| Akcijski centar (dashboard) | ✅ M11 | Djelomično | Kalendar | ✅ |
| Alarm stupnjevi (90/60/30 dana) | ✅ | Konfigurabilan | ✅ | ✅ |
| Alarm odmah (isteklo) | ✅ | ✅ | ✅ | ✅ |
| SMS alarmi | ❌ | — | — | Neke | 🚨 Razmisliti |
| Push notifikacija (mobitel) | ❌ | — | — | ✅ | Faza 3 |
| Alarm na pragovne radnike (50+) | ✅ | — | — | — | ⭐ |

---

### C) DOKUMENTI I PDF GENERIRANJE

| Feature | Mi | WebZNR | ZNR.admin |
|---|---|---|---|
| EK-1 (Evidencijski karton) | 🚨 ZABORAVLJENO | ✅ | ✅ |
| EK-2 (Evidencijski karton) | 🚨 ZABORAVLJENO | ✅ | ✅ |
| EK-4 (Evidencijski karton) | 🚨 ZABORAVLJENO | ✅ | ✅ |
| EK-5 (Evidencijski karton) | 🚨 ZABORAVLJENO | ✅ | ✅ |
| ZOS obrazac | ✅ | ✅ | ✅ |
| Uputnica za zdravstveni pregled | 🚨 ZABORAVLJENO | ✅ | ✅ |
| OIR-1 (obavijest o ozljedi) | 🚨 ZABORAVLJENO | ✅ | ✅ |
| ER-2 (prijava ozljede HZZO) | ✅ Faza 2 | ✅ | ✅ |
| Procjena rizika (Word/PDF) | ✅ Faza 2 | ✅ (Word) | ✅ (Word) |
| Inspekcijska mapa (ZIP) | ✅ M12 | — | — | ⭐ |
| Vlastiti predlošci (upload Word) | ❌ | — | ✅ | 🚨 Razmisliti |

---

### D) UVOZ I INTEGRACIJE

| Feature | Mi | WebZNR | ZNR.admin |
|---|---|---|---|
| CSV uvoz radnika | ❌ | ✅ | ✅ | 🚨 BITNO za onboarding |
| Excel uvoz | ❌ | ✅ | ✅ | 🚨 BITNO |
| IS ZNR integracija | ❌ | ✅ | ✅ | Faza 2 |
| Sinkronizacija s kadrovskim | ❌ | ✅ (za veće) | ✅ | Faza 3 |
| Migracija iz WebZNR/ZNR.admin | ❌ | — | ✅ | 🚨 Killer feature za switching |
| HZZO API (prijava ozljeda) | ✅ Faza 3 | — | — | ⭐ |

---

### E) UX I PRISTUP

| Feature | Mi | WebZNR | ZNR.admin | SafetyCulture |
|---|---|---|---|---|
| Web aplikacija | ✅ | ✅ | ✅ | ✅ |
| Mobilna aplikacija | Faza 3 | ❌ | ❌ | ✅ |
| QR kod na opremi | ❌ | — | ✅ (barcode) | ✅ | 🚨 Odlična ideja |
| Offline rad | ❌ | — | — | ✅ | Faza 3 |
| Radnik vidi vlastiti dosje | ✅ (Faza 3) | ✅ | ✅ | — |
| 2FA | ❌ | ✅ | — | ✅ | 🚨 Sigurnost — dodati |
| Audit log (tko je promijenio) | ❌ | ✅ | — | — | 🚨 GDPR obveza |
| Multi-tvrtka (ZNR stručnjak) | ✅ | ✅ | ✅ | — | OK |
| On-premise opcija | ❌ | ✅ | — | — | Nerelevantno za nas |

---

### F) PRAĆENJE TROŠKOVA

| Feature | Mi | WebZNR | ZNR.admin |
|---|---|---|---|
| Cijena po pregledu/ispitivanju | ❌ | ✅ | ✅ | 🚨 Razmisliti za Faza 2 |
| Budžet/troškovnik ZNR | ❌ | ✅ | — | 🚨 Zanimljivo |
| Godišnji trošak ZNR po tvrtki | ❌ | ✅ | — | 🚨 Dobar insight za korisnika |

---

### G) ISO I ŠIRE COMPLIANCE

| Feature | Mi | ZNR.admin | Globalni |
|---|---|---|---|
| ISO 45001:2018 | ❌ | ✅ | ✅ | Faza 3 |
| Zaštita od požara (ZOP) | ❌ | ✅ | — | 🚨 Pitaj korisnike |
| Zaštita okoliša | ❌ | ✅ | EcoOnline | Daleka budućnost |
| ESG reporting | ❌ | — | ✅ | Irelevantno za SME |

---

### H) AI I NAPREDNE FUNKCIJE (globalni igrači)

| Feature | Mi | SafetyCulture | Cority | EcoOnline |
|---|---|---|---|---|
| AI template generator | ❌ | ✅ | — | — | Razmotriti |
| Predictive analytics | ❌ | — | ✅ | — | Faza 3+ |
| Auto-sourcing SDS-ova | ❌ | — | — | ✅ | 🚨 Odlično za SDS modul |
| Bow-tie risk visualization | ❌ | — | ✅ | — | Faza 3 |
| Video AI (ergonomija) | ❌ | — | ✅ | — | Irelevantno za SME |
| Automatsko praćenje izmjena propisa | ❌ | — | — | ✅ | 🚨 Razmotriti! |

---

## 3. PRONAĐENE RUPE — PRIORITIZIRANI POPIS

### 🔴 KRITIČNO — Odmah dodati (MVP ili pre-MVP)

#### R1: Vatrogasni aparati — zaboravljeni modul!
**Problem:** I WebZNR i ZNR.admin imaju evidenciju vatrogasnih aparata. Mi smo to propustili.
**Zakon:** Pravilnik o zaštiti od požara (nije ZZnR, ali je zakonska obveza paralelna)
**Akcija:** Dodati u M05 Radna oprema kao poseban tip (vatrogasni aparat), ili kao M05b — poseban submodul.
**Rok pregleda aparata:** Vizualni pregled 1x/godišnje, servis 2 god, zamjena po pravilniku.
**Napomena:** Ako ne radimo ZOP (zaštita od požara), barem vatrogasni aparati moraju biti u evidenciji radne opreme.

#### R2: Evidencijski kartoni (EK-1, EK-2, EK-4, EK-5)
**Problem:** Ovo su standardni HR ZNR obrasci koje svi HR korisnici poznaju i očekuju.
**EK-1** — Evidencijski karton zaposlenika (ukupni ZNR profil)
**EK-2** — Evidencija o osposobljavanju
**EK-4** — Evidencija o zdravstvenim pregledima
**EK-5** — Evidencija o radnoj opremi
**Akcija:** Generiranje ovih kartona je MVP feature — korisnici to TRAŽE od prvog dana.
**[ZAK: čl. 61 ZZnR]** — svi ovi kartoni su zakonska obveza evidencije.

#### R3: Uputnica za zdravstveni pregled
**Problem:** Svaki poslodavac šalje radnika na pregled s uputnicom. I WebZNR i ZNR.admin generiraju to.
**Što je uputnica:** Standardni obrazac s podacima o radniku, radnom mjestu, opasnostima.
**Akcija:** Dodati generiranje uputnice u M04 (Zdravstveni pregledi). MVP.

#### R4: OIR-1 obrazac (Obavijest o ozljedi)
**Problem:** Kod ozljede na radu postoji i OIR-1 (obavijest o događaju). WebZNR ga generira.
**Razlika:** ER-2 = prijava HZZO-u (rokova 48h), OIR-1 = interni obrazac za evidenciju
**Akcija:** Dodati uz ER-2 u M08 (Ozljede na radu). Faza 2.

#### R5: 2FA autentikacija
**Problem:** WebZNR ima 2FA. Radi se o medicinskim i osobnim podacima — GDPR zahtijeva adekvatnu zaštitu.
**Akcija:** Supabase Auth podržava TOTP/MFA nativno. Uključiti od starta.
**Zakon:** GDPR — čl. 32 — adekvatne tehničke mjere za zaštitu osobnih podataka.

#### R6: Audit log (tko je promijenio što i kada)
**Problem:** WebZNR ga ima. GDPR zahtijeva traceability pristupa osobnim podacima.
**Akcija:** Supabase ima `created_by`, `updated_by`, ali trebamo pravi audit log tablicu.
**[ZAK: GDPR čl. 5(2) — accountability princip]**

---

### 🟠 VAŽNO — Dodati u Fazi 2

#### V1: CSV/Excel uvoz radnika
**Problem:** Svaka tvrtka ima radnike u Excelu. Ručni unos 50 radnika = loše iskustvo.
**Akcija:** Import wizard — prihvati Excel/CSV, mapiranje kolona, preview, uvoz.
**Posebno važno:** Migracija iz WebZNR/ZNR.admin = switching tool.

#### V2: Praćenje troškova ZNR
**Problem:** WebZNR ima — korisnici planiraju budžet ZNR-a.
**Feature:** Po svakom pregledu/ispitivanju → unos cijene → godišnji troškovnik ZNR.
**Vrijednost:** "ZNR vas košta 8.400 EUR/god — naša pretplata je 588 EUR." Dobar ROI argument.

#### V3: QR kod na radnoj opremi
**Ideja SafetyCulture/ZNR.admin:** Printaš QR naljepnicu, zalijepis na stroj → mobitelom skeniraš → vidiš status pregleda, rok, zadnji zapisnik.
**Implementacija:** generate QR (qrcode.js) koji vodi na read-only stranicu opreme.
**Vrijednost:** Inspektor na terenu može odmah provjeriti status opreme.

#### V4: IS ZNR integracija (dostava podataka Ministarstvu)
**Problem:** Ovlaštene kuće (Tip C korisnici) moraju dostavljati podatke u IS ZNR Ministarstva.
**Akcija:** ISZNR modul za Tip C. WebZNR i ZNR.admin ga imaju — mi bez njega gubimo Tip C.
**Faza:** 2 (ali istraži API dokumentaciju odmah).

#### V5: Automatsko praćenje izmjena propisa
**Ideja EcoOnline:** Sustav automatski prati izmjene zakona i obavještava.
**Naša implementacija:** 
1. RSS feed Narodnih novina (nn.hr ima feed)
2. Keyword filter (ZZnR, pravilnik o ZNR)
3. Admin notifikacija → Claude analizira → kreira ticket za ažuriranje `legal_references`
4. Korisnik vidi u sustavu: "Propis se promijenio — sustav se ažurira"
**Vrijednost:** Korisnik ne mora pratiti NN. Mi pratimo. Diferencijator.

---

### 🟡 RAZMOTRITI — Za kasniju fazu

#### Rz1: Zaštita od požara (ZOP) modul
**Problem:** I WebZNR i ZNR.admin imaju ZOP u startu. Mi nemamo.
**Zakon:** Zakon o zaštiti od požara (NN 92/10 i izmjene)
**Bitne evidencije ZOP:**
- Vatrogasni aparati (pregledi, rok)
- Hidrantska mreža (ispitivanje)
- Sustavi za dojavu požara (redovni pregledi)
- Plan zaštite od požara
- Osposobljavanje za protupožarnu zaštitu
**Rizik:** Bez ZOP-a gubimo klijente koji traže sve na jednom mjestu.
**Preporuka:** Dodati vatrogasne aparate u MVP (M05), ostalo u Fazi 2.

#### Rz2: Organizacijske jedinice / lokacije
**Problem:** ZNR.admin ima — tvrtke s više lokacija (gradilišta, poslovnice) trebaju to.
**Primjer:** Građevinska firma ima 5 gradilišta. Svako gradilište ima svoju opremu i radnike.
**Akcija:** Dodati `location` i `department` polje na radnike i opremu.

#### Rz3: Vlastiti Word/PDF predlošci
**ZNR.admin ima:** Korisnik uploaduje vlastiti Word predložak → sustav ga popunjava podacima.
**Naš pristup:** Mi generiramo PDF iz koda (@react-pdf/renderer). Dugoročno — razmisliti o custom predlošcima.

#### Rz4: Corrective and Preventive Actions (CAPA)
**Globalni standard:** Nakon ozljede ili incidenta → definiraj korektivne mjere → prati realizaciju.
**Naš ekvivalent:** Dijelom u M08 (Ozljede — provedene mjere). Proširiti na formalni CAPA proces.

#### Rz5: Guided onboarding
**Intelex Essentials ideja:** Pre-konfiguriran sustav, guided setup wizard za nove korisnike.
**Naša prilagodba:**
- Korak 1: Unesi tvrtku (veličina, djelatnost)
- Korak 2: Dodaj radnike (ili uvezi iz Excela)
- Korak 3: Definiraj radna mjesta
- Korak 4: Provjeri zakonske obveze koje se odnose na tebe
- Korak 5: Akcijski centar s prvim alarmima

---

## 4. NAŠE DIFERENCIJACIJE (što mi imamo, a konkurencija nema)

| Feature | Zašto je to važno |
|---|---|
| ⭐ Akcijski centar s zakonskim referencama | Korisnik vidi zakon, rok i kaznu — ne samo alarm |
| ⭐ Inspekcijska mapa (ZIP jednim klikom) | Nijedna HR konkurencija to nema |
| ⭐ ZNR stručnjak multi-klijent dashboard | WebZNR ima switching, mi imamo pregled statusa svih klijenata |
| ⭐ Alarm na pragu radnika (50+) | Automatska obavijest kad zakonska obveza eskalira |
| ⭐ Legal_references tablica (zakon bez deplooya) | Internoj arhitekturi — brzina ažuriranja propisa |
| ⭐ Digitalni potpis radnika | Elektronski potpis zapisnika (email link "Potvrđujem") |
| ⭐ HZZO API (Faza 3) | Direktna prijava ozljede — nijedna HR aplikacija nema |
| ⭐ Moderan UX (vs. 2007 WebZNR dizajn) | Lakše za onboarding malih poslodavaca |
| ⭐ Automatizacija AI-om (Faza 3+) | "ZNR na autopilotu" — naša vizija |

---

## 5. AŽURIRANI MVP SCOPE (s dopunama iz analize)

### Što dodati u MVP (nije bilo u originalnom planu):

**Obrasci (kritično):**
- EK-1 i EK-2 evidencijski kartoni (zakonski standard)
- Uputnica za zdravstveni pregled

**Evidencija:**
- Vatrogasni aparati kao tip u M05 (minimalno)

**Tehničko:**
- 2FA (Supabase MFA) — od starta
- Audit log — od starta (GDPR)
- CSV/Excel uvoz radnika — MVP (ili odmah nakon)

### Što OSTAJE van MVP (ali sad imamo na umu):
- ZOP kompletan modul
- IS ZNR modul
- Praćenje troškova
- QR kod na opremi
- RCFA analiza

---

## 6. TRŽIŠNO POZICIONIRANJE (zaključak)

```
WebZNR = Stari market leader, loš UX, bez mobilne app, bez AI
ZNR.admin = Moderniji, složeniji, targeting veće tvrtke i ZNR stručnjake
SafetyCulture = Mobile-first inspections, nije fokusiran na HR zakon
Cority/Intelex/Sphera = Enterprise, skupo, previše kompleksno za SME

MI = Jedino rješenje koje:
  → Je dizajnirano specifično za HR zakone (ZZnR, pravilnici)
  → Prikazuje zakonske reference uz svaki alarm
  → Cilja SME s jednostavnim UX
  → Ima proaktivni AI akcijski centar (roadmap)
  → Ima ZNR stručnjak multi-klijent flow
  → Generira inspekcijsku mapu jednim klikom
  → Automatizira praćenje zakonskih izmjena (roadmap)
```

---

*Dokument: ZNR_KONKURENCIJA_FEATURES.md v1.0*
*Autor: Atila Vadoci + Claude (Anthropic)*
*Datum: Travanj 2026.*
*Temelj: Analiza WebZNR, ZNR.admin, IS ZNR, ZIRS, Centar ZNR, HUSZNR, SafetyCulture, EcoOnline, Sphera, Intelex, Cority*
