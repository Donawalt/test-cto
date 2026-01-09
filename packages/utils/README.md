# @myapp/utils

Client-only lightweight utilities for DOM manipulation, string formatting, event handling, storage management, and validation.

## Installation

```bash
pnpm add @myapp/utils
```

## Usage

All utilities are organized into submodules for optimal tree-shaking:

```typescript
import { querySelector, addClass } from '@myapp/utils/dom';
import { formatDate, slugify } from '@myapp/utils/string';
import { debounce, throttle } from '@myapp/utils/events';
import { getLocalStorage, setLocalStorage } from '@myapp/utils/storage';
import { validateEmail, validatePassword } from '@myapp/utils/validation';
```

## Modules

### DOM Module (`@myapp/utils/dom`)

DOM manipulation and query utilities.

#### `querySelector<T>(selector, parent?)`
Query a single element with type safety.

```typescript
const button = querySelector<HTMLButtonElement>('#submit');
const input = querySelector<HTMLInputElement>('input[name="email"]');
```

#### `querySelectorAll<T>(selector, parent?)`
Query multiple elements, returns array.

```typescript
const buttons = querySelectorAll<HTMLButtonElement>('.btn');
buttons.forEach(btn => btn.disabled = true);
```

#### `addClass(element, ...classNames)`
Add one or more CSS classes.

```typescript
addClass(element, 'active', 'highlighted');
```

#### `removeClass(element, ...classNames)`
Remove one or more CSS classes.

```typescript
removeClass(element, 'active', 'highlighted');
```

#### `toggleClass(element, className, force?)`
Toggle a CSS class.

```typescript
toggleClass(element, 'active'); // Toggle
toggleClass(element, 'active', true); // Force add
toggleClass(element, 'active', false); // Force remove
```

#### `createElement<K>(tagName, options?)`
Create an element with options.

```typescript
const div = createElement('div', {
  classes: ['container', 'mx-auto'],
  attributes: { 'data-id': '123' },
  styles: { backgroundColor: 'red' },
  children: ['Hello', document.createElement('span')],
});
```

#### `setStyles(element, styles)`
Set multiple CSS styles at once.

```typescript
setStyles(element, {
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
});
```

#### `isVisible(element)`
Check if element is visible.

```typescript
if (isVisible(element)) {
  // Element is visible
}
```

#### `scrollToElement(element, options?)`
Scroll to an element.

```typescript
scrollToElement(element, { behavior: 'smooth', block: 'center' });
```

#### `getScrollPosition()`
Get current scroll position.

```typescript
const { x, y } = getScrollPosition();
```

### String Module (`@myapp/utils/string`)

String formatting and manipulation utilities.

#### `formatDate(date, options?)`
Format a date using Intl.DateTimeFormat.

```typescript
formatDate(new Date(), { year: 'numeric', month: 'long', day: 'numeric' });
// "January 15, 2024"

formatDate('2024-01-15');
// "1/15/2024"
```

#### `formatCurrency(amount, currency?, locale?)`
Format a number as currency.

```typescript
formatCurrency(1000, 'USD'); // "$1,000.00"
formatCurrency(1000, 'EUR', 'de-DE'); // "1.000,00 €"
```

#### `truncate(str, maxLength, suffix?)`
Truncate a string.

```typescript
truncate('Hello World', 5); // "He..."
truncate('Hello World', 8, '…'); // "Hello W…"
```

#### `capitalize(str)`
Capitalize first letter.

```typescript
capitalize('hello'); // "Hello"
```

#### `camelCase(str)`, `kebabCase(str)`, `snakeCase(str)`
Convert string cases.

```typescript
camelCase('hello world'); // "helloWorld"
kebabCase('Hello World'); // "hello-world"
snakeCase('Hello World'); // "hello_world"
```

#### `slugify(str)`
Convert string to URL-friendly slug.

```typescript
slugify('Hello World!'); // "hello-world"
slugify('My Blog Post #1'); // "my-blog-post-1"
```

#### `stripHtml(html)`
Strip HTML tags from string.

```typescript
stripHtml('<p>Hello <strong>World</strong></p>'); // "Hello World"
```

#### `escapeHtml(str)`
Escape HTML special characters.

```typescript
escapeHtml('<script>alert("xss")</script>');
// "&lt;script&gt;alert("xss")&lt;/script&gt;"
```

#### `pluralize(count, singular, plural?)`
Pluralize based on count.

```typescript
pluralize(1, 'item'); // "1 item"
pluralize(5, 'item'); // "5 items"
pluralize(5, 'box', 'boxes'); // "5 boxes"
```

#### `excerpt(text, maxLength?)`
Create text excerpt.

