// Sistema de Andón - Multi Departamento
// Permite múltiples andones activos simultáneamente con semáforo visual

const DEPARTMENTS = {
    'calidad': 'Calidad',
    'ingenieria': 'Ingeniería',
    'mantenimiento': 'Mantenimiento',
    'ats': 'ATS',
};

// Estado global
let activeAndons = {}; // { deptKey: { isActive, arrivedTime, startTime, timerInterval, stationInput, problemInput, reportedBy, ... } }
let records = [];
let soundEnabled = true;
let selectedDept = null; // Departamento seleccionado
let mainTimerInterval = null; // Intervalo del temporizador principal

// DOM Elements
const departmentsGrid = document.getElementById('departmentsGrid');
const soundToggle = document.getElementById('soundToggle');
const recordsBody = document.getElementById('recordsBody');
const alertSound = document.getElementById('alertSound');
const alertSection = document.getElementById('alertSection');
const alertStatus = document.getElementById('alertStatus');
const alertLight = document.getElementById('alertLight');
const statusText = document.getElementById('statusText');
const statusSubtext = document.getElementById('statusSubtext');
const timer = document.getElementById('timer');
const responseTime = document.getElementById('responseTime');
const resolutionTime = document.getElementById('resolutionTime');
const responseTimeContainer = document.getElementById('responseTimeContainer');
const resolutionTimeContainer = document.getElementById('resolutionTimeContainer');

// Form Elements
const activateBtn = document.getElementById('activateBtn');
const arrivedBtn = document.getElementById('arrivedBtn');
const deactivateBtn = document.getElementById('deactivateBtn');
const stationInput = document.getElementById('stationInput');
const departmentSelect = document.getElementById('departmentSelect');
const problemInput = document.getElementById('problemInput');
const responsibleInput = document.getElementById('responsibleInput');

// Modal elements
const teamArrivalModal = document.getElementById('teamArrivalModal');
const arrivedEmployeeId = document.getElementById('arrivedEmployeeId');
const arrivalDeptInfo = document.getElementById('arrivalDeptInfo');
const confirmArrivalBtn = document.getElementById('confirmArrivalBtn');
const cancelArrivalBtn = document.getElementById('cancelArrivalBtn');

// Initialize activeAndons for each department
function initializeActiveAndons() {
    Object.keys(DEPARTMENTS).forEach(key => {
        activeAndons[key] = {
            isActive: false,
            arrivedTime: null,
            startTime: null,
            timerInterval: null,
            stationInput: 'Shenzhen Watt',
            problemInput: '',
            reportedBy: '',
            employeeResponded: '',
            andonId: null,
            escalationHistory: []
        };
    });
}

// Load data from localStorage
function loadFromStorage() {
    const stored = localStorage.getItem('andonRecords');
    if (stored) {
        records = JSON.parse(stored);
    }
    updateRecordsTable();
}

// Save data to localStorage
function saveToStorage() {
    localStorage.setItem('andonRecords', JSON.stringify(records));
}

// Initialize dashboard on first load
let dashboardInitialized = false;

// Render dashboard with department cards (solo una vez en la inicialización)
function renderDashboard() {
    // Solo renderizar la primera vez o si no hay tarjetas aún
    if (dashboardInitialized && departmentsGrid.children.length > 0) {
        // Solo actualizar estados visuales sin recrear
        updateDashboardStates();
        return;
    }
    
    departmentsGrid.innerHTML = Object.entries(DEPARTMENTS).map(([key, name]) => {
        const state = activeAndons[key];
        let statusColor = 'green'; // Verde - inactivo
        let statusText = 'Disponible';
        
        if (state.isActive && !state.arrivedTime) {
            statusColor = 'red';
            statusText = 'Requiere Atención';
        } else if (state.isActive && state.arrivedTime) {
            statusColor = 'yellow';
            statusText = 'Siendo Atendido';
        }
        
        return `
            <div class="department-card ${selectedDept === key ? 'selected' : ''} ${state.isActive ? 'active' : ''}" 
                 onclick="selectDepartment('${key}')">
                <div class="traffic-light ${statusColor}"></div>
                <div class="department-name">${name}</div>
                <div class="department-status">${statusText}</div>
                ${state.isActive ? `
                    <div class="department-info">
                        <div class="department-timer" id="timer-${key}">00:00:00</div>
                        <div style="font-size: 0.7em; margin-top: 4px;">${state.stationInput ? state.stationInput : 'N/A'}</div>
                    </div>
                ` : ''}
            </div>
        `;
    }).join('');
    
    dashboardInitialized = true;
}

