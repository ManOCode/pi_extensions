# Agent Guidelines for pi-mono-extensions

This repository is a TypeScript monorepo designed to house multiple `@manocode` packages, including pi extensions and support libraries. This document provides the necessary context and guidelines for AI agents to operate within this codebase efficiently.

## 🏗️ Architecture

### Monorepo Structure
- **Root**: Contains global configuration and workspace orchestration.
- **`packages/`**: The directory where all individual packages reside. This includes:
  - **Extensions**: Standalone npm packages designed to be loaded by the pi runtime.
  - **Support Packages**: Utility libraries that provide shared functionality to extensions.
- **Workspaces**: Managed via `npm workspaces`. Dependencies between packages are handled via the workspace protocol.

### TypeScript Setup
- **Base Configuration**: `tsconfig.base.json` defines the shared compiler options (Target: `ES2022`, Module: `NodeNext`, Strict: `true`).
- **Package Configuration**: Each package has its own `tsconfig.json` that extends the base config, ensuring consistent build targets while allowing package-specific `outDir` and `rootDir` settings.

## 🛠️ Development Workflow

## 🛠️ Development Workflow

### Adding a New Package
When creating a new package (e.g., `pkg-name`):
1. Create the directory: `packages/pkg-name/src`.
2. Create the test directory: `packages/pkg-name/test` and a test file `packages/pkg-name/test/index.test.ts`.
3. Create `packages/pkg-name/package.json` with the name `@manocode/pi-pkg-name`.
4. Create `packages/pkg-name/tsconfig.json` extending `../../tsconfig.base.json`.

#### If the package is a Support Library:
- Implement the logic in `src/`. Export the necessary classes, functions, or types from `src/index.ts`.

#### If the package is an Extension:
- Implement the logic in `src/index.ts`. Ensure the package exports a **default factory function** that accepts `ExtensionAPI` to register tools, hooks, or other features.
- Install required Pi dependencies: `npm install @earendil-works/pi-coding-agent @earendil-works/pi-ai -w @manocode/pi-pkg-name`.

5. Run `npm install` at the root to link the new package.

### Managing Dependencies
- **External Dependencies**: Install at the package level (e.g., `npm install <pkg> -w @manocode/pi-pkg-name`).
- **Internal Dependencies**: Use the `workspace:` protocol in the `dependencies` section of the consuming package's `package.json` (e.g., `"@manocode/pi-extension-one": "workspace:1.0.0"`).

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
- **Naming**: All packages must be scoped under `@manocode/`.
- **Strictness**: Maintain `strict: true` in TypeScript to ensure type safety across the monorepo.

## 📦 Current Packages

### Support Packages
- **`@manocode/pi-extension-logger`**: Utility logger providing console and file transports for other extensions.

### Extensions
- **`@manocode/pi-memory-extension`**: Simple markdown-based memory storage (currently a scaffold).

## 📋 Quick Reference
- Root `package.json` $\rightarrow$ Workspace definitions & global scripts.
- `tsconfig.base.json` $\rightarrow$ Source of truth for TS rules.
- `packages/*/src/index.ts` $\rightarrow$ Primary entry point for packages.
- `packages/*/test/` $\rightarrow$ Test suites for respective packages.
- `npm run ext:add/remove` $\rightarrow$ Manage extension symlinks in `./.pi/extensions`.
