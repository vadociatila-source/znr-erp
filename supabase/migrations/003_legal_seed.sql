-- ============================================================
-- ZNR ERP — 003_legal_references_seed.sql
-- [ZAK] Sve zakonske obveze i rokovi
-- Ažuriraj ovdje kad se promijeni zakon — automatski za sve klijente
-- ============================================================

INSERT INTO legal_references
  (code, title, article, nn_number, effective_date, description,
   deadline_days, deadline_description, module_codes, source_url)
VALUES

-- M03 OSPOSOBLJAVANJA ─────────────────────────────────────────
('ZZnR-27-novi-radnik-30d', 'Zakon o zaštiti na radu', 'čl. 27',
 'NN 71/14, 118/14, 94/18, 96/18', '2014-07-26',
 'Osposobljavanje novog radnika za rad na siguran način',
 30, '30 dana od dana zaposlenja', ARRAY['M03'],
 'https://www.zakon.hr/z/167/Zakon-o-za%C5%A1titi-na-radu'),

('ZZnR-27-usavrsavanje-4god', 'Zakon o zaštiti na radu + PR-02',
 'čl. 27 + čl. 38 PR-02', 'NN 71/14; PR-02: NN 142/21', '2021-12-18',
 'Provjera znanja (usavršavanje) iz zaštite na radu',
 1461, 'Svake 4 godine', ARRAY['M03'],
 'https://narodne-novine.nn.hr/clanci/sluzbeni/2021_12_142_2414.html'),

('ZZnR-27-promjena-rm', 'Zakon o zaštiti na radu', 'čl. 27',
 'NN 71/14, 118/14, 94/18, 96/18', '2014-07-26',
 'Osposobljavanje pri promjeni radnog mjesta ili uvjeta',
 0, 'Odmah — prije preuzimanja novih poslova', ARRAY['M03'],
 'https://www.zakon.hr/z/167/Zakon-o-za%C5%A1titi-na-radu'),

-- M04 ZDRAVSTVENI PREGLEDI ────────────────────────────────────
('ZZnR-34-prethodni', 'Zakon o zaštiti na radu', 'čl. 34',
 'NN 71/14, 118/14, 94/18, 96/18', '2014-07-26',
 'Prethodni zdravstveni pregled za poslove s posebnim uvjetima',
 NULL, 'Prije raspoređivanja na posao s posebnim uvjetima', ARRAY['M04'],
 'https://www.zakon.hr/z/167/Zakon-o-za%C5%A1titi-na-radu'),

('ZZnR-34-periodicki-1god', 'Zakon o zaštiti na radu + PR-03',
 'čl. 34', 'NN 71/14; PR-03: NN 5/84', '1984-01-01',
 'Periodički zdravstveni pregled (visokorizični poslovi)',
 365, 'Jednom godišnje', ARRAY['M04'], NULL),

('ZZnR-34-periodicki-3god', 'Zakon o zaštiti na radu + PR-03',
 'čl. 34', 'NN 71/14; PR-03: NN 5/84', '1984-01-01',
 'Periodički zdravstveni pregled (standardni posebni uvjeti)',
 1095, 'Max. svake 3 godine', ARRAY['M04'], NULL),

-- M05 RADNA OPREMA ────────────────────────────────────────────
('PR04-oprema-3god', 'Pravilnik o pregledu i ispitivanju radne opreme',
 'čl. 5', 'NN 16/16', '2016-02-19',
 'Pregled i ispitivanje radne opreme',
 1095, 'Max. svake 3 godine', ARRAY['M05'],
 'https://narodne-novine.nn.hr/clanci/sluzbeni/2016_02_16_434.html'),

('ZOP-aparat-vizualni-1god', 'Pravilnik o zaštiti od požara', 'čl. 39',
 'NN 92/10', '2010-07-28', 'Vizualni pregled vatrogasnog aparata',
 365, 'Jednom godišnje — vizualni pregled', ARRAY['M05'], NULL),

('ZOP-aparat-servis-2god', 'Pravilnik o zaštiti od požara', 'čl. 39',
 'NN 92/10', '2010-07-28', 'Servis vatrogasnog aparata',
 730, 'Svake 2 godine', ARRAY['M05'], NULL),

-- M06 RADNI OKOLIŠ ────────────────────────────────────────────
('PR05-fizikalni-3god', 'Pravilnik o ispitivanju radnog okoliša', 'čl. 4',
 'NN (provjeriti)', NULL,
 'Ispitivanje fizikalnih čimbenika (mikroklima, buka, rasvjeta)',
 1095, 'Max. svake 3 godine', ARRAY['M06'], NULL),

('PR05-kemijski-2god', 'Pravilnik o ispitivanju radnog okoliša', 'čl. 4',
 'NN (provjeriti)', NULL,
 'Ispitivanje kemijskih čimbenika (prašine, plinovi)',
 730, 'Max. svake 2 godine', ARRAY['M06'], NULL),

-- M08 OZLJEDE ─────────────────────────────────────────────────
('ZZnR-62-prijava-48h', 'Zakon o zaštiti na radu', 'čl. 62',
 'NN 71/14, 118/14, 94/18, 96/18', '2014-07-26',
 'Prijava ozljede na radu HZZO-u',
 NULL, '48 sati od nastanka — HITNO! Kazna: 5.000–50.000 EUR',
 ARRAY['M08'],
 'https://www.zakon.hr/z/167/Zakon-o-za%C5%A1titi-na-radu'),

-- M09 EVAKUACIJA ──────────────────────────────────────────────
('ZZnR-45-evakuacija-1god', 'Zakon o zaštiti na radu', 'čl. 45',
 'NN 71/14, 118/14, 94/18, 96/18', '2014-07-26',
 'Vježba evakuacije i spašavanja',
 365, 'Najmanje jednom godišnje', ARRAY['M09'],
 'https://www.zakon.hr/z/167/Zakon-o-za%C5%A1titi-na-radu'),

-- M02 PROCJENA RIZIKA ─────────────────────────────────────────
('ZZnR-18-procjena-2god', 'Zakon o zaštiti na radu', 'čl. 18',
 'NN 71/14, 118/14, 94/18, 96/18', '2014-07-26',
 'Revizija procjene rizika',
 730, 'Kod promjene uvjeta ili min. svake 2 godine', ARRAY['M02'],
 'https://www.zakon.hr/z/167/Zakon-o-za%C5%A1titi-na-radu'),

-- M11 ORGANIZACIJSKI ──────────────────────────────────────────
('ZZnR-70-odbor-znr', 'Zakon o zaštiti na radu', 'čl. 70',
 'NN 71/14, 118/14, 94/18, 96/18', '2014-07-26',
 'Sjednica Odbora ZNR — samo za 50+ radnika',
 182, 'Min. 2x godišnje — samo za tvrtke s 50+ radnika',
 ARRAY['M11'],
 'https://www.zakon.hr/z/167/Zakon-o-za%C5%A1titi-na-radu'),

('ZZnR-20-strucnjak-50plus', 'Zakon o zaštiti na radu', 'čl. 20',
 'NN 71/14, 118/14, 94/18, 96/18', '2014-07-26',
 'Obvezni stručnjak ZNR u radnom odnosu (50+ radnika)',
 NULL, 'Od trenutka dostizanja 50 radnika',
 ARRAY['M01','M11'],
 'https://www.zakon.hr/z/167/Zakon-o-za%C5%A1titi-na-radu');