// Update department card states without recreating
function updateDashboardStates() {
    Object.entries(DEPARTMENTS).forEach(([key, name]) => {
        const state = activeAndons[key];
        const card = document.querySelector(`[onclick="selectDepartment('${key}')"]`);
        if (!card) return;
        
        // Actualizar clases
        card.classList.toggle('selected', selectedDept === key);
        card.classList.toggle('active', state.isActive);
        
        // Actualizar estado visual
        const trafficLight = card.querySelector('.traffic-light');
        if (trafficLight) {
            trafficLight.className = 'traffic-light';
            if (state.isActive && !state.arrivedTime) {
                trafficLight.classList.add('red');
            } else if (state.isActive && state.arrivedTime) {
                trafficLight.classList.add('yellow');
            } else {
                trafficLight.classList.add('green');
            }
        }
        
        // Actualizar estado de texto
        const statusEl = card.querySelector('.department-status');
        if (statusEl) {
            if (state.isActive && !state.arrivedTime) {
                statusEl.textContent = 'Requiere Atención';
            } else if (state.isActive && state.arrivedTime) {
                statusEl.textContent = 'Siendo Atendido';
            } else {
                statusEl.textContent = 'Disponible';
            }
        }
    });
}

// Select department and update form
function selectDepartment(deptKey) {
    selectedDept = deptKey;
    const state = activeAndons[deptKey];
    
    // Update form with selected department data
    stationInput.value = state.stationInput || 'Shenzhen Watt';
    problemInput.value = state.problemInput || '';
    responsibleInput.value = state.reportedBy || '';
    departmentSelect.value = deptKey;
    
    // Show/hide alert section based on state
    if (state.isActive) {
        alertSection.style.display = 'block';
        updateAlertDisplay(deptKey);
        // Actualizar el timer principal
        const elapsedMs = Date.now() - state.startTime;
        const hours = Math.floor(elapsedMs / 3600000);
        const minutes = Math.floor((elapsedMs % 3600000) / 60000);
        const seconds = Math.floor((elapsedMs % 60000) / 1000);
        timer.textContent = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    } else {
        alertSection.style.display = 'none';
        timer.textContent = '00:00:00';
    }
    
    updateButtonStates(deptKey);
    renderDashboard();
}

// Switch department from dropdown (no es cambiar de departamento activo, solo mirar otro)
function switchDepartmentView(deptKey) {
    selectedDept = deptKey;
    const state = activeAndons[deptKey];
    
    // Solo actualizar el select y mantener los inputs que el usuario escribió
    departmentSelect.value = deptKey;
    
    // Mostrar datos del andón si está activo
    if (state.isActive) {
        alertSection.style.display = 'block';
        updateAlertDisplay(deptKey);
        // Actualizar el timer principal
        const elapsedMs = Date.now() - state.startTime;
        const hours = Math.floor(elapsedMs / 3600000);
        const minutes = Math.floor((elapsedMs % 3600000) / 60000);
        const seconds = Math.floor((elapsedMs % 60000) / 1000);
        timer.textContent = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    } else {
        alertSection.style.display = 'none';
        timer.textContent = '00:00:00';
    }
    
    updateButtonStates(deptKey);
    renderDashboard();
}

// Update alert display for selected department
function updateAlertDisplay(deptKey) {
    const state = activeAndons[deptKey];
    
    if (!state.isActive) {
        alertSection.style.display = 'none';
        return;
    }
    
    alertSection.style.display = 'block';
    alertStatus.classList.add('active');
    alertLight.classList.remove('off');
    
    if (!state.arrivedTime) {
        // Andón activo, esperando equipo (ROJO)
        alertLight.classList.remove('on');
        alertLight.style.backgroundColor = '#f44336';
        alertLight.style.boxShadow = '0 0 30px rgba(244, 67, 54, 0.6)';
        statusText.textContent = `¡ANDÓN ACTIVO! - ${DEPARTMENTS[deptKey]}`;
        statusSubtext.textContent = 'Esperando que el equipo llegue';
    } else {
        // Equipo en sitio (AMARILLO)
        alertLight.classList.add('on');
        alertLight.style.backgroundColor = '#FFC107';
        alertLight.style.boxShadow = '0 0 30px rgba(255, 193, 7, 0.6)';
        statusText.textContent = `Siendo Atendido - ${DEPARTMENTS[deptKey]}`;
        statusSubtext.textContent = 'Equipo en sitio';
    }
}

