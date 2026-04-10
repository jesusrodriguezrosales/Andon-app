// Sistema de Andón - Multi Departamento
// Permite múltiples andones activos simultáneamente

const DEPARTMENTS = {
    'calidad': 'Calidad',
    'ingenieria': 'Ingeniería',
    'mantenimiento': 'Mantenimiento',
    'ats': 'ATS',
};

// Estado global
let activeAndons = {}; // { deptKey: { isActive, arrivedTime, startTime, data, timerInterval, ... } }
let records = [];
let soundEnabled = true;

// DOM Elements
const departmentsGrid = document.getElementById('departmentsGrid');
const soundToggle = document.getElementById('soundToggle');
const recordsBody = document.getElementById('recordsBody');
const alertSound = document.getElementById('alertSound');

// Modal elements
const activationModal = document.getElementById('activationModal');
const modalDeptName = document.getElementById('modalDeptName');
const activationForm = document.getElementById('activationForm');

const arrivalModal = document.getElementById('arrivalModal');
const arrivalDeptName = document.getElementById('arrivalDeptName');
const arrivalForm = document.getElementById('arrivalForm');

const deactivationModal = document.getElementById('deactivationModal');
const deactivationDeptName = document.getElementById('deactivationDeptName');

// Current dept being worked with
let currentDept = null;

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadFromStorage();
    renderDepartmentCards();
    setupEventListeners();
    updateRecordsTable();
});

// Render department cards
function renderDepartmentCards() {
    departmentsGrid.innerHTML = '';
    
    Object.entries(DEPARTMENTS).forEach(([key, name]) => {
        const andon = activeAndons[key];
        const isActive = andon && andon.isActive;
        const hasArrived = andon && andon.arrivedTime;
        
        // Determine status and color
        let status = 'inactive';
        let statusColor = '#4CAF50'; // Verde
        let statusLabel = 'Inactivo';
        let statusIcon = '✓';
        
        if (isActive && !hasArrived) {
            status = 'active';
            statusColor = '#d32f2f'; // Rojo
            statusLabel = 'Requiere Atención';
            statusIcon = '!';
        } else if (isActive && hasArrived) {
            status = 'attending';
            statusColor = '#FFC107'; // Amarillo
            statusLabel = 'Siendo Atendido';
            statusIcon = '⏱️';
        }
        
        // Get timer value
        const timerValue = andon ? getTimerValue(andon) : '00:00:00';
        
        const card = document.createElement('div');
        card.className = `dept-card status-${status}`;
        card.style.borderLeftColor = statusColor;
        card.innerHTML = `
            <div class="dept-card-header">
                <h2>${name}</h2>
                <div class="status-badge" style="background: ${statusColor};">
                    <span class="status-icon">${statusIcon}</span>
                    <span class="status-text">${statusLabel}</span>
                </div>
            </div>
            
            <div class="dept-card-timer">
                <div class="timer-display" id="timer-${key}">${timerValue}</div>
            </div>
            
            ${isActive ? `
                <div class="dept-card-info">
                    <p><strong>Zona:</strong> ${andon.data.station}</p>
                    <p><strong>Problema:</strong> ${andon.data.problem}</p>
                    <p><strong>Reportado por:</strong> ${andon.data.reportedBy}</p>
                    ${hasArrived ? `<p><strong>Atendido por:</strong> ${andon.respondedBy}</p>` : ''}
                </div>
            ` : ''}
            
            <div class="dept-card-buttons">
                ${!isActive ? `
                    <button class="btn btn-primary" onclick="openActivationModal('${key}', '${name}')">
                        Activar Andón
                    </button>
                ` : `
                    ${!hasArrived ? `
                        <button class="btn btn-warning" onclick="openArrivalModal('${key}', '${name}')">
                            Equipo Llegó
                        </button>
                    ` : ''}
                    <button class="btn btn-danger" onclick="openDeactivationModal('${key}', '${name}')">
                        Desactivar
                    </button>
                `}
            </div>
        `;
        
        departmentsGrid.appendChild(card);
        
        // Start timer if active
        if (isActive && andon.timerInterval) {
            clearInterval(andon.timerInterval);
        }
        
        if (isActive) {
            andon.timerInterval = setInterval(() => updateDeptTimer(key), 100);
        }
    });
}

