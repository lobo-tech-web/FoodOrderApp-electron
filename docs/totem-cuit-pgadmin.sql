-- Ejecutar por bloques en Query Tool de pgAdmin, sobre la base correcta.
-- No se cambia ningún CUIT en producción desde la aplicación del tótem.

-- 1. Buscar vacíos, caracteres no numéricos y largos incompatibles con el tótem.
SELECT id, name, role, cuit,
       regexp_replace(cuit, '[^0-9]', '', 'g') AS propuesta_solo_numeros,
       CASE
         WHEN cuit IS NULL OR cuit = '' THEN 'Vacío'
         WHEN cuit ~ '[[:alpha:]]' THEN 'Tiene letras: revisar manualmente'
         WHEN cuit !~ '^[0-9]+$' THEN 'Tiene separadores u otros caracteres'
         ELSE 'Más de 11 dígitos: revisar manualmente'
       END AS motivo
FROM public.users
WHERE cuit IS NULL OR cuit !~ '^[0-9]{1,11}$'
ORDER BY name, id;

-- 2. Detectar colisiones ANTES de quitar caracteres (cuit es UNIQUE).
-- Se revisan todos los roles: los documentos son únicos en toda la tabla.
WITH normalizados AS (
  SELECT id, name, cuit, regexp_replace(cuit, '[^0-9]', '', 'g') AS limpio
  FROM public.users
)
SELECT limpio, count(*) AS cantidad,
       jsonb_agg(jsonb_build_object('id', id, 'nombre', name, 'cuit_actual', cuit)) AS cuentas
FROM normalizados
WHERE limpio <> ''
GROUP BY limpio
HAVING count(*) > 1;

-- 3. Limpiar SOLO puntos, barras, guiones y espacios, sin colisiones.
-- No convierte letras en un documento: esos casos necesitan confirmación humana.
-- Este bloque termina en ROLLBACK para permitir revisar RETURNING sin guardar.
BEGIN;
WITH candidatos AS (
  SELECT id, cuit AS anterior, regexp_replace(cuit, '[^0-9]', '', 'g') AS limpio
  FROM public.users
  WHERE cuit ~ '^[0-9[:space:]./-]+$' AND cuit !~ '^[0-9]+$'
)
UPDATE public.users AS u
SET cuit = c.limpio
FROM candidatos AS c
WHERE u.id = c.id
  AND u.cuit = c.anterior
  AND c.limpio ~ '^[0-9]{1,11}$'
  AND NOT EXISTS (
    SELECT 1 FROM public.users AS otro
    WHERE otro.id <> u.id
      AND regexp_replace(otro.cuit, '[^0-9]', '', 'g') = c.limpio
  )
RETURNING u.id, u.name, c.anterior AS cuit_anterior, u.cuit AS cuit_nuevo;
ROLLBACK;
-- Para aplicar: repetir el bloque anterior REEMPLAZANDO ROLLBACK por COMMIT.

-- 4. Corrección manual de letras / duplicados: confirmar el documento real.
-- Reemplazar los tres valores y ejecutar dentro de una transacción.
-- UPDATE public.users
-- SET cuit = 'DOCUMENTO_CORRECTO_SOLO_NUMEROS'
-- WHERE id = 'UUID_DE_LA_CUENTA' AND cuit = 'VALOR_ACTUAL'
-- RETURNING id, name, cuit;

-- 5. OPCIONAL: impedir nuevos valores no numéricos en toda la base.
-- Afecta TODOS los registros y modificaciones, no solo los tótems.
-- NOT VALID permite conservar temporalmente las filas viejas inválidas;
-- las filas nuevas/modificadas ya deben cumplir la regla.
-- ALTER TABLE public.users
--   ADD CONSTRAINT users_cuit_formato CHECK (cuit ~ '^[0-9]{1,11}$') NOT VALID;
-- Después de resolver todas las filas inválidas:
-- ALTER TABLE public.users VALIDATE CONSTRAINT users_cuit_formato;
