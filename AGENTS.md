# Agent Guidelines for pi-mono-extensions

This repository is a TypeScript monorepo designed to house multiple `pi-mono` extension packages. This document provides the necessary context and guidelines for AI agents to operate within this codebase efficiently.

## 🏗️ Architecture

### Monorepo Structure
- **Root**: Contains global configuration and workspace orchestration.
- **`packages/`**: The directory where all individual extensions reside. Each sub-directory is a standalone npm package.
- **`tests/`**: Contains tests for each package, organized by package name (e.g., `tests/extension-one`).
- **Workspaces**: Managed via `npm workspaces`. Dependencies between packages are handled via the workspace protocol.

### TypeScript Setup
- **Base Configuration**: `tsconfig.base.json` defines the shared compiler options (Target: `ES2022`, Module: `NodeNext`, Strict: `true`).
- **Package Configuration**: Each package has its own `tsconfig.json` that extends the base config, ensuring consistent build targets while allowing package-specific `outDir` and `rootDir` settings.

## 🛠️ Development Workflow

### Adding a New Extension
When creating a new extension (e.g., `extension-name`):
1. Create the directory: `packages/extension-name/src`.
2. Create the test directory: `tests/extension-name` and a test file `tests/extension-name/index.test.ts`.
3. Create `packages/extension-name/package.json` with the name `@pi-mono/extension-name`.
3. Create `packages/extension-name/tsconfig.json` extending `../../tsconfig.base.json`.
4. Implement the logic in `src/index.ts`. Ensure the package exports a **default factory function** that accepts `ExtensionAPI` to register tools, hooks, or other features.
5. Install required Pi dependencies: `npm install @earendil-works/pi-coding-agent @earendil-works/pi-ai -w @pi-mono/extension-name`.
6. Run `npm install` at the root to link the new package.

### Managing Dependencies
- **External Dependencies**: Install at the package level (e.g., `npm install <pkg> -w @pi-mono/extension-name`).
- **Internal Dependencies**: Add the internal package name to the `dependencies` section of the consuming package's `package.json` (e.g., `"@pi-mono/extension-one": "*"`).

### Building and Verification
- **Build All**: Run `npm run build` from the root. This executes `tsc` across all workspaces.
- **Run Tests**: Run `npm run test` from the root to execute all tests via `vitest`.
- **Verification**: Ensure that the `dist/` folder of the package contains the compiled `.js` and `.d.ts` files and that all tests pass.

### Managing Local Installations
To make an extension available to the `pi` agent in the current project:
- **Install Extension**: Run `npm run ext:add -- <package-name|folder-name>` to symlink the package's `dist` folder to `./.pi/extensions`.
- **Remove Extension**: Run `npm run ext:remove -- <package-name|folder-name>` to remove the symlink from `./.pi/extensions`.
- **Requirement**: Always run `npm run build` before installing to ensure the `dist/` folder is present.

## 📏 Coding Standards
- **Pi Extension Pattern**: Every extension must provide a `default export` function that the `pi` runtime calls upon loading.
  ```typescript
  import { type ExtensionAPI } from "@earendil-works/pi-coding-agent";
  export default function (pi: ExtensionAPI) {
    // Register tools, hooks, etc.
    pi.registerTool(myTool);
  }
  ```
- **Module System**: Use `NodeNext` resolution. Use explicit file extensions in imports if required by the environment, or rely on the TS compiler's resolution.
- **Naming**: All packages must be scoped under `@pi-mono/`.
- **Strictness**: Maintain `strict: true` in TypeScript to ensure type safety across the monorepo.

## 📋 Quick Reference
- Root `package.json` $\rightarrow$ Workspace definitions & global scripts.
- `tsconfig.base.json` $\rightarrow$ Source of truth for TS rules.
- `packages/*/src/index.ts` $\rightarrow$ Primary entry point for extensions.
- `tests/*/` $\rightarrow$ Test suites for respective packages.
- `npm run ext:add/remove` $\rightarrow$ Manage extension symlinks in `./.pi/extensions`.
