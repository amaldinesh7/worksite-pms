# Web Rules

Frontend-specific rules for the web app (apps/web).

## UI System (NON-NEGOTIABLE)

1. **shadcn/ui**: ALWAYS use shadcn/ui components if available.
2. **Tailwind CSS**: Customize using Tailwind CSS classes ONLY.
3. **No Inline Styles**: Strictly no `style={{}}`.
4. **No CSS-in-JS**: Do not use CSS-in-JS libraries.
5. **shadcn First**: No custom UI components if a shadcn equivalent exists.
6. **Extend**: Extend or wrap shadcn components when necessary.

## Styling Rules

- **Tailwind ONLY**: Standard utility classes.
- **Semantic Spacing**: Use `gap-2`, `gap-4`, `p-4`, etc.
- **Typography**: Use consistent typography utilities.
- **Visual Language**: Follow existing project aesthetics.

## Layout Discipline

Prefer shadcn primitives:

- Table
- Tabs
- Dialog
- Sheet
- DropdownMenu

## shadcn/ui Installation

To add a component:

```bash
cd apps/web && npx shadcn@latest add [component-name]
```

## Component Standards

- Always use `cn()` helper for class merging.
- Use `lucide-react` for icons.
- Check `apps/web/src/components/ui/` before adding new ones.
