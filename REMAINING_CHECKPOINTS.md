# Confirm Bakery — Remaining Development Checkpoints

This roadmap continues from the current application: landing page, menu, cart,
checkout, Clerk authentication, customer orders, admin dashboard, order status
management, product/category management, Cloudinary uploads, and saved-address
CRUD are already in place.

The goal is not merely to add screens. Each checkpoint should leave the app in
a testable state and teach one production full-stack concept.

## Product rules we are keeping

- Restaurant: Confirm Bakery
- Market: Ghana
- Currency: Ghana cedi (GHS), stored as integer pesewas
- Fulfilment: pickup and delivery
- Payments: no Stripe integration; payment status is managed by the restaurant
- Stack: Next.js, TypeScript, Prisma, PostgreSQL/Neon, Clerk, Zustand and shadcn

---

## Phase 1 — Finish the customer ordering journey

### 1. Connect saved addresses to checkout

**Outcome:** A signed-in delivery customer can select a saved address or enter a
different address manually.

**Build:**

- Load the customer's saved addresses in the checkout Server Component.
- Pass serializable address data to `CheckoutPageContent`.
- Preselect the default address when delivery is selected.
- Add a saved-address selector and an “Enter a different address” option.
- Populate recipient, phone, address line, city, region and directions.
- Keep manual delivery fields editable.
- Submit address values as an order snapshot, not only an address ID.
- Continue validating all submitted address fields on the server.

**You learn:** Server-to-client data boundaries, controlled form state and why
orders require immutable snapshots.

**Done when:** Editing or deleting a saved address after ordering does not alter
the delivery address displayed on the existing order.

### 2. Finish debounced admin search

**Outcome:** Product and order searches update without submitting on every
keystroke or requiring the Apply button.

**Build:**

- Use `useDebouncedCallback` from `use-debounce` with a 300–400 ms delay.
- Store the search term in the `q` URL parameter.
- Preserve active category, visibility, availability and status filters.
- Remove `page` whenever the search changes.
- Use `router.replace(..., { scroll: false })` to avoid polluting browser history.
- Verify clearing the input removes `q` from the URL.

**You learn:** Debouncing, URL-driven UI state and Server Component refreshes.

**Done when:** Rapidly typing ten characters causes one or two navigations rather
than ten database searches.

### 3. Order confirmation experience

**Outcome:** Successful checkout has a reliable destination and cannot create a
duplicate order through an accidental resubmission.

**Build:**

- Redirect to `/account/orders/[orderId]` after successful signed-in checkout.
- Provide a public confirmation view for guest checkout if guest ordering is
  still supported.
- Display order number, items, total, fulfilment, address/pickup details and
  payment instructions.
- Clear the Zustand cart only after confirmed server success.
- Preserve and verify the existing idempotency key flow.
- Add a clear “Continue shopping” action.

**You learn:** Post/Redirect/Get, idempotency and client/server success handling.

**Done when:** Refreshing the confirmation page or double-clicking Place order
does not create another order.

### 4. Checkout edge cases

**Outcome:** Checkout behaves correctly when application state changes.

**Build:**

- Handle an empty cart by redirecting or showing a useful empty state.
- Reject archived or unavailable products on the server.
- Recalculate prices from the database rather than trusting Zustand values.
- Show which item changed if a price or availability changed.
- Enforce positive quantities and a reasonable maximum quantity.
- Prevent pickup orders from retaining stale delivery fields.
- Prevent delivery orders without a complete address.

**You learn:** The server as the source of truth and defensive validation.

**Done when:** Manipulating cart data in browser storage cannot change an order's
price or purchase an unavailable product.

---

## Phase 2 — Restaurant operations

### 5. Store settings

**Outcome:** Operational values are editable rather than hard-coded throughout
the application.

**Build:**

- Add a single store-settings record for phone, email and pickup address.
- Add opening hours and an accepting-orders switch.
- Store pickup preparation estimates.
- Store the default delivery fee in pesewas.
- Build an admin settings page and protected Server Actions.
- Read settings in checkout, footer and order confirmation.

**You learn:** Singleton configuration models, centralized business rules and
cache revalidation.

**Done when:** An admin can temporarily stop new orders without deploying code.

### 6. Ghana delivery zones and fees

