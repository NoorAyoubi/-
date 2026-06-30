// Notification Service (Desktop Push and Audio Alerts)
export function playChime() {
    try {
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        const playTone = (freq, startTime, duration) => {
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            osc.connect(gain);
            gain.connect(audioCtx.destination);
            osc.frequency.setValueAtTime(freq, startTime);
            gain.gain.setValueAtTime(0, startTime);
            gain.gain.linearRampToValueAtTime(0.15, startTime + 0.05);
            gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);
            osc.start(startTime);
            osc.stop(startTime + duration);
        };
        const now = audioCtx.currentTime;
        playTone(659.25, now, 0.3); // E5 note
        playTone(880.00, now + 0.12, 0.45); // A5 note
    } catch (e) {
        console.log("Audio play failed:", e);
    }
}

export function triggerDesktopNotification(lead, onClickCallback) {
    if (!("Notification" in window)) return;
    
    const showNotification = () => {
        playChime(); // Play synthesized audio chime!
        const title = "🔔 Lawyer AI";
        const options = {
            body: `طلب جديد\nوصلتك رسالة جديدة من:\n${lead.clientName}`,
            requireInteraction: true
        };
        const n = new Notification(title, options);
        n.onclick = function() {
            window.focus();
            if (onClickCallback) onClickCallback(lead.id);
            n.close();
        };
    };
    
    if (Notification.permission === "granted") {
        showNotification();
    } else if (Notification.permission !== "denied") {
        Notification.requestPermission().then(permission => {
            if (permission === "granted") {
                showNotification();
            }
        });
    }
}