// Update button states based on department state
function updateButtonStates(deptKey) {
    const state = activeAndons[deptKey];
    
    if (state.isActive) {
        activateBtn.disabled = true;
        activateBtn.classList.add('disabled');
        // Botón "Equipo Llegó" debe estar HABILITADO cuando andón está activo pero equipo NO ha llegado
        arrivedBtn.disabled = state.arrivedTime !== null; // Deshabilitado si ya llegó
        arrivedBtn.classList.toggle('disabled', state.arrivedTime !== null);
        arrivedBtn.textContent = state.arrivedTime ? '✓ Equipo en Sitio' : 'Equipo Llegó';
        deactivateBtn.disabled = false;
        deactivateBtn.classList.remove('disabled');
    } else {
        activateBtn.disabled = false;
        activateBtn.classList.remove('disabled');
        arrivedBtn.disabled = true;
        arrivedBtn.classList.add('disabled');
        arrivedBtn.textContent = 'Equipo Llegó';
        deactivateBtn.disabled = true;
        deactivateBtn.classList.add('disabled');
    }
}

// Validate required fields
function validateRequiredFields(deptKey) {
    const errors = [];
    const state = activeAndons[deptKey];
    
    if (!problemInput.value.trim()) errors.push('Problema es requerido');
    if (!responsibleInput.value.trim()) errors.push('Número de Empleado es requerido');
    
    return { isValid: errors.length === 0, errors };
}

// Activate Andón for selected department
function activateDeptAndon() {
    // Si no hay departamento seleccionado en las tarjetas, usar el del select
    let deptKey = selectedDept;
    if (!deptKey) {
        deptKey = departmentSelect.value;
        if (!deptKey) {
            showNotification('Por favor selecciona un departamento', 'warning');
            return;
        }
    }
    
    const validation = validateRequiredFields(deptKey);
    if (!validation.isValid) {
        showNotification(validation.errors.join('\n'), 'error');
        return;
    }
    
    const state = activeAndons[deptKey];
    
    state.isActive = true;
    state.startTime = Date.now();
    state.arrivedTime = null;
    state.stationInput = stationInput.value.trim();
    state.problemInput = problemInput.value;
    state.reportedBy = responsibleInput.value;
    state.andonId = `ANDON_${deptKey}_${Date.now()}`;
    state.escalationHistory = [];
    
    // Limpiar timers de respuesta y resolución
    responseTimeContainer.style.display = 'none';
    resolutionTimeContainer.style.display = 'none';
    responseTime.textContent = '00:00:00';
    resolutionTime.textContent = '00:00:00';
    
    playAlertSound();
    flashScreen();
    
    selectedDept = deptKey;
    selectDepartment(deptKey);
    showNotification(`✓ Andón activado para ${DEPARTMENTS[deptKey]}`, 'success');
    
    // Iniciar intervalo de temporizadores si no está corriendo
    if (!mainTimerInterval) {
        mainTimerInterval = setInterval(updateAllTimers, 100);
    }
}

// Mark team arrived for department
function markDeptTeamArrived() {
    if (!selectedDept) return;
    
    const state = activeAndons[selectedDept];
    if (!state.isActive || state.arrivedTime) return;
    
    const currentDept = DEPARTMENTS[selectedDept];
    arrivalDeptInfo.textContent = `Departamento: ${currentDept}`;
    arrivedEmployeeId.value = '';
    arrivedEmployeeId.focus();
    teamArrivalModal.style.display = 'flex';
}

// Confirm team arrival
function confirmDeptTeamArrival() {
    const employeeId = arrivedEmployeeId.value.trim();
    
    if (!employeeId) {
        showNotification('Por favor ingresa tu número de empleado', 'error');
        return;
    }
    
    if (!selectedDept) return;
    
    const state = activeAndons[selectedDept];
    state.arrivedTime = Date.now();
    state.employeeResponded = employeeId;
    
    teamArrivalModal.style.display = 'none';
    arrivedEmployeeId.value = ''; // Limpiar input del modal
    
    stopAlertSound();
    flashScreenYellow();
    playArrivalSound();
    
    // Actualizar inmediatamente la visualización del semáforo
    updateAlertDisplay(selectedDept);
    updateButtonStates(selectedDept); // Actualizar estado de botones
    selectDepartment(selectedDept);
    showNotification(`✓ Empleado ${employeeId} llegó al sitio`, 'success');
}

