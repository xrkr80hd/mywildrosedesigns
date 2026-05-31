# Agent Instructions

- Use the agent system before building pages or features.
- Do not replace working admin, storefront, cart, checkout, or Supabase flows unless the user explicitly asks for that scope.
- Be surgical and preserve existing behavior by default.
- Do not commit secrets. `web/.env.local` is local-only and ignored.
- Do not create live Supabase test inventory, bundle, product, order, or customer data without explicit user approval.
- If a real Supabase form submission is needed for verification, ask first and use an obvious temporary name so it can be cleaned up.
- Keep `WORK_PLANNED.md` updated with pending work.
- Update `WORK_COMPLETED.md` only after work is actually implemented and verified.
- Variant brand/size pricing templates are the foundation for bundle pricing and must be handled before true bundle component pricing.
- Bundle work comes before ADHD/calm admin layout changes unless the user changes priority.
- Admin UI should avoid rounded bubble-style buttons.
