/**
 * EFECTOS ESPECIALES Y CONTROL DE STREAMING - MODO SOLO TECLADO
 * Simulación de directo: Eliminados todos los eventos de mouse para evitar conflictos.
 */

// ==========================================
// 1. INICIALIZACIÓN DE AUDIO WEB API
// ==========================================
let audioCtx = null;

function getAudioContext() {
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtx.state === 'suspended') {
        audioCtx.resume();
    }
    return audioCtx;
}

// ==========================================
// 2. SINTETIZADOR DE EFECTOS DE SONIDO
// ==========================================
function playSound(type) {
    const ctx = getAudioContext();
    const now = ctx.currentTime;

    if (type === 'applause') {
        for (let i = 0; i < 40; i++) {
            const bufferSize = ctx.sampleRate * 0.1;
            const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
            const data = buffer.getChannelData(0);
            for (let j = 0; j < bufferSize; j++) {
                data[j] = Math.random() * 2 - 1;
            }
            const noise = ctx.createBufferSource();
            noise.buffer = buffer;
            const filter = ctx.createBiquadFilter();
            filter.type = 'bandpass';
            filter.frequency.value = 1000 + Math.random() * 1000;
            const gain = ctx.createGain();
            const delay = Math.random() * 1.5;
            gain.gain.setValueAtTime(0.01, now + delay);
            gain.gain.exponentialRampToValueAtTime(0.3, now + delay + 0.02);
            gain.gain.exponentialRampToValueAtTime(0.001, now + delay + 0.1);
            noise.connect(filter);
            filter.connect(gain);
            gain.connect(ctx.destination);
            noise.start(now + delay);
        }
    } else if (type === 'airhorn') {
        const freqs = [466.16, 622.25, 932.33];
        freqs.forEach(freq => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(freq, now);
            gain.gain.setValueAtTime(0.2, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(now);
            osc.stop(now + 0.6);
        });
    } else if (type === 'rimshot') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.frequency.setValueAtTime(400, now);
        osc.frequency.exponentialRampToValueAtTime(80, now + 0.1);
        gain.gain.setValueAtTime(0.5, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.1);
        setTimeout(() => {
            const now2 = ctx.currentTime;
            const osc2 = ctx.createOscillator();
            const gain2 = ctx.createGain();
            osc2.frequency.setValueAtTime(800, now2);
            osc2.frequency.exponentialRampToValueAtTime(200, now2 + 0.15);
            gain2.gain.setValueAtTime(0.6, now2);
            gain2.gain.exponentialRampToValueAtTime(0.001, now2 + 0.15);
            osc2.connect(gain2);
            gain2.connect(ctx.destination);
            osc2.start(now2);
            osc2.stop(now2 + 0.15);
        }, 150);
    } else if (type === 'fail') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(300, now);
        osc.frequency.linearRampToValueAtTime(100, now + 0.8);
        gain.gain.setValueAtTime(0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.8);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.8);
    } else if (type === 'laughter') {
        for (let i = 0; i < 5; i++) {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            const start = now + (i * 0.12);
            osc.frequency.setValueAtTime(350 + (i % 2 * 50), start);
            osc.frequency.exponentialRampToValueAtTime(200, start + 0.08);
            gain.gain.setValueAtTime(0.2, start);
            gain.gain.exponentialRampToValueAtTime(0.001, start + 0.08);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(start);
            osc.stop(start + 0.08);
        }
    } else if (type === 'crickets') {
        for (let i = 0; i < 3; i++) {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            const start = now + (i * 0.15);
            osc.type = 'sine';
            osc.frequency.setValueAtTime(4500, start);
            gain.gain.setValueAtTime(0.1, start);
            gain.gain.exponentialRampToValueAtTime(0.001, start + 0.08);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(start);
            osc.stop(start + 0.08);
        }
    }
}

// ==========================================
// 3. GENERADOR DE EMOJIS FLOTANTES
// ==========================================
function spawnEmojiExplosion(emojiSymbol) {
    const container = document.getElementById('emojiContainer');
    if (!container) return;
    if (container.children.length > 30) {
        container.innerHTML = '';
    }
    const totalEmojis = 15;
    for (let i = 0; i < totalEmojis; i++) {
        const emojiEl = document.createElement('div');
        emojiEl.classList.add('floating-emoji');
        emojiEl.innerText = emojiSymbol;
        const randomLeft = Math.random() * 90 + 5;
        const randomDelay = Math.random() * 0.4;
        const randomSize = Math.random() * 1.2 + 1.5;
        emojiEl.style.left = `${randomLeft}vw`;
        emojiEl.style.bottom = `-50px`;
        emojiEl.style.animationDelay = `${randomDelay}s`;
        emojiEl.style.fontSize = `${randomSize}rem`;
        container.appendChild(emojiEl);
        setTimeout(() => {
            emojiEl.remove();
        }, 2500);
    }
}

