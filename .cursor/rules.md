Keep it simple.

For body text, using Fraktion Mono.

## Development Mode

The app has a dev mode that can be toggled by pressing the 'B' key. When enabled, red borders appear around components to help with layout debugging.

**Usage:**
- Import `useDevMode` hook: `import { useDevMode } from "./DevModeProvider"`
- Use in component: `const devMode = useDevMode()`
- Apply dev borders conditionally: `className={devMode ? 'border border-red-500' : ''}`

**Example:**
```tsx
const devMode = useDevMode()
return <div className={`p-4 ${devMode ? 'border border-red-500' : ''}`}>...</div>
```

Press 'B' to toggle dev mode on/off. A console message will confirm the state change.

