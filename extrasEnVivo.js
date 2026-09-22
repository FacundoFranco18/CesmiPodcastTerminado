/**
 * EXTRAS EN VIVO — toque "directo de verdad" para el estudio
 * Reloj, tiempo al aire, espectadores, ticker, alertas estilo stream,
 * VU meters en cámaras, glitch al cambiar de escena y shake con la bocina.
 */

(function () {
    'use strict';

    const START_TIME = Date.now();

    // ==========================================
    // 1. HEADER: HORA · TIEMPO AL AIRE · ESPECTADORES
    // ==========================================
    const clockEl = document.querySelector('#metaClock b');
    const uptimeEl = document.querySelector('#metaUptime b');
    const viewersEl = document.querySelector('#metaViewers b');

    let viewers = 847;

    function pad(n) {
        return String(n).padStart(2, '0');
    }

    function tickHeader() {
        const now = new Date();
        if (clockEl) {
            clockEl.textContent = `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
        }
        if (uptimeEl) {
            const s = Math.floor((Date.now() - START_TIME) / 1000);
            const h = Math.floor(s / 3600);
            const m = Math.floor((s % 3600) / 60);
            const sec = s % 60;
            uptimeEl.textContent = `${pad(h)}:${pad(m)}:${pad(sec)}`;
        }
        if (viewersEl) {
            viewersEl.textContent = viewers.toLocaleString('es-AR');
        }
    }

    setInterval(tickHeader, 1000);
    tickHeader();

    // Espectadores subiendo y bajando de a poco
    setInterval(() => {
        const delta = Math.floor(Math.random() * 11) - 4; // -4 .. +6
        viewers = Math.max(120, viewers + delta);
        if (viewersEl) viewersEl.textContent = viewers.toLocaleString('es-AR');
    }, 2200);

    // ==========================================
    // 2. TICKER INFERIOR (cinta tipo noticiero)
    // ==========================================
    const tickerPhrases = [
        '🎙 PODCASTCESMI EN VIVO — ¡BIENVENIDOS AL PROGRAMA!',
        '🔥 APLAUSOS [1] · RISAS [2] · BOCINA [3] · BA-DUM-TSS [4]',
        '😄 Tecla J = siguiente chiste · ESPACIO = confeti',
        '⭐ SHIFT+Q / W / E para enfocar cámaras · SHIFT+P = PARTY',
        '👁 GRACIAS POR ESTAR ACOMPAÑANDO, SE SIGUE LA CHARLA...'
    ];

    const tickerTrack = document.getElementById('tickerTrack');
    if (tickerTrack) {
        const half = tickerPhrases.map(p => `<span>${p} ◆</span>`).join('');
        tickerTrack.innerHTML = half + half;
    }

    // ==========================================
    // 3. ALERTAS ESTILO TWITCH (seguidor / chat / donación)
    // ==========================================
    const alertStack = document.getElementById('alertStack');

    const nickPool = [
        'AgusPodcast', 'lucas_dev', 'MateEnLua', 'Sofi_Stream', 'ElFede',
        'CaroLive', 'Nico_88', 'ValeCCI', 'programadorJR', 'FacuFan2026',
        'reliquias_del_bit', 'la_uli', 'TomasEnVivo', 'pablito.py'
    ];
    const chatPool = [
        'jajaja buenísimo', 'saludos desde el aula', 'esto está genial',
        '+1 por el chiste', 'seguimos en vivo!', 'qué genial el programa',
        'primera vez acá, me quedo', 'jaja no puedo con el bocinazo'
    ];
    const donPool = ['1000', '2000', '5000', '1500'];

    function pick(arr) {
        return arr[Math.floor(Math.random() * arr.length)];
    }

    function makeAlert() {
        const roll = Math.random();
        if (roll < 0.35) {
            return { icon: '👤', html: `Nuevo seguidor: <b>${pick(nickPool)}</b>` };
        }
        if (roll < 0.65) {
            return { icon: '💬', html: `<b>${pick(nickPool)}</b>: ${pick(chatPool)}` };
        }
        if (roll < 0.85) {
            return { icon: '💜', html: `<b>${pick(nickPool)}</b> donó $${pick(donPool)}` };
        }
        return { icon: '🎬', html: `Alguien clippeó el mejor momento del show` };
    }

    function showAlert() {
        if (!alertStack) return;
        const data = makeAlert();
        const el = document.createElement('div');
        el.className = 'alert-toast';
        el.innerHTML = `<span class="alert-icon">${data.icon}</span><span>${data.html}</span>`;
        alertStack.appendChild(el);

        setTimeout(() => {
            el.classList.add('out');
            setTimeout(() => el.remove(), 320);
        }, 4600);

        // Máximo 3 alertas a la vez
        while (alertStack.children.length > 3) {
            alertStack.firstChild.remove();
        }
    }

    function scheduleAlert() {
        const wait = 9000 + Math.random() * 9000;
        setTimeout(() => {
            showAlert();
            scheduleAlert();
        }, wait);
    }
    setTimeout(scheduleAlert, 5000);

    // ==========================================
    // 4. VU METERS EN CÁMARAS (barras de audio falsas)
    // ==========================================
    document.querySelectorAll('.cam-frame').forEach((frame, idx) => {
        const overlay = frame.querySelector('.cam-overlay');
        if (!overlay) return;

        const vu = document.createElement('div');
        vu.className = 'vu-meter';
        vu.setAttribute('aria-hidden', 'true');
        for (let i = 0; i < 5; i++) vu.appendChild(document.createElement('span'));
        overlay.appendChild(vu);

        const bars = Array.from(vu.children);
        // Conductor habla fuerte, invitado moderado, cámara satisfactorio suave
        const intensity = idx === 0 ? 1.0 : idx === 1 ? 0.75 : 0.45;

        setInterval(() => {
            const muted = frame.querySelector('.mic-status.muted');
            const t = Date.now() / 180;
            bars.forEach((bar, bi) => {
                if (muted) {
                    bar.style.height = '6px';
                    return;
                }
                const wave = 0.55 + 0.45 * Math.sin(t + bi * 1.3);
                const noise = 0.5 + Math.random() * 0.5;
                const h = 8 + 34 * intensity * wave * noise;
                bar.style.height = `${Math.round(h)}px`;
            });
        }, 150);
    });

    // ==========================================
    // 5. GLITCH AL CAMBIAR DE ESCENA (foco de cámara)
    // ==========================================
    function flashGlitch() {
        const stage = document.querySelector('.stage');
        if (!stage) return;
        stage.classList.remove('glitch-on');
        void stage.offsetWidth;
        stage.classList.add('glitch-on');
        setTimeout(() => stage.classList.remove('glitch-on'), 350);
    }

    if (typeof window.focusSpeaker === 'function') {
        const origFocus = window.focusSpeaker;
        window.focusSpeaker = function (...args) {
            const r = origFocus.apply(this, args);
            flashGlitch();
            return r;
        };
    }

    // ==========================================
    // 6. SHAKE CON BOCINA / FAIL
    // ==========================================
    function shakeApp() {
        const app = document.querySelector('.app-container');
        if (!app) return;
        app.classList.remove('shake');
        void app.offsetWidth;
        app.classList.add('shake');
        setTimeout(() => app.classList.remove('shake'), 450);
    }

    if (typeof window.playSound === 'function') {
        const origPlay = window.playSound;
        window.playSound = function (type) {
            const r = origPlay.call(this, type);
            if (type === 'airhorn' || type === 'fail') shakeApp();
            return r;
        };
    }

    // ==========================================
    // 7. CONTADOR CÍCLICO DE ESPECTADORES "PICOS"
    // ==========================================
    // De vez en cuando entra una oleada y el número sube de golpe
    setInterval(() => {
        if (Math.random() < 0.3) {
            viewers += 15 + Math.floor(Math.random() * 40);
            if (viewersEl) viewersEl.textContent = viewers.toLocaleString('es-AR');
            const meta = document.getElementById('metaViewers');
            if (meta) {
                meta.classList.remove('spike');
                void meta.offsetWidth;
                meta.classList.add('spike');
            }
        }
    }, 15000);
})();
