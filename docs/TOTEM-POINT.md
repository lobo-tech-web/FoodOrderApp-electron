# Totem: carrito, cobro Point y ticket

## Flujo

1. El cliente elige ESPERA EN LOCAL o CONSUMIR EN LOCAL.
2. Agrega productos con sus opciones, cantidades y comentarios. No existen descuentos manuales; se conservan los precios/descuentos de los productos del catalogo.
3. Confirma el carrito, completa el nombre y opcionalmente busca su numero de usuario. La busqueda no expone email, telefono ni direccion. El backend vuelve a verificar la cuenta al cobrar.
4. El backend recalcula productos, opciones, importes y puntos con datos propios. Una cuenta no encontrada usa `lobotech.bb@gmail.com`, no suma puntos ni incluye contactos.
5. Guarda una compra pendiente e inicia una order Point con clave idempotente. El pedido de FoodOrderApp todavia no existe.
6. Consulta Mercado Pago; una notificacion por si sola no prueba el pago. Comprueba referencia, terminal, estado acreditado e importe.
7. En una transaccion crea el pedido `orderSource: TOTEM`, `status: FINALIZADO`, `isPaid: true`, `paidAt`, numero diario, pago y venta en la caja asociada. El canje reserva puntos mientras se cobra, los libera al cancelar y los consume al confirmar.
8. Electron obtiene el pedido confirmado y genera en el proceso principal el mismo ticket termico de cliente usado por LocalOrders. Solo se imprime el ticket del cliente solicitado; no se imprime cocina en este flujo.
9. Si no hay impresora configurada/disponible, avisa sin deshacer el pedido ni abrir dialogos del sistema en el kiosco. Se puede reimprimir. Al finalizar, o 20 segundos despues de la impresion/intento, reinicia el carrito.

## Configuracion pendiente antes de probar cobros reales

### Base de datos y backend

- Aplicar manualmente `FoodOrderApp-api/migrations/20261010-totem-checkouts.sql`, con respaldo, antes de desplegar el backend. No se ejecuta automaticamente. Agrega la tabla del modelo TotemCheckout y sus indices; no requiere nuevas propiedades en Orders.
- El indice de terminales exige que un Point no este asignado a varios totems; revisar posibles asignaciones existentes antes de ejecutar el SQL.
- Mantener `TOTEM_JWT_SECRET` separado de `JWT_SECRET` y `TOTEM_DEVICE_MAIN_ROUTER=/main-route-totem`.
- Habilitar MERCADO PAGO en `users.paymentMethods` del local.
- Configurar SOLO en las variables privadas de Railway una credencial por local. Ejemplo ficticio:

```json
{
  "UUID-DEL-LOCAL": {
    "accessToken": "ACCESS-TOKEN-DE-LA-CUENTA-DEL-LOCAL",
    "webhookSecret": "CLAVE-SECRETA-DE-NOTIFICACIONES"
  }
}
```

La variable se llama `MP_POINT_ACCOUNTS` y contiene el JSON completo. No usar variables `VITE_*`, no incluirlo en el repositorio o instalador, y no copiar credenciales aqui. El codigo nunca devuelve el error original de Axios, que podria contener el token.

Para una plataforma que cobra para terceros, el Access Token del comercio debe obtenerse mediante OAuth. Este cambio admite ese token por local, pero NO implementa la pantalla/flujo OAuth ni su renovacion. Para distribuir comercialmente, completar esa conexion autorizada antes de utilizarlo en produccion.

### Mercado Pago y terminal

