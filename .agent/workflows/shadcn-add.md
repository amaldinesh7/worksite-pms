---
description: Helper for adding new shadcn/ui components
---

# Add shadcn Component Workflow

Automate the process of adding new shadcn/ui components to the web app.

## Workflow Steps

1. **Check Existing**: Verify if the component is already in `apps/web/src/components/ui/`.
2. **Add Component**: Run the shadcn CLI command.
   // turbo
   ```bash
   cd apps/web && npx shadcn@latest add [component-name]
   ```
3. **Verify Installation**: Ensure the component file exists and is correctly placed.
