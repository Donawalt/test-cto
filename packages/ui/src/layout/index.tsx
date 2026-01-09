import { useRef } from 'react';
import { useIntersectionObserver } from '@myapp/hooks/dom';
import type { LayoutProps, ScrollTriggerProps } from '@myapp/types';

export function Layout({ children, enableLenis = true, className = '' }: LayoutProps) {
  return (
    <div className={`min-h-screen ${className}`} data-lenis={enableLenis ? 'true' : undefined}>
      {children}
    </div>
  );
}

export function ScrollTrigger({
  children,
  threshold = 0.1,
  rootMargin = '0px',
  onEnter,
  onLeave,
  className = '',
}: ScrollTriggerProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isIntersecting = useIntersectionObserver(ref, {
    threshold,
    rootMargin,
  });

  if (isIntersecting && onEnter) {
    onEnter();
  } else if (!isIntersecting && onLeave) {
    onLeave();
  }

  return (
    <div ref={ref} className={`transition-opacity duration-700 ${isIntersecting ? 'opacity-100' : 'opacity-0'} ${className}`}>
      {children}
    </div>
  );
}
