import { createRootRoute, Link, Outlet } from '@tanstack/react-router';
import { Layout } from '@myapp/ui/layout';

export const Route = createRootRoute({
  component: () => (
    <Layout enableLenis>
      <nav className="bg-white shadow-sm border-b border-secondary-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex space-x-8">
              <Link
                to="/"
                className="inline-flex items-center px-1 pt-1 text-sm font-medium text-secondary-900"
              >
                Home
              </Link>
              <Link
                to="/about"
                className="inline-flex items-center px-1 pt-1 text-sm font-medium text-secondary-900"
              >
                About
              </Link>
              <Link
                to="/users"
                className="inline-flex items-center px-1 pt-1 text-sm font-medium text-secondary-900"
              >
                Users
              </Link>
            </div>
          </div>
        </div>
      </nav>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>
    </Layout>
  ),
});
