-- =====================================================================
-- MIGRACIÓN 003 :: Categorías fijas (idempotente)
-- Ejecutar con: npm run db:migrate
--
-- Usa MERGE para que se pueda ejecutar tantas veces como sea necesario
-- sin romper por duplicados. Idea: si la categoría ya existe (por slug),
-- no hace nada; si no existe, la inserta.
-- =====================================================================

MERGE INTO categories t
USING (SELECT 1 AS id, 'General' AS name, 'general' AS slug, 'Temas generales y conversación interna' AS description, '#64748B' AS color_code FROM dual) s
ON (t.slug = s.slug)
WHEN NOT MATCHED THEN
  INSERT (id, name, slug, description, color_code)
  VALUES (s.id, s.name, s.slug, s.description, s.color_code);

MERGE INTO categories t
USING (SELECT 2 AS id, 'Redes' AS name, 'redes' AS slug, 'Infraestructura, switches, routers y VLANs' AS description, '#F97316' AS color_code FROM dual) s
ON (t.slug = s.slug)
WHEN NOT MATCHED THEN
  INSERT (id, name, slug, description, color_code)
  VALUES (s.id, s.name, s.slug, s.description, s.color_code);

MERGE INTO categories t
USING (SELECT 3 AS id, 'Desarrollo' AS name, 'desarrollo' AS slug, 'Código, APIs, bases de datos y microservicios' AS description, '#06B6D4' AS color_code FROM dual) s
ON (t.slug = s.slug)
WHEN NOT MATCHED THEN
  INSERT (id, name, slug, description, color_code)
  VALUES (s.id, s.name, s.slug, s.description, s.color_code);

MERGE INTO categories t
USING (SELECT 4 AS id, 'Marketing' AS name, 'marketing' AS slug, 'Campañas, contenido y análisis comercial' AS description, '#EC4899' AS color_code FROM dual) s
ON (t.slug = s.slug)
WHEN NOT MATCHED THEN
  INSERT (id, name, slug, description, color_code)
  VALUES (s.id, s.name, s.slug, s.description, s.color_code);

MERGE INTO categories t
USING (SELECT 5 AS id, 'Administración' AS name, 'administracion' AS slug, 'Procesos administrativos, TI y gestión' AS description, '#10B981' AS color_code FROM dual) s
ON (t.slug = s.slug)
WHEN NOT MATCHED THEN
  INSERT (id, name, slug, description, color_code)
  VALUES (s.id, s.name, s.slug, s.description, s.color_code);