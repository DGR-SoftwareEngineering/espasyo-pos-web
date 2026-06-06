# espasyo-pos-web: Project Architecture & Developer Guide

## Project Overview

This is a **Turborepo monorepo** containing a POS (Point of Sale) system with admin dashboard, built with Next.js, React, and TypeScript.

### Workspace Structure
```
espasyo-pos-web/
├── apps/
│   ├── espasyo-pos/          # Primary POS app (Next.js 16, Pages Router)
│   └── web/                  # Secondary Next.js app (lightweight)
├── packages/
│   ├── core-lib/             # Shared library: API clients, components, hooks, contexts, types
│   ├── eslint-config/        # Shared ESLint configs
│   └── typescript-config/    # Shared TypeScript configs
├── turbo.json                # Turborepo pipeline configuration
├── tailwind.ts               # Root Tailwind config (imported by apps)
├── package.json              # Root workspace config (Yarn 1.22.22, Node >=18)
└── CLAUDE.md                 # This file
```

---

## Quick Start

### Development
```bash
yarn dev              # Start all apps in dev mode (via Turborepo)
yarn build            # Build all apps
yarn lint             # Lint all packages
yarn test             # Run Jest (no test files exist yet)
yarn test:watch       # Run Jest in watch mode
```

### App-Level Development
```bash
cd apps/espasyo-pos
yarn dev              # Start POS app on localhost:3000
```

---

## Tech Stack

| Layer | Technology | Notes |
|-------|-----------|-------|
| **Framework** | Next.js 16 (espasyo-pos, Pages Router), React 19 | Primary app uses Pages Router; secondary app uses App Router |
| **UI Library** | Radix UI Themes (`@radix-ui/themes` v3) | Primary UI framework for POS app |
| **Icons** | Radix UI Icons, MUI Icons | Mix of icon sets in use |
| **Styling** | Radix design tokens + inline styles (POS), Tailwind CSS v3 (admin) | No CSS modules; use inline `style` props or Tailwind |
| **State** | React Context (in `core-lib`) + local `useState` | No Redux, Zustand, or global state machine |
| **Data Fetching** | `useApi` / `useApiCallback` hooks (wrapping `react-async-hook`) | Single data fetching pattern throughout |
| **HTTP Client** | Axios (custom `Http` class wrapper) | Via `core-lib/core/http-client.ts` |
| **Forms** | `react-hook-form` v7 + Yup v1 + custom field wrappers | Consistent form pattern: `*FormBlock` + `*Form` |
| **Charts** | Recharts v3 | For financial & product performance reports |
| **Animations** | Framer Motion v12 | For UI transitions and motion effects |
| **Drag & Drop** | @dnd-kit | For inventory/product reordering |
| **Carousels** | react-slick | For image galleries |
| **Maps** | Google Maps API | For location-based features in admin |
| **Monorepo** | Turborepo + Yarn Workspaces | Managed at root; transpile `core-lib` in espasyo-pos |

---

## Architecture Patterns

### 1. Provider Tree (Context Stack)

The app's context hierarchy is assembled in `apps/espasyo-pos/src/components/shared/Page.tsx`:

