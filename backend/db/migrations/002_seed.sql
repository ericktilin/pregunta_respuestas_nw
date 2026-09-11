-- =====================================================================
-- MIGRACIÓN 002 :: Datos semilla (seed)
-- Ejecutar con: npm run db:migrate
--
-- Contiene
--   1. Las 5 categorías fijas del proyecto
--   2. Usuarios de demostración (los reales se crean solos vía SSO)
--   3. Preguntas + etiquetas + respuestas de ejemplo
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1) CATEGORÍAS FIJAS (colores según el diseño visual del proyecto)
-- ---------------------------------------------------------------------
INSERT INTO categories (id, name, slug, description, color_code) VALUES (1, 'General',        'general',        'Temas generales y conversación interna', '#64748B');
INSERT INTO categories (id, name, slug, description, color_code) VALUES (2, 'Redes',          'redes',          'Infraestructura, switches, routers y VLANs', '#F97316');
INSERT INTO categories (id, name, slug, description, color_code) VALUES (3, 'Desarrollo',     'desarrollo',     'Código, APIs, bases de datos y microservicios', '#06B6D4');
INSERT INTO categories (id, name, slug, description, color_code) VALUES (4, 'Marketing',      'marketing',      'Campañas, contenido y análisis comercial', '#EC4899');
INSERT INTO categories (id, name, slug, description, color_code) VALUES (5, 'Administración', 'administracion', 'Procesos administrativos, TI y gestión', '#10B981');

-- ---------------------------------------------------------------------
-- 2) USUARIOS DE DEMOSTRACIÓN
--    El SSO de Intranet creará el resto de usuarios automáticamente.
-- ---------------------------------------------------------------------
INSERT INTO users (id, external_intranet_id, full_name, role_title, avatar_initials, reputation_points) VALUES (1, 'EXT-1001', 'Maria Garcia', 'Arquitecta de Redes', 'MG', 120);
INSERT INTO users (id, external_intranet_id, full_name, role_title, avatar_initials, reputation_points) VALUES (2, 'EXT-1002', 'Luis Lopez', 'Desarrollador Java', 'CL', 85);
INSERT INTO users (id, external_intranet_id, full_name, role_title, avatar_initials, reputation_points) VALUES (3, 'EXT-1003', 'Erika Hernandez ', 'Ingeniera de Sistemas', 'AM', 60);

-- ---------------------------------------------------------------------
-- 3) PREGUNTAS + ETIQUETAS + RESPUESTAS DE EJEMPLO
-- ---------------------------------------------------------------------
INSERT INTO questions (id, user_id, category_id, title, body_text, status, votes_count, views_count, created_at)
VALUES (1, 2, 2,
  'Configuración de router Cisco ASR-920 para segmentación VLAN',
  'Estamos implementando la segmentación de red en el nuevo datacenter y necesito validar la configuración del ASR-920. Alguien que haya trabajado con este modelo me puede confirmar si este es el enfoque correcto para 50+ VLANs activas?',
  'resolved', 12, 340, CURRENT_TIMESTAMP - INTERVAL '3' DAY);

INSERT INTO question_tags (id, question_id, tag_name) VALUES (1, 1, 'cisco');
INSERT INTO question_tags (id, question_id, tag_name) VALUES (2, 1, 'vlan');
INSERT INTO question_tags (id, question_id, tag_name) VALUES (3, 1, 'asr-920');

INSERT INTO questions (id, user_id, category_id, title, body_text, status, votes_count, views_count, created_at)
VALUES (2, 3, 3,
  'Integración con API de facturación electrónica SAT',
  'Al consumir el endpoint de timbrado obtenemos error 500 cuando enviamos facturas con más de 50 conceptos. El ambiente de pruebas funciona correcto. Alguien con experiencia en el webservice del SAT me puede orientar?',
  'in_progress', 8, 215, CURRENT_TIMESTAMP - INTERVAL '2' DAY);

INSERT INTO question_tags (id, question_id, tag_name) VALUES (4, 2, 'sat');
INSERT INTO question_tags (id, question_id, tag_name) VALUES (5, 2, 'facturacion');
INSERT INTO question_tags (id, question_id, tag_name) VALUES (6, 2, 'api');

INSERT INTO questions (id, user_id, category_id, title, body_text, status, votes_count, views_count, created_at)
VALUES (3, 1, 3,
  'Librería de logging centralizado para microservicios',
  'Comparto un módulo reutilizable para logging estructurado con correlación de trazas entre servicios. Incluye soporte para OpenTelemetry y salida en JSON. Cualquier feedback es bienvenido.',
  'open', 25, 480, CURRENT_TIMESTAMP - INTERVAL '1' DAY);

INSERT INTO question_tags (id, question_id, tag_name) VALUES (7, 3, 'logging');
INSERT INTO question_tags (id, question_id, tag_name) VALUES (8, 3, 'microservicios');
INSERT INTO question_tags (id, question_id, tag_name) VALUES (9, 3, 'reutilizable');

-- Respuestas de ejemplo
INSERT INTO answers (id, question_id, user_id, body_text, is_accepted, votes_count, created_at)
VALUES (1, 1, 1, 'Tu configuración base es correcta. El ASR-920 maneja hasta 256 VLANs sin problemas si configuras correctamente el QoS. Te recomiendo habilitar mls qos trust dscp y usar EtherChannel para el uplink al core.', 1, 15, CURRENT_TIMESTAMP - INTERVAL '3' DAY + INTERVAL '4' HOUR);

INSERT INTO answers (id, question_id, user_id, body_text, is_accepted, votes_count, created_at)
VALUES (2, 1, 3, 'Adicional a lo que menciona María, verifica la licencia: la base soporta 128 VLANs, para más necesitas la licencia Advanced.', 0, 8, CURRENT_TIMESTAMP - INTERVAL '2' DAY);

-- Guardado de ejemplo (aparecerá en "Mis Preguntas" de Ana)
INSERT INTO saved_items (id, user_id, item_type, item_id) VALUES (1, 3, 'question', 1);

-- Proyecto reutilizable de ejemplo
INSERT INTO projects (id, user_id, category_id, title, description, repo_url, status_badge, stars_count, forks_count, created_at)
VALUES (1, 1, 3,
  'Central Logger',
  'Librería de logging estructurado para microservicios Java/Spring Boot con correlación de trazas.',
  'https://github.com/empresa/central-logger',
  'Disponible', 32, 9, CURRENT_TIMESTAMP - INTERVAL '5' DAY);

INSERT INTO project_stack (id, project_id, technology) VALUES (1, 1, 'Java');
INSERT INTO project_stack (id, project_id, technology) VALUES (2, 1, 'Spring Boot');
INSERT INTO project_stack (id, project_id, technology) VALUES (3, 1, 'OpenTelemetry');