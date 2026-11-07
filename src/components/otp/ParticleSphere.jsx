import { useEffect, useRef } from 'react';

function ParticleSphere() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    let animationFrame;
    let particles = [];

    const particleCount = 650;

    function resizeCanvas() {
      const size = canvas.parentElement.clientWidth;

      canvas.width = size * window.devicePixelRatio;
      canvas.height = size * window.devicePixelRatio;

      context.scale(window.devicePixelRatio, window.devicePixelRatio);

      canvas.style.width = `${size}px`;
      canvas.style.height = `${size}px`;

      createParticles(size);
    }

    function createParticles(size) {
      particles = [];

      const radius = size * 0.43;

      for (let i = 0; i < particleCount; i++) {
        const angle = Math.random() * Math.PI * 2;
        const vertical = Math.random() * 2 - 1;

        const horizontal = Math.sqrt(1 - vertical * vertical);

        particles.push({
          x: Math.cos(angle) * horizontal * radius,
          y: vertical * radius,
          z: Math.sin(angle) * horizontal * radius,
          size: Math.random() * 1.5 + 0.5,
        });
      }
    }

    let rotation = 0;

    function drawSphere() {
      const size = canvas.clientWidth;
      const center = size / 2;
      const radius = size * 0.43;

      context.clearRect(0, 0, size, size);

      rotation += 0.002;

      particles.forEach((particle) => {
        const rotatedX =
          particle.x * Math.cos(rotation) -
          particle.z * Math.sin(rotation);

        const rotatedZ =
          particle.x * Math.sin(rotation) +
          particle.z * Math.cos(rotation);

        const scale = 300 / (300 + rotatedZ);

        const x = center + rotatedX * scale;
        const y = center + particle.y * scale;

        const depth = (rotatedZ + radius) / (radius * 2);

        let color;

        if (depth > 0.65) {
          color = `rgba(249, 115, 22, ${depth})`;
        } else if (depth > 0.35) {
          color = `rgba(59, 130, 246, ${depth})`;
        } else {
          color = `rgba(100, 116, 139, ${depth})`;
        }

        context.beginPath();
        context.arc(
          x,
          y,
          particle.size * scale,
          0,
          Math.PI * 2
        );

        context.fillStyle = color;
        context.fill();
      });

      animationFrame = requestAnimationFrame(drawSphere);
    }

    resizeCanvas();
    drawSphere();

    window.addEventListener('resize', resizeCanvas);

    return () => {
      cancelAnimationFrame(animationFrame);
      window.removeEventListener('resize', resizeCanvas);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="particle-sphere-canvas"
    />
  );
}

export default ParticleSphere;