import React, { useEffect, useRef } from 'react';
import './AnimatedBackground.scss';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  alpha: number;
}

interface AnimatedBackgroundProps {
  variant?: 'particles' | 'gradient' | 'geometric' | 'neural' | 'matrix';
  primaryColor?: string;
  secondaryColor?: string;
  particleCount?: number;
}

export const AnimatedBackground: React.FC<AnimatedBackgroundProps> = ({
  variant = 'neural',
  primaryColor = '#6366f1',
  secondaryColor = '#8b5cf6',
  particleCount = 80
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const particlesRef = useRef<Particle[]>([]);
  const mouseRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Initialize particles
    const initParticles = () => {
      particlesRef.current = [];
      for (let i = 0; i < particleCount; i++) {
        particlesRef.current.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: (Math.random() - 0.5) * 0.5,
          vy: (Math.random() - 0.5) * 0.5,
          radius: Math.random() * 2 + 1,
          color: Math.random() > 0.5 ? primaryColor : secondaryColor,
          alpha: Math.random() * 0.5 + 0.2
        });
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    };

    window.addEventListener('mousemove', handleMouseMove);

    initParticles();

    const drawNeuralNetwork = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw gradient background
      const gradient = ctx.createRadialGradient(
        canvas.width / 2,
        canvas.height / 2,
        0,
        canvas.width / 2,
        canvas.height / 2,
        canvas.width
      );
      gradient.addColorStop(0, 'rgba(15, 23, 42, 1)');
      gradient.addColorStop(0.5, 'rgba(30, 41, 59, 1)');
      gradient.addColorStop(1, 'rgba(15, 23, 42, 1)');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const particles = particlesRef.current;

      // Update and draw particles
      particles.forEach((particle, i) => {
        // Update position
        particle.x += particle.vx;
        particle.y += particle.vy;

        // Bounce off edges
        if (particle.x < 0 || particle.x > canvas.width) particle.vx *= -1;
        if (particle.y < 0 || particle.y > canvas.height) particle.vy *= -1;

        // Mouse interaction
        const dx = mouseRef.current.x - particle.x;
        const dy = mouseRef.current.y - particle.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 150) {
          particle.vx -= dx * 0.0001;
          particle.vy -= dy * 0.0001;
        }

        // Draw particle
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
        ctx.fillStyle = particle.color;
        ctx.globalAlpha = particle.alpha;
        ctx.fill();

        // Draw connections
        particles.slice(i + 1).forEach(other => {
          const dx = particle.x - other.x;
          const dy = particle.y - other.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < 120) {
            ctx.beginPath();
            ctx.moveTo(particle.x, particle.y);
            ctx.lineTo(other.x, other.y);
            ctx.strokeStyle = primaryColor;
            ctx.globalAlpha = (120 - distance) / 120 * 0.3;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        });
      });

      ctx.globalAlpha = 1;
    };

    const drawMatrix = () => {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = primaryColor;
      ctx.font = '14px monospace';

      const columns = Math.floor(canvas.width / 20);
      const chars = '01アイウエオカキクケコサシスセソタチツテトナニヌネノ';

      if (!particlesRef.current.length) {
        particlesRef.current = Array(columns).fill(null).map(() => ({
          x: 0,
          y: Math.random() * canvas.height,
          vx: 0,
          vy: Math.random() * 3 + 2,
          radius: 0,
          color: '',
          alpha: 1
        }));
      }

      particlesRef.current.forEach((drop, i) => {
        const char = chars[Math.floor(Math.random() * chars.length)];
        ctx.fillText(char, i * 20, drop.y);
        drop.y += drop.vy;
        if (drop.y > canvas.height && Math.random() > 0.975) {
          drop.y = 0;
        }
      });
    };

    const drawGeometric = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Background
      const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
      gradient.addColorStop(0, 'rgba(15, 23, 42, 1)');
      gradient.addColorStop(1, 'rgba(30, 41, 59, 1)');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const time = Date.now() * 0.001;

      // Draw rotating hexagons
      for (let i = 0; i < 5; i++) {
        ctx.save();
        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.rotate(time * 0.2 + i * 0.5);

        const size = 100 + i * 80;
        ctx.beginPath();
        for (let j = 0; j < 6; j++) {
          const angle = (j / 6) * Math.PI * 2;
          const x = Math.cos(angle) * size;
          const y = Math.sin(angle) * size;
          if (j === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.strokeStyle = i % 2 === 0 ? primaryColor : secondaryColor;
        ctx.globalAlpha = 0.3 - i * 0.05;
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.restore();
      }

      // Draw floating shapes
      particlesRef.current.forEach((particle, i) => {
        particle.x += particle.vx;
        particle.y += particle.vy;

        if (particle.x < -50) particle.x = canvas.width + 50;
        if (particle.x > canvas.width + 50) particle.x = -50;
        if (particle.y < -50) particle.y = canvas.height + 50;
        if (particle.y > canvas.height + 50) particle.y = -50;

        ctx.save();
        ctx.translate(particle.x, particle.y);
        ctx.rotate(time + i);
        ctx.beginPath();

        const sides = 3 + (i % 4);
        for (let j = 0; j < sides; j++) {
          const angle = (j / sides) * Math.PI * 2;
          const x = Math.cos(angle) * particle.radius * 5;
          const y = Math.sin(angle) * particle.radius * 5;
          if (j === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.strokeStyle = particle.color;
        ctx.globalAlpha = particle.alpha;
        ctx.stroke();
        ctx.restore();
      });

      ctx.globalAlpha = 1;
    };

    const drawGradient = () => {
      const time = Date.now() * 0.001;

      // Animated gradient
      const gradient = ctx.createLinearGradient(
        Math.sin(time) * canvas.width,
        Math.cos(time) * canvas.height,
        Math.cos(time * 0.5) * canvas.width + canvas.width,
        Math.sin(time * 0.5) * canvas.height + canvas.height
      );

      gradient.addColorStop(0, primaryColor + '40');
      gradient.addColorStop(0.5, secondaryColor + '40');
      gradient.addColorStop(1, primaryColor + '40');

      ctx.fillStyle = 'rgba(15, 23, 42, 1)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Floating orbs
      for (let i = 0; i < 5; i++) {
        const x = canvas.width * (0.2 + (i * 0.15)) + Math.sin(time + i) * 50;
        const y = canvas.height * (0.3 + (i * 0.1)) + Math.cos(time * 0.5 + i) * 50;
        const radius = 100 + Math.sin(time + i * 2) * 30;

        const orbGradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
        orbGradient.addColorStop(0, i % 2 === 0 ? primaryColor + '30' : secondaryColor + '30');
        orbGradient.addColorStop(1, 'transparent');

        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fillStyle = orbGradient;
        ctx.fill();
      }
    };

    const animate = () => {
      switch (variant) {
        case 'matrix':
          drawMatrix();
          break;
        case 'geometric':
          drawGeometric();
          break;
        case 'gradient':
          drawGradient();
          break;
        case 'neural':
        default:
          drawNeuralNetwork();
          break;
      }
      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      window.removeEventListener('mousemove', handleMouseMove);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [variant, primaryColor, secondaryColor, particleCount]);

  return (
    <div className="animated-background">
      <canvas ref={canvasRef} className="background-canvas" />
      <div className="overlay" />
    </div>
  );
};

export default AnimatedBackground;
