---
"circulating-magazines": patch
---

Fix line chart issue-marker interactions so circles behave correctly during hover and click.

- Keep the selected issue circle visible after click.
- Restore normal circle visibility and radius for non-selected points.
- Make hover temporarily enlarge a point while keeping clicked points at default size.
- Resolves https://github.com/ayyrickay/circulating-magazines/issues/49.