// ==========================================
// 4. CONTROL DE EFECTOS Y COOLDOWN
// ==========================================
let lastSoundTime = 0;
const SOUND_COOLDOWN = 300;

function triggerSoundFX(soundType, emojiSymbol) {
    const now = Date.now();
    if (now - lastSoundTime < SOUND_COOLDOWN) return;
    lastSoundTime = now;
    playSound(soundType);
    spawnEmojiExplosion(emojiSymbol);
}

// ==========================================
// 5. EFECTOS ESPECIALES (CORAZONES Y TEMA)
// ==========================================
let lastHeartTime = 0;
function triggerHeartExplosion() {
    const now = Date.now();
    if (now - lastHeartTime < 300) return;
    lastHeartTime = now;
    spawnEmojiExplosion('❤️');
    setTimeout(() => spawnEmojiExplosion('💖'), 200);
}

function toggleThemeMode() {
    document.body.classList.toggle('theme-day');
    const themeIcon = document.getElementById('themeIcon');
    if (themeIcon) {
        if (document.body.classList.contains('theme-day')) {
            themeIcon.className = 'fas fa-sun';
        } else {
            themeIcon.className = 'fas fa-moon';
        }
    }
}

// ==========================================
// 6. FOCO DE INTEGRANTES CON TEMA Y COLOR PROPIO
// ==========================================
function focusSpeaker(frameId, colorName, emojiSymbol) {
    // Limpiar clases activas o atenuadas de todos los marcos y avatares
    document.querySelectorAll('.cam-frame').forEach(el => {
        el.classList.remove('focused');
        el.classList.add('dimmed');
    });

    document.querySelectorAll('.color-btn').forEach(btn => {
        btn.classList.remove('active');
    });

    // Cambiar la clase de tema en el body para aplicar el color propio correspondiente
    if (colorName) {
        document.body.className = document.body.classList.contains('theme-day') ? 'theme-day' : '';
        document.body.classList.add(`theme-${colorName}`);

        // Activar visualmente el botón de color correspondiente en la barra superior
        const targetBtn = document.querySelector(`.color-btn[data-color="${colorName}"]`);
        if (targetBtn) {
            targetBtn.classList.add('active');
        }
    }

    // Enfocar el marco seleccionado
    const targetElement = document.getElementById(frameId);
    if (targetElement) {
        targetElement.classList.remove('dimmed');
        targetElement.classList.add('focused');
    }

    if (emojiSymbol) {
        spawnEmojiExplosion(emojiSymbol);
    }
}

function clearSpeakerFocus() {
    document.querySelectorAll('.cam-frame').forEach(el => {
        el.classList.remove('focused', 'dimmed');
    });
}

// ==========================================
// 7. MODO PARTY EXPLOSIVO
// ==========================================
let lastPartyTime = 0;
function triggerPartyMode() {
    const now = Date.now();
    if (now - lastPartyTime < 1500) return;
    lastPartyTime = now;

    // Activar el modo party en el body para los colores locos y arcoíris
    document.body.classList.toggle('theme-party');

    // Agrandar y enfocar todos los marcos a la vez (Caos hermoso)
    document.querySelectorAll('.cam-frame').forEach(el => {
        el.classList.remove('dimmed');
        el.classList.add('focused');
    });

    setTimeout(() => {
        clearSpeakerFocus();
        document.body.classList.remove('theme-party');
    }, 2000);

    triggerSoundFX('applause', '🔥');
    setTimeout(() => spawnEmojiExplosion('⚡'), 300);
    setTimeout(() => spawnEmojiExplosion('🎉'), 600);
    setTimeout(() => spawnEmojiExplosion('🥳'), 900);

    if (typeof confetti === 'function') {
        confetti({ particleCount: 150, spread: 120, origin: { y: 0.5 } });
        setTimeout(() => {
            confetti({ particleCount: 100, angle: 60, spread: 55, origin: { x: 0 } });
            confetti({ particleCount: 100, angle: 120, spread: 55, origin: { x: 1 } });
        }, 400);
    }
}

