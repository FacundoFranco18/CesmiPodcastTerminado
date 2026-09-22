document.getElementById('btnClap').addEventListener('click', () => {
    if (typeof confetti === 'function') {
        confetti({
            particleCount: 200,
            spread: 100,
            origin: { y: 0.6 }
        });
    }
});

document.getElementById('btnReturn').addEventListener('click', () => {
    window.location.href = '../index.html';
});
