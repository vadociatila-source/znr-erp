# ZNR ERP — Pravni okvir i zakonske reference
## Živi dokument — ažurirati kod svake promjene propisa

> Verzija: 2.0 | Datum: Travanj 2026.  
> **UPUTA:** Kada se promijeni propis — ažuriraj ovaj dokument I tablicu `legal_references` u Supabase. Promjena u tablici stupa na snagu odmah, bez deplooya.

---

## 1. KROVNI ZAKON

### Zakon o zaštiti na radu (ZZnR)
- **Puni naziv:** Zakon o zaštiti na radu
- **Objava:** NN 71/14
- **Izmjene:** NN 118/14, 94/18, 96/18
- **Nadležnost:** Ministarstvo rada, mirovinskoga sustava, obitelji i socijalne politike
- **URL:** https://www.zakon.hr/z/167/Zakon-o-za%C5%A1titi-na-radu

**Ključni članci:**

| Članak | Sadržaj | Modul |
|--------|---------|-------|
| čl. 18 | Obveza procjene rizika | M02 |
| čl. 20 | Organizacija ZNR (50+ radnika → stručnjak ZNR) | M01, M11 |
| čl. 27 | Osposobljavanje radnika | M03 |
| čl. 34 | Zdravstveni pregledi | M04 |
| čl. 45 | Plan evakuacije i vježbe | M09 |
| čl. 50 | Pregled i ispitivanje radne opreme | M05 |
| čl. 61 | Obvezne evidencije (7 vrsta) | Svi moduli |
| čl. 62 | Ozljede na radu — prijava 48h | M08 |
| čl. 70 | Odbor ZNR (50+ radnika, min. 2x/god) | M11 |
| čl. 85 | Prekršajne odredbe | ⚠️ Kazne: 5.000–50.000 EUR |

---

## 2. PRAVILNICI — DETALJI

### PR-01: Pravilnik o obavljanju poslova zaštite na radu
- **NN:** 112/14, 43/15, 72/15, 126/19, 154/22
- **Regulira:** Uvjeti za stručnjaka ZNR I. i II. stupnja, ovlaštene osobe
- **Modul:** M03, Tip C korisnik (ZNR stručnjak)
- **Status:** 🔄 Faza 2

### PR-02: Pravilnik o osposobljavanju iz zaštite na radu
- **NN:** 142/21
- **Regulira:** Program osposobljavanja, sadržaj, izvoditelji
- **Modul:** M03
- **Ključni rokovi:**
  - Novi radnik: **30 dana od zaposlenja** [čl. 27 ZZnR]
  - Usavršavanje (provjera znanja): **svake 4 godine**
  - Kod promjene radnog mjesta: **odmah**
- **Status:** ✅ MVP — implementirano u `legal_references` tablici

### PR-03: Pravilnik o poslovima s posebnim uvjetima rada
- **NN:** 5/84 ⚠️ Star 40+ godina — pratiti reviziju!
- **Regulira:** Lista poslova koji zahtijevaju posebne zdravstvene uvjete
- **Modul:** M02, M04
- **Status:** ✅ MVP — šifarnik u bazi

### PR-04: Pravilnik o pregledu i ispitivanju radne opreme
- **NN:** 16/16
- **Regulira:** Obveza i metodologija pregleda strojeva i uređaja
- **Modul:** M05
- **Ključni rokovi:**
  - Standardna oprema: **max. svake 3 godine**
  - Oprema s povećanim opasnostima: poseban raspored
- **Status:** ✅ MVP — implementirano

### PR-05: Pravilnik o ispitivanju radnog okoliša
- **NN:** (verificirati aktualnu verziju!)
- **Regulira:** Mjerenje fizikalnih, kemijskih i bioloških čimbenika
- **Modul:** M06
- **Ključni rokovi:**
  - Fizikalni (mikroklima, buka, rasvjeta): **max. svake 3 godine**
  - Kemijski (prašine, plinovi): **max. svake 2 godine**
