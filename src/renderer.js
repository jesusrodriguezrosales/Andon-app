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
            stationInput: '',
            problemInput: '',
            reportedBy: '',
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

// Render dashboard with department cards
function renderDashboard() {
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
}

// Select department and update form
function selectDepartment(deptKey) {
    selectedDept = deptKey;
    const state = activeAndons[deptKey];
    
    // Update form with selected department data
    stationInput.value = state.stationInput || '';
    problemInput.value = state.problemInput || '';
    responsibleInput.value = state.reportedBy || '';
    departmentSelect.value = deptKey;
    
    // Show/hide alert section based on state
    if (state.isActive) {
        alertSection.style.display = 'block';
        updateAlertDisplay(deptKey);
    } else {
        alertSection.style.display = 'none';
    }
    
    updateButtonStates(deptKey);
    renderDashboard();
}

// Update alert display for selected department
function updateAlertDisplay(deptKey) {
    const state = activeAndons[deptKey];
    
    alertStatus.classList.add('active');
    alertLight.classList.remove('off');
    
    if (!state.arrivedTime) {
        alertLight.classList.remove('on');
        alertLight.style.backgroundColor = '#f44336'; // Rojo
        statusText.textContent = `¡ANDÓN ACTIVO! - ${DEPARTMENTS[deptKey]}`;
        statusSubtext.textContent = 'Esperando que el equipo llegue';
    } else {
        alertLight.classList.add('on');
        alertLight.style.backgroundColor = '#FFC107'; // Amarillo
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
        arrivedBtn.disabled = !state.arrivedTime;
        arrivedBtn.classList.toggle('disabled', state.arrivedTime || false);
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
    
    if (!stationInput.value.trim()) errors.push('Zona/Estación es requerida');
    if (!problemInput.value.trim()) errors.push('Problema es requerido');
    if (!responsibleInput.value.trim()) errors.push('Número de Empleado es requerido');
    
    return { isValid: errors.length === 0, errors };
}

// Activate Andón for selected department
function activateDeptAndon() {
    if (!selectedDept) {
        showNotification('Por favor selecciona un departamento', 'warning');
        return;
    }
    
    const validation = validateRequiredFields(selectedDept);
    if (!validation.isValid) {
        showNotification(validation.errors.join('\n'), 'error');
        return;
    }
    
    const state = activeAndons[selectedDept];
    
    state.isActive = true;
    state.startTime = Date.now();
    state.arrivedTime = null;
    state.stationInput = stationInput.value;
    state.problemInput = problemInput.value;
    state.reportedBy = responsibleInput.value;
    state.andonId = `ANDON_${selectedDept}_${Date.now()}`;
    state.escalationHistory = [];
    
    // Start timer for this department
    if (state.timerInterval) clearInterval(state.timerInterval);
    state.timerInterval = setInterval(() => updateDeptTimer(selectedDept), 100);
    
    playAlertSound();
    flashScreen();
    
    selectDepartment(selectedDept);
    showNotification(`✓ Andón activado para ${DEPARTMENTS[selectedDept]}`, 'success');
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
    
    teamArrivalModal.style.display = 'none';
    
    stopAlertSound();
    flashScreenYellow();
    playArrivalSound();
    
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
            priority: 'media',
            timestamp: new Date().toLocaleString('es-ES')
        };
        
        records.push(record);
        saveToStorage();
        updateRecordsTable();
        
        // Clear and reset state
        if (state.timerInterval) clearInterval(state.timerInterval);
        state.isActive = false;
        state.arrivedTime = null;
        state.startTime = null;
        state.stationInput = '';
        state.problemInput = '';
        state.reportedBy = '';
        state.andonId = null;
        state.escalationHistory = [];
        
        stopAlertSound();
        
        renderDashboard();
        alertSection.style.display = 'none';
        
        showNotification(`✓ Andón de ${DEPARTMENTS[selectedDept]} desactivado`, 'success');
        
    } catch (error) {
        console.error('Error:', error);
        showNotification('Error al desactivar: ' + error.message, 'error');
    }
}

// Update timer display for department
function updateDeptTimer(deptKey) {
    const state = activeAndons[deptKey];
    if (!state.isActive) return;
    
    const elapsedMs = Date.now() - state.startTime;
    const hours = Math.floor(elapsedMs / 3600000);
    const minutes = Math.floor((elapsedMs % 3600000) / 60000);
    const seconds = Math.floor((elapsedMs % 60000) / 1000);
    
    const timerEl = document.getElementById(`timer-${deptKey}`);
    if (timerEl) {
        timerEl.textContent = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    }
    
    if (selectedDept === deptKey) {
        timer.textContent = timerEl.textContent;
    }
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
    if (soundEnabled && alertSound) {
        alertSound.play().catch(err => console.log('Sound error:', err));
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
        padding: 12px 20px;
        border-radius: 4px;
        z-index: 9999;
        font-size: 0.9em;
        max-width: 300px;
        word-wrap: break-word;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
        animation: slideIn 0.3s ease;
    `;

    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from { transform: translateX(400px); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
    `;
    document.head.appendChild(style);

    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 3000);
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
    
    // Update timestamp
    setInterval(updateTimestamp, 1000);
    
    // Refres dashboard every second
    setInterval(renderDashboard, 1000);
});

// Update timestamp
function updateTimestamp() {
    const now = new Date();
    const timestampEl = document.getElementById('timestamp');
    if (timestampEl) {
        timestampEl.textContent = now.toLocaleString('es-ES');
    }
}
