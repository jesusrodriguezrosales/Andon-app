# 🚨 Sistema de Andón - Aplicación de Escritorio

Una aplicación de escritorio moderna para gestionar andones (sistema de alertas visuales) en entornos de manufactura. Incluye cronómetro automático, alertas visuales llamativas, sonidos de alerta y sincronización con tablas de Excel en SharePoint.

## 🌟 Características Principales

- **⏱️ Cronómetro Automático**: Mide el tiempo exacto desde que se activa el andón hasta que se resuelve
- **🔴 Alertas Visuales Llamativas**: Pantalla roja parpadeante con animaciones impactantes
- **🔊 Sonido de Alerta**: Alerta sonora continua que se puede desactivar sin parar el andón
- **📊 Tabla de Registros**: Historial completo de todos los andones activados
- **☁️ Sincronización con SharePoint**: Conecta automáticamente con tu tabla de Excel en SharePoint
- **💾 Almacenamiento Local**: Los datos se guardan localmente incluso sin conexión
- **🖥️ Aplicación de Escritorio**: Corre en tu máquina sin necesidad de servidor
- **🎨 Interfaz Moderna**: Diseño responsivo y fácil de usar
- **⌨️ Atajo de Teclado**: Presiona ESPACIO para activar/desactivar el andón

## 🚀 Inicio Rápido

### Requisitos Previos
- Node.js 16+
- npm o yarn
- Windows, macOS o Linux

### Instalación

```bash
# 1. Instalar dependencias
npm install

# 2. Copiar el archivo de configuración
cp .env.example .env

# 3. Editar .env con tus credenciales de SharePoint

# 4. Ejecutar la aplicación
npm run dev
```

## 📋 Configuración de SharePoint

Lee el archivo [SETUP_SHAREPOINT.md](SETUP_SHAREPOINT.md) para:
- Registrar tu aplicación en Azure AD
- Obtener credenciales
- Configurar permisos
- Conectar con tu tabla de Excel

## 🎮 Cómo Usar

### Activar el Andón
1. Haz clic en **"Activar Andón"** (o presiona ESPACIO)
2. La pantalla parpadeará en rojo
3. El sonido de alerta comenzará
4. Rellena la información del problema:
   - Zona/Estación
   - Descripción del problema
   - Responsable
   - Prioridad

### Desactivar el Andón
1. Haz clic en **"Desactivar Andón"** cuando se resuelva el problema
2. El cronómetro se detiene automáticamente
3. El registro se guarda en la tabla local

### Controlar el Sonido
- Desactiva el checkbox **"Sonido de Alerta Activo"** para silenciar sin parar el andón
- El sonido reanudará si vuelves a activar el checkbox

### Sincronizar con SharePoint
1. Haz clic en **"Conectar a SharePoint"**
2. Una vez conectado, haz clic en **"Sincronizar Datos"**
3. Tus registros se enviarán a tu tabla de Excel

## 📁 Estructura del Proyecto

```
andon-system/
├── src/
│   ├── main.js              # Punto de entrada de Electron
│   ├── preload.js           # Puente seguro entre procesos
│   ├── index.html           # Interfaz principal
│   ├── styles.css           # Estilos CSS
│   ├── renderer.js          # Lógica del frontend
│   └── sharepoint-connector.js  # Integración con SharePoint
├── assets/                  # Recursos (imágenes, sonidos)
├── package.json             # Dependencias del proyecto
├── .env.example             # Plantilla de configuración
├── SETUP_SHAREPOINT.md      # Guía de configuración
└── README.md                # Este archivo
```

## 🔧 Comandos Disponibles

```bash
npm run dev          # Ejecutar en modo desarrollo
npm run start        # Iniciar la aplicación
npm run build        # Construir para distribución
npm run dist         # Empaquetar la aplicación
```

## 🔐 Seguridad

- Las credenciales se almacenan en variables de entorno
- Nunca compartas tu archivo `.env`
- Usa un `.gitignore` para proteger archivos sensibles

## 📚 Estructura de la Tabla en SharePoint

Crea una tabla con estas columnas:

| Columna | Tipo | Ejemplo |
|---------|------|---------|
| **Title** | Texto | Estación A1 |
| **Problem** | Texto | Motor averiado |
| **StartTime** | Fecha | 2024-01-15 14:30:00 |
| **EndTime** | Fecha | 2024-01-15 14:45:00 |
| **Duration** | Texto | 00:15:00 |
| **Responsible** | Texto | Juan García |
| **Priority** | Opción | Alta |
| **Status** | Opción | Resuelto |

## 🐛 Solución de Problemas

### El sonido no suena
- Verifica el volumen del sistema
- Asegúrate que el checkbox "Sonido" esté activado
- Revisa los permisos de audio del navegador

### No puedo conectar a SharePoint
- Verifica que las credenciales en `.env` sean correctas
- Asegúrate de tener permisos en Azure AD
- Revisa la consola de desarrollador (F12) para mensajes de error

### Los datos no se sincronizan
- Verifica la conexión a internet
- Comprueba los permisos de la aplicación
- Intenta conectar nuevamente

## 📖 Documentación Adicional

- [Guía de Configuración de SharePoint](SETUP_SHAREPOINT.md)
- [Documentación de Electron](https://www.electronjs.org/docs)
- [Microsoft Graph API](https://docs.microsoft.com/es-es/graph/)

## 📝 Registro de Cambios

### Versión 1.0.0
- ✨ Lanzamiento inicial
- 🎨 Interfaz de usuario moderna
- ⏱️ Sistema de cronómetro
- 🔊 Alertas visuales y sonoras
- ☁️ Integración básica con SharePoint

## 🤝 Contribuir

Las contribuciones son bienvenidas. Por favor:
1. Fork el repositorio
2. Crea una rama para tu feature
3. Commited tus cambios
4. Push a la rama
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la licencia MIT. Ver el archivo LICENSE para más detalles.

## 📞 Soporte

Si encuentras problemas o tienes sugerencias:
- Crea un issue en el repositorio
- Envía un email al administrador
- Revisa la documentación de SharePoint

---

**Nota**: Esta aplicación está diseñada para uso local sin servidor. Si necesitas hosting en servidor, contacta al administrador del sistema.

**Versión**: 1.0.0  
**Última actualización**: 2024
