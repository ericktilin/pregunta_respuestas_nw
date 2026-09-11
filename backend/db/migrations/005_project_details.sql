-- =====================================================================
-- MIGRACIÓN 005 :: Detalle de Proyectos Reutilizables
-- Ejecutar con: npm run db:migrate
--
-- Añade al catálogo de proyectos los datos que consume la vista detallada
-- /projects/:id: README (markdown), contador de usos, contribuidores y
-- estado. Después siembra el proyecto de ejemplo con esos datos.
-- =====================================================================

ALTER TABLE projects ADD readme CLOB;
ALTER TABLE projects ADD usage_count NUMBER DEFAULT 0;
ALTER TABLE projects ADD contributors VARCHAR2(500);

-- Proyecto de ejemplo con el estado STABLE y contenido de README.
UPDATE projects
   SET status_badge = 'STABLE',
       usage_count = 4,
       contributors = 'MG,AM,CL',
       readme = '# Central Logger

## Descripción

Librería centralizada de logging para microservicios con salida estructurada JSON y correlación de trazas por request id
Soporta múltiples canales (consola, archivo, SIEM) y niveles configurables por servicio

## Instalación

Agregar la dependencia al build del microservicio (versión 2.4.x del repositorio interno de artefactos) y declararla en el arranque con la anotación EnableCentralLogger

## Configuración

Configurar las variables LOG_LEVEL, LOG_OUTPUT y TRACE_ENDPOINT en el ambiente y verificar el estado del servicio de logs'
 WHERE id = 1;

-- Enriquecer el stack del proyecto de ejemplo (MERGE = idempotente).
UPDATE project_stack SET technology = 'Java 21' WHERE project_id = 1 AND technology = 'Java';
UPDATE project_stack SET technology = 'Spring Boot 3.2' WHERE project_id = 1 AND technology = 'Spring Boot';
UPDATE project_stack SET technology = 'OpenTelemetry 1.31' WHERE project_id = 1 AND technology = 'OpenTelemetry';

MERGE INTO project_stack p
 USING (SELECT 1 FROM dual) d
    ON (p.project_id = 1 AND p.technology = 'PostgreSQL')
  WHEN NOT MATCHED THEN INSERT (project_id, technology) VALUES (1, 'PostgreSQL');

MERGE INTO project_stack p
 USING (SELECT 1 FROM dual) d
    ON (p.project_id = 1 AND p.technology = 'Docker')
  WHEN NOT MATCHED THEN INSERT (project_id, technology) VALUES (1, 'Docker');