# User Roles

## Roles

| Role | Description | Permissions |
|------|-------------|-------------|
| `OWNER` | Winery owner or executive | Full access including team user management |
| `MANAGER` | Vineyard manager | Full operational access except user management |
| `FIELD_WORKER` | Crew member in the vineyard | Log tasks, irrigation, and field notes; GPS tracking |
| `READ_ONLY` | Consultant or auditor | View-only access |

## RBAC (enforced)

Role-based access control is enforced on **all server mutations** via `src/lib/rbac.ts` and `requirePermission()` in domain actions.

| Permission | Owner | Manager | Field worker | Read only |
|------------|-------|---------|--------------|-----------|
| `users:manage` | yes | — | — | — |
| `blocks:edit` | yes | yes | — | — |
| `notes:create` | yes | yes | yes | — |
| `tasks:create` / `tasks:update` | yes | yes | yes | — |
| `tasks:delete` / `tasks:types` | yes | yes | — | — |
| `irrigation:log` | yes | yes | yes | — |
| `irrigation:manage` | yes | yes | — | — |
| `equipment:manage` | yes | yes | — | — |
| `pumps:manage` | yes | yes | — | — |
| `tours:manage` | yes | yes | — | — |
| `import:data` | yes | yes | — | — |
| `varieties:manage` | yes | yes | — | — |
| `gps:manage` | yes | yes | yes | — |
| `notifications:self` | yes | yes | yes | — |

## User onboarding

Owners create accounts at **Settings → Team users** (`/settings/users`). A one-time temporary password is shown at creation — share it securely with the new team member.

### Demo seed accounts

| Email | Role | Password (seed) |
|-------|------|-----------------|
| admin@cooperestate.com | Owner | cooper2026 |
| manager@cooperestate.com | Manager | manager2026 |
| field@cooperestate.com | Field worker | field2026 |

## Open questions

- Should field workers see all blocks or only assigned blocks? (v1: all blocks)
- Email invite / password reset flows (deferred — use owner-created temp passwords)