// ==========================================
// 8. UTILIDADES (MICRÓFONOS, VIDEOS, CHISTES)
// ==========================================
function toggleMic(role) {
    const statusEl = document.getElementById(`status${role}`);
    if (!statusEl) return;
    statusEl.classList.toggle('muted');
    if (statusEl.classList.contains('muted')) {
        statusEl.innerHTML = '<i class="fas fa-microphone-slash"></i>';
    } else {
        statusEl.innerHTML = '<i class="fas fa-microphone"></i>';
    }
}

const satisfyingVideos = [
    "https://assets.mixkit.co/videos/preview/mixkit-ink-swirling-in-water-1187-large.mp4",
    "https://assets.mixkit.co/videos/preview/mixkit-hands-holding-a-burning-sparkler-42993-large.mp4",
    "https://assets.mixkit.co/videos/preview/mixkit-abstract-fluorescent-lights-background-41662-large.mp4"
];
let currentVideoIdx = 0;

function changeVideoBackground() {
    const videoSat = document.getElementById('videoSatisfying');
    if (videoSat) {
        currentVideoIdx = (currentVideoIdx + 1) % satisfyingVideos.length;
        videoSat.src = satisfyingVideos[currentVideoIdx];
        videoSat.play();
    }
}

const jokes = [
    "¿Por qué los desarrolladores odian la naturaleza? Porque tiene demasiados bugs.",
    "Hay 10 tipos de personas en el mundo: los que entienden binario y los que no.",
    "El código perfecto no existe, hasta que lo escribes... y te olvidas del punto y coma.",
    "¿Cuál es el colmo de un programador? Encontrarse con su ex y que le tire error 404."
];
let currentJokeIdx = 0;

function nextJokeText() {
    const jokeBox = document.getElementById('jokeBox');
    if (jokeBox) {
        currentJokeIdx = (currentJokeIdx + 1) % jokes.length;
        const text = jokes[currentJokeIdx];
        if (typeof window.renderTeleprompter === 'function') {
            window.renderTeleprompter(text);
        } else {
            jokeBox.innerText = text;
            jokeBox.style.animation = 'none';
            void jokeBox.offsetWidth;
            jokeBox.style.animation = '';
        }
    }
}

let lastConfettiTime = 0;
function launchConfetti() {
    const now = Date.now();
    if (now - lastConfettiTime < 800) return;
    lastConfettiTime = now;
    if (typeof confetti === 'function') {
        confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
    }
}

// ==========================================
// 9. ESCUCHADOR DE TECLADO GENERAL
// ==========================================
document.addEventListener('keydown', (e) => {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
    const key = e.key.toLowerCase();

    if (e.shiftKey) {
        switch (key) {
            case 'q': // Facundo (Violeta)
                e.preventDefault();
                focusSpeaker('frameHost', 'purple', '🦋');
                break;
            case 'w': // Integrante 2 (Cian)
                e.preventDefault();
                focusSpeaker('frameGuest', 'cyan', '🐶');
                break;
            case 'e': // Integrante 3 (Esmeralda)
                e.preventDefault();
                focusSpeaker('frameSatisfying', 'emerald', '⭐');
                break;
            case 'r': // Integrante 4 (Ámbar)
                e.preventDefault();
                // Si agregás más marcos en el futuro, podés rutearlos acá perfectamente
                focusSpeaker('frameSatisfying', 'amber', '🔥');
                break;
            case 't': // Integrante 5 (Rosa)
                e.preventDefault();
                focusSpeaker('frameSatisfying', 'pink', '💎');
                break;
            case 'p': // Modo Party Explosivo
                e.preventDefault();
                triggerPartyMode();
                break;
        }
    } else {
        switch (key) {
            case '1': triggerSoundFX('applause', '👏'); break;
            case '2': triggerSoundFX('laughter', '😂'); break;
            case '3': triggerSoundFX('airhorn', '🎺'); break;
            case '4': triggerSoundFX('rimshot', '🥁'); break;
            case '5': triggerSoundFX('fail', '❌'); break;
            case '6': triggerSoundFX('crickets', '🦗'); break;
            case 'escape':
                clearSpeakerFocus();
                break;
            case 'v':
                changeVideoBackground();
                break;
            case 'j':
                nextJokeText();
                break;
            case 'l':
                triggerHeartExplosion();
                break;
            case 'x':
                e.preventDefault();
                toggleThemeMode();
                break;
            case ' ':
                e.preventDefault();
                launchConfetti();
                break;
        }
    }
});
