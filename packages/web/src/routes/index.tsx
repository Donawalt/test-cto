import { createFileRoute } from '@tanstack/react-router';
import { Card } from '@myapp/ui/card';
import { Button } from '@myapp/ui/button';
import { ScrollTrigger } from '@myapp/ui/layout';
import { useScrollDirection } from '@myapp/hooks/scroll';

export const Route = createFileRoute('/')({
  component: Home,
});

function Home() {
  const scrollDirection = useScrollDirection();

  return (
    <div className="space-y-8">
      <section className="text-center py-20">
        <h1 className="text-5xl font-bold text-secondary-900 mb-4">
          Welcome to MyApp
        </h1>
        <p className="text-xl text-secondary-600 mb-8">
          Production-ready monorepo with type-safe client-server communication
        </p>
        <div className="flex gap-4 justify-center">
          <Button variant="primary" size="lg">
            Get Started
          </Button>
          <Button variant="outline" size="lg">
            Learn More
          </Button>
        </div>
      </section>

      <ScrollTrigger>
        <Card variant="elevated" padding="lg">
          <h2 className="text-3xl font-bold text-secondary-900 mb-4">
            🖥️ Client-Side Packages
          </h2>
          <ul className="space-y-2 text-secondary-700">
            <li>• @myapp/web - React app with TanStack Router + Lenis</li>
            <li>• @myapp/ui - Component library (Tailwind styled)</li>
            <li>• @myapp/hooks - Custom React hooks</li>
            <li>• @myapp/lib - Universal utilities</li>
            <li>• @myapp/utils - Client-only utilities</li>
          </ul>
        </Card>
      </ScrollTrigger>

      <ScrollTrigger>
        <Card variant="elevated" padding="lg">
          <h2 className="text-3xl font-bold text-secondary-900 mb-4">
            🗄️ Server-Side Packages
          </h2>
          <ul className="space-y-2 text-secondary-700">
            <li>• @myapp/db - Drizzle ORM + multi-database support</li>
            <li>• @myapp/schema - JSON schema builder + CLI</li>
            <li>• @myapp/server-utils - Server-only utilities</li>
          </ul>
        </Card>
      </ScrollTrigger>

      <ScrollTrigger>
        <Card variant="elevated" padding="lg">
          <h2 className="text-3xl font-bold text-secondary-900 mb-4">
            🔄 Shared Packages
          </h2>
          <ul className="space-y-2 text-secondary-700">
            <li>• @myapp/types - Type definitions + API contracts</li>
            <li>• @myapp/tokens - Design tokens + Tailwind config</li>
          </ul>
        </Card>
      </ScrollTrigger>

      {scrollDirection && (
        <div className="fixed bottom-4 right-4 bg-white shadow-lg rounded-lg p-4">
          <p className="text-sm text-secondary-600">
            Scrolling: <span className="font-bold">{scrollDirection}</span>
          </p>
        </div>
      )}
    </div>
  );
}