- La terminal debe estar ligada a la cuenta del comercio. Usar un modelo compatible con integracion Point y configurarlo en PDV (o SELF_SERVICE si Mercado Pago habilita ese modo para ese equipo/cuenta).
- En el panel de totems, usar **Configurar terminal Point** e ingresar el ID obtenido del listado de terminales de esa cuenta. El backend comprueba pertenencia y modo; nunca recibe un token desde Electron.
- Se consultan las primeras 50 terminales. Si el comercio tiene mas, falta agregar paginacion al selector.
- No se fija `config.payment_method.default_type`: el comprador elige entre los medios habilitados por Point, como tarjeta o QR. No se genera un QR de pago propio en Electron.
- Esta integracion es por la API de Mercado Pago y requiere internet en el totem/terminal/backend. No es un driver USB universal para cualquier posnet.
- Configurar las notificaciones **orders** en la aplicacion de Mercado Pago, con URL publica HTTPS del backend: `https://TU-BACKEND/main-route-totem/point/webhook`. Copiar su clave de firma al `webhookSecret` correspondiente.
- Configurar la impresora de **ticket cliente** en Electron antes de entrar en modo totem y abrir la caja asociada. Si se cierra mientras se paga, una compra aprobada se completa al abrir una sesion de esa misma caja; no se cobra nuevamente ni se atribuye a otra caja.

## Recuperacion y limites

- Electron guarda la solicitud pendiente con cifrado de Windows (`safeStorage`) antes de enviarla. Al reiniciar consulta compras pendientes del dispositivo y utiliza la misma referencia; no genera un nuevo cobro mientras no conoce el resultado.
- El backend persiste la referencia Point, el estado y la reserva de puntos. Usa notificaciones firmadas y consultas de respaldo, con intervalo minimo de 10 segundos por compra.
- Cancelar no equivale a recibir HTTP 202: se espera la confirmacion del proveedor. Si se confirma cancelacion/fallo/expiracion, se restituyen los puntos y puede finalizarse esa compra.
- Si la creacion del cobro sigue incierta y pasan 10 minutos sin poder recuperar su ID, se detiene el totem para conciliacion del administrador. No se vuelve a emitir automaticamente un cobro vencido.
- No se aceptan cobros offline, no hay modo de simulacion en produccion y no se marca pagado desde el renderer.
- Las devoluciones posteriores a un pedido completado requieren el procedimiento del administrador en Mercado Pago. Aun falta implementar su conciliacion automatica con caja/Orders.
- No se implemento un proceso de conciliacion periodico independiente del totem/webhooks para compras huerfanas. Conviene agregarlo junto con una pantalla administrativa de compras pendientes e incidentes antes de un despliegue amplio.
- La impresora confirma que Windows acepto el trabajo, no que realmente haya papel o que el ticket haya salido.

## Pruebas antes de publicar

Probar primero en entorno de pruebas autorizado por Mercado Pago, con terminal compatible:

1. Compra invitado: email alternativo, sin puntos/contactos, numero diario correcto y venta en la caja correcta.
2. Cliente registrado nuevo y existente: puntos acumulados/canje, opciones y precios con decimales.
3. Tarjeta y QR habilitados en la terminal; pago aprobado, rechazado, cancelado y expirado.
4. Doble clic y notificacion repetida: un solo pago, pedido y movimiento.
5. Cortar internet despues de iniciar el cobro y reiniciar Electron: recuperar sin pagar dos veces.
6. Cerrar caja mientras se cobra y abrir de nuevo la misma caja: conciliar el pago aprobado.
7. Impresora desconectada, sin papel, reimpresion y reinicio para el siguiente cliente.
8. Cambiar precios/disponibilidad antes del pago: rechazar el carrito desactualizado sin cobrar.
9. Confirmar que la app instalada contiene `dist-main/totem-ticket.cjs`. `npm run build` y `npm run dev` lo preparan automaticamente.

Las pruebas automatizadas usan proveedores y DB simulados; no sustituyen las pruebas del Point, PostgreSQL, webhook publico y driver de impresora reales.

## Referencias oficiales

- [Procesar pagos Point y seleccionar terminal/medio de pago](https://www.mercadopago.com.ar/developers/es/docs/mp-point/payment-processing)
- [Notificaciones de orders y firma](https://www.mercadopago.com.ar/developers/es/docs/mp-point/notifications)
