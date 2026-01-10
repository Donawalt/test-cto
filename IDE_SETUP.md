# IDE Setup Guide

To ensure the best developer experience with the `mono-cto-template`, please follow these instructions for setting up your IDE.

## VSCode Setup (Recommended)

This template includes a pre-configured `.vscode` directory that will automatically prompt you to install recommended extensions and apply optimal settings.

### 1. Recommended Extensions

When you open the project, VSCode should suggest installing these extensions. If not, please install them manually:

- **ESLint** (`dbaeumer.vscode-eslint`): For code linting and automatic fixes.
- **Prettier** (`esbenp.prettier-vscode`): For consistent code formatting.
- **Tailwind CSS IntelliSense** (`bradlc.vscode-tailwindcss`): For autocomplete and class preview.
- **TypeScript Nightly** (`ms-vscode.vscode-typescript-next`): For the latest TypeScript features (optional).

### 2. Workspace Settings

The workspace is configured to:

- Format on save using Prettier.
- Run ESLint fixes on save.
- Use the workspace version of TypeScript (`node_modules/typescript`).
- Enable Tailwind CSS IntelliSense in `.ts` and `.tsx` files.
- Recognize Tailwind classes in `cva`, `cn`, and `clsx` utilities.

### 3. Debugging

Configurations are provided in `.vscode/launch.json`:

- **Debug Web App (Vite)**: Launches Chrome and attaches to the Vite dev server (port 3000).
- **Debug Server**: Debugs the server package.
- **Debug current file**: Runs and debugs the currently active TypeScript/JavaScript file.

## TypeScript Configuration

### Path Aliases

Path aliases are defined in the root `tsconfig.json` and mirrored in `vite.config.ts`.

- `@myapp/ui/*` -> `packages/ui/src/*`
- `@myapp/hooks/*` -> `packages/hooks/src/*`
- `@myapp/types/*` -> `packages/types/src/*`
- `@myapp/utils/*` -> `packages/utils/src/*`
- `@myapp/lib/*` -> `packages/lib/src/*`
- `@myapp/tokens/*` -> `packages/tokens/src/*`

**Note:** If imports are not resolving, ensure you have run `pnpm install` at the root.

### Type Discovery

- **Global Types**: Shared ambient types are located in `packages/types/src/global.d.ts`.
- **Environment Variables**: Vite env types are in `packages/web/src/env.d.ts`.

## Tailwind CSS Support

### Class Autocomplete

Tailwind IntelliSense is optimized to scan both the current package and the `@myapp/ui` library.
To trigger autocomplete in custom utilities, use:

```tsx
const styles = cva('...'); // Autocomplete works here
const classes = cn('...'); // Autocomplete works here
```

### CSS Layers

Global styles and Tailwind directives are managed in `packages/web/src/styles/tailwind.css` using `@layer` for better IDE discovery of custom components and utilities.

## Troubleshooting

- **IntelliSense not working?** Try `Restart TS Server` from the Command Palette (`Cmd+Shift+P`).
- **Tailwind classes not showing?** Ensure `tailwindcss` is installed in the package and `.vscode/settings.json` is present.
- **Formatter issues?** Check that Prettier is set as the default formatter for the language.