- **Status:** 🔄 Faza 2

### PR-06: Pravilnik o osobnoj zaštitnoj opremi
- **NN:** 5/21
- **Regulira:** Evidencija OZO, rokovi zamjene
- **Modul:** M07
- **Napomena:** Rokovi zamjene su **po procjeni rizika** — nije fiksni rok
- **Status:** 🔄 Faza 2

### PR-07: Pravilnik o pružanju prve pomoći radnicima
- **NN:** 56/83 ⚠️ Star 40+ godina — pratiti reviziju!
- **Regulira:** Obveze osiguranja prve pomoći
- **Modul:** M01 (evidencija PP osoba)
- **Ključno:** 1 osoba osposobljena za PP na 50 radnika
- **Status:** 🔄 Faza 2

### ZOP: Zakon o zaštiti od požara + Pravilnik
- **NN:** 92/10 i izmjene
- **Regulira:** Vatrogasni aparati, hidrantska mreža, plan zaštite od požara
- **Modul:** M05 (vatrogasni aparati su dio evidencije opreme)
- **Ključni rokovi:**
  - Vizualni pregled vatrogasnog aparata: **1x godišnje**
  - Servis vatrogasnog aparata: **svake 2 godine**
- **Status:** ✅ MVP — implementirano u M05 kao tip opreme

---

## 3. MATRICA ROKOVA — osnova za alarm engine

```
OBVEZA                          ROK         ALARM_90  ALARM_60  ALARM_30  ALARM_ODMAH
─────────────────────────────────────────────────────────────────────────────────────
Osposobljavanje novog radnika   30 dana     —         —         ✓ (dan 1) ✓ (dan 30)
Periodički zdravstveni pregled  1-3 god     ✓         ✓         ✓         ✓
Prethodni zdravstveni pregled   Odmah       —         —         —         ✓ (zaposlenje)
Pregled radne opreme            3 god       —         ✓         —         ✓
Vatrogasni aparat (vizualni)    1 god       —         —         ✓         ✓
Vatrogasni aparat (servis)      2 god       —         ✓         —         ✓
Ispitivanje okoliša (fizikalni) 3 god       ✓         —         —         ✓
Ispitivanje okoliša (kemijski)  2 god       ✓         —         —         ✓
Vježba evakuacije               1/god       ✓         —         —         ✓
Usavršavanje ZNR radnika        4 god       —         —         ✓         ✓
Odbor ZNR (>50 radnika)         2/god       —         —         ✓         ✓
Revizija procjene rizika        2 god       ✓         —         —         ✓
OZO zamjena                     Po procjeni —         —         ✓         ✓
Prijava ozljede HZZO            48 sati     —         —         —         ✓ ODMAH!
```

**Svi rokovi su u `legal_references` tablici u Supabase — nikad u kodu!**

---

## 4. OBVEZE PO BROJU RADNIKA — triggerima za sustav

| Prag | Nova obveza | Akcija u sustavu |
|------|-------------|------------------|
| 1+ | Sve temeljne ZNR obveze | Onboarding checklist |
| 5+ | Procjena rizika obvezna pisanim aktom | Upozorenje pri unosu 5. radnika |
| 20+ | Povjerenik radnika za ZNR preporučen | Informacija korisniku |
| 50+ | Obvezan stručnjak ZNR u radnom odnosu | ⚠️ Upozorenje + zakonska ref. |
| 50+ | Obvezan Odbor ZNR (min. 2x/god) | Alarm za sjednice |
| 100+ | Obvezan interni ZNR stručnjak II. stupnja | Upozorenje + zakonska ref. |
| 250+ | Obvezna samostalna stručna služba | Upozorenje + zakonska ref. |

---

## 5. EVIDENCIJE — čl. 61 ZZnR

Zakon propisuje 7 vrsta evidencija. Sve su trajnog roka čuvanja.