```
PublicSettingsProvider
  ├─ fetches /api/v1/settings-api/Settings/list
  └─ PublicTheme, PublicPosConfig, PublicSecurityPolicy
     │
     └─ AuthProvider (uses STANDARD_AUTH strategy)
        ├─ JWT stored in sessionStorage, httpOnly cookie named "ac"
        ├─ Validates token on mount via /authentication-api/api/authentication/validate-token
        │
        └─ AccessProvider
           ├─ Loads RBAC data: /api/v1/access-api/Access/me
           ├─ Exposes `role` ("admin" | "cashier"), `menu`, `permissions`
           │
           └─ MpinStatusProvider
              ├─ Tracks MPIN (mobile PIN) enrollment state
              │
              └─ Layout (Radix UI Themes)
                 └─ Page content

**Additional Contexts (imported separately):**
- `ToastContext` — Toast notifications via `react-toastify` or `sonner`
- `DialogContext` — Single global dialog system for all CRUD dialogs
- `NotificationsContext` — Notification feed (SSE-based)
- `TenantContext` — Tenant metadata
- `HeaderTitleContext` — Dynamic page title state
- `FormSubmissionContext` — Form-wide submission tracking
- `PersistentAppStateContext` — Cross-page checkbox/selection state

All contexts are exported from `packages/core-lib/core/contexts/`.

### 2. Routing & Authentication

**File-based routing** (Next.js Pages Router):
- `/` — Login page (public, SSR-seeded with public settings + content blocks)
- `/admin/hub/...` — Admin routes (role-gated to `admin`)
- `/cashier/...` — Cashier routes (role-gated to `cashier`)
- `/404` — 404 page

**Route Protection via Middleware** (`apps/espasyo-pos/src/proxy.ts`):
- Next.js middleware intercepts every request
- Decodes JWT from `ac` cookie (no library; custom base64 + JSON.parse)
- Enforces role-based routing: `admin` users redirected to `/admin/hub`, `cashier` to `/cashier/shift/open`
- Unauthenticated requests to protected routes → 404
- Applies security headers: HSTS, X-Frame-Options, CSP, Permissions-Policy, XSS-Protection

**Roles:**
- `"admin"` — Full system access, settings, user management, reports
- `"cashier"` — POS register, shift open/close, order management

**Session Management:**
- Access token + refresh token stored in sessionStorage (JSON, retrieved from `ac` cookie)
- `ac` cookie: `httpOnly`, `secure`, `sameSite: lax`
- SSO cookie: domain-wide JWT `jti` claim
- Idle timer: logout after `security.sessionTimeoutMinutes` (from PublicSettingsContext)
- Token refresh: 401 response triggers `useRefreshTokenHandler` hook, calls refresh endpoint, retries original request

### 3. API Layer

All API communication flows through the `Api` class (`packages/core-lib/api/api.ts`), which has four sub-clients:

```typescript
class Api {
  authentication: AuthenticationApi  // Login, logout, validate, refresh, MPIN
  commons:        CommonsApi         // Products, inventory, orders, shift, categories, etc.
  access:         AccessApi          // RBAC: roles, permissions, menu items
  crm:            CrmApi             // Customers, loyalty, segments, analytics
}
```

**HTTP Configuration:**
- Base URL: `NEXT_PUBLIC_API_URL` env var (or `NEXT_PUBLIC_LOCAL_API_URL` for local override)
- Two Axios instances:
  - `httpClient` — client-side calls (uses `NEXT_PUBLIC_API_URL`)
  - `httpSsrClient` — server-side calls via Next.js BFF (uses `window.location.origin`)

**Request/Response Flow:**
1. `useApi(asyncFn, deps)` or `useApiCallback(asyncFn)` hook is called
2. Hook instantiates `Api` class (lazily, shared per-session)
3. API method makes HTTP request via Axios
4. Request interceptor adds `Authorization: Bearer <accessToken>` header from sessionStorage
5. Response interceptor catches 401 errors:
   - `ERROR_ACCESS_TOKEN_EXPIRED` → call refresh endpoint, update tokens, retry
   - `ERROR_INVALID_ACCESS_TOKEN` → logout immediately
6. All API errors normalized to `string[]` with optional `.status` property

**Microservice Backends (prefixed endpoints):**
- `/authentication-api/api/authentication/` — Auth (login, refresh, validate, MPIN)
- `/api/v1/access-api/` — RBAC
- `/api/v1/sales-api/` — POS sales, products
- `/api/v1/shift-api/` — Cashier shifts
- `/api/v1/promo-api/` — Promotions
- `/api/v1/product-api/` — Product management, variants, add-ons
- `/api/v1/product/recipe-api/` — Recipes and production
- `/api/v1/inventory-api/` — Inventory and stock movements
- `/api/v1/procurement-api/` — Purchase orders, suppliers, invoices
- `/api/v1/crm-api/` — Customers, loyalty, notes
- `/api/v1/report-api/` — Financial and product reports
- `/api/v1/notifications-api/` — Notifications (SSE stream)
- `/api/v1/settings-api/` — System settings, backup/restore
- `/api/v1/chart-api/` — Chart data
- `/api/v1/smart-api/` — Sales forecasts
- `/api/v1/role-api/` — Role lookup
- `/api/v1/user/` — User management
- `/api/v1/supplier-api/` — Supplier management
- `/api/v1/backup-api/` — Export/import backups

**BFF Routes (Next.js API):**
- `POST /api/auth/login` — Proxies to backend auth, sets `ac` cookie
- `POST /api/auth/logout` — Clears cookie
- `GET /api/commons/get-user-info` — Proxies user info via SSR client

### 4. Dialog System

A single `DialogContext` (from `core-lib`) handles all CRUD dialogs throughout the app.

**Usage:**
```typescript
const { openDialog } = useDialog();

