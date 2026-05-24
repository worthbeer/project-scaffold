# Data Fetching Conventions

## Server Components (default)
Fetch directly in RSC. No useEffect, no useState for server data.

```tsx
async function getData() {
  const res = await fetch("/api/data", { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch");
  return res.json();
}

export default async function Page() {
  const data = await getData();
  return <Dashboard data={data} />;
}
```

## Client-Side Async
Use `useAsync` from `@hooks/use-async`:
```tsx
const { state, run } = useAsync<ResponseType>();
// state.status: "idle" | "loading" | "success" | "error"
```

## API Routes
```ts
// src/app/api/[route]/route.ts
import { NextResponse } from "next/server";
export async function GET() {
  return NextResponse.json({ data: [] });
}
```

## Rules
- Never fetch in useEffect unless triggered by user interaction
- Always handle loading and error states explicitly
- Type every response — never `any`
