---
description: Automated helper for pushing changes and creating PRs via GitHub CLI
---

# Create PR Workflow

Automate the process of pushing changes and creating a pull request.

## Workflow Steps

1. **Check Status**: Verify git status and branch.
2. **Generate Title**: Create a conventional commit style title (feat, fix, refactor, etc.).
3. **Create Summary**: Draft a brief description of changes and key files.
4. **Push and Create PR**: Run the combined command.
   // turbo
   ```bash
   git push -u origin HEAD && gh pr create --title "type: descriptive title" --body "## Summary\nDescription\n\n## Changes\n- List"
   ```
