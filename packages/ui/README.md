# @myapp/ui

Component library with Tailwind styling and Lenis-aware patterns.

## Installation

```bash
pnpm add @myapp/ui
```

## Components

### Button

```typescript
import { Button } from '@myapp/ui/button';

<Button variant="primary" size="md" onClick={() => console.log('Clicked')}>
  Click Me
</Button>

<Button variant="outline" size="lg" fullWidth>
  Full Width Button
</Button>

<Button variant="danger" disabled>
  Disabled
</Button>

<Button loading>
  Loading...
</Button>
```

**Props:**
- `variant`: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
- `size`: 'sm' | 'md' | 'lg'
- `disabled`: boolean
- `loading`: boolean
- `fullWidth`: boolean
- `onClick`: () => void

### Card

```typescript
import { Card } from '@myapp/ui/card';

<Card variant="elevated" padding="lg">
  <h2>Card Title</h2>
  <p>Card content goes here</p>
</Card>

<Card variant="bordered" padding="md" className="custom-class">
  Content
</Card>
```

**Props:**
- `variant`: 'default' | 'bordered' | 'elevated'
- `padding`: 'none' | 'sm' | 'md' | 'lg'
- `className`: string
- `children`: React.ReactNode

### Input

```typescript
import { Input } from '@myapp/ui/input';

<Input
  type="email"
  label="Email Address"
  placeholder="user@example.com"
  value={email}
  onChange={setEmail}
  error={errors.email}
/>

<Input
  type="password"
  label="Password"
  placeholder="••••••••"
  value={password}
  onChange={setPassword}
  disabled={loading}
/>
```

**Props:**
- `type`: 'text' | 'email' | 'password' | 'number'
- `label`: string
- `placeholder`: string
- `error`: string
- `disabled`: boolean
- `value`: string
- `onChange`: (value: string) => void
- `onBlur`: () => void

### Layout

```typescript
import { Layout } from '@myapp/ui/layout';

<Layout enableLenis className="custom-layout">
  <nav>Navigation</nav>
  <main>Content</main>
  <footer>Footer</footer>
</Layout>
```

**Props:**
- `enableLenis`: boolean (default: true)
- `className`: string
- `children`: React.ReactNode

### ScrollTrigger

```typescript
import { ScrollTrigger } from '@myapp/ui/layout';

<ScrollTrigger
  threshold={0.5}
  rootMargin="0px 0px -100px 0px"
  onEnter={() => console.log('Entered viewport')}
  onLeave={() => console.log('Left viewport')}
>
  <div>This content fades in when scrolled into view</div>
</ScrollTrigger>
```

**Props:**
- `threshold`: number (0-1)
- `rootMargin`: string
- `onEnter`: () => void
- `onLeave`: () => void
- `className`: string
- `children`: React.ReactNode

## Styling

All components use Tailwind CSS classes. You can customize using:

1. **Tailwind Config** - Extend colors, spacing, etc. in `tailwind.config.js`
2. **CSS Classes** - Add custom classes via `className` prop
3. **Design Tokens** - Use `@myapp/tokens` for consistent styling

## Lenis Integration

Components in this library are Lenis-aware and work seamlessly with smooth scrolling:

- `Layout` enables Lenis by default
- `ScrollTrigger` uses IntersectionObserver for scroll animations
- All components are optimized for smooth scrolling performance

## Usage with TanStack Router

```typescript
import { createFileRoute } from '@tanstack/react-router';
import { Button } from '@myapp/ui/button';
import { Card } from '@myapp/ui/card';

export const Route = createFileRoute('/about')({
  component: About,
});

function About() {
  return (
    <div className="space-y-4">
      <Card variant="elevated" padding="lg">
        <h1>About Page</h1>
        <p>Content here</p>
        <Button variant="primary">Learn More</Button>
      </Card>
    </div>
  );
}
```

## TypeScript Support

All components are fully typed. Import types from `@myapp/types/ui`:

```typescript
import type { ButtonProps, CardProps } from '@myapp/types/ui';

function MyButton(props: ButtonProps) {
  return <Button {...props} />;
}
```

## Accessibility

All components follow accessibility best practices:
- Semantic HTML elements
- ARIA attributes where appropriate
- Keyboard navigation support
- Focus management