**Outcome:** Delivery availability and fees are predictable for customers and
the restaurant.

**Build:**

- Model named delivery zones, such as neighbourhoods or cities.
- Give every active zone a delivery fee and optional minimum order.
- Let admins create, edit, activate and reorder zones.
- Require the customer to select an eligible zone during checkout.
- Calculate the fee on the server from the selected zone.
- Copy the zone name and fee into the order snapshot.

**You learn:** Business-rule modelling and secure derived totals.

**Done when:** The client cannot submit a cheaper delivery fee than the selected
zone allows.

### 7. Order workflow refinement

**Outcome:** Staff can process orders without entering invalid status states.

**Build:**

- Reconfirm allowed transitions for pickup versus delivery.
- Keep completion blocked until payment is marked paid.
- Require a cancellation reason.
- Record who changed order and payment status.
- Add an order-event timeline for status, payment and cancellation changes.
- Add optimistic/pending UI protection against repeated updates.

**You learn:** State machines, audit trails and transactional updates.

**Done when:** Every status change is attributable and invalid transitions are
rejected on the server even if the UI is bypassed.

### 8. Admin order usability

**Outcome:** The order dashboard works efficiently during restaurant service.

**Build:**

- Highlight new and overdue orders.
- Add counts for actionable statuses.
- Provide mobile-friendly order cards alongside the desktop table.
- Add print-friendly order details or a kitchen ticket.
- Add manual refresh and visible last-updated time.
- Decide whether sound/browser notifications are valuable for new orders.

**You learn:** Operational UX and progressive enhancement.

**Done when:** Staff can accept and process an order comfortably from a phone.

---

## Phase 3 — Customer account quality

### 9. Complete saved-address production rules

**Outcome:** Address management remains consistent under concurrent requests.

**Build:**

- Apply the partial unique-index migration that permits one default per user.
- Test first-address, set-default and delete-default behaviour.
- Add a sensible maximum number of saved addresses per customer.
- Confirm labels, errors and controls are keyboard/screen-reader accessible.

**You learn:** Database invariants and accessibility-aware forms.

**Done when:** Two concurrent default updates cannot leave two default rows.

### 10. Customer order self-service

**Outcome:** Customers can act on an order only when restaurant policy permits.

**Build:**

- Add customer cancellation for `PLACED` orders if the restaurant allows it.
- Require confirmation and an optional reason.
- Enforce ownership and allowed status on the server.
- Show clear contact instructions once cancellation is no longer available.
- Keep order history pagination and refresh behaviour intact.

**You learn:** Authorization versus authentication and policy enforcement.

**Done when:** A customer cannot cancel another user's order or a preparing order.

### 11. Notifications

**Outcome:** Customers and staff receive essential order updates.

**Build:**

- Choose email, SMS/WhatsApp, or both based on restaurant needs and budget.
- Send an order-received notification after database commit.
- Notify customers about confirmation, readiness/out-for-delivery, completion
  and cancellation.
- Never make notification delivery part of the database transaction.
- Add retryable background delivery or an outbox table.
- Keep secrets server-only and record delivery failures.

**You learn:** Side effects, retries and the transactional outbox pattern.

**Done when:** A provider outage does not prevent an order from being created.

---

## Phase 4 — Quality, security and observability

### 12. Automated tests

**Outcome:** Critical business rules can be changed confidently.

**Build:**

- Unit-test currency formatting, validation and status transitions.
- Integration-test order totals, snapshots and ownership checks.
- Test default-address transactions.
- Add Playwright end-to-end coverage for browse → cart → checkout → order.
- Add admin E2E coverage for product creation and order processing.
- Use Clerk's testing helpers rather than bypassing authentication in production
  code.

**You learn:** The testing pyramid, fixtures and high-value test selection.

**Done when:** CI catches price tampering, authorization regressions and invalid
status transitions.

### 13. Security hardening

**Outcome:** Production endpoints resist common abuse and privilege mistakes.

**Build:**

- Audit every Server Action and Route Handler for authentication/authorization.
- Validate all IDs and form payloads with Zod.
- Add rate limits to checkout, Cloudinary signing and sensitive mutations.
- Restrict Cloudinary upload types, size, folder and transformations.
- Review webhook signature verification and replay handling.
- Prevent secrets and sensitive customer details from entering client bundles or
  logs.
