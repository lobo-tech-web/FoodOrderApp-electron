# Mercado Pago Point: Railway, Insomnia y conexion de locales

Guia revisada el 10 de octubre de 2026 contra las rutas actuales de FoodOrderApp-api y la documentacion oficial. No se ejecutaron cobros, cambios en Railway ni solicitudes a cuentas reales para preparar esta guia.

## 1. Corregir MP_POINT_ACCOUNTS

El UUID tambien debe estar entre comillas dobles. El valor es JSON, no un objeto JavaScript. Ejemplo ficticio para Railway:

```json
{
  "11111111-1111-4111-8111-111111111111": {
    "accessToken": "TOKEN-DE-PRUEBA",
    "webhookSecret": "CLAVE-DE-FIRMA-DE-WEBHOOKS"
  }
}
```

Reemplazar el UUID por `users.id` del admin/local en FoodOrderApp. No usar el ID de la aplicacion de Mercado Pago, el numero de usuario ni el ID del dispositivo.

En Railway: abrir el servicio del backend, Variables, editar `MP_POINT_ACCOUNTS` y aplicar/desplegar el cambio. No agregar comillas alrededor de TODO el JSON. No incluir barras invertidas al final de las lineas ni texto HTML como `&#x20;`.

`webhookSecret` es la clave de firma de Webhooks de la aplicacion que origina esas notificaciones; no es Client Secret, una clave de WebSocket ni una clave del JWT.

Que el backend inicie no valida esta variable: se interpreta cuando el flujo necesita la cuenta Point. Un UUID sin comillas hace que esa operacion falle aunque el despliegue termine correctamente.

`TOTEM_DEVICE_MAIN_ROUTER` y `TOTEM_JWT_SECRET` ya estan configuradas: conservarlas. El codigo actual no utiliza `MP_CLIENT_ID`, `MP_CLIENT_SECRET` ni una ruta OAuth.

## 2. Configuracion para distintos locales

Un token representa una cuenta/autorizacion de Mercado Pago. Cambiar el UUID en el JSON NO cambia esa cuenta ni autoriza un Point de otro comercio.

El token de prueba de LoboTech sirve para ensayar con su entorno de prueba; el UUID solo lo vincula al local de pruebas de FoodOrderApp. No da acceso al Point productivo de ese local.

Con el mecanismo manual actual, diferentes cuentas tendrian entradas distintas, sin borrar la anterior:

```json
{
  "11111111-1111-4111-8111-111111111111": {
    "accessToken": "TOKEN-AUTORIZADO-DEL-COMERCIO-A",
    "webhookSecret": "FIRMA-DE-LA-APLICACION-QUE-ORIGINA-SUS-EVENTOS"
  },
  "22222222-2222-4222-8222-222222222222": {
    "accessToken": "TOKEN-AUTORIZADO-DEL-COMERCIO-B",
    "webhookSecret": "FIRMA-DE-LA-APLICACION-QUE-ORIGINA-SUS-EVENTOS"
  }
}
```

El secreto de firma puede coincidir cuando ambos comercios autorizan la misma aplicacion de LoboTech. Los tokens de cuentas distintas NO se deben reutilizar. Para integrar terceros oficialmente, usar OAuth Authorization Code, no pedirles contrasenas ni distribuir secretos en Electron. Esa conexion y su renovacion aun no estan implementadas.

