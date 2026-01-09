export function debounce<T extends (...args: unknown[]) => unknown>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout> | undefined;

  return function (this: unknown, ...args: Parameters<T>) {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    timeoutId = setTimeout(() => {
      fn.apply(this, args);
    }, delay);
  };
}

export function throttle<T extends (...args: unknown[]) => unknown>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let lastCall = 0;

  return function (this: unknown, ...args: Parameters<T>) {
    const now = Date.now();

    if (now - lastCall >= delay) {
      lastCall = now;
      fn.apply(this, args);
    }
  };
}

export function once<T extends (...args: unknown[]) => unknown>(
  fn: T
): (...args: Parameters<T>) => ReturnType<T> | undefined {
  let called = false;
  let result: ReturnType<T>;

  return function (this: unknown, ...args: Parameters<T>) {
    if (!called) {
      called = true;
      result = fn.apply(this, args) as ReturnType<T>;
      return result;
    }
    return undefined;
  };
}

export type EventListener<E extends Event = Event> = (event: E) => void;

export function addEventListener<K extends keyof WindowEventMap>(
  target: Window,
  event: K,
  handler: (event: WindowEventMap[K]) => void,
  options?: AddEventListenerOptions
): () => void;

export function addEventListener<K extends keyof DocumentEventMap>(
  target: Document,
  event: K,
  handler: (event: DocumentEventMap[K]) => void,
  options?: AddEventListenerOptions
): () => void;

export function addEventListener<K extends keyof HTMLElementEventMap>(
  target: HTMLElement,
  event: K,
  handler: (event: HTMLElementEventMap[K]) => void,
  options?: AddEventListenerOptions
): () => void;

export function addEventListener(
  target: EventTarget,
  event: string,
  handler: EventListener,
  options?: AddEventListenerOptions
): () => void {
  target.addEventListener(event, handler, options);
  return () => target.removeEventListener(event, handler, options);
}

export function delegateEvent<E extends HTMLElement = HTMLElement>(
  parent: Element,
  eventType: string,
  selector: string,
  handler: (event: Event, target: E) => void
): () => void {
  const listener = (event: Event) => {
    const target = (event.target as Element).closest(selector) as E | null;
    if (target && parent.contains(target)) {
      handler(event, target);
    }
  };

  parent.addEventListener(eventType, listener);
  return () => parent.removeEventListener(eventType, listener);
}

export function onDocumentReady(callback: () => void): void {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', callback, { once: true });
  } else {
    callback();
  }
}

export function onWindowLoad(callback: () => void): void {
  if (document.readyState === 'complete') {
    callback();
  } else {
    window.addEventListener('load', callback, { once: true });
  }
}

export function preventDefaultHandler(event: Event): void {
  event.preventDefault();
}

export function stopPropagationHandler(event: Event): void {
  event.stopPropagation();
}
