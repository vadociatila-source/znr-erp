// Script: parse Carta ERP employees CSV, fix UTF-8 mojibake, emit SQL INSERT statements
// for workers + auto-seed work_positions from distinct job titles.
//
// Usage: node scripts/import-carta-employees.mjs > scripts/carta_employees.sql
//
// Mojibake problem: Carta ERP exportao je CSV gdje su UTF-8 bajtovi dekodirani
// kao Latin-1 pa ponovo enkodirani kao UTF-8 — klasična "double encoding" greška.
// Primjeri:  "Å½ivkoviÄ" → "Živković",  "Å maholc" → "Šmaholc",  "Äubela" → "Čubela"
//
// Fix: uzmi svaki karakter stringa, interpretiraj njegov Unicode code point kao
// jedan Latin-1 bajt, složi bajtove u Buffer i dekodiraj kao UTF-8.

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const CSV_PATH = path.join(__dirname, 'carta_employees.csv')

// Phase 1: Popravi sve dvo-bajtne mojibake sekvence koje su preživjele.
// Radi tako da svaki 2-char pair bytes reinterpretira kao UTF-8.
// Ako par nije valid UTF-8, ostavlja ga kao je.
function fixDoubleEncoding(str) {
  if (!str) return str
  let out = ''
  let i = 0
  while (i < str.length) {
    const c1 = str.charCodeAt(i)
    if (c1 >= 0xC0 && c1 <= 0xDF && i + 1 < str.length) {
      const c2 = str.charCodeAt(i + 1)
      if (c2 >= 0x80 && c2 <= 0xBF) {
        // Valid 2-byte UTF-8 sequence hidden as 2 Latin-1 chars
        try {
          const decoded = Buffer.from([c1, c2]).toString('utf8')
          if (!decoded.includes('\uFFFD')) {
            out += decoded
            i += 2
            continue
          }
        } catch { /* fall through */ }
      }
    }
    // Three-byte (npr. ö = C3 B6 already handled above, this is for edge cases)
    out += str[i]
    i++
  }
  return out
}

// Phase 2: Rekonstrukcija za slučajeve gdje je TRAILING bajt izgubljen.
// Carta CSV je izgubio bajtove 0x87, 0xA0 itd. pa su:
//   "ć" (C4 87) postali samo "Ä"
//   "Š" (C5 A0) postali "Å" + ASCII space (0xA0 normaliziran u 0x20)
//   "Đ" (C4 90) postali "Ä" (leading)
// Heuristike koje primjenjujemo nakon Phase 1:
//   - "Å " na početku riječi (praćeno slovom) → "Š"
//   - trailing -iÄ → -ić (hrvatska -ić/-ović prezimena)
//   - standalone trailing Ä → ć
// Za ambiguous slučajeve (Kovač vs Kovać, Ečimović vs Ećimović) koristimo dictionary.

// Dictionary se aplicira POSLIJE Phase 1 + regex pravila, pa ključevi odražavaju
// stanje nakon automatskih fixova. Sam string se uspoređuje s ključem.
const NAME_DICTIONARY = {
  'Kovač':       'Kovač',      // no-op, već OK nakon regex-a
  'Kovačić':     'Kovačić',    // no-op
  'Lončarić':    'Lončarić',   // no-op (Phase 1 popravi finalni ć, middle Ä ostaje Ä → regex ne radi za middle)
  'LonÄarić':    'Lončarić',   // middle Ä → č (Lončar nije Lonćar)
  'Ervačić':     'Ervačić',    // no-op
  'ErvaÄić':     'Ervačić',    // middle Ä → č
  'Ečimović':    'Ečimović',   // no-op
  'EÄimović':    'Ečimović',   // middle Ä → č
  'Äurišić':     'Đurišić',    // leading Ä → Đ
  'Slađana':     'Slađana',    // no-op
  'SlaÄana':     'Slađana',    // middle Ä → đ
  'Čubela':      'Čubela',     // no-op
  'Äubela':      'Čubela',     // leading Ä → Č
  'KovaÄić':     'Kovačić',    // middle Ä → č
  'DomaÄica':    'Domaćica',   // position: middle Ä (samoglasnik s obje strane) → ć

  // Post-regex overrides: generic "aÄ → ać" regex pogriješi za "-ač" prezimena.
  // Runtime: regex prvo pretvori u krivo, dictionary pass ga vraća na točno.
  'Kovać':       'Kovač',
}