Referencia: [OAuth para terceros](https://www.mercadopago.com.ar/developers/es/docs/security/oauth/creation).

## 3. Preparar Insomnia sin exponer claves

Crear una coleccion local con dos carpetas: `Mercado Pago - pruebas` y `FoodOrderApp - pruebas`. No exportar ni sincronizar credenciales a espacios compartidos. Usar el almacenamiento privado de secretos disponible en tu version de Insomnia o ingresar los tokens solamente en la configuracion local de autenticacion.

Se usaran TRES credenciales distintas:

| Destino | Credencial en Auth / Bearer Token |
| --- | --- |
| `https://api.mercadopago.com/...` | Access Token de PRUEBA de Mercado Pago |
| Rutas de administracion de FoodOrderApp | JWT de login del admin del local |
| Catalogo y compras del totem | JWT del dispositivo obtenido en `/activate` o `/session` |

En las solicitudes con cuerpo, seleccionar Body / JSON y `Content-Type: application/json`. En Bearer Token ingresar el token solo; Insomnia agrega `Bearer`. No heredar el token del admin para las solicitudes de Mercado Pago ni viceversa.

En los ejemplos, `API` significa el origen HTTPS del BACKEND DE PRUEBAS, sin barra final. `TOTEM` significa `API/main-route-totem`. Sustituir esos nombres al armar las URL; no son variables que ya existan en Insomnia.

No hace falta pushear Electron para probar HTTP con Insomnia. Tampoco hace falta pushear para ejecutar el codigo local con `npm run dev`.

IMPORTANTE: los checkouts simulados completos crean pedidos, puntos y movimientos de caja en la base a la que apunta FoodOrderApp. Usar un backend/base aislados y un local de pruebas. Un token de prueba de Mercado Pago NO convierte la base productiva de FoodOrderApp en sandbox.

## 4. Primera prueba: Mercado Pago solamente, sin terminal fisica

Esta prueba valida credenciales/API, pero NO crea un pedido de FoodOrderApp ni imprime un ticket. Usar solo credenciales de prueba. El simulador oficial admite una terminal virtual como `NEWLAND_N950__SBX0000001` para Point Argentina; no demuestra compatibilidad de la impresora o terminal real y no sirve para medir calidad de integracion.

Fuente: [Pruebas Point](https://www.mercadopago.com.ar/developers/es/docs/mp-point/integration-test).

### 4.1 Crear un cobro de prueba

Metodo: POST. URL: `https://api.mercadopago.com/v1/orders`.

Auth: Bearer Token de prueba MP. Header adicional: `X-Idempotency-Key`, con un UUID nuevo para esta compra. Para generar uno en PowerShell: `[guid]::NewGuid().ToString()`.

```json
{
  "type": "point",
  "external_reference": "ensayo-insomnia-001",
  "expiration_time": "PT10M",
  "transactions": {
    "payments": [{ "amount": "100.00" }]
  },
  "config": {
    "point": {
      "terminal_id": "NEWLAND_N950__SBX0000001",
      "print_on_terminal": "no_ticket"
    }
  },
  "description": "Ensayo de integracion"
}
```

Conservar el `id` devuelto por MP (habitualmente comienza con ORD). Si esta solicitud falla, revisar su error antes de continuar con FoodOrderApp. No reintentar con un token productivo para hacer funcionar una simulacion.

Fuente: [Crear order Point](https://www.mercadopago.com.ar/developers/es/reference/in-person-payments/point/orders/create-order/post).

### 4.2 Simular aprobacion

POST `https://api.mercadopago.com/v1/orders/ID-ORD-DEVUELTO/events`, mismo token de prueba, Body JSON:

```json
{
  "status": "processed",
  "payment_method_type": "credit_card",
  "installments": 1,
  "payment_method_id": "visa",
  "status_detail": "accredited"
}
```

El simulador responde `204 No Content`; no esperar un cuerpo JSON. Luego consultar GET `https://api.mercadopago.com/v1/orders/ID-ORD-DEVUELTO` con el mismo token. El cambio no es instantaneo: esperar unos segundos antes de consultar de nuevo.

Fuente: [Simular estado de una order](https://www.mercadopago.com.ar/developers/es/reference/in-person-payments/point/orders/simulate-order/post).

### 4.3 Otros resultados

Crear una compra NUEVA para cada escenario; nueva clave idempotente y referencia. Enviar a `/events` un JSON con `status: "failed"`, `"canceled"` o `"expired"` y consultar despues el resultado. No intentar cancelar una compra ya aprobada para probar otro escenario.

Fuente: [Escenarios de prueba Point para kiosco](https://www.mercadopago.com.ar/developers/es/docs/mp-point-v2/integration-test?scope=prod).

## 5. Terminal compatible, sucursal y caja de Mercado Pago

Tener un Point que cobra manualmente no garantiza acceso integrado por API. Confirmar modelo, cuenta y modo operativo; la documentacion actual distingue Point Smart 1 (PDV) y Point Smart 2 (PDV / SELF_SERVICE). Verificar disponibilidad para el equipo/cuenta antes de modificar un Point que el comercio ya usa.

Fuente: [Equipos y modos Point](https://www.mercadopago.com.ar/developers/es/docs/mp-point-v2/overview?scope=prod).

### 5.1 Identificar terminales

GET `https://api.mercadopago.com/terminals/v1/list?limit=50&offset=0` con el token de la cuenta/autorizacion correspondiente al entorno. Revisar `data.terminals`, copiando `id` completo, `store_id`, `pos_id` y `operating_mode`.

Un listado vacio con tu token de prueba no implica que el Point productivo del comercio no exista: se consultan identidades/entornos distintos. No asociar la terminal virtual a un totem real a mano en SQL.

El backend actual solo acepta para un dispositivo una terminal presente entre las primeras 50 de ese listado. Si la virtual no aparece, la prueba del apartado 4 sigue siendo valida, pero NO permite todavia probar todo FoodOrderApp con esa terminal. Para el flujo completo necesitas una terminal de prueba asociada y visible en la cuenta de prueba, o un adaptador sandbox aislado que aun no esta implementado. No se debe quitar esta validacion del entorno productivo.

### 5.2 Sucursal y caja

Si faltan, crear una sucursal de Mercado Pago y una caja de Mercado Pago y vincular el Point. La guia oficial muestra POST `/users/{MP_USER_ID}/stores` y POST `/v2/pos`. No confundir MP_USER_ID con el UUID de FoodOrderApp.

Si `store_id` y `pos_id` ya corresponden al comercio, reutilizarlos: no crear duplicados sin revisar. Sus campos de direccion, ubicacion y asociacion dependen del comercio; completar los datos reales conforme a la guia, no copiar una direccion ficticia a produccion.

### 5.3 Modo integrado

Para la primera activacion compatible, la guia muestra PATCH `https://api.mercadopago.com/terminals/v1/setup` con el token autorizado y este cuerpo, sustituyendo el ID:

```json
{
  "terminals": [
    {
      "id": "ID-COMPLETO-DE-LA-TERMINAL",
      "operating_mode": "PDV"
    }
  ]
}
```

No ejecutar este cambio sobre un equipo productivo sin coordinar con su responsable: cambia como recibe cobros. Si ya esta en el modo correcto, omitirlo. Para reconfigurar y para SELF_SERVICE, seguir las instrucciones especificas del equipo; el modo de autoservicio requiere proteger el acceso a sus configuraciones. La PC y el Point se comunican mediante la API/internet, no por un controlador USB universal.

Fuente para los pasos 5.1-5.3: [Configurar terminal, sucursal y caja](https://www.mercadopago.com.ar/developers/es/docs/mp-point-v2/configure-terminal?scope=prod).

## 6. Prueba completa de FoodOrderApp desde Insomnia

Prerequisitos: backend/base de pruebas, variables corregidas, migracion con indices, admin de prueba activo, MERCADO PAGO habilitado en `users.paymentMethods`, caja propia activa con sesion OPEN y terminal de pruebas visible y configurada como en el apartado 5. Abrir la caja desde el panel existente para no inventar una sesion en SQL.

### 6.1 Obtener JWT admin

POST `API/main-route-users/log-in-user`, sin Bearer Token, con el email/contrasena DEL ADMIN DE FOODORDERAPP:

```json
{
  "email": "ADMIN-DE-PRUEBAS",
  "password": "CONTRASENA-DEL-ADMIN"
}
```

La ruta de login es la del `.env.example` de Electron; si cambiaste los nombres de las rutas del backend, usar tu ruta desplegada. Conservar `token` como JWT ADMIN y `user.id` como UUID del local. No utilizar el login de Mercado Pago aqui.

### 6.2 Crear dispositivo de pruebas

POST `TOTEM/devices`, Auth Bearer JWT ADMIN:

```json
{
  "name": "Totem Insomnia pruebas",
  "cashRegisterId": "UUID-DE-LA-CAJA-FOODORDERAPP"
}
```

Conservar `device.id` y `pairingCode`. El codigo vence a los 10 minutos. Usar un dispositivo separado del de la PC: activarlo desde Insomnia consume el codigo y produce una credencial propia.

### 6.3 Asignar terminal

POST `TOTEM/devices/UUID-DEL-DISPOSITIVO/point`, Auth Bearer JWT ADMIN:

```json
{
  "pointTerminalId": "ID-COMPLETO-DE-LA-TERMINAL-DE-PRUEBAS"
}
```

La respuesta confirma el dispositivo actualizado. Si informa que no pertenece a la cuenta, revisar el token de `MP_POINT_ACCOUNTS`, el UUID y el listado de terminales; no desactivar el control de pertenencia. Una terminal solo puede quedar asignada a un totem a la vez en FoodOrderApp.

### 6.4 Activar dispositivo

POST `TOTEM/activate`, sin Bearer Token:

```json
{
  "deviceId": "UUID-DEL-DISPOSITIVO",
  "pairingCode": "CODIGO-DEVUELTO-EN-6.2"
}
```

Conservar el `token` de esta respuesta como JWT TOTEM y proteger `deviceSecret`. El JWT dura 15 minutos. Si vence, POST `TOTEM/session`, sin Bearer Token, con JSON `deviceId` y `deviceSecret`; usar el nuevo `token`. La PC hace esta gestion con sus propias credenciales.

### 6.5 Obtener catalogo

GET `TOTEM/catalog`, Auth Bearer JWT TOTEM. Elegir un producto disponible, copiar su `id` y revisar `displayPrice` y `customOptions`. Para empezar, usar uno sin opciones obligatorias ni canje de puntos.

Opcional: GET `TOTEM/customer?userNumber=NUMERO`, mismo JWT. Devuelve si existe el cliente y su saldo del local. No enviar email, puntos ni precios arbitrarios para identificarlo.

### 6.6 Iniciar compra

POST `TOTEM/checkouts`, Auth Bearer JWT TOTEM. Ejemplo: un producto cuyo `displayPrice` REAL sea 100 y sin opciones obligatorias:

```json
{
  "clientRequestId": "33333333-3333-4333-8333-333333333333",
  "clientName": "Cliente de prueba",
  "orderType": "ESPERA EN LOCAL",
  "expectedTotal": 100,
  "cartItems": [
    {
      "productId": "UUID-REAL-DEL-PRODUCTO",
      "quantity": 1,
      "customOptions": [],
      "productComment": ""
    }
  ]
}
```

Reemplazar el importe por el total real del catalogo. Generar un nuevo clientRequestId para cada compra NUEVA; conservarlo sin cambiar el carrito al reintentar una solicitud incierta. Puede omitirse `userNumber` para invitado o agregarse como numero/string de digitos de un cliente existente.

Para opciones seleccionadas, cada entrada de `customOptions` tiene `optionId`, `itemId` y `quantity`, obtenidos de ese producto. El total es la suma por producto de `(displayPrice + extras seleccionados) * cantidad`. El backend verifica cantidades, minimos/maximos, total, puntos y precio; no acepta un total inventado.

La respuesta devuelve el UUID del CHECKOUT, `status`, `totalAmount` y `order`. Mientras esta pendiente, `order` es null. Un error no prueba que no se haya iniciado un cobro: consultar GET `TOTEM/checkouts/active` antes de intentar otro. Si devuelve un checkout, continuar con su ID.

### 6.7 Obtener la referencia de Mercado Pago

El endpoint publico no devuelve `providerOrderId`. Para simular este checkout concreto, consultar SOLO EN LA BASE DE PRUEBAS con pgAdmin:

```sql
SELECT "id", "providerOrderId", "status", "totalAmount"
FROM "totemCheckouts"
WHERE "id" = 'UUID-DEL-CHECKOUT-DEVUELTO';
```

No editar la fila ni marcarla APPROVED manualmente. El UUID del checkout y la referencia ORD de Mercado Pago NO son intercambiables.

### 6.8 Aprobar mediante el simulador oficial

Repetir la solicitud del apartado 4.2 usando el `providerOrderId` del checkout REAL de esta prueba y el mismo token MP de pruebas que tiene el backend. No crear ahora otra order directamente en MP: tendria otra referencia y no corresponderia al carrito.

Consultar GET `TOTEM/checkouts/UUID-DEL-CHECKOUT` con JWT TOTEM. El backend consulta MP con un intervalo minimo de 10 segundos; una primera lectura puede seguir pendiente. El resultado esperado es COMPLETED y `order` con `orderSource: TOTEM`, `status: FINALIZADO`, `isPaid: true`, `paidAt`, numero diario y caja correcta. Confirmar un solo pedido y un solo movimiento de pago en la base/panel.

Para probar el webhook, usar una compra conocida, verificar la entrega real desde MP y revisar que el backend confirma el proveedor. El boton generico de simulacion con un Data ID desconocido puede obtener 200 sin validar la firma: el handler actual ignora referencias que no reconoce. Eso NO prueba la firma ni la conciliacion completa.

### 6.9 Liberar el dispositivo para la siguiente compra

POST `TOTEM/checkouts/UUID-DEL-CHECKOUT/finish`, JWT TOTEM, Body JSON `{}`. Solo funciona tras COMPLETED, CANCELED, FAILED o EXPIRED; libera la compra activa, no cobra ni imprime.

Para cancelar una compra pendiente: POST `TOTEM/checkouts/UUID-DEL-CHECKOUT/cancel`, mismo JWT y `{}`; esperar el estado confirmado y luego `/finish`. No suponer que el primer HTTP exitoso equivale a cancelacion efectiva.

Insomnia no imprime tickets. Para probar el ticket, ejecutar Electron localmente, vincular SU dispositivo y configurar la impresora de cliente antes de entrar en modo totem. No ejecutar dos clientes de pruebas contra el mismo dispositivo/terminal al mismo tiempo.

## 7. OAuth oficial: pasos pendientes de implementacion

Esta seccion es un plan de desarrollo, NO rutas ya instaladas. No inventar una URL de callback y registrarla esperando que funcione: primero se debe implementar y desplegar el callback real. No hace falta publicar Electron para construirlo.

1. Agregar en el panel admin una accion `Conectar Mercado Pago`. El backend debe comprobar que el admin conecta su propio local.
2. Preparar configuracion privada para el Client ID/Client Secret de la aplicacion de LoboTech y la URL HTTPS del callback. Nombres propuestos: `MP_CLIENT_ID`, `MP_CLIENT_SECRET`, `MP_REDIRECT_URI`; hoy el codigo NO los lee. Preparar una clave privada independiente para cifrar las credenciales almacenadas, por ejemplo `MP_CREDENTIALS_ENCRYPTION_KEY`.
3. Implementar el inicio de autorizacion en el backend con `state` aleatorio, de corta duracion y de un solo uso, asociado al local/admin. Incorporar PKCE y proteger la correlacion de la respuesta.
4. Registrar el callback REAL en Mercado Pago Developers, detalles/edicion de la aplicacion, `URLs de redireccionamiento`. Debe coincidir exactamente con la que usa el backend.
5. Abrir el navegador externo del comercio hacia la autorizacion de Mercado Pago. El comercio ingresa en SU cuenta y acepta; LoboTech no recibe su contrasena. El Client Secret no se manda al navegador ni a Electron.
6. En el callback, validar state y errores/rechazo, y canjear el code desde el backend en POST `https://api.mercadopago.com/oauth/token` usando Authorization Code, las credenciales privadas, redirect_uri y el verifier de PKCE.
7. Guardar por local la identidad MP y access/refresh tokens cifrados, expiracion y estado de conexion. Rechazar asociaciones inconsistentes; no sobrescribir credenciales de otro local. La variable manual MP_POINT_ACCOUNTS no es el almacenamiento definitivo para renovaciones.
8. Cambiar `getPointAccount` para obtener la credencial autorizada de ese almacenamiento y renovar de forma controlada antes de expirar. No implementar OAuth en el renderer.
9. Incorporar selector de terminales de ESA cuenta, pertenencia/modo, desconexion/reautorizacion y diagnostico seguro. Mantener el webhook de la aplicacion y resolver local/checkout sin confiar en datos de identidad enviados por el navegador.
10. Desplegar y probar con un comercio autorizado. Una vez terminado, el comercio conecta la cuenta desde el panel; no tendras que editar Railway por cada alta.

Referencia del protocolo: [Authorization Code y PKCE](https://www.mercadopago.com.ar/developers/es/docs/security/oauth/creation). La seguridad, almacenamiento y rutas descritos arriba son el plan propuesto para FoodOrderApp, no una implementacion existente.

La renovacion intercambia el refresh token por nuevos tokens desde el servidor; actualizar tambien el refresh token devuelto. Si la autorizacion se revoca, pedir reconexion y no emitir cobros con una credencial invalida. Fuente: [Renovar Access Token](https://www.mercadopago.com.ar/developers/es/docs/security/oauth/renewal).

## 8. Salida a produccion

1. Completar OAuth antes de cobrar para otras cuentas y verificar que la identidad autorizada es la del comercio que recibira el dinero.
2. Configurar el webhook de la aplicacion en el entorno correspondiente. En Developers: Webhooks, Configurar notificaciones, evento Order (Mercado Pago), URL HTTPS `https://TU-BACKEND/main-route-totem/point/webhook`, Guardar configuracion. Usar su clave de firma, no Client Secret. Para pruebas, seguir la indicacion oficial sobre la cuenta vendedor de prueba.
3. Confirmar sucursal, caja MP, terminal compatible y modo integrado del comercio. Un token de pruebas no opera su terminal productiva.
4. Probar pedido aprobado/fallido/cancelado, repeticion de solicitudes/webhooks, precios cambiados, puntos, cierre/reapertura de la misma caja, corte de red y reinicio. Verificar que no haya doble pedido, venta ni cobro.
5. Probar Electron local y luego la version instalada: impresora conectada/desconectada, ticket, numero diario, recuperacion y siguiente cliente.
6. Antes de un despliegue amplio, agregar conciliacion independiente para compras pendientes, pantalla de incidentes y manejo de devoluciones en caja. Esos procesos no estan completos; un error de DB despues del pago no devuelve automaticamente el dinero.
7. Realizar una operacion productiva controlada con el comercio, revisando condiciones y comisiones de MP; no presentar una transaccion real como una simulacion gratuita. Revisar los requisitos de calidad/salida a produccion de Mercado Pago.

Fuente de notificaciones: [Configurar Webhooks Point](https://www.mercadopago.com.ar/developers/es/docs/mp-point/notifications). Los pagos reales en terminal requieren cuenta productiva y medios reales: [Pruebas Point](https://www.mercadopago.com.ar/developers/es/docs/mp-point/integration-test).

## 9. Diagnostico rapido

| Sintoma | Que revisar |
| --- | --- |
| Configuracion MP requiere revision | JSON invalido, UUID sin comillas, objeto serializado dos veces |
| Local sin Point configurado | UUID incorrecto en MP_POINT_ACCOUNTS o accessToken faltante |
| Falta firma | webhookSecret faltante o confundido con Client Secret |
| Terminal no pertenece a la cuenta | Token de otra cuenta/entorno, ID incorrecto o terminal fuera de las primeras 50 |
| Terminal no integrada | Modo operativo y compatibilidad del equipo |
| 401 en catalogo/checkout | JWT TOTEM vencido o usar JWT ADMIN/MP donde no corresponde |
| Caja del totem cerrada | Sesion OPEN de la misma caja FoodOrderApp asociada al dispositivo |
| Precios cambiaron | expectedTotal, displayPrice, extras y cantidad no coinciden |
| Compra pendiente | Consultar /checkouts/active; no generar otro cobro a ciegas |
| 204 del simulador | Resultado normal sin cuerpo; luego consultar el estado |
| Webhook simulado da 200 con un ID inventado | No acredita prueba de firma ni pago; usar una compra conocida |

No compartir valores reales de tokens, deviceSecret, contrasenas ni secretos en capturas, commits o tickets. Para diagnostico, compartir status HTTP y mensaje sanitizado, sin headers de autorizacion.
