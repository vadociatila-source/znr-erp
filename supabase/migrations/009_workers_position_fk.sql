-- ============================================================
-- ZNR ERP — 009_workers_position_fk.sql
-- Dodaj foreign key na workers.position_id → work_positions.id
--
-- Potrebno za PostgREST embedded select (join) u useWorkersList
-- hook-u. Bez FK constrainta PostgREST ne može detektirati
-- relaciju i vraća HTTP 400.
--
-- position_id je nullable jer neki djelatnici nemaju pridruženo
-- radno mjesto (npr. novozaposleni prije rasporeda).
-- ============================================================

ALTER TABLE workers
  ADD CONSTRAINT workers_position_id_fkey
  FOREIGN KEY (position_id) REFERENCES work_positions(id);