openDialog({
  dialogContentType: "ProductDetail",  // Typed string literal
  data: { productId: 123 }              // Type-safe data param
});
```

**Type Mapping:**
All dialog types and their data shapes are defined in `packages/core-lib/api/content/types/common.ts`:
```typescript
export interface DialogDataType {
  ProductDetail: ProductDetailDialogData;
  CustomerEdit: CustomerEditDialogData;
  PromoAssign: PromoAssignDialogData;
  // ... 20+ dialog types
}
```

This auto-derives a `DialogContentType` union type, ensuring type safety at the callsite.

### 5. Form Pattern

All forms follow a consistent two-file pattern:

**`*FormBlock.tsx`** (data fetching + submit logic):
```typescript
const ProductFormBlock: React.FC = () => {
  const { result: product } = useApi(
    (api) => api.commons.getProduct(productId),
    [productId]
  );
  const { execute: submit } = useApiCallback(
    (api, params) => api.commons.updateProduct(params)
  );
  
  return <ProductForm onSubmit={submit} initialValues={product} />;
};
```

**`*Form.tsx`** (pure form UI with react-hook-form):
```typescript
const ProductForm: React.FC<{ onSubmit, initialValues }> = ({ ... }) => {
  const form = useForm({ resolver: yupResolver(productSchema) });
  
  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <TextField {...form.register("name")} />
      <SelectField {...form.register("category")} options={...} />
      <Button type="submit">Save</Button>
    </form>
  );
};
```

**Form Components** (from `core-lib/components/radix/`):
- `TextField` — text input with optional password toggle, multiline support
- `SelectField` — dropdown with search
- `AutoCompleteField` — autocomplete with filtering
- `ImageUploadField` — file upload with preview
- `DateField` — date picker
- `CheckboxField`, `RadioField` — boolean inputs

All wrap Radix UI components with `react-hook-form` `Controller` integration and Yup validation.

### 6. Data Fetching Hooks

**`useApi(asyncFn, deps)`** — Auto-execute pattern:
```typescript
const { result: products, loading, error } = useApi(
  (api) => api.commons.productList({ limit: 10 }),
  [limit]  // deps: re-runs when deps change
);
```

**`useApiCallback(asyncFn)`** — Manual-trigger pattern:
```typescript
const { execute: submitForm, loading } = useApiCallback(
  (api, formData) => api.commons.createProduct(formData)
);