| # | Evidencija | Modul | Status |
|---|-----------|-------|--------|
| 1 | Radnici osposobljeni za siguran rad | M03 | ✅ MVP |
| 2 | Radnici na posebnim uvjetima | M02, M04 | ✅ MVP |
| 3 | Ozljede, prof. bolesti, nezgode | M08 | 🔄 Faza 2 |
| 4 | Pregledi i ispitivanja opreme | M05 | ✅ MVP |
| 5 | Ispitivanja radnog okoliša | M06 | 🔄 Faza 2 |
| 6 | Osobna zaštitna oprema | M07 | 🔄 Faza 2 |
| 7 | Dosjei radnika (pregledi, osposobljavanja) | M01 | ✅ MVP |

**Digitalni oblik:** Zakon dopušta digitalnu evidenciju. Nema eksplicitnog zahtjeva za certificiranost softvera — ali vrijedi verificirati s ZUZN-om.

---

## 6. PDF DOKUMENTI — obvezni za generiranje

| Dokument | Zakonska osnova | Prioritet | Status |
|----------|----------------|-----------|--------|
| ZOS — Zapisnik o ocjeni osposobljenosti | čl. 27 ZZnR + PR-02 | MVP | 🔄 Sprint 004 |
| Potvrda o osposobljenosti | PR-02 | MVP | 🔄 Sprint 004 |
| Uputnica za zdravstveni pregled | čl. 34 ZZnR + PR-03 | MVP | 🔄 Sprint 005 |
| EK-1 — Evidencijski karton zaposlenika | čl. 61 ZZnR | MVP | 🔄 Sprint 008 |
| EK-2 — Evidencija o osposobljavanju | čl. 61 ZZnR | MVP | 🔄 Sprint 008 |
| EK-4 — Evidencija o zdravstvenim pregledima | čl. 61 ZZnR | MVP | 🔄 Sprint 008 |
| EK-5 — Evidencija o radnoj opremi | čl. 61 ZZnR | MVP | 🔄 Sprint 008 |
| Opis radnog mjesta | čl. 18 ZZnR | Faza 2 | ⏳ Sprint 009 |
| OIR-1 — Obavijest o ozljedi | čl. 62 ZZnR | Faza 2 | ⏳ Sprint 010 |
| ER-2 — Prijava ozljede HZZO | čl. 62 ZZnR + HZZO | Faza 2 | ⏳ Sprint 010 |
| Procjena rizika (predložak) | čl. 18 ZZnR | Faza 2 | ⏳ Sprint 009 |
| Lista OZO po radniku | PR-06 | Faza 2 | ⏳ |
| Inspekcijska mapa (ZIP) | čl. 61 ZZnR | Faza 2 | ⏳ Sprint 012 |

---

## 7. TIJELA I INSTITUCIJE

| Institucija | Uloga | Relevantnost za sustav |
|---|---|---|
| Ministarstvo rada (MRMS) | Donosi propise | Pratiti izmjene ZZnR |
| Inspektorat rada | Inspekcijski nadzor | Inspekcijska mapa feature |
| HZZO | Prima prijave ozljeda | M08, ER-2 — Faza 3: API integracija |
| ZUZN | Stručna tijela, IS ZNR registar | Certifikacija softvera, Faza 2: IS ZNR |
| HZO | Medicina rada | M04 zdravstveni pregledi |
| Ovlaštene osobe za ZNR | Pregledi opreme, okoliša | M05, M06 |
| HUSZNR | Udruga ZNR stručnjaka | Ključan kanal za Tip C korisnike |

---

## 8. PRAĆENJE IZMJENA PROPISA

### Procedure ažuriranja

Kad se promijeni propis:
1. Ažuriraj ovaj dokument (verzija, datum, NN broj)
2. Ažuriraj `legal_references` tablicu u Supabase (UPDATE — bez deplooya!)
3. Provjeri koji `[ZAK]` tagovi u kodu su pogođeni
4. Procijeni hitnost: mijenja li se rok, obveza ili forma?
5. Kreiraj sprint zadatak s NN brojem
6. Obavijesti korisnike u sustavu ("Propis je ažuriran")

