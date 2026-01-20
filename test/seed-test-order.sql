-- Script temporal para dar acceso al curso durante testing
-- Ejecutar en psql o en un cliente SQL

-- Crear una orden completada para el usuario test
INSERT INTO "Order" (id, "userId", total, subtotal, status, "createdAt", "updatedAt")
VALUES (
  gen_random_uuid(),
  'fcab938a-f5a2-48a1-a981-13474bf0baee', -- userId del test
  19990,
  19990,
  'COMPLETED',
  NOW(),
  NOW()
)
RETURNING id;

-- Nota: Guarda el ID de la orden que se generó arriba
-- Luego ejecuta este INSERT con ese ID:

-- INSERT INTO "OrderItem" (id, "orderId", "courseId", price, "discountPrice", "createdAt", "updatedAt")
-- VALUES (
--   gen_random_uuid(),
--   'PEGAR-ORDER-ID-AQUI',
--   '86bcfca3-ab6b-401e-90e9-d9c41976f40c', -- courseId
--   29990,
--   19990,
--   NOW(),
--   NOW()
-- );
