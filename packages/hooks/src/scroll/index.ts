import { useEffect, useState, useCallback, useRef } from 'react';
import type Lenis from '@studio-freight/lenis';

export function useLenis(callback?: (lenis: Lenis) => void, deps: React.DependencyList = []): Lenis | null {
  const [lenis, setLenis] = useState<Lenis | null>(null);

  useEffect(() => {
    const lenisInstance = (window as unknown as { lenis?: Lenis }).lenis;
    if (lenisInstance) {
      setLenis(lenisInstance);
    }
  }, []);

  useEffect(() => {
    if (lenis && callback) {
      callback(lenis);
    }
  }, [lenis, callback, ...deps]);

  return lenis;
}

export function useScrollPosition(): { x: number; y: number } {
  const [position, setPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const updatePosition = () => {
      setPosition({
        x: window.scrollX,
        y: window.scrollY,
      });
    };

    window.addEventListener('scroll', updatePosition);
    updatePosition();

    return () => window.removeEventListener('scroll', updatePosition);
  }, []);

  return position;
}

export function useScrollDirection(): 'up' | 'down' | null {
  const [direction, setDirection] = useState<'up' | 'down' | null>(null);
  const lastScrollY = useRef(0);

  useEffect(() => {
    const updateDirection = () => {
      const scrollY = window.scrollY;
      const direction = scrollY > lastScrollY.current ? 'down' : 'up';
      
      if (scrollY !== lastScrollY.current) {
        setDirection(direction);
      }
      
      lastScrollY.current = scrollY;
    };

    window.addEventListener('scroll', updateDirection);
    return () => window.removeEventListener('scroll', updateDirection);
  }, []);

  return direction;
}

export function useScrollTo() {
  const lenis = useLenis();

  const scrollTo = useCallback((target: string | number | HTMLElement, options?: { offset?: number; duration?: number }) => {
    if (lenis) {
      lenis.scrollTo(target, options);
    } else {
      if (typeof target === 'string') {
        const element = document.querySelector(target);
        element?.scrollIntoView({ behavior: 'smooth' });
      } else if (typeof target === 'number') {
        window.scrollTo({ top: target, behavior: 'smooth' });
      } else {
        target.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }, [lenis]);

  return scrollTo;
}
