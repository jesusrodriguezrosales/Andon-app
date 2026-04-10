# Instrucciones para el Desarrollo de Sistema de Andón

Este proyecto es una aplicación de escritorio Electron para gestionar andones (alertas visuales) en manufactura.

## Información del Proyecto

- **Tipo**: Aplicación de Escritorio (Electron + Node.js)
- **Lenguaje**: JavaScript/HTML/CSS
- **Plataformas**: Windows, macOS, Linux
- **Características Principales**: Alertas visuales, sonido, cronómetro, integración SharePoint

## Estructura del Proyecto

```
src/
  ├── main.js                 # Proceso principal de Electron
  ├── preload.js              # Puente seguro IPC
  ├── index.html              # Interfaz principal
  ├── styles.css              # Estilos
  ├── renderer.js             # Lógica del frontend
  ├── sharepoint-connector.js # Integración con Microsoft Graph
  ├── config.json             # Configuración de la app
  ├── test-sharepoint.js      # Script de prueba
  └── setup-sound.js          # Configuración de sonido

assets/                        # Recursos (imágenes, sonidos)
docs/
  ├── README.md               # Documentación principal
  ├── SETUP_SHAREPOINT.md     # Guía de configuración
  └── QUICK_START.md          # Guía rápida
```

## Cómo Iniciar

1. **Instalar dependencias**
   ```
   npm install
   ```

2. **Crear archivo .env**
   ```
   cp .env.example .env
   # Edita con tus credenciales de SharePoint (opcional)
   ```

3. **Ejecutar en desarrollo**
   ```
   npm run dev
   ```

4. **Compilar para distribución**
   ```
   npm run build
   npm run dist
   ```

## Stack Tecnológico

- **Electron**: Framework para aplicaciones de escritorio
- **Node.js**: Runtime JavaScript
- **HTML/CSS**: Interfaz
- **Azure/Microsoft Graph**: OAuth2 y acceso a SharePoint
- **Axios**: Cliente HTTP para APIs

## Características Implementadas

✅ Interfaz visual moderna y responsiva
✅ Sistema de alertas visuales con animaciones
✅ Cronómetro automático
✅ Sonido de alerta configurable
✅ Almacenamiento local (localStorage)
✅ Integración con Microsoft Graph API
✅ Conexión a tablas de SharePoint/Excel
✅ Atajos de teclado
✅ Historial de eventos
✅ Notificaciones en pantalla

## Archivo de Configuración

El archivo `src/config.json` controla:
- Temas y colores
- Parámetros de sonido
- Intervalo de actualización
- Sincronización con SharePoint
- Preferencias de usuario

## Debugging

- **DevTools**: Ctrl+Shift+I para abrir la consola
- **Recargar**: Ctrl+R
- **Archivo de Log**: Revisa la salida en la terminal

## Variables de Entorno (.env)

```
SHAREPOINT_TENANT_ID=xxxxxxxx
SHAREPOINT_CLIENT_ID=xxxxxxxx
SHAREPOINT_CLIENT_SECRET=xxxxxxxx
SHAREPOINT_SITE_URL=xxx.sharepoint.com:/sites/xxx
SHAREPOINT_LIST_ID=xxxxxxxx
```

## Atajos de Desarrollo

| Acción | Shortcut |
|--------|----------|
| Activar/Desactivar Andón | Barra Espaciadora |
| DevTools | Ctrl+Shift+I |
| Recargar | Ctrl+R |
| Salir | Ctrl+Q |

## Próximas Mejoras Potenciales

- [ ] Soporte para múltiples usuarios
- [ ] Dashboard de estadísticas
- [ ] Exportación de reportes
- [ ] Sincronización automática
- [ ] Caché offline avanzado
- [ ] Integración con Power BI
- [ ] Múltiples idiomas
- [ ] Control de permisos
- [ ] Sistema de notificaciones por email
- [ ] Base de datos local vs cloud

## Estructura de Datos - Sharepoint

Tabla recomendada en SharePoint:

| Campo | Tipo | Notas |
|-------|------|-------|
| Title | Texto | Zona/Estación |
| Problem | Texto | Descripción |
| StartTime | DateTime | Inicio |
| EndTime | DateTime | Fin |
| Duration | Texto | HH:MM:SS |
| Responsible | Texto | Operario |
| Priority | Opción | Baja/Media/Alta |
| Status | Opción | Pendiente/Resuelto |

## Testing

Para probar la conexión con SharePoint:
```
node src/test-sharepoint.js
```

## Empaquetamiento

Windows:
```
npm run dist
```

Esto crea:
- Instalador NSIS
- Ejecutable portable

## Notas de Seguridad

- Nunca commitees archivos `.env`
- Las credenciales se cargan desde variables de entorno
- Usa context isolation en Electron
- Validar todos los datos de entrada
- Sanitizar datos antes de enviar a SharePoint

## Contacto/Soporte

- Revisa README.md para documentación
- Consulta SETUP_SHAREPOINT.md para Azure AD
- Abre DevTools para debugging

---
Versión: 1.0.0