// Deactivate Andón for department
function deactivateDeptAndon() {
    if (!selectedDept) return;
    
    try {
        const state = activeAndons[selectedDept];
        if (!state.isActive) return;
        
        const endTime = Date.now();
        const duration = formatDuration(endTime - state.startTime);
        let responseTime = '-';
        if (state.arrivedTime) {
            responseTime = formatDuration(state.arrivedTime - state.startTime);
        }
        
        let resolutionTime = '-';
        if (state.arrivedTime) {
            resolutionTime = formatDuration(endTime - state.arrivedTime);
        }
        
        // Save record
        const record = {
            startTime: formatDateTime(state.startTime),
            endTime: formatDateTime(endTime),
            duration: duration,
            responseTime: responseTime,
            resolutionTime: resolutionTime,
            station: state.stationInput || 'N/A',
            department: DEPARTMENTS[selectedDept],
            problem: state.problemInput || 'N/A',
            reportedBy: state.reportedBy || 'N/A',
            employeeResponded: state.employeeResponded || '-',
            priority: 'media',
            timestamp: new Date().toLocaleString('es-ES')
        };
        
        records.push(record);
        saveToStorage();
        updateRecordsTable();
        
        // Clear and reset state
        state.isActive = false;
        state.arrivedTime = null;
        state.startTime = null;
        state.stationInput = 'Shenzhen Watt';
        state.problemInput = '';
        state.reportedBy = '';
        state.employeeResponded = '';
        state.andonId = null;
        state.escalationHistory = [];
        
        stopAlertSound();
        
        // Verificar si aún hay andones activos
        const hasActiveAndons = Object.values(activeAndons).some(a => a.isActive);
        if (!hasActiveAndons && mainTimerInterval) {
            clearInterval(mainTimerInterval);
            mainTimerInterval = null;
        }
        
        // Limpiar inputs del formulario
        stationInput.value = 'Shenzhen Watt';
        problemInput.value = '';
        responsibleInput.value = '';
        departmentSelect.value = '';
        
        // Guardar nombre del departamento antes de resetear
        const deptName = DEPARTMENTS[selectedDept];
        
        // Resetear el departamento seleccionado
        selectedDept = null;
                // Limpiar timers de respuesta y resoluci\u00f3n
        responseTimeContainer.style.display = 'none';
        resolutionTimeContainer.style.display = 'none';
        responseTime.textContent = '00:00:00';
        resolutionTime.textContent = '00:00:00';
                renderDashboard();
        updateButtonStates('calidad'); // Resetear botones
        alertSection.style.display = 'none';
        timer.textContent = '00:00:00';
        
        showNotification(`✓ Andón de ${deptName} desactivado`, 'success');
        
    } catch (error) {
        console.error('Error:', error);
        showNotification('Error al desactivar: ' + error.message, 'error');
    }
}

// Update timer display for all active departments
function updateAllTimers() {
    Object.keys(DEPARTMENTS).forEach(deptKey => {
        const state = activeAndons[deptKey];
        if (!state.isActive) return;
        
        const elapsedMs = Date.now() - state.startTime;
        const hours = Math.floor(elapsedMs / 3600000);
        const minutes = Math.floor((elapsedMs % 3600000) / 60000);
        const seconds = Math.floor((elapsedMs % 60000) / 1000);
        const timeString = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
        
        // Actualizar timer en tarjeta de dashboard
        const timerEl = document.getElementById(`timer-${deptKey}`);
        if (timerEl) {
            timerEl.textContent = timeString;
        }
        
        // Actualizar timer principal si es el departamento seleccionado
        if (selectedDept === deptKey && timer) {
            timer.textContent = timeString;
            
            // Mostrar y actualizar tiempo de respuesta si equipo ha llegado
            if (state.arrivedTime) {
                responseTimeContainer.style.display = 'block';
                const responseMs = state.arrivedTime - state.startTime;
                const respHours = Math.floor(responseMs / 3600000);
                const respMinutes = Math.floor((responseMs % 3600000) / 60000);
                const respSeconds = Math.floor((responseMs % 60000) / 1000);
                responseTime.textContent = `${String(respHours).padStart(2, '0')}:${String(respMinutes).padStart(2, '0')}:${String(respSeconds).padStart(2, '0')}`;
                
                // Mostrar y actualizar tiempo de resolución
                resolutionTimeContainer.style.display = 'block';
                const resolutionMs = elapsedMs - responseMs;
                const resHours = Math.floor(resolutionMs / 3600000);
                const resMinutes = Math.floor((resolutionMs % 3600000) / 60000);
                const resSeconds = Math.floor((resolutionMs % 60000) / 1000);
                resolutionTime.textContent = `${String(resHours).padStart(2, '0')}:${String(resMinutes).padStart(2, '0')}:${String(resSeconds).padStart(2, '0')}`;
            }
            
            // Actualizar también la sección de alertas
            updateAlertDisplay(deptKey);
        }
    });
}

