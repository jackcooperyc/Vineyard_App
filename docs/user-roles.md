# User Roles

## v1 roles

| Role | Description | v1 permissions |
|------|-------------|----------------|
| `OWNER` | Winery owner or executive | Full read/write; future admin settings |
| `MANAGER` | Vineyard manager | Full read/write on all modules |
| `FIELD_WORKER` | Crew member in the vineyard | Read all; create/update tasks, notes, irrigation records |
| `READ_ONLY` | Consultant or auditor | Read-only access to blocks, tasks, records |

## v1 implementation note

Sprint 0–1 implements authentication only. All authenticated users have full read/write access. Role-based access control (RBAC) will be enforced in a later sprint once workflows are validated with the team.

## Future RBAC matrix (planned)

| Action | Owner | Manager | Field Worker | Read Only |
|--------|-------|---------|--------------|-----------|
| View blocks | ✓ | ✓ | ✓ | ✓ |
| Edit block records | ✓ | ✓ | — | — |
| Create/complete tasks | ✓ | ✓ | ✓ | — |
| Log irrigation | ✓ | ✓ | ✓ | — |
| Manage equipment | ✓ | ✓ | — | — |
| Import data | ✓ | ✓ | — | — |
| Manage users | ✓ | — | — | — |

## Open questions

- How many users need mobile access in v1?
- Should field workers see all blocks or only assigned blocks?
- Are consultants expected in v1 or v2?
