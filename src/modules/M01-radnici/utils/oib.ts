// OIB validacija — Hrvatski osobni identifikacijski broj
// Algoritam: ISO 7064 MOD 11,10

export function validateOIB(oib: string): boolean {
  if (!/^\d{11}$/.test(oib)) return false

  let t = 10
  for (let i = 0; i < 10; i++) {
    t = (t + Number(oib[i])) % 10
    if (t === 0) t = 10
    t = (t * 2) % 11
  }

  const control = (11 - t) % 10
  return control === Number(oib[10])
}

export function formatOIBError(oib: string): string | null {
  if (!oib) return null // prazno je ok (opcionalno polje)
  if (!/^\d+$/.test(oib)) return 'OIB smije sadržavati samo brojeve'
  if (oib.length !== 11) return 'OIB mora imati točno 11 znamenki'
  if (!validateOIB(oib)) return 'OIB nije validan (kontrolna znamenka)'
  return null
}