function getTimerValue(andon) {
    if (!andon.startTime) return '00:00:00';
    const elapsed = Date.now() - andon.startTime;
    return formatDuration(elapsed);
}

function updateDeptTimer(deptKey) {
    const andon = activeAndons[deptKey];
    if (!andon || !andon.isActive) return;
    
    const timerEl = document.getElementById(`timer-${deptKey}`);
    if (timerEl) {
        timerEl.textContent = getTimerValue(andon);
    }
}

function formatDuration(ms) {
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

// Modal functions
function openActivationModal(deptKey, deptName) {
    currentDept = deptKey;
    modalDeptName.textContent = deptName;
    document.getElementById('modalStation').value = '';
    document.getElementById('modalProblem').value = '';
    document.getElementById('modalEmployeeId').value = '';
    document.getElementById('modalPriority').value = 'media';
    activationModal.style.display = 'flex';
    document.getElementById('modalStation').focus();
}

function closeActivationModal() {
    activationModal.style.display = 'none';
    currentDept = null;
}

function confirmActivation(event) {
    event.preventDefault();
    
    const station = document.getElementById('modalStation').value.trim();
    const problem = document.getElementById('modalProblem').value.trim();
    const employeeId = document.getElementById('modalEmployeeId').value.trim();
    const priority = document.getElementById('modalPriority').value;
    
    if (!station || !problem || !employeeId) {
        showNotification('Por favor completa todos los campos', 'error');
        return;
    }
    
    // Crear nuevo andón para este departamento
    activeAndons[currentDept] = {
        isActive: true,
        arrivedTime: null,
        respondedBy: null,
        startTime: Date.now(),
        timerInterval: null,
        data: {
            station,
            problem,
            reportedBy: employeeId,
            priority,
            deptKey: currentDept,
            deptName: DEPARTMENTS[currentDept]
        }
    };
    
    // Guardar en historial
    records.push({
        timestamp: new Date().toLocaleString('es-ES'),
        department: DEPARTMENTS[currentDept],
        station,
        problem,
        reportedBy: employeeId,
        priority,
        status: 'activo',
        startTime: new Date().toLocaleString('es-ES')
    });
    
    saveToStorage();
    showNotification(`✅ Andón activado en ${DEPARTMENTS[currentDept]}`, 'success');
    playAlertSound();
    flashScreen();
    closeActivationModal();
    renderDepartmentCards();
}

function openArrivalModal(deptKey, deptName) {
    currentDept = deptKey;
    arrivalDeptName.textContent = deptName;
    document.getElementById('arrivalEmployeeId').value = '';
    arrivalModal.style.display = 'flex';
    document.getElementById('arrivalEmployeeId').focus();
}

function closeArrivalModal() {
    arrivalModal.style.display = 'none';
    currentDept = null;
}

function confirmArrival(event) {
    event.preventDefault();
    
    const employeeId = document.getElementById('arrivalEmployeeId').value.trim();
    
    if (!employeeId) {
        showNotification('Por favor ingresa tu número de empleado', 'error');
        return;
    }
    
    const andon = activeAndons[currentDept];
    if (andon) {
        andon.arrivedTime = Date.now();
        andon.respondedBy = employeeId;
        
        saveToStorage();
        showNotification(`✅ Equipo llegó al sitio (${employeeId})`, 'success');
        playArrivalSound();
        flashScreenYellow();
        closeArrivalModal();
        renderDepartmentCards();
    }
}

function openDeactivationModal(deptKey, deptName) {
    currentDept = deptKey;
    const andon = activeAndons[deptKey];
    
    deactivationDeptName.textContent = deptName;
    document.getElementById('deactivationStation').textContent = andon.data.station;
    document.getElementById('deactivationProblem').textContent = andon.data.problem;
    document.getElementById('deactivationDuration').textContent = getTimerValue(andon);
    
    if (andon.arrivedTime) {
        const responseMs = andon.arrivedTime - andon.startTime;
        document.getElementById('deactivationResponseTime').textContent = formatDuration(responseMs);
    } else {
        document.getElementById('deactivationResponseTime').textContent = '-';
    }
    
    deactivationModal.style.display = 'flex';
}

function closeDeactivationModal() {
    deactivationModal.style.display = 'none';
    currentDept = null;
}

function confirmDeactivation() {
    if (!currentDept) return;
    
    const andon = activeAndons[currentDept];
    const deptName = DEPARTMENTS[currentDept];
    
    if (andon) {
        const totalMs = Date.now() - andon.startTime;
        const totalTime = formatDuration(totalMs);
        
        let responseTime = '-';
        if (andon.arrivedTime) {
            const responseMs = andon.arrivedTime - andon.startTime;
            responseTime = formatDuration(responseMs);
        }
        
        // Update record
        const record = records.find(r => 
            r.department === deptName && 
            r.status === 'activo' && 
            r.startTime === andon.data.startTimeStr
        );
        
        if (record) {
            record.status = 'completado';
            record.endTime = new Date().toLocaleString('es-ES');
            record.totalTime = totalTime;
            record.responseTime = responseTime;
            record.respondedBy = andon.respondedBy || '-';
        } else {
            // Crear nuevo registro
            records.push({
                timestamp: new Date().toLocaleString('es-ES'),
                department: deptName,
                station: andon.data.station,
                problem: andon.data.problem,
                reportedBy: andon.data.reportedBy,
                respondedBy: andon.respondedBy || '-',
                priority: andon.data.priority,
                status: 'completado',
                startTime: andon.data.startTimeStr,
                totalTime,
                responseTime
            });
        }
        
        // Stop timer
        if (andon.timerInterval) {
            clearInterval(andon.timerInterval);
        }
        
        // Remove andon
        delete activeAndons[currentDept];
        
        saveToStorage();
        updateRecordsTable();
        showNotification(`✅ Andón desactivado en ${deptName}`, 'success');
        closeDeactivationModal();
        renderDepartmentCards();
    }
}

// Update records table
function updateRecordsTable() {
    if (records.length === 0) {
        recordsBody.innerHTML = '<tr><td colspan="10" style="text-align: center; color: #999;">No hay registros aún</td></tr>';
        return;
    }
    
    recordsBody.innerHTML = records
        .slice()
        .reverse()
        .slice(0, 20)
        .map(record => `
            <tr>
                <td>${record.startTime || '-'}</td>
                <td>${record.department}</td>
                <td>${record.station}</td>
                <td>${record.problem}</td>
                <td>${record.reportedBy}</td>
                <td>${record.respondedBy || '-'}</td>
                <td>${record.responseTime || '-'}</td>
                <td>${record.totalTime || '-'}</td>
                <td>${record.priority}</td>
                <td><span style="background: ${record.status === 'completado' ? '#4CAF50' : '#FFC107'}; padding: 4px 8px; border-radius: 3px; color: white; font-size: 12px;">${record.status}</span></td>
            </tr>
        `)
        .join('');
}

// Audio functions
function playAlertSound() {
    if (soundEnabled) {
        alertSound.play().catch(err => console.log('Sound error:', err));
    }
}

function playArrivalSound() {
    if (soundEnabled) {
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const osc = audioContext.createOscillator();
            const gain = audioContext.createGain();
            
            osc.connect(gain);
            gain.connect(audioContext.destination);
            osc.frequency.value = 1000;
            osc.type = 'sine';
            
            gain.gain.setValueAtTime(0.3, audioContext.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
            
            osc.start(audioContext.currentTime);
            osc.stop(audioContext.currentTime + 0.2);
        } catch (err) {
            console.log('Arrival sound error:', err);
        }
    }
}

// Flash screen - Red
function flashScreen() {
    const flash = document.createElement('div');
    flash.style.cssText = `
        position: fixed; top: 0; left: 0; width: 100%; height: 100%;
        background: rgba(255, 0, 0, 0.3); z-index: 10000; pointer-events: none;
        animation: flashAnimation 0.5s ease-out;
    `;
    document.body.appendChild(flash);
    
    const style = document.createElement('style');
    style.textContent = '@keyframes flashAnimation { 0% { opacity: 1; } 100% { opacity: 0; } }';
    document.head.appendChild(style);
    
    setTimeout(() => flash.remove(), 500);
}

// Flash screen - Yellow
function flashScreenYellow() {
    const flash = document.createElement('div');
    flash.style.cssText = `
        position: fixed; top: 0; left: 0; width: 100%; height: 100%;
        background: rgba(255, 193, 7, 0.4); z-index: 10000; pointer-events: none;
        animation: flashAnimationYellow 0.6s ease-out;
    `;
    document.body.appendChild(flash);
    
    const style = document.createElement('style');
    style.textContent = '@keyframes flashAnimationYellow { 0% { opacity: 1; } 100% { opacity: 0; } }';
    document.head.appendChild(style);
    
    setTimeout(() => flash.remove(), 600);
}

// Notifications
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.style.cssText = `
        position: fixed; top: 20px; right: 20px; z-index: 9999;
        background: ${type === 'success' ? '#4CAF50' : type === 'error' ? '#d32f2f' : '#FFC107'};
        color: white; padding: 15px 20px; border-radius: 5px;
        box-shadow: 0 4px 6px rgba(0,0,0,0.2); animation: slideIn 0.3s ease-out;
    `;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    const style = document.createElement('style');
    style.textContent = '@keyframes slideIn { from { transform: translateX(400px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }';
    document.head.appendChild(style);
    
    setTimeout(() => notification.remove(), 3000);
}

