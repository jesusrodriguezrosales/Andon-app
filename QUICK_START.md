# 🚀 Guía Rápida de Inicio

Bienvenido a la aplicación de Andón. Esta guía te ayudará a empezar en menos de 5 minutos.

## ⚡ Instalación Rápida

### Paso 1: Descargar el Proyecto
Ya tienes los archivos. El proyecto está ubicado en:
```
C:\Users\E0860225\Documents\Pruebas\andon test
```

### Paso 2: Instalar Node.js (si no lo tienes)
1. Ve a https://nodejs.org/
2. Descarga la versión LTS
3. Instala siguiendo las instrucciones
4. Verifica que se instaló: `node --version` y `npm --version` en la terminal

### Paso 3: Instalar Dependencias
```bash
cd "c:\Users\E0860225\Documents\Pruebas\andon test"
npm install
```

### Paso 4: Ejecutar la Aplicación
```bash
npm run dev
```

¡La aplicación se abrirá automáticamente!

---

## 🎮 Uso Básico

### Activar el Andón
1. Haz clic en el botón **"Activar Andón"**
2. O simplemente presiona la **barra espaciadora**

**Lo que sucede:**
- La pantalla parpadea en rojo 🔴
- El cronómetro comienza a contar
- Un sonido de alerta suena (si está habilitado)

### Llenar la Información
Mientras el andón está activo, rellena:
- **Zona/Estación**: Dónde ocurrió el problema (ej: A1, B3)
- **Problema**: ¿Qué se dañó? (ej: Sensor averiado)
- **Responsable**: Tu nombre
- **Prioridad**: Baja, Media, Alta o Crítica

### Desactivar el Andón
1. Haz clic en **"Desactivar Andón"** cuando se resuelva
2. El cronómetro se detiene
3. El registro se guarda automáticamente

### Controlar el Sonido
- Usa el checkbox **"Sonido de Alerta Activo"**
- Cuando desactive el sonido, el andón sigue activo
- El timer continúa corriendo

---

## 📊 Ver tu Historial

En la sección de **"Registros Recientes"** verás:
- Hora de inicio y fin
- Duración total
- Zona afectada
- Descripción del problema

Los registros se guardan automáticamente en tu computadora.

---

## ☁️ Conectar con SharePoint (Opcional)

### Si tienes un Excel en SharePoint:

1. **Haz clic en "Conectar a SharePoint"**
   - Necesitarás tus credenciales de Azure
   - Esto se configura una sola vez

2. **Luego haz clic en "Sincronizar Datos"**
   - Tus registros se enviarán a tu tabla de Excel
   - Puedas verlos online desde cualquier lugar

### Si no sabes tus credenciales:
1. Lee el archivo [SETUP_SHAREPOINT.md](SETUP_SHAREPOINT.md)
2. Contacta a tu administrador de TI

---

## 🔊 Solución de Problemas Rápida

### El sonido no suena
- ✅ Verifica que el volumen de tu PC esté activo
- ✅ Asegúrate que el checkbox esté marcado
- ✅ Intenta cerrar y reabre la aplicación

### La aplicación se cierra
- ✅ Asegúrate de haber corrido `npm install`
- ✅ Verifica que tengas Node.js instalado
- ✅ Prueba cerrar la consola antes de ejecutar

### No puedo conectar a SharePoint
- ✅ Verifica tu conexión a internet
- ✅ Comprueba tus credenciales en el archivo `.env`
- ✅ Lee la sección de SharePoint en README.md

---

## 📋 Keyboard Shortcuts (Atajos)

| Atajo | Acción |
|-------|--------|
| **ESPACIO** | Activar/Desactivar Andón |
| **Ctrl+R** | Recargar la aplicación |
| **Ctrl+Q** | Salir |
| **Ctrl+Shift+I** | Mostrar consola (para debug) |

---

## 📁 Archivos Importantes

```
📁 andon-system/
├── 📄 README.md              ← Documentación completa
├── 📄 SETUP_SHAREPOINT.md    ← Guía de SharePoint
├── 📄 .env.example           ← Variables de ejemplo
├── 📁 src/
│   ├── main.js               ← Aplicación principal
│   ├── index.html            ← Interfaz
│   ├── renderer.js           ← Lógica
│   └── styles.css            ← Estilos
└── 📁 assets/                ← Imágenes y sonidos
```

---

## 💡 Consejos Útiles

1. **Usa Zona/Estación consistente**: Así tus datos son más fáciles de analizar
2. **Sé específico en el problema**: Ayuda a entender patrones
3. **Sincroniza regularmente**: Para no perder datos
4. **Haz backup**: Coloca una copia de la carpeta de vez en cuando

---

## 🆘 Necesito Ayuda

1. **¿La aplicación no inicia?**
   - Abre una terminal (cmd o PowerShell)
   - Ve a la carpeta del proyecto
   - Ejecuta: `npm run dev`

2. **¿No aparecen los botones?**
   - Presiona F11 para pantalla completa
   - O redimensiona la ventana

3. **¿Olvidé mi contraseña de SharePoint?**
   - Contacta a tu administrador de TI
   - Puedes seguir usando la app sin SharePoint

---

## 📞 Contacto

Si tienes problemas específicos:
- Revisa el archivo `README.md` (documentación completa)
- Abre la consola: `Ctrl+Shift+I` para ver mensajes de error
- Contacta a tu administrador local

---

**¡Listo! Ahora tienes una herramienta profesional de Andón lista para usar.**

Presiona ESPACIO para activar tu primer andón 🚨

Versión: 1.0.0
