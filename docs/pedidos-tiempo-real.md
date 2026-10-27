# Pedidos en tiempo real

## Uso

`OrderPanel` usa Socket.IO para recibir avisos. Se quitó su consulta periódica
de 30 segundos. Cuando el panel está libre, cada aviso solicita automáticamente
una actualización por HTTP, conservando fecha, búsqueda, filtros y paginación.
Los eventos no insertan pedidos directamente: la consulta HTTP sigue siendo la
fuente de datos. Los avisos consecutivos se agrupan mientras haya una carga activa.
El indicador muestra el botón **Cargar cambios** únicamente mientras hay avisos
pendientes; la actualización manual habitual se realiza desde el botón del navbar.

Mientras haya un formulario de creación, edición o pago abierto, la actualización
está bloqueada. También se espera mientras haya pedidos seleccionados, un campo
del panel enfocado o una búsqueda escrita sin aplicar. El indicador muestra los
cambios pendientes sin interrumpir la operación. Al quedar libre, el panel carga
automáticamente los cambios acumulados. Guardar una operación propia sigue
solicitando la actualización, que se aplica al cerrar el último formulario.
Cerrar un formulario sin guardar y sin avisos pendientes no consulta por sí solo.
Si se abrió un formulario durante una consulta en curso, esa respuesta se descarta
y se vuelve a solicitar al terminar la operación.

En cada conexión/reconexión se comprueban cambios, incluso si no se recibió
ningún evento: Socket.IO no funciona aquí como historial persistente. Los avisos
que lleguen durante una consulta no se descartan al publicar esa respuesta.
Si el socket no está disponible, se puede actualizar manualmente por HTTP.
Si falla una actualización automática, el aviso se conserva sin reintentar en
bucle; una nueva notificación o la actualización manual permite volver a consultar.

## Orígenes y transacciones

La API registra hooks centrales sobre `Orders`: creación, edición, eliminación y
operaciones masivas. Las rutas de la web, Electron y la sincronización offline usan
ese modelo. El checkout del tótem usa `createOrderController` con una transacción
externa: el aviso se emite únicamente tras su commit. Un rollback no envía avisos.
Crear y actualizar el mismo pedido dentro de una transacción produce un solo
evento de creación. No se modifica ningún esquema de la base de datos.

Los pedidos creados offline generan un aviso local en la PC, y al sincronizarse
con la API generan eventos para los administradores conectados. Un pedido que
permanece offline en otra PC no es visible desde otros equipos hasta sincronizarse.
El intervalo existente que reintenta sincronizar pedidos offline se conserva;
no es el temporizador eliminado del listado.

## Contrato y acceso

El cliente envía `auth.token` usando la sesión actual de Electron. El servidor
verifica el JWT (HS256, expiración). Admite administradores activos y empleados
activos con `permissions.orders.read === true`. Para empleados consulta su local
y sus permisos vigentes en `RestaurantStaff`, y verifica que el local esté activo.
El local se obtiene de la cuenta validada; no se acepta elegir una sala desde el cliente.
Las sesiones conectadas se cierran cuando expira el token.

- `orders:ready`: `{ restaurantId }`, confirma la suscripción.
- `orders:changed`: `{ eventId, restaurantId, orderId, kind, changedAt }`.
- `kind`: `created`, `updated` o `deleted`.

Los eventos contienen identificadores y tipo de cambio; los datos de clientes,
productos y pagos se siguen consultando por HTTP con la autorización existente.

## Puesta en funcionamiento

1. Desplegar/reiniciar `FoodOrderApp-api` con su `package.json`, lockfile, `index.js`
   y los dos archivos nuevos de `src/realtime/`.
2. Recompilar Electron con sus dependencias actualizadas. El socket utiliza por
   defecto el origen de `VITE_API_URL` y el path `/socket.io`.
3. El proxy debe permitir conexiones WebSocket y el path `/socket.io`. Si el socket
   usa otro host, establecer `VITE_ORDERS_SOCKET_URL` antes de compilar Electron.
   `VITE_ORDERS_SOCKET_PATH` permite un path distinto si el proxy lo redirige al servidor.
4. La API reutiliza `JWT_SECRET` y los orígenes `URL_WEB_DEPLOY`, `URL_WEB_DEPLOY_2`,
   `URL_WEB_LOCAL`; admite el origen `null` de Electron empaquetado.

La implementación usa una instancia de API. Si se despliegan varias réplicas o
workers, se debe incorporar un adaptador compartido (por ejemplo Redis) para
distribuir los eventos entre procesos antes de habilitar esa topología.
`StaffOrderPanel` utiliza los mismos hooks de conexión y carga protegida. Sus
modales de creación, edición, edición masiva y cobro bloquean la publicación de
listas; la selección también aplaza la actualización automática. Los permisos
de lectura y modificación y las restricciones de caja se mantienen. La edición
masiva exitosa limpia únicamente la selección actualizada. Día y mes usan consultas
separadas y se descartan respuestas de la vista anterior.

Para habilitar empleados sobre un backend desplegado con la versión que admitía
solo administradores, volver a desplegar `index.js` y `src/realtime/orderRealtime.js`.

## Validación

`tests/order-realtime-server.test.cjs` usa HTTP/Socket.IO reales, JWT de prueba y
modelos simulados: comprueba aislamiento por local, rechazo de credenciales,
expiración, commit/rollback y escrituras masivas. No conecta a la base real.

`tests/order-realtime-ui.test.cjs` conecta el navegador al servidor Socket.IO real
con respuestas HTTP simuladas: comprueba actualización automática en reposo,
selección y escritura protegidas, borradores, carreras durante la carga, reconexión
y creación offline.
También se mantienen las pruebas de filtros, consultas serializadas y guardados.
`tests/staff-order-realtime-ui.test.cjs` verifica la vista real de pedidos del
empleado con providers de la aplicación y un servidor Socket.IO local.

Referencias: [inicialización de Socket.IO](https://socket.io/docs/v4/server-initialization/),
[autenticación por middleware](https://socket.io/docs/v4/middlewares/).