// Storage
function saveToStorage() {
    localStorage.setItem('andonRecords', JSON.stringify(records));
    localStorage.setItem('activeAndons', JSON.stringify(activeAndons));
}

function loadFromStorage() {
    const savedRecords = localStorage.getItem('andonRecords');
    if (savedRecords) {
        records = JSON.parse(savedRecords);
    }
    
    const savedAndons = localStorage.getItem('activeAndons');
    if (savedAndons) {
        activeAndons = JSON.parse(savedAndons);
        // Re-initialize timers
        Object.keys(activeAndons).forEach(key => {
            activeAndons[key].timerInterval = null;
        });
    }
}

// Event listeners
soundToggle.addEventListener('change', (e) => {
    soundEnabled = e.target.checked;
});

document.getElementById('downloadExcelBtn').addEventListener('click', downloadExcel);
document.getElementById('clearRecordsBtn').addEventListener('click', () => {
    if (confirm('¿Deseas limpiar el historial?')) {
        records = [];
        saveToStorage();
        updateRecordsTable();
        showNotification('✅ Historial limpiado', 'success');
    }
});

activationForm.addEventListener('submit', confirmActivation);
arrivalForm.addEventListener('submit', confirmArrival);

// Download Excel
function downloadExcel() {
    if (records.length === 0) {
        showNotification('No hay registros para descargar', 'warning');
        return;
    }
    
    let csvContent = 'Hora Inicio,Departamento,Zona,Problema,Reportado Por,Atendido Por,T. Respuesta,T. Total,Prioridad,Estado\n';
    
    records.forEach(record => {
        const row = [
            record.startTime || '',
            record.department || '',
            record.station || '',
            `"${(record.problem || '').replace(/"/g, '""')}"`,
            record.reportedBy || '',
            record.respondedBy || '',
            record.responseTime || '',
            record.totalTime || '',
            record.priority || '',
            record.status || ''
        ].join(',');
        csvContent += row + '\n';
    });
    
    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `andones_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    showNotification(`📊 ${records.length} registros descargados`, 'success');
}
