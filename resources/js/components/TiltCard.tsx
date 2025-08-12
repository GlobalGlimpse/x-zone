import React, { useRef, useState, useEffect } from 'react';

interface TiltCardProps {
  children: React.ReactNode;
  className?: string;
  maxTilt?: number;
  scale?: number;
  perspective?: number;
  transitionSpeed?: number;
  glareOpacity?: number;
}

const TiltCard: React.FC<TiltCardProps> = ({
  children,
  className = "",
  maxTilt = 10,
  scale = 1.05,
  perspective = 1000,
  transitionSpeed = 400,
  glareOpacity = 0.2
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const glareRef = useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isFocusInside, setIsFocusInside] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    const card = cardRef.current;
    const handleFocusIn = () => setIsFocusInside(true);
    const handleFocusOut = () => setIsFocusInside(false);

    card?.addEventListener('focusin', handleFocusIn);
    card?.addEventListener('focusout', handleFocusOut);

    return () => {
      window.removeEventListener('resize', checkMobile);
      card?.removeEventListener('focusin', handleFocusIn);
      card?.removeEventListener('focusout', handleFocusOut);
    };
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isMobile || isFocusInside || !cardRef.current) return;

    const card = cardRef.current;
    const glare = glareRef.current;
    const rect = card.getBoundingClientRect();

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = ((y - centerY) / centerY) * maxTilt * -1;
    const rotateY = ((x - centerX) / centerX) * maxTilt;

    card.style.transform = `perspective(${perspective}px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(${scale}, ${scale}, ${scale})`;

    if (glare) {
      const glareX = (x / rect.width) * 100;
      const glareY = (y / rect.height) * 100;
      glare.style.background = `radial-gradient(circle at ${glareX}% ${glareY}%, rgba(255, 255, 255, ${glareOpacity}), transparent)`;
    }
  };

  const handleMouseEnter = () => {
    if (isMobile || isFocusInside || !cardRef.current) return;

    setIsAnimating(true);

    const card = cardRef.current;
    const glare = glareRef.current;

    card.style.transition = `transform ${transitionSpeed}ms cubic-bezier(0.03, 0.98, 0.52, 0.99)`;
    setTimeout(() => setIsAnimating(false), transitionSpeed);

    if (glare) {
      glare.style.opacity = glareOpacity.toString();
    }
  };

  const handleMouseLeave = () => {
    if (isMobile || !cardRef.current) return;

    setIsAnimating(true);

    const card = cardRef.current;
    const glare = glareRef.current;

    card.style.transition = `transform ${transitionSpeed}ms cubic-bezier(0.03, 0.98, 0.52, 0.99)`;
    card.style.transform = `perspective(${perspective}px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`;

    setTimeout(() => setIsAnimating(false), transitionSpeed);

    if (glare) {
      glare.style.opacity = '0';
    }
  };

  return (
    <div
      ref={cardRef}
      className={`relative overflow-hidden rounded-xl bg-gradient-to-b from-slate-800/60 to-slate-900/80 backdrop-blur-lg ${className}`}
      onMouseMove={!isAnimating ? handleMouseMove : undefined}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div
        ref={glareRef}
        className="pointer-events-none absolute inset-0 z-10 opacity-0 transition-opacity duration-300"
      />
      {children}
    </div>
  );
};

export default TiltCard;