function smartRepair(str) {
  if (!str) return str

  // Phase 1: 2-byte UTF-8 recovery (C3 85 → Å, C5 BE → ž, Ä‡ → ć, ...)
  let s = fixDoubleEncoding(str)

  // Phase 2a: "Å " (Å + ASCII space) na početku ili u sredini riječi → "Š"
  // Uzrok: original Š = C5 A0, A0 je NBSP koji je negdje normaliziran u 0x20 (space).
  s = s.replace(/Å (?=[a-zA-ZčćžšđČĆŽŠĐ])/g, 'Š')

  // Phase 2b: trailing "-iÄ" → "-ić" (ISKLJUČIVO za hrvatska prezimena)
  s = s.replace(/iÄ$/g, 'ić')
  // Trailing Ä nakon bilo kojeg samoglasnika (oviÄ → ović je već catch-an gore,
  // ali pokriva i aÄ, eÄ, uÄ završetke)
  s = s.replace(/([aeiou])Ä$/g, '$1ć')

  // Phase 3: dictionary za dvosmislene slučajeve (middle Ä, leading Ä)
  if (NAME_DICTIONARY[s]) s = NAME_DICTIONARY[s]

  return s
}

// Za email polja: popravi mojibake, pa ukloni dijakritike (emailovi su ASCII).
// Primjer: "ivan.schrÃ¶del" → smartRepair → "ivan.schrödel" → asciiFold → "ivan.schrodel"
function asciiFoldEmail(str) {
  if (!str) return str
  const repaired = smartRepair(str)
  return repaired
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd').replace(/Đ/g, 'D')
}

// Minimalni CSV parser — podržava quoted fields, nema escape sekvenci (ne trebamo).
function parseCSV(text) {
  const rows = []
  let row = []
  let field = ''
  let inQuotes = false
  for (let i = 0; i < text.length; i++) {
    const c = text[i]
    if (inQuotes) {
      if (c === '"' && text[i + 1] === '"') { field += '"'; i++ }
      else if (c === '"') { inQuotes = false }
      else { field += c }
    } else {
      if (c === '"') { inQuotes = true }
      else if (c === ',') { row.push(field); field = '' }
      else if (c === '\n') { row.push(field); rows.push(row); row = []; field = '' }
      else if (c === '\r') { /* skip */ }
      else { field += c }
    }
  }
  if (field.length > 0 || row.length > 0) { row.push(field); rows.push(row) }
  return rows
}