// Update records table
function updateRecordsTable() {
    if (records.length === 0) {
        recordsBody.innerHTML = '<tr><td colspan="7" style="text-align: center; color: #999;">No hay registros aún</td></tr>';
        return;
    }
    
    recordsBody.innerHTML = records
        .slice(-10)
        .reverse()
        .map(record => `
            <tr>
                <td>${record.startTime || '-'}</td>
                <td>${record.department || '-'}</td>
                <td>${record.station || '-'}</td>
                <td>${record.responseTime || '-'}</td>
                <td>${record.resolutionTime || '-'}</td>
                <td>${record.duration || '-'}</td>
                <td>${record.problem || '-'}</td>
            </tr>
        `)
        .join('');
}

// Update full table for modal
function updateFullTable() {
    const fullTableBody = document.getElementById('fullTableBody');
    if (!fullTableBody) return;
    
    if (records.length === 0) {
        fullTableBody.innerHTML = '<tr><td colspan="11" style="text-align: center; color: #999;">No hay registros aún</td></tr>';
        return;
    }
    
    fullTableBody.innerHTML = records
        .reverse()
        .map(record => `
            <tr>
                <td>${record.startTime || '-'}</td>
                <td>${record.endTime || '-'}</td>
                <td>${record.department || '-'}</td>
                <td>${record.station || '-'}</td>
                <td>${record.problem || '-'}</td>
                <td>${record.reportedBy || '-'}</td>
                <td>${record.employeeResponded || '-'}</td>
                <td>${record.responseTime || '-'}</td>
                <td>${record.resolutionTime || '-'}</td>
                <td>${record.duration || '-'}</td>
            </tr>
        `)
        .join('');
}

// Open full table modal
function openFullTableModal() {
    updateFullTable();
    const fullTableModal = document.getElementById('fullTableModal');
    if (fullTableModal) {
        fullTableModal.style.display = 'flex';
    }
}

// Descargar registros a Excel
// Descargar registros a Excel/CSV
async function downloadToExcel() {
    if (records.length === 0) {
        showNotification('No hay registros para descargar', 'warning');
        return;
    }
    
    try {
        // Generar nombre del archivo con fecha y hora
        const now = new Date();
        const timestamp = now.toISOString().slice(0, 19).replace(/[T:]/g, '-');
        const defaultFilename = `Andones_${timestamp}.xlsx`;
        
        // Mostrar diálogo de guardado
        const result = await window.electron.saveFile({
            defaultPath: defaultFilename
        });
        
        if (result.canceled) {
            return;
        }
        
        // Llamar al IPC handler para guardar el archivo
        const exportResult = await window.electron.exportToFile({
            filePath: result.filePath,
            records: records
        });
        
        if (exportResult.success) {
            showNotification(`✓ Archivo guardado exitosamente`, 'success');
        } else {
            showNotification(`Error al guardar archivo: ${exportResult.message}`, 'error');
        }
    } catch (error) {
        showNotification(`Error al guardar archivo: ${error.message}`, 'error');
    }
}