return <button onClick={() => submitForm(formData)}>Save</button>;
```

Both hooks:
- Automatically inject Bearer token from sessionStorage
- Normalize error responses to `string[]`
- Trigger 401 refresh-and-retry on token expiry
- Return `{ result, loading, error }` or `{ execute, loading, error }`

---

## Feature Modules

All feature components live under `apps/espasyo-pos/src/components/contents/`:

| Module | Path | Purpose |
|--------|------|---------|
| **POS Register** | `pos/register/` | Main checkout UI: product grid, cart, charge flow, variant/add-on picker, shift close |
| **CRM** | `crm/` | Customer management, loyalty stamps, segments, analytics |
| **Inventory** | `inventory/` | Stock list, movements, adjustments, low-stock alerts |
| **Products** | `products/` | Product CRUD, bulk import, variants, add-ons, recipe templates |
| **Procurement** | `procurement/` | Purchase orders, supplier invoices, payment tracking |
| **Reports** | `reports/` | Financial reports, product performance analysis |
| **Promo Management** | `promo-management/` | Promotion CRUD, AI suggestions, customer assignment |
| **Shift Management** | `shift-management/` | Cashier shift open/close, summary reports |
| **Settings** | `settings/` | System configuration, content blocks, themes |
| **User Management** | `user-management/` | Staff CRUD with role assignment |
| **Categories** | `categories/` | Product categories, brands, ingredient categories |
| **Unit Conversion** | `unit-conversion/` | Unit CRUD and conversion rules |
| **Recipe** | `recipe/` | Recipe management for production |
| **People Management** | `people-management/` | Admin role/permission management |
| **Orders** | (cashier page) | Online/POS order list, void/refund |

Each module typically contains:
- `*Block.tsx` — wrapper with data fetching
- `*Form.tsx` — form UI
- `*List.tsx` — data table
- `*Detail.tsx` — detail view
- `hooks.ts` — custom hooks for the feature
- `types.ts` — feature-specific types
- `constants.ts` — constants (enums, defaults, etc.)

---

## Key Files & Their Roles

| File | Purpose |
|------|---------|
| `apps/espasyo-pos/src/pages/_app.tsx` | App entry point: Emotion cache, NProgress bar, per-page layout support |
| `apps/espasyo-pos/src/components/shared/Page.tsx` | Provider tree assembly: wraps every page with context stack |
| `apps/espasyo-pos/src/proxy.ts` | Next.js middleware: JWT validation, role-based routing, security headers |
| `packages/core-lib/api/api.ts` | Root `Api` class: instantiates all sub-clients |
| `packages/core-lib/api/commons/api.ts` | `CommonsApi`: largest domain API (products, sales, inventory, etc.) |
| `packages/core-lib/api/authentication/api.ts` | `AuthenticationApi`: login, refresh, validate, MPIN |
| `packages/core-lib/api/access/api.ts` | `AccessApi`: RBAC endpoints |
| `packages/core-lib/api/crm/api.ts` | `CrmApi`: customer & loyalty endpoints |
| `packages/core-lib/api/types.ts` | Base response types: `ApiResponse<T>`, `PaginationData` |
| `packages/core-lib/api/commons/types.ts` | All domain DTOs & enums (very large file) |
| `packages/core-lib/api/content/types/common.ts` | Dialog type mappings via `DialogDataType` |
| `packages/core-lib/core/http-client.ts` | Axios wrapper: request/response interceptors, token injection |
| `packages/core-lib/core/hooks/useApi.ts` | `useApi` & `useApiCallback`: data fetching hooks |
| `packages/core-lib/core/contexts/auth/AuthContext.tsx` | Auth state: login, logout, tokens, role, email |
| `packages/core-lib/core/contexts/auth/hooks/useAuthentication.ts` | Auth logic: login flow, token validation, idle timer, session refresh |
| `packages/core-lib/core/contexts/AccessContext.tsx` | RBAC context: role, permissions, menu items |
| `packages/core-lib/core/contexts/PublicSettingsContext.tsx` | Runtime settings: POS config, inventory flags, theme, security policy |
| `packages/core-lib/core/hooks/useRefreshTokenHandler.ts` | Token refresh on 401 intercept |
| `packages/core-lib/core/hooks/usePreventDuplicateSession.ts` | Session duplicate detection |
| `packages/core-lib/core/hooks/useSessionIdleTimer.ts` | Auto-logout on inactivity |
| `packages/core-lib/config/index.ts` | Environment variable configuration |
| `packages/core-lib/components/radix/` | Current Radix UI component library (dialogs, fields, tables, etc.) |
| `packages/core-lib/business/` | Pure utility functions: dates, strings, numbers, colors, recipes, etc. |
| `apps/espasyo-pos/src/components/contents/pos/register/PosRegisterBlock.tsx` | Main POS register orchestrator |
| `apps/espasyo-pos/src/styles/globals.css` | Global styles and Tailwind imports |

---

## Environment Variables

Create a `.env.local` file in `apps/espasyo-pos/` with these variables:

```bash
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:5000           # Backend base URL
NEXT_PUBLIC_LOCAL_API_URL=http://localhost:5000     # Local dev override

# JWT Claims (backend dependent)
NEXT_PUBLIC_CLAIMS_IDENTITY_URL=http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier
NEXT_PUBLIC_CLAIMS_NAME_IDENTIFIER=http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name

# SSO
NEXT_PUBLIC_SSO_COOKIE=sso_token                    # Domain-wide SSO cookie name

