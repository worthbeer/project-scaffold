# Testing Conventions

## What Gets Tested
- Unit: pure functions in `/lib`, custom hooks
- Component: user interactions, not implementation details
- Skip: Next.js internals, third-party library behavior

## Pattern
```tsx
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ComponentName } from "./ComponentName";

describe("ComponentName", () => {
  it("renders with required props", () => {
    render(<ComponentName />);
    expect(screen.getByRole("...")).toBeInTheDocument();
  });

  it("responds to user interaction", async () => {
    const user = userEvent.setup();
    const onAction = jest.fn();
    render(<ComponentName onAction={onAction} />);
    await user.click(screen.getByRole("button", { name: /action/i }));
    expect(onAction).toHaveBeenCalledTimes(1);
  });
});
```

## Rules
- Query by role first, then label, then text
- Test behavior not implementation
- One describe per component, one concept per it
- Mock at the module boundary
