---
description: CodeRabbit AI-assisted code review cycle
---

# Code Review Workflow

When reviewing code or before committing changes.

## Workflow Steps

1. **Run CodeRabbit CLI**: Review uncommitted changes.
   // turbo

   ```bash
   coderabbit --prompt-only --type uncommitted
   ```

2. **Categorize Findings**: Evaluate and categorize by severity (Critical, High, Medium, Low).
3. **Fix Critical Issues**: Immediately address any Critical or High priority issues.
4. **Verify Fixes**: Run CodeRabbit again to ensure no new issues were introduced.
   // turbo

   ```bash
   coderabbit --prompt-only --type uncommitted
   ```

5. **Completion**: If no critical issues remain after 2 iterations, the code is ready.