# Server-side only (not exposed to client)
NEXT_PRIVATE_API_URL=http://localhost:5000
```

---

## Conventions & Best Practices

### ✅ DO

1. **Use `useApi` / `useApiCallback` for all API calls**
   ```typescript
   const { result } = useApi((api) => api.commons.productList());
   ```
   Never call axios directly.

2. **Use Radix UI Themes for all new UI**
   ```typescript
   import { Box, Flex, Button, TextField } from "@radix-ui/themes";
   ```
   Import from `core-lib/components/radix/` for custom wrappers.

3. **Use inline `style` props for POS UI styling**
   ```typescript
   <Box style={{ backgroundColor: "var(--gray-a4)", padding: "1rem" }} />
   ```
   Use Radix design token CSS variables.

4. **Use `react-hook-form` + Yup for forms**
   ```typescript
   const form = useForm({ resolver: yupResolver(schema) });
   ```
   Follow the `*FormBlock` + `*Form` pattern.

5. **Use Tailwind for admin UI**
   ```typescript
   <div className="flex gap-4 p-4 bg-gray-100">
   ```

6. **Use `openDialog()` for all CRUD dialogs**
   ```typescript
   openDialog({ dialogContentType: "ProductDetail", data: { ... } });
   ```

### ❌ DON'T

1. **Don't import Axios directly**
   - Always use `useApi` hooks.

2. **Don't use MUI components for new UI**
   - Radix UI Themes is the standard.
   - Exception: MUI icon imports (`@mui/icons-material`) are OK.

3. **Don't use CSS modules**
   - Use inline `style` props or Tailwind classes.

4. **Don't use Redux, Zustand, or react-query**
   - Use React Context (provided in `core-lib`) + `useApi` hooks.

5. **Don't create new global state without a Context**
   - All global state goes in `core-lib/core/contexts/`.

6. **Don't mix Radix and MUI components in the same area**
   - Radix is the primary system for new code.

---

## Common Tasks

### Add a New Feature Module

1. Create folder: `apps/espasyo-pos/src/components/contents/my-feature/`
2. Add API endpoints to `packages/core-lib/api/commons/api.ts` (or new sub-client)
3. Add DTO types to `packages/core-lib/api/commons/types.ts`
4. Create `MyFeatureBlock.tsx` (data fetching) + `MyFeatureForm.tsx` (UI)
5. Add table/list component if needed
6. Create route: `apps/espasyo-pos/src/pages/admin/hub/my-feature/index.tsx`
7. Add menu item in admin's navigation (controlled by `AccessContext.menu`)

### Add a New API Endpoint

1. Add method to the appropriate API client (`CommonsApi`, `CrmApi`, etc.)
2. Add request/response types to the corresponding `types.ts`
3. Use in a component via `useApi` or `useApiCallback`

### Modify Dialog System

1. Add dialog type & data interface to `DialogDataType` in `core-lib/api/content/types/common.ts`
2. Create a new dialog component that reads from `DialogContext.data`
3. Register component in the master dialog renderer

### Add Global State

1. Create a new Context file in `packages/core-lib/core/contexts/`
2. Export both the Context and Provider component
3. Add Provider to the stack in `Page.tsx` (in correct nesting order)
4. Export from `core-lib/core/contexts/index.ts`

---

## Testing

Jest is configured via `babel-jest` + `jest-environment-jsdom`, but **no test files exist yet**.

To add tests:
1. Install: `yarn add -D @testing-library/react @testing-library/jest-dom`
2. Create `*.test.tsx` files next to components
3. Run: `yarn test` or `yarn test:watch`

Example test structure:
```typescript
// MyComponent.test.tsx
import { render, screen } from "@testing-library/react";
import MyComponent from "./MyComponent";

describe("MyComponent", () => {
  it("renders correctly", () => {
    render(<MyComponent />);
    expect(screen.getByText("Hello")).toBeInTheDocument();
  });
});
```

---

## Troubleshooting

### 404 after Login
- Check `proxy.ts` role-based routing logic
- Ensure JWT claim keys match `NEXT_PUBLIC_CLAIMS_*` env vars
- Verify `AccessProvider` loaded RBAC data successfully

### API 401 Errors
- Check sessionStorage for valid `accessToken`
- Verify `NEXT_PUBLIC_API_URL` env var is correct
- Check token refresh interceptor logs in browser console

### Missing Styles in POS UI
- Use Radix CSS variables: `var(--gray-a4)`, `var(--indigo-9)`, etc.
- For custom colors, use `ThemeColorVars` hook to set `--espasyo-primary` / `--espasyo-secondary`

### Form Field Not Validating
- Ensure field is wrapped with `react-hook-form` Controller
- Check Yup schema matches field name
- Verify custom field component passes `value` and `onChange` from Controller

---

## Additional Resources

- **Next.js Docs**: https://nextjs.org/docs
- **React Docs**: https://react.dev
- **Radix UI Docs**: https://www.radix-ui.com/docs
- **react-hook-form Docs**: https://react-hook-form.com
- **Yup Docs**: https://github.com/jquense/yup
- **Turborepo Docs**: https://turbo.build/repo/docs
- **Axios Docs**: https://axios-http.com

---

**Last updated:** 2026-05-27
