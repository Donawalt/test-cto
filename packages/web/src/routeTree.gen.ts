import { Route as rootRoute } from './routes/__root';
import { Route as AboutRoute } from './routes/about';
import { Route as IndexRoute } from './routes/index';
import { Route as UsersRoute } from './routes/users';

declare module '@tanstack/react-router' {
  interface FileRoutesByPath {
    '/': {
      preLoaderRoute: typeof IndexRoute;
      parentRoute: typeof rootRoute;
    };
    '/about': {
      preLoaderRoute: typeof AboutRoute;
      parentRoute: typeof rootRoute;
    };
    '/users': {
      preLoaderRoute: typeof UsersRoute;
      parentRoute: typeof rootRoute;
    };
  }
}

export const routeTree = rootRoute.addChildren([
  IndexRoute,
  AboutRoute,
  UsersRoute,
]);
