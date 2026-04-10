#!/usr/bin/env node

/**
 * Script para probar la conexión con SharePoint
 * Uso: node src/test-sharepoint.js
 */

const SharePointConnector = require('./sharepoint-connector');
require('dotenv').config();

async function testConnection() {
    console.log('🔍 Iniciando prueba de conexión con SharePoint...\n');

    // Verificar variables de entorno
    const requiredEnvs = [
        'SHAREPOINT_TENANT_ID',
        'SHAREPOINT_CLIENT_ID',
        'SHAREPOINT_CLIENT_SECRET',
        'SHAREPOINT_SITE_URL',
        'SHAREPOINT_LIST_ID'
    ];

    console.log('📝 Verificando variables de entorno...');
    let missingEnvs = [];
    for (const env of requiredEnvs) {
        if (process.env[env]) {
            console.log(`✅ ${env}: ${process.env[env].substring(0, 10)}...`);
        } else {
            console.log(`❌ ${env}: NO CONFIGURADO`);
            missingEnvs.push(env);
        }
    }

    if (missingEnvs.length > 0) {
        console.error('\n❌ Faltan variables de entorno. Por favor configura el archivo .env\n');
        console.error('Variables faltantes:', missingEnvs);
        process.exit(1);
    }

    // Crear instancia del conector
    const connector = new SharePointConnector();

    try {
        console.log('\n🔐 Intentando obtener token de acceso...');
        await connector.getAccessToken();
        console.log('✅ Token obtenido exitosamente\n');

        console.log('📚 Intentando obtener lista de elementos...');
        const items = await connector.getListItems();
        console.log(`✅ Conexión exitosa! Se encontraron ${items.length} elementos\n`);

        if (items.length > 0) {
            console.log('📋 Primeros elementos:');
            items.slice(0, 3).forEach((item, index) => {
                console.log(`  ${index + 1}. ${item.fields?.Title || 'Sin título'}`);
            });
        }

        console.log('\n✅ ¡La conexión con SharePoint funciona correctamente!');
    } catch (error) {
        console.error('\n❌ Error de conexión:');
        console.error('Mensaje:', error.message);
        
        if (error.response?.status === 401) {
            console.error('\n⚠️  Credenciales inválidas. Verifica tu Client ID y Secret.');
        } else if (error.response?.status === 403) {
            console.error('\n⚠️  Permiso denegado. Verifica los permisos en Azure AD.');
        } else if (error.response?.status === 404) {
            console.error('\n⚠️  Recurso no encontrado. Verifica la URL de sitio y el ID de lista.');
        }
        
        process.exit(1);
    }
}

// Ejecutar prueba
testConnection().catch(err => {
    console.error('Error inesperado:', err);
    process.exit(1);
});
