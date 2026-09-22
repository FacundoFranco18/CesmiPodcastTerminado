let timeLeft = 300;
let timerInterval = null;
let isRunning = true;

const timerEl = document.getElementById('timer');
const statusEl = document.getElementById('timerStatus');
const toggleBtn = document.getElementById('btnToggleTimer');

function updateDisplay() {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    timerEl.innerText = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

function startTimer() {
    timerInterval = setInterval(() => {
        if (timeLeft > 0) {
            timeLeft--;
            updateDisplay();
        } else {
            clearInterval(timerInterval);
            statusEl.innerText = "¡ESTAMOS EN VIVO!";
            if (typeof confetti === 'function') {
                confetti({ particleCount: 150, spread: 90 });
            }
        }
    }, 1000);
}

toggleBtn.addEventListener('click', () => {
    if (isRunning) {
        clearInterval(timerInterval);
        toggleBtn.innerHTML = '<i class="fas fa-play"></i> Reanudar';
        statusEl.innerText = "CUENTA REGRESIVA PAUSADA";
    } else {
        startTimer();
        toggleBtn.innerHTML = '<i class="fas fa-pause"></i> Pausar';
        statusEl.innerText = "CUENTA REGRESIVA ACTIVA";
    }
    isRunning = !isRunning;
});

document.getElementById('btnAddMin').addEventListener('click', () => {
    timeLeft += 60;
    updateDisplay();
});

document.getElementById('btnGoLive').addEventListener('click', () => {
    window.location.href = '../index.html';
});

startTimer();
