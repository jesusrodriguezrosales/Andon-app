# Sistema de Andón - Guía de Configuración

## Configuración de SharePoint y Microsoft Graph API

Para conectar la aplicación con tu tabla de Excel en SharePoint, sigue estos pasos:

### 1. Registrar una Aplicación en Azure AD

1. Ve a [Azure Portal](https://portal.azure.com)
2. Busca "Azure Active Directory" o "Entra ID"
3. Click en "App registrations" → "New registration"
4. Rellena los detalles:
   - **Name**: Andon System
   - **Account types**: "Accounts in this organizational directory only"
5. Click "Register"

### 2. Crear un Secret

1. En la página de tu aplicación registrada, ve a "Certificates & secrets"
2. Click "New client secret"
3. Rellena la descripción: "Andon System API"
4. Selecciona expiración (recomendado: 24 meses)
5. Click "Add"
6. **COPIA Y GUARDA EL VALOR DEL SECRET** (no podrás verlo después)

### 3. Otorgar Permisos a Microsoft Graph

1. Ve a "API permissions"
2. Click "Add a permission"
3. Selecciona "Microsoft Graph" → "Application permissions"
4. Busca y selecciona:
   - `Sites.ReadWrite.All`
   - `Files.ReadWrite.All`
5. Click "Add permissions"
6. Click "Grant admin consent for [tu organización]"

### 4. Recopilar Información Necesaria

Copia los siguientes valores y guárdalos:

- **Tenant ID**: En "Overview" → "Tenant ID"
- **Client ID**: En "Overview" → "Application (client) ID"
- **Client Secret**: El que copiaste en el paso 2

### 5. Obtener la URL de tu SharePoint

1. Abre tu SharePoint site en el navegador
2. Copia la URL: `https://tuorganizacion.sharepoint.com/sites/tunombre`

### 6. Obtener el ID de la Lista/Tabla

1. Abre tu lista de Excel/SharePoint
2. Click en "... Details" (en arriba a la derecha)
3. El ID está en la URL o puedes obtenerlo via Graph API

## Archivo .env

Crea un archivo `.env` en la raíz del proyecto con el siguiente contenido:

```bash
SHAREPOINT_TENANT_ID=tu-tenant-id-aqui
SHAREPOINT_CLIENT_ID=tu-client-id-aqui
SHAREPOINT_CLIENT_SECRET=tu-client-secret-aqui
SHAREPOINT_SITE_URL=tuorganizacion.sharepoint.com:/sites/nombre
SHAREPOINT_LIST_ID=tu-list-id-aqui
```

## Estructura de la Tabla en Excel/SharePoint

Recomendamos crear una tabla con las siguientes columnas:

| Columna | Tipo | Descripción |
|---------|------|-------------|
| Title | Texto | Zona/Estación |
| Problem | Texto | Descripción del problema |
| StartTime | Fecha/Hora | Hora de inicio del andón |
| EndTime | Fecha/Hora | Hora de fin del andón |
| Duration | Texto | Duración (HH:MM:SS) |
| Responsible | Texto | Responsable/Operario |
| Priority | Opción | Baja/Media/Alta/Crítica |
| Status | Opción | Pendiente/En Progreso/Resuelto |

## Instalación y Ejecución

### Requisitos Previos
- Node.js 16 o superior
- npm o yarn

### Pasos de Instalación

1. **Clonar el repositorio**
```bash
git clone <tu-repositorio>
cd andon-system
```

2. **Instalar dependencias**
```bash
npm install
```

3. **Crear archivo .env**
```bash
cp .env.example .env
# Edita el archivo .env con tus credenciales
```

4. **Ejecutar en desarrollo**
```bash
npm run dev
```

5. **Construir para producción**
```bash
npm run build
npm run dist
```

## Uso de la Aplicación

### Activar Andón
1. Click el botón "Activar Andón" o presiona ESPACIO
2. La pantalla se volverá rojo y parpadeará
3. El sonido de alerta comenzará a sonar
4. Rellena la información del problema (zona, descripción, etc.)

### Desactivar Andón
1. Click el botón "Desactivar Andón" cuando se resuelva el problema
2. El cronómetro se detendrá automáticamente
3. El registro se guardará automáticamente en la tabla local

### Controlar el Sonido
- Usa el checkbox "Sonido de Alerta Activo" para activar/desactivar el sonido
- El sonido continúa mientras el andón esté activo si está habilitado

### Sincronizar con SharePoint
1. Click "Conectar a SharePoint"
2. Después de conectar, click "Sincronizar Datos" para enviar los registros a la tabla

## Solución de Problemas

### El sonido no funciona
- Verifica que tu navegador no tenga el audio silenciado
- Intenta usar audífonos/altavoces conectados

### No puedo conectar a SharePoint
- Verifica que las credenciales en el archivo .env son correctas
- Asegúrate de haber otorgado los permisos adecuados en Azure AD
- Comprueba que tu Tenant ID y Client ID sean correctos

### Los datos no se sincronizan
- Verifica la conexión a internet
- Comprueba los permisos de la aplicación en SharePoint
- Revisa los mensajes de error en la consola (Dev Tools)

## Características

✅ Interfaz visual llamativa y responsiva
✅ Cronómetro automático
✅ Alertas visuales con animaciones
✅ Sonido de alerta configurable
✅ Almacenamiento local de registros
✅ Sincronización con SharePoint/Excel
✅ Historial de eventos
✅ Prioridades de problemas
✅ Acceso sin servidor (aplicación de escritorio)

## Seguridad

- Las credenciales se almacenan de forma segura en variables de entorno
- Nunca commitees el archivo .env a control de versiones
- Usa un .gitignore para excluir archivos sensibles

## Soporte

Para reportar problemas o sugerencias, crea un issue en el repositorio.

## Licencia

MIT
