import React, { useEffect, useRef } from 'react';

const Animation = () => {
    const canvasRef = useRef(null);
    const particles = [];

    const createParticles = (numParticles) => {
        for (let i = 0; i < numParticles; i++) {
            particles.push({
                x: Math.random() * window.innerWidth,
                y: Math.random() * window.innerHeight,
                radius: Math.random() * 1.3 + .9 + .5,
                speedX: (Math.random() - 0.5) * 1,
                speedY: (Math.random() - 0.5) * 1,
            });
        }
    };

    const drawParticles = (ctx) => {
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

        // Dibujar líneas entre partículas
        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                const dx = particles[i].x - particles[j].x;
                const dy = particles[i].y - particles[j].y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                // Dibujar línea si la distancia es menor a un umbral
                if (distance < 100) { // Ajusta este valor según sea necesario
                    ctx.strokeStyle = `rgb(102, 154, 234, ${1 - distance / 100})`; // Desvanecer línea según distancia
                    ctx.lineWidth = .3;
                    ctx.beginPath();
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.stroke();
                }
            }
        }

        // Dibujar partículas
        particles.forEach(particle => {
            ctx.beginPath();
            ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
            ctx.fillStyle = '#667eea49';
            ctx.fill();
            ctx.closePath();

            // Actualizar posición
            particle.x += particle.speedX;
            particle.y += particle.speedY;

            // Rebote en los bordes
            if (particle.x + particle.radius > ctx.canvas.width || particle.x - particle.radius < 0) {
                particle.speedX *= -1;
            }
            if (particle.y + particle.radius > ctx.canvas.height || particle.y - particle.radius < 0) {
                particle.speedY *= -1;
            }
        });
    };

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        createParticles(100); // Crear 100 partículas

        const animate = () => {
            drawParticles(ctx);
            requestAnimationFrame(animate);
        };

        animate();
    }, []);

    return (
        <canvas
            className='canvas'
            ref={canvasRef}
            width={window.innerWidth}
            height={window.innerHeight}
        />
    );
};

export default Animation;
