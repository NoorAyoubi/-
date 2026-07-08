function startCelebration(message) {
    // Play local confetti success sound (short popper pop)
    try {
        const confettiAudio = new Audio('features/shared/celebration/confetti.wav');
        confettiAudio.volume = 0.6;
        confettiAudio.play().catch(e => {
            console.log("Confetti audio play was prevented by browser autoplay policy:", e);
        });
    } catch (err) {
        console.error("Failed to play confetti sound:", err);
    }

    let canvas = document.getElementById('celebrationCanvas');
    if (!canvas) {
        canvas = document.createElement('canvas');
        canvas.id = 'celebrationCanvas';
        canvas.className = 'celebration-canvas';
        document.body.appendChild(canvas);
    }
    
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    const ctx = canvas.getContext('2d');
    const colors = ['#fbbf24', '#34d399', '#60a5fa', '#f472b6', '#a78bfa', '#f87171', '#22d3ee'];
    const confettiCount = 150;
    const confetti = [];
    
    const handleResize = () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);
    
    for (let i = 0; i < confettiCount; i++) {
        confetti.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height - canvas.height,
            size: Math.random() * 8 + 6,
            color: colors[Math.floor(Math.random() * colors.length)],
            rotation: Math.random() * 360,
            rotationSpeed: Math.random() * 4 - 2,
            speedY: Math.random() * 5 + 3,
            speedX: Math.random() * 3 - 1.5,
            opacity: 1
        });
    }
    
    let toast = document.getElementById('celebrationToast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'celebrationToast';
        toast.className = 'success-celebration-toast';
        document.body.appendChild(toast);
    }
    
    toast.innerHTML = `
        <div style="font-size: 3.5rem; animation: bounce 0.8s infinite alternate;">🎉</div>
        <div style="text-align: center; color: var(--text-primary); font-family: inherit;">${message}</div>
    `;
    
    setTimeout(() => toast.classList.add('show'), 50);
    
    let animationFrameId;
    const startTime = Date.now();
    const duration = 3500;
    
    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        let activeParticles = 0;
        
        confetti.forEach(p => {
            p.y += p.speedY;
            p.x += p.speedX;
            p.rotation += p.rotationSpeed;
            p.x += Math.sin(p.y / 30) * 0.5;
            
            const elapsed = Date.now() - startTime;
            if (elapsed > duration - 1000) {
                p.opacity = Math.max(0, 1 - (elapsed - (duration - 1000)) / 1000);
            }
            
            if (p.y < canvas.height && p.opacity > 0) {
                activeParticles++;
                ctx.save();
                ctx.translate(p.x, p.y);
                ctx.rotate((p.rotation * Math.PI) / 180);
                ctx.globalAlpha = p.opacity;
                ctx.fillStyle = p.color;
                ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
                ctx.restore();
            }
        });
        
        if (Date.now() - startTime < duration && activeParticles > 0) {
            animationFrameId = requestAnimationFrame(draw);
        } else {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            toast.classList.remove('show');
            window.removeEventListener('resize', handleResize);
            if (canvas.parentNode) canvas.parentNode.removeChild(canvas);
        }
    }
    
    draw();
}