// Utility functions
function formatDuration(ms) {
    const hours = Math.floor(ms / 3600000);
    const minutes = Math.floor((ms % 3600000) / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

function formatDateTime(timestamp) {
    const date = new Date(timestamp);
    return date.toLocaleString('es-ES');
}

// Sound functions
function playAlertSound() {
    if (!soundEnabled) return;
    
    try {
        // Intenta usar el elemento audio primero (si existe alert.mp3)
        if (alertSound && alertSound.src) {
            alertSound.play().catch(err => {
                // Si falla, usa Web Audio API como fallback
                playAlertToneWebAudio();
            });
        } else {
            // Si no hay elemento audio, usa Web Audio API
            playAlertToneWebAudio();
        }
    } catch (err) {
        console.log('Sound error:', err);
    }
}

function playAlertToneWebAudio() {
    try {
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
    } catch (err) {
        console.log('Web Audio error:', err);
    }
}

function stopAlertSound() {
    if (alertSound) {
        alertSound.pause();
        alertSound.currentTime = 0;
    }
}

function playArrivalSound() {
    if (soundEnabled) {
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gain = audioContext.createGain();
            
            oscillator.connect(gain);
            gain.connect(audioContext.destination);
            
            oscillator.frequency.value = 1000;
            oscillator.type = 'sine';
            
            gain.gain.setValueAtTime(0.3, audioContext.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
            
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.2);
        } catch (err) {
            console.log('Arrival sound error:', err);
        }
    }
}

// Screen flash functions
function flashScreen() {
    const flash = document.createElement('div');
    flash.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(255, 0, 0, 0.3);
        z-index: 10000;
        pointer-events: none;
        animation: flashAnimation 0.5s ease-out;
    `;

    document.body.appendChild(flash);

    const style = document.createElement('style');
    style.textContent = `
        @keyframes flashAnimation {
            0% { opacity: 1; }
            100% { opacity: 0; }
        }
    `;
    document.head.appendChild(style);

    setTimeout(() => flash.remove(), 500);
}

function flashScreenYellow() {
    const flash = document.createElement('div');
    flash.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(255, 193, 7, 0.4);
        z-index: 10000;
        pointer-events: none;
        animation: flashAnimationYellow 0.6s ease-out;
    `;

    document.body.appendChild(flash);

    const style = document.createElement('style');
    style.textContent = `
        @keyframes flashAnimationYellow {
            0% { opacity: 1; }
            100% { opacity: 0; }
        }
    `;
    document.head.appendChild(style);

    setTimeout(() => flash.remove(), 600);
}

// Notification system
function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.textContent = message;
    
    const colors = {
        success: '#4CAF50',
        error: '#d32f2f',
        warning: '#ff9800',
        info: '#2196F3'
    };

    notification.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: ${colors[type] || colors.success};
        color: white;
        padding: 16px 24px;
        border-radius: 6px;
        z-index: 9999;
        font-size: 1em;
        font-weight: 500;
        min-width: 280px;
        max-width: 450px;
        word-wrap: break-word;
        white-space: normal;
        word-break: break-word;
        line-height: 1.5;
        box-shadow: 0 6px 16px rgba(0, 0, 0, 0.4);
        animation: slideIn 0.3s ease;
        display: block;
    `;

    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from { transform: translateX(500px); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
    `;
    document.head.appendChild(style);

    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 4000);
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    loadFromStorage();
    initializeActiveAndons();
    renderDashboard();
    updateTimestamp();
    
    // Button listeners
    if (activateBtn) activateBtn.addEventListener('click', activateDeptAndon);
    if (arrivedBtn) arrivedBtn.addEventListener('click', markDeptTeamArrived);
    if (deactivateBtn) deactivateBtn.addEventListener('click', deactivateDeptAndon);
    
    // Department select change listener
    if (departmentSelect) {
        departmentSelect.addEventListener('change', (e) => {
            const deptKey = e.target.value;
            if (deptKey) {
                switchDepartmentView(deptKey); // Usar la nueva función que no limpia inputs
            }
        });
    }
    
    // Modal listeners
    if (confirmArrivalBtn) confirmArrivalBtn.addEventListener('click', confirmDeptTeamArrival);
    if (cancelArrivalBtn) cancelArrivalBtn.addEventListener('click', () => {
        teamArrivalModal.style.display = 'none';
        arrivedEmployeeId.value = '';
    });
    
    if (soundToggle) {
        soundToggle.addEventListener('change', (e) => {
            soundEnabled = e.target.checked;
        });
    }
    
    // Expand table button listener
    const expandTableBtn = document.getElementById('expandTableBtn');
    if (expandTableBtn) {
        expandTableBtn.addEventListener('click', openFullTableModal);
    }
    
    // Download Excel button listener
    const downloadExcelBtn = document.getElementById('downloadExcelBtn');
    if (downloadExcelBtn) {
        downloadExcelBtn.addEventListener('click', downloadToExcel);
    }
    
    // Close fullTableModal when clicking outside content
    const fullTableModal = document.getElementById('fullTableModal');
    if (fullTableModal) {
        fullTableModal.addEventListener('click', function(event) {
            if (event.target === fullTableModal) {
                fullTableModal.style.display = 'none';
            }
        });
    }
    
    // Update timestamp
    setInterval(updateTimestamp, 1000);
    
    // Actualizar estados del dashboard (sin recrear elementos)
    setInterval(updateDashboardStates, 1000);
});

// Update timestamp
function updateTimestamp() {
    const now = new Date();
    const timestampEl = document.getElementById('timestamp');
    if (timestampEl) {
        timestampEl.textContent = now.toLocaleString('es-ES');
    }
}
