export function querySelector<T extends Element = Element>(
  selector: string,
  parent: Document | Element = document
): T | null {
  return parent.querySelector<T>(selector);
}

export function querySelectorAll<T extends Element = Element>(
  selector: string,
  parent: Document | Element = document
): T[] {
  return Array.from(parent.querySelectorAll<T>(selector));
}

export function addClass(element: Element, ...classNames: string[]): void {
  element.classList.add(...classNames);
}

export function removeClass(element: Element, ...classNames: string[]): void {
  element.classList.remove(...classNames);
}

export function toggleClass(element: Element, className: string, force?: boolean): boolean {
  return element.classList.toggle(className, force);
}

export function hasClass(element: Element, className: string): boolean {
  return element.classList.contains(className);
}

export function setAttribute(element: Element, name: string, value: string): void {
  element.setAttribute(name, value);
}

export function getAttribute(element: Element, name: string): string | null {
  return element.getAttribute(name);
}

export function removeAttribute(element: Element, name: string): void {
  element.removeAttribute(name);
}

export function setStyles(element: HTMLElement, styles: Partial<CSSStyleDeclaration>): void {
  Object.assign(element.style, styles);
}

export function getComputedStyle(element: Element): CSSStyleDeclaration {
  return window.getComputedStyle(element);
}

export function createElement<K extends keyof HTMLElementTagNameMap>(
  tagName: K,
  options?: {
    classes?: string[];
    attributes?: Record<string, string>;
    styles?: Partial<CSSStyleDeclaration>;
    children?: (Node | string)[];
  }
): HTMLElementTagNameMap[K] {
  const element = document.createElement(tagName);

  if (options?.classes) {
    element.classList.add(...options.classes);
  }

  if (options?.attributes) {
    Object.entries(options.attributes).forEach(([key, value]) => {
      element.setAttribute(key, value);
    });
  }

  if (options?.styles) {
    Object.assign(element.style, options.styles);
  }

  if (options?.children) {
    options.children.forEach((child) => {
      if (typeof child === 'string') {
        element.appendChild(document.createTextNode(child));
      } else {
        element.appendChild(child);
      }
    });
  }

  return element;
}

export function isVisible(element: Element): boolean {
  return !!(element.offsetWidth || element.offsetHeight || element.getClientRects().length);
}

export function scrollToElement(
  element: Element,
  options?: ScrollIntoViewOptions
): void {
  element.scrollIntoView(options);
}

export function getScrollPosition(): { x: number; y: number } {
  return {
    x: window.scrollX || window.pageXOffset,
    y: window.scrollY || window.pageYOffset,
  };
}
