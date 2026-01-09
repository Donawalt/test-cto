import { createFileRoute } from '@tanstack/react-router';
import { Card } from '@myapp/ui/card';
import { useScrollPosition } from '@myapp/hooks/scroll';

export const Route = createFileRoute('/about')({
  component: About,
});

function About() {
  const { y } = useScrollPosition();

  return (
    <div className="space-y-8">
      <h1 className="text-4xl font-bold text-secondary-900">About MyApp</h1>
      
      <Card variant="elevated" padding="lg">
        <h2 className="text-2xl font-bold text-secondary-900 mb-4">
          Type-Safe Communication
        </h2>
        <p className="text-secondary-700 mb-4">
          MyApp provides a complete type-safe architecture with shared types between
          client and server, powered by Zod schemas and TypeScript strict mode.
        </p>
        <ul className="space-y-2 text-secondary-700">
          <li>• Single source of truth via @myapp/types</li>
          <li>• API namespace with Requests, Responses, Validators</li>
          <li>• Full TypeScript strict mode compliance</li>
          <li>• Build-time security boundaries</li>
        </ul>
      </Card>

      <Card variant="elevated" padding="lg">
        <h2 className="text-2xl font-bold text-secondary-900 mb-4">
          Smooth Scrolling with Lenis
        </h2>
        <p className="text-secondary-700 mb-4">
          Experience buttery-smooth scrolling powered by Lenis, integrated at the root level
          with custom hooks and scroll-aware components.
        </p>
        <p className="text-sm text-secondary-500">
          Current scroll position: {Math.round(y)}px
        </p>
      </Card>

      <Card variant="elevated" padding="lg">
        <h2 className="text-2xl font-bold text-secondary-900 mb-4">
          Developer Experience
        </h2>
        <ul className="space-y-2 text-secondary-700">
          <li>• Hot Module Replacement (HMR) across all packages</li>
          <li>• Type checking on save with IntelliSense</li>
          <li>• Turborepo for build orchestration and caching</li>
          <li>• pnpm workspaces for efficient dependency management</li>
          <li>• Comprehensive documentation and examples</li>
        </ul>
      </Card>
    </div>
  );
}
