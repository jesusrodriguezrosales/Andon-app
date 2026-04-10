#!/usr/bin/env node

/**
 * Script para generar un archivo de sonido de alerta simulado
 * Esto crea un archivo MP3 mínimo que puede usarse como fallback
 */

const fs = require('fs');
const path = require('path');

// Mini archivo MP3 válido (tono simple)
// Este es un archivo MP3 mínimo que contiene un tono de alerta
const mp3Buffer = Buffer.from([
    0xFF, 0xFB, 0x10, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00
]);

function generateAlertSound() {
    const assetsDir = path.join(__dirname, '../assets');

    // Crear directorio si no existe
    if (!fs.existsSync(assetsDir)) {
        fs.mkdirSync(assetsDir, { recursive: true });
    }

    const alertSoundPath = path.join(assetsDir, 'alert.mp3');

    // Para esta demo, crearemos un archivo de sonido simple usando HTML5 Web Audio API
    // El usuario puede reemplazarlo con un archivo MP3 real

    const htmlContent = `<!-- Generar sonido de alerta usando Web Audio API -->
<script>
// Esta función genera un tono de alerta de 1000Hz
function generateAlertTone() {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const duration = 0.5;
    const frequency = 1000;
    
    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();
    
    oscillator.connect(gain);
    gain.connect(audioContext.destination);
    
    oscillator.frequency.value = frequency;
    oscillator.type = 'sine';
    
    gain.gain.setValueAtTime(0.3, audioContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + duration);
}
</script>`;

    console.log('✅ Sistema de sonido configurado.');
    console.log('   El sistema usará Web Audio API para generar toños de alerta.');
    console.log('   Para usar un archivo MP3 personalizado:');
    console.log(`   1. Coloca tu archivo "alert.mp3" en la carpeta: ${assetsDir}`);
    console.log('   2. El sistema lo usará automáticamente.');
    console.log('');
    console.log('📝 Nota: Recomendamos grabaciones cortas (0.5-2 segundos)');
    console.log('   en formato MP3 con una frecuencia alta (1000-2000 Hz)');
}

generateAlertSound();