- Add security headers and review Next.js production recommendations.
- Run dependency and secret scans.

**You learn:** Trust boundaries, least privilege and abuse prevention.

**Done when:** A non-admin cannot invoke an admin action by calling it directly.

### 14. Error handling and observability

**Outcome:** Production failures can be diagnosed without exposing internals to
customers.

**Build:**

- Add route-level `error.tsx`, `loading.tsx` and appropriate `not-found.tsx` UI.
- Use structured server logs with order IDs but no unnecessary personal data.
- Add Sentry before deployment if desired, including source maps and release
  tracking.
- Capture unexpected Server Action and database failures.
- Track order-creation latency and failure rate.
- Add uptime monitoring for the storefront and webhook route.

**You learn:** Error boundaries, structured telemetry and privacy-conscious logs.

**Done when:** An unexpected checkout error has a traceable event ID and a useful
customer-facing message.

### 15. Accessibility and responsive QA

**Outcome:** The storefront and admin interface are usable across devices and
input methods.

**Build:**

- Complete keyboard-only checkout and admin workflows.
- Verify labels, focus order, focus visibility and live status announcements.
- Check colour contrast and zoom at 200%.
- Test mobile layouts at common narrow widths.
- Respect reduced-motion preferences.
- Run automated accessibility checks and manually test the key flows.

**You learn:** Practical WCAG testing beyond automated scores.

**Done when:** A keyboard-only user can place an order and an admin can process it.

### 16. Performance review

**Outcome:** Key pages remain fast with realistic data and images.

**Build:**

- Audit Server/Client Component boundaries and reduce client JavaScript.
- Review Prisma query selections, pagination and indexes.
- Optimize Cloudinary delivery dimensions and formats through `next/image`.
- Add appropriate caching/revalidation without caching private customer data.
- Measure Core Web Vitals on menu, checkout and admin pages.
- Test with a realistic number of products and orders.

**You learn:** Measurement-driven Next.js performance and safe caching.

**Done when:** Performance decisions are backed by measurements, not guesses.

---

## Phase 5 — Production delivery

### 17. Production environment setup

**Outcome:** Development and production services are cleanly separated.

**Build:**

- Create production Neon, Clerk and Cloudinary configurations.
- Use Clerk production keys and register the production webhook URL.
- Configure trusted application URLs and redirects.
- Store secrets only in the deployment platform.
- Confirm production migrations run through `prisma migrate deploy`.
- Add a safe admin bootstrap process; never seed a hard-coded production admin.
- Document backup and restore expectations.

**You learn:** Environment isolation and secret management.

**Done when:** No development keys, test webhooks or local URLs appear in the
production deployment.

### 18. CI/CD pipeline

**Outcome:** Every change is validated consistently before deployment.

**Build:**

- Run formatting/lint, TypeScript, tests and production build in CI.
- Validate Prisma migrations against a temporary database when practical.
- Block deployment when required checks fail.
- Run database migrations as a deliberate release step.
- Add a rollback/runbook for application and migration failures.

**You learn:** Deployment gates and safe schema delivery.

**Done when:** A broken type, failing test or invalid migration cannot reach
production.

### 19. Final production acceptance test

**Outcome:** Confirm Bakery can safely begin taking real orders.

Test all of the following in the production environment:

- Customer sign-up, sign-in and sign-out
- Browse, category filter and product availability
- Add, update and remove cart items
- Pickup checkout
- Delivery checkout with saved and manual addresses
- Correct GHS totals and delivery fee
- Duplicate-submission protection
- Customer order history and details
- Admin authorization
- Product/category create, edit, archive and restore
- Cloudinary upload, replacement and cleanup
- Order and payment status rules
- Clerk webhook delivery
- Empty, loading, error and not-found states
- Mobile and keyboard workflows
- Logging, monitoring and alert delivery

**Done when:** The restaurant owner completes a realistic test order from a
customer phone through final admin completion and signs off on the workflow.

---

## Recommended execution order

Work through checkpoints 1–4 first because they complete the order flow. Then do
5–8 with the restaurant owner because these depend on real operational policy.
Complete 9–16 before accepting live orders, followed by 17–19 for deployment.

Avoid adding optional features until the production acceptance test passes. A
small, reliable ordering system is more valuable than a large unfinished one.