### Izvori

- Narodne novine: https://narodne-novine.nn.hr (RSS feed za praćenje)
- Ministarstvo rada: https://mrosp.gov.hr
- Inspektorat rada: https://inspektorat.hr
- ZUZN: https://www.zuzn.hr
- HUSZNR: https://husznr.hr (ZNR stručnjaci — first-hand)

### Rizici promjene propisa

| Propis | Rizik | Razlog |
|--------|-------|--------|
| PR-03 (NN 5/84) | 🔴 Visok | Star 40+ godina, pritisak za revizijom |
| PR-07 (NN 56/83) | 🔴 Visok | Star 40+ godina |
| ZZnR | 🟡 Srednji | Zadnja izmjena 2018. |
| PR-02 (NN 142/21) | 🟢 Nizak | Relativno nov |
| PR-04 (NN 16/16) | 🟢 Nizak | Relativno nov |

---

## 9. DEVELOPER UPUTE — [ZAK] konvencija

### Pravilo: nikad ne hard-kodiraj rokove u kod

Svi zakonski rokovi žive u `legal_references` tablici u Supabase.

```typescript
// ❌ NIKAD OVAKO:
const TRAINING_DAYS = 30

// ✅ UVIJEK OVAKO:
// [ZAK: čl.27 ZZnR NN71/14] rok se čita iz legal_references tablice
const ref = useLegalStore.getState().byCode('ZZnR-27-novi-radnik-30d')
const deadlineDays = ref?.deadline_days // 30
```

### [ZAK] tag u kodu

Svaki zakonski rok ili obveza u kodu mora imati tag:

```typescript
// [ZAK: čl.27 ZZnR NN71/14] Osposobljavanje 30 dana od zaposlenja
// [ZAK: PR-04 NN16/16] Pregled radne opreme max. svake 3 godine
// [ZAK: GDPR čl.5(2)] Audit log — accountability princip
// [ZAK: čl.62 ZZnR] Prijava ozljede HZZO u roku 48 sati
```

### Alarm prikazuje zakon korisniku

Svaki alarm u UI prikazuje:
- Zakonsku referencu: `čl. 27 ZZnR`
- Rok: `30 dana od zaposlenja`
- Sankciju (za kritične): `Kazna: 5.000–50.000 EUR`

### Svaki PDF sadrži zakonsku referencu

```
Zapisnik o osposobljavanju
Temelj: čl. 27 Zakona o zaštiti na radu (NN 71/14) i 
        Pravilnik o osposobljavanju (NN 142/21)
```

### legal_references tablica (implementirana u 003_legal_seed.sql)

```sql
-- Struktura (implementirana):
code TEXT UNIQUE           -- 'ZZnR-27-novi-radnik-30d'
title TEXT                 -- 'Zakon o zaštiti na radu'
article TEXT               -- 'čl. 27'
nn_number TEXT             -- 'NN 71/14, 118/14, 94/18, 96/18'
deadline_days INTEGER      -- 30 (null = nije fiksni rok)
deadline_description TEXT  -- '30 dana od dana zaposlenja'
module_codes TEXT[]        -- ARRAY['M03']
is_active BOOLEAN          -- true/false
source_url TEXT            -- link na zakon.hr
```

Ažuriranje: `UPDATE legal_references SET deadline_days = X WHERE code = 'ZZnR-27-...'`  
Efekt: sve tvrtke odmah vide novi rok — bez deplooya.

---

*Dokument: ZNR_PRAVNI_OKVIR.md v2.0*  
*Autor: Atila Vadoci + Claude (Anthropic)*  
*Datum: Travanj 2026.*  
*Sljedeći pregled: Srpanj 2026. ili kod izmjene propisa*
