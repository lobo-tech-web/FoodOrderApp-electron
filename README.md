# FoodOrderApp Admin

Aplicacion de escritorio para Windows construida con Electron y React. Incluye
el panel administrativo y el flujo tactil de Pedidos Local.

## Como funciona

La aplicacion tiene tres partes:

1. **Proceso principal de Electron:** crea la ventana, menu de Windows,
   impresion, almacenamiento cifrado y actualizaciones.
2. **Renderer React:** muestra login, panel administrativo y Pedidos Local.
3. **API remota:** usuarios, productos, pedidos, puntos e impresion termica
   siguen siendo gestionados por FoodOrderApp API.

El instalador no contiene la base de datos ni el backend. Cada PC se conecta
por HTTPS a la API configurada durante el build.

## Desarrollo

```powershell
npm install
npm run dev
```

Vite actualiza la ventana de Electron al guardar cambios. El codigo propio de
Electron esta en `src/`, `main.js`, `preload.js`, `menu.js` y `updater.js`. Los
componentes reutilizados del cliente estan dentro de `vendor/client-src/`.

## Variables de entorno

Crear `.env` a partir de `.env.example`. Las variables `VITE_*` se incorporan
al renderer durante el build, por lo que nunca deben contener contrasenas,
tokens privados ni claves de firma.

El instalador no incluye `.env`, codigo fuente, certificados ni datos de
sesion. La sesion de cada PC se guarda cifrada mediante Electron `safeStorage`.

## Crear instalador local

```powershell
npm run dist:win
```

Salida:

```text
release/installer/FoodOrderApp-Admin-Setup-<version>.exe
```

El instalador NSIS permite elegir directorio, crea accesos directos en
Escritorio y Menu Inicio, e incluye desinstalador.

## Publicar en GitHub

Cuando exista el repositorio:

```powershell
git init
git add .
git commit -m "Initial Electron admin application"
git branch -M main
git remote add origin https://github.com/USUARIO/REPOSITORIO.git
git push -u origin main
```

Para publicar una version:

```powershell
git add .
git commit -m "Describe the new changes"
git push origin main

npm version patch
git push origin main --follow-tags
```

El workflow `.github/workflows/release-windows.yml` crea un GitHub Release con
el instalador y los metadatos utilizados por `electron-updater`.

`npm version patch` cambia, por ejemplo, `1.0.0` a `1.0.1`, crea el commit de
version y crea el tag `v1.0.1`. No crear otro tag manualmente.

Un `git push` normal actualiza el codigo fuente, pero no modifica las
aplicaciones instaladas. Los clientes reciben cambios solamente cuando se
publica una version nueva mediante un tag como `v1.0.1`.

Flujo de actualizacion:

1. GitHub Actions construye y publica el instalador, `latest.yml` y blockmap.
2. La aplicacion instalada revisa GitHub Releases al iniciar y cada cuatro
   horas.
3. Descarga la version nueva en segundo plano.
4. Pregunta al usuario antes de reiniciar e instalar.

### Repositorios privados

Los clientes no pueden descargar actualizaciones anonimas desde un repositorio
privado. Para mantener el codigo privado, usar un segundo repositorio publico
solo para releases y definir la variable de repositorio `UPDATE_REPOSITORY`
como `propietario/repositorio-publico`. El workflow necesitara un token con
permiso para publicar en ese repositorio.

## Firma de codigo

Para evitar advertencias de SmartScreen y verificar la identidad del editor,
adquirir un certificado Windows Code Signing y guardar en GitHub:

- `CSC_LINK`: certificado `.pfx` codificado en base64 o URL segura.
- `CSC_KEY_PASSWORD`: contrasena del certificado.

Nunca guardar el certificado o su contrasena en el repositorio.

## Instalacion en otros equipos

El cliente solo ejecuta el instalador. No necesita configurar rutas HTTP,
copiar `.env`, instalar Node.js ni agregar archivos manualmente.

Cada PC necesita:

- Windows x64.
- Acceso a Internet y a la API configurada durante el build.
- Credenciales validas del panel.
- Configurar su impresora dentro de la aplicacion si utiliza impresion.

Si cambia la URL de la API o una ruta del backend, actualizar `.env`, generar
una nueva version y publicarla. Los clientes recibiran esa version mediante el
sistema de actualizaciones.

## Datos guardados en cada PC

- Sesion y JWT: cifrados por Windows mediante Electron `safeStorage`.
- Tema e impresoras: preferencias locales del equipo.
- Aplicacion: instalada por usuario en la carpeta elegida durante el setup.

Desinstalar la aplicacion conserva las preferencias por defecto para facilitar
una reinstalacion. Para borrar todos los datos, eliminar manualmente la carpeta
de datos de la aplicacion dentro de `%APPDATA%` despues de desinstalar.

## Gestion diaria

- Cambios de interfaz: editar `src/` o `vendor/client-src/` y usar
  `npm run dev`.
- Probar build: `npm run build`.
- Crear instalador local: `npm run dist:win`.
- Publicar clientes: aumentar version, crear tag y subirlo a GitHub.
- Cambiar backend: actualizar `.env.example` y `.env`, probar y publicar una
  version nueva.
- Revisar seguridad: ejecutar `npm audit --omit=dev` antes de cada release.