function sqlStr(v) {
  if (v === null || v === undefined || v === '') return 'NULL'
  return "'" + String(v).replace(/'/g, "''") + "'"
}

const raw = fs.readFileSync(CSV_PATH, 'utf8')
const rows = parseCSV(raw).filter(r => r.length > 1 && r.some(f => f.length > 0))
const [header, ...dataRows] = rows
const col = Object.fromEntries(header.map((h, i) => [h.trim(), i]))

// ── Filter: preskačemo Admin Test (company_id=NULL) i prazne retke ─────
const employees = dataRows
  .filter(r => r[col.company_id] && r[col.company_id].trim() !== '')
  .map(r => ({
    first_name:  smartRepair(r[col.first_name]),
    last_name:   smartRepair(r[col.last_name]),
    email:       asciiFoldEmail(r[col.email]) || null,
    phone:       r[col.phone] || null,
    position:    smartRepair(r[col.position]) || null,
    team_name:   smartRepair(r[col.team_name]) || null,
    active:      r[col.active] === 'true',
  }))

// ── Swap-fix: jedan red ima "BerkoviÄ,Dajana" gdje je prezime u first_name i obratno ──
// Heuristika: ako first_name završava s 'ć' (odnosno mojibake ekvivalentom)
// i last_name ne, vjerojatno je zamijenjeno. Radimo je samo za poznate slučajeve.
for (const e of employees) {
  if (e.first_name === 'Berković' && e.last_name === 'Dajana') {
    [e.first_name, e.last_name] = [e.last_name, e.first_name]
  }
  if (e.first_name === 'Čubela' && e.last_name === 'Kristina') {
    [e.first_name, e.last_name] = [e.last_name, e.first_name]
  }
  if (e.first_name === 'Marić' && e.last_name === 'Aleksandra') {
    [e.first_name, e.last_name] = [e.last_name, e.first_name]
  }
}

// ── Distinct positions za work_positions seed ──────────────────────────
const distinctPositions = [...new Set(
  employees.map(e => e.position).filter(p => p && p.trim() !== '')
)].sort()

// ── SQL generation ─────────────────────────────────────────────────────
const out = []
out.push('-- Auto-generated by scripts/import-carta-employees.mjs')
out.push('-- DO NOT EDIT BY HAND — re-run the script if CSV changes')
out.push('')
out.push('BEGIN;')
out.push('')
out.push("-- Resolve Carta tenant id")
out.push("DO $$")
out.push("DECLARE v_tenant UUID;")
out.push("BEGIN")
out.push("  SELECT id INTO v_tenant FROM tenants WHERE slug = 'carta-d-o-o' LIMIT 1;")
out.push("  IF v_tenant IS NULL THEN RAISE EXCEPTION 'Carta d.o.o. tenant nije pronađen'; END IF;")
out.push('')
out.push('  -- ── Seed work_positions iz distinct Carta radnih mjesta ──')
out.push('  -- ON CONFLICT na (tenant_id, name) bi trebao postojati, ali trenutno nema UNIQUE constraint.')
out.push('  -- Koristimo defenzivni INSERT ... WHERE NOT EXISTS.')
for (const pos of distinctPositions) {
  out.push(`  INSERT INTO work_positions (tenant_id, name, status)`)
  out.push(`    SELECT v_tenant, ${sqlStr(pos)}, 'active'`)
  out.push(`    WHERE NOT EXISTS (SELECT 1 FROM work_positions WHERE tenant_id = v_tenant AND name = ${sqlStr(pos)});`)
}
out.push('')
out.push('  -- ── Insert workers ──')
for (const e of employees) {
  const status = e.active ? 'active' : 'former'
  const posLookup = e.position
    ? `(SELECT id FROM work_positions WHERE tenant_id = v_tenant AND name = ${sqlStr(e.position)})`
    : 'NULL'
  out.push(`  INSERT INTO workers (tenant_id, first_name, last_name, email, phone, department, position_id, status)`)
  out.push(`    VALUES (v_tenant, ${sqlStr(e.first_name)}, ${sqlStr(e.last_name)}, ${sqlStr(e.email)}, ${sqlStr(e.phone)}, ${sqlStr(e.team_name)}, ${posLookup}, ${sqlStr(status)});`)
}
out.push('')
out.push('  -- ── Update tenant employee_count na stvarni broj active radnika ──')
out.push('  UPDATE tenants SET employee_count = (SELECT count(*) FROM workers WHERE tenant_id = v_tenant AND status = \'active\') WHERE id = v_tenant;')
out.push('END $$;')
out.push('')
out.push('COMMIT;')

process.stdout.write(out.join('\n') + '\n')

// ── Summary na stderr (ne ide u SQL output) ────────────────────────────
console.error(`Parsed ${employees.length} employees (${employees.filter(e => e.active).length} active, ${employees.filter(e => !e.active).length} former)`)
console.error(`Distinct positions: ${distinctPositions.length}`)
console.error(`Positions: ${distinctPositions.join(', ')}`)