```typescript
excerpt('Long text here...', 50);
// "Long text here..."
```

### Events Module (`@myapp/utils/events`)

Event handling utilities.

#### `debounce<T>(fn, delay)`
Debounce a function.

```typescript
const handleSearch = debounce((query: string) => {
  console.log('Searching for:', query);
}, 300);

input.addEventListener('input', (e) => handleSearch(e.target.value));
```

#### `throttle<T>(fn, delay)`
Throttle a function.

```typescript
const handleScroll = throttle(() => {
  console.log('Scrolled');
}, 100);

window.addEventListener('scroll', handleScroll);
```

#### `once<T>(fn)`
Create a function that only runs once.

```typescript
const initialize = once(() => {
  console.log('Initialized');
});

initialize(); // Logs "Initialized"
initialize(); // Does nothing
```

#### `addEventListener(target, event, handler, options?)`
Add event listener with cleanup function.

```typescript
const cleanup = addEventListener(window, 'resize', () => {
  console.log('Window resized');
});

// Later: cleanup();
```

#### `delegateEvent(parent, eventType, selector, handler)`
Event delegation.

```typescript
const cleanup = delegateEvent(
  document.body,
  'click',
  '.btn',
  (event, target) => {
    console.log('Button clicked:', target);
  }
);
```

#### `onDocumentReady(callback)`, `onWindowLoad(callback)`
Execute callback when document/window is ready.

```typescript
onDocumentReady(() => {
  console.log('DOM ready');
});

onWindowLoad(() => {
  console.log('Window loaded');
});
```

### Storage Module (`@myapp/utils/storage`)

Browser storage utilities.

#### localStorage Functions

```typescript
// Set item
setLocalStorage('user', { id: 1, name: 'John' });

// Get item
const user = getLocalStorage<User>('user');

// Remove item
removeLocalStorage('user');

// Clear all
clearLocalStorage();
```

#### sessionStorage Functions

```typescript
setSessionStorage('temp', { value: 123 });
const temp = getSessionStorage<{ value: number }>('temp');
removeSessionStorage('temp');
clearSessionStorage();
```

#### Cookie Functions

```typescript
// Set cookie
setCookie('token', 'abc123', {
  days: 7,
  path: '/',
  secure: true,
  sameSite: 'Strict',
});

// Get cookie
const token = getCookie('token');

// Remove cookie
removeCookie('token');
```

### Validation Module (`@myapp/utils/validation`)

Client-side validation utilities.

#### `validateEmail(email)`
Validate email address.

```typescript
if (validateEmail('user@example.com')) {
  // Valid email
}
```

#### `validatePhone(phone, countryCode?)`
Validate phone number.

```typescript
validatePhone('(555) 123-4567', 'US'); // true
validatePhone('+1-555-123-4567', 'INTL'); // true
```

#### `validateURL(url)`
Validate URL.

```typescript
validateURL('https://example.com'); // true
validateURL('not-a-url'); // false
```

#### `validatePassword(password, options?)`
Validate password with custom rules.

```typescript
const result = validatePassword('MyPass123!', {
  minLength: 8,
  requireUppercase: true,
  requireLowercase: true,
  requireNumbers: true,
  requireSpecialChars: true,
});

if (result.valid) {
  // Password is valid
} else {
  console.error(result.errors);
  // ["Password must contain at least one special character"]
}
```

#### `validateZipCode(zipCode, countryCode?)`
Validate ZIP/postal code.

```typescript
validateZipCode('12345', 'US'); // true
validateZipCode('12345-6789', 'US'); // true
validateZipCode('A1B 2C3', 'CA'); // true
```

#### `validateCreditCard(cardNumber)`
Validate credit card using Luhn algorithm.

```typescript
validateCreditCard('4532015112830366'); // true
```

#### `validateUsername(username)`
Validate username.

```typescript
const result = validateUsername('john_doe');

if (result.valid) {
  // Username is valid
} else {
  console.error(result.errors);
}
```

#### `validateHexColor(color)`
Validate hex color code.

```typescript
validateHexColor('#FF5733'); // true
validateHexColor('#F57'); // true
validateHexColor('invalid'); // false
```

#### Type Checking Functions

```typescript
isNumeric('123'); // true
isInteger('123'); // true
isAlpha('abc'); // true
isAlphanumeric('abc123'); // true
```

## TypeScript Support

All functions are fully typed with TypeScript. Import types as needed:

```typescript
import type { EventListener } from '@myapp/utils/events';
```

## Browser Compatibility

All utilities are designed to work in modern browsers (ES2020+). For older browser support, transpile with your build tool.
