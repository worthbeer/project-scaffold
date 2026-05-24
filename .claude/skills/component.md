# Component Conventions

## File Structure
Each component lives in its own folder:
```
src/components/DataTable/
  index.ts            ← barrel export
  DataTable.tsx       ← component
  DataTable.test.tsx  ← co-located test
  DataTable.types.ts  ← types if complex
```

## Anatomy
```tsx
import { cn } from "@lib/utils";

type Props = {
  className?: string;
  children?: React.ReactNode;
};

export function ComponentName({ className, children }: Props) {
  return (
    <div className={cn("base-classes", className)}>
      {children}
    </div>
  );
}
```

## Rules
- Named exports only
- `className` prop on every leaf component
- Use `cn()` for all class composition
- `forwardRef` only when parent needs the DOM node
- Variants as const object, not ternaries

## Variants Pattern
```tsx
const variants = {
  primary: "bg-blue-600 text-white",
  secondary: "bg-gray-100 text-gray-900",
} as const;
type Variant = keyof typeof variants;
```
