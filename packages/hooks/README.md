# @myapp/hooks

Custom React hooks including scroll, state management, and DOM utilities.

## Installation

```bash
pnpm add @myapp/hooks
```

## Hooks

### Scroll Hooks (`@myapp/hooks/scroll`)

#### useLenis

Access and control Lenis smooth scrolling instance.

```typescript
import { useLenis } from '@myapp/hooks/scroll';

function Component() {
  const lenis = useLenis((lenis) => {
    // Called when Lenis is available
    console.log('Lenis ready:', lenis);
  });

  return <div>Scroll position: {lenis?.scroll}</div>;
}
```

#### useScrollPosition

Track window scroll position.

```typescript
import { useScrollPosition } from '@myapp/hooks/scroll';

function Component() {
  const { x, y } = useScrollPosition();

  return <div>Scrolled {y}px</div>;
}
```

#### useScrollDirection

Detect scroll direction.

```typescript
import { useScrollDirection } from '@myapp/hooks/scroll';

function Component() {
  const direction = useScrollDirection();

  return <div>Scrolling: {direction || 'none'}</div>;
}
```

#### useScrollTo

Programmatically scroll to elements or positions.

```typescript
import { useScrollTo } from '@myapp/hooks/scroll';

function Component() {
  const scrollTo = useScrollTo();

  return (
    <div>
      <button onClick={() => scrollTo('#section')}>
        Go to Section
      </button>
      <button onClick={() => scrollTo(1000)}>
        Scroll to 1000px
      </button>
    </div>
  );
}
```

### State Hooks (`@myapp/hooks/state`)

#### useLocalStorage

Persist state in localStorage.

```typescript
import { useLocalStorage } from '@myapp/hooks/state';

function Component() {
  const [name, setName] = useLocalStorage<string>('name', 'Guest');

  return (
    <input
      value={name}
      onChange={(e) => setName(e.target.value)}
    />
  );
}
```

#### useDebounce

Debounce a value.

```typescript
import { useDebounce } from '@myapp/hooks/state';
import { useState } from 'react';

function SearchComponent() {
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearch = useDebounce(searchTerm, 300);

  // Use debouncedSearch for API calls
  useEffect(() => {
    if (debouncedSearch) {
      searchAPI(debouncedSearch);
    }
  }, [debouncedSearch]);

  return <input onChange={(e) => setSearchTerm(e.target.value)} />;
}
```

#### useToggle

Toggle boolean state.

```typescript
import { useToggle } from '@myapp/hooks/state';

function Component() {
  const [isOpen, toggle] = useToggle(false);

  return (
    <div>
      <button onClick={toggle}>Toggle</button>
      {isOpen && <div>Content</div>}
    </div>
  );
}
```

#### usePrevious

Access previous value of state.

```typescript
import { usePrevious } from '@myapp/hooks/state';
import { useState } from 'react';

function Component() {
  const [count, setCount] = useState(0);
  const prevCount = usePrevious(count);

  return (
    <div>
      <p>Current: {count}</p>
      <p>Previous: {prevCount}</p>
      <button onClick={() => setCount(count + 1)}>Increment</button>
    </div>
  );
}
```

#### useAsync

Handle async operations with loading and error states.

```typescript
import { useAsync } from '@myapp/hooks/state';

function Component() {
  const { data, loading, error, execute } = useAsync(
    async () => {
      const response = await fetch('/api/data');
      return response.json();
    },
    true // Execute immediately
  );

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return <div>Data: {JSON.stringify(data)}</div>;
}
```

### DOM Hooks (`@myapp/hooks/dom`)

#### useIntersectionObserver

Observe element visibility.

```typescript
import { useIntersectionObserver } from '@myapp/hooks/dom';
import { useRef } from 'react';

function Component() {
  const ref = useRef<HTMLDivElement>(null);
  const isVisible = useIntersectionObserver(ref, {
    threshold: 0.5,
    rootMargin: '0px',
  });

  return (
    <div ref={ref} className={isVisible ? 'visible' : 'hidden'}>
      I'm {isVisible ? 'visible' : 'hidden'}
    </div>
  );
}
```

#### useWindowSize

Track window dimensions.

```typescript
import { useWindowSize } from '@myapp/hooks/dom';

function Component() {
  const { width, height } = useWindowSize();

  return <div>Window: {width}x{height}</div>;
}
```

#### useMediaQuery

Respond to media queries.

```typescript
import { useMediaQuery } from '@myapp/hooks/dom';

function Component() {
  const isMobile = useMediaQuery('(max-width: 768px)');
  const isDark = useMediaQuery('(prefers-color-scheme: dark)');

  return (
    <div>
      {isMobile ? 'Mobile' : 'Desktop'}
      {isDark && ' - Dark Mode'}
    </div>
  );
}
```

#### useClickOutside

Detect clicks outside element.

```typescript
import { useClickOutside } from '@myapp/hooks/dom';
import { useRef, useState } from 'react';

function Dropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useClickOutside(ref, () => setIsOpen(false));

  return (
    <div ref={ref}>
      <button onClick={() => setIsOpen(!isOpen)}>Toggle</button>
      {isOpen && <div>Dropdown content</div>}
    </div>
  );
}
```

#### useEventListener

Add event listeners safely.

```typescript
import { useEventListener } from '@myapp/hooks/dom';

function Component() {
  useEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      console.log('Escape pressed');
    }
  });

  return <div>Press Escape</div>;
}
```

## Example: Complete Form Component

```typescript
import { useState } from 'react';
import { useDebounce, useLocalStorage, useAsync } from '@myapp/hooks/state';
import { useClickOutside } from '@myapp/hooks/dom';

function SearchForm() {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useLocalStorage('suggestions', []);
  const debouncedQuery = useDebounce(query, 300);
  
  const { data, loading } = useAsync(
    async () => {
      if (!debouncedQuery) return [];
      const res = await fetch(`/api/search?q=${debouncedQuery}`);
      return res.json();
    },
    false
  );

  return (
    <div>
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search..."
      />
      {loading && <div>Loading...</div>}
      {data && <div>Results: {data.length}</div>}
    </div>
  );
}
```

## TypeScript Support

All hooks are fully typed with TypeScript:

```typescript
import type { RefObject } from 'react';
import { useIntersectionObserver } from '@myapp/hooks/dom';

const ref: RefObject<HTMLDivElement> = useRef(null);
const isVisible: boolean = useIntersectionObserver(ref);
```

## Best Practices

1. **Use appropriate hook for the job** - Don't reinvent built-in hooks
2. **Memoize callbacks** - Use `useCallback` with hooks that take functions
3. **Clean up effects** - Hooks handle cleanup automatically
4. **Type your hooks** - Always use TypeScript for type safety
5. **Test hooks** - Use `@testing-library/react-hooks` for testing
