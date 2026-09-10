# ScheduleMate — Lecture Hall Digital Signage System

Individual Software Engineering Assignment — Sparkline Academy scenario, prepared during the Job Portal System's QA phase.

**Prepared by:** Disura Sandaruwan
**Team Lead / Final Code Reviewer:** Sithum Buddhika Jayalal

## Project Objective

ScheduleMate is a dynamic lecture hall digital signage system that displays current and upcoming academic activity, cancellations, reschedules, and live room status for a specific floor/side of Sparkline Academy, in real time — automatically, with no viewer interaction required.

## Main Features

**Admin side**

- Secure login with either username or email, two roles (**Admin** and **Super Admin**), and a full password-recovery flow with real email delivery
- Campus structure management: rooms within the fixed Sparkline Academy building/floor/side layout, with auto-generated room codes (building/floor/side/type are selected — the code itself is computed, never typed)
- Module and Lecturer management
- Full session lifecycle: create, edit, cancel, reopen, and reschedule — with automatic room-conflict detection and a full multi-hop reschedule history
- Live, campus-wide room occupancy dashboard with status filtering, search, and clearable filters
- Digital signage device registration, reassignment, and online/offline tracking (based on real polling heartbeats)
- Admin account management (Super Admin only): invite-based account creation with a real emailed activation link, deactivation/reactivation, role changes — all with self-protection rules to prevent accidental lockout or privilege escalation
- A profile-change approval workflow: an Admin requests a name/email change, a Super Admin reviews and approves or rejects it
- Every destructive or state-changing action (deactivate, remove, reopen, delete) confirms through an in-app modal — never a raw browser dialog

**Digital Signage side**

- Public, unauthenticated, read-only display
- Auto-rotates through Ongoing → Upcoming → Cancelled (if any) → Rescheduled (if any), skipping any slide with nothing to show
- Refreshes its schedule roughly every 60 seconds and recalculates live status every second from its own clock
- One shared display template reused across all four slide types, content vertically centered so a near-empty slide still looks deliberate, not broken

## Technology Stack

| Layer              | Technology                               | Why                                                                                                                                                           |
| ------------------ | ---------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Frontend (Admin)   | React (Vite) + TypeScript + Tailwind CSS | Authenticated, interactive admin application                                                                                                                  |
| Frontend (Signage) | React (Vite) + TypeScript + Tailwind CSS | Separate, public, read-only kiosk application — kept independent so the signage client never ships any admin or login code                                    |
| Backend            | NestJS (Node.js) + TypeScript            | Modular, dependency-injection based architecture — one module per domain area, mirroring the ER diagram and System Architecture design                        |
| ORM                | Prisma                                   | Type-safe queries and migrations; schema mirrors the ER diagram directly                                                                                      |
| Database           | PostgreSQL                               | The scheduling domain is heavily relational (rooms, sessions, time-range conflicts, foreign keys) — a relational database enforces these constraints natively |
| Email              | Resend                                   | Real transactional email delivery for account activation and password reset links                                                                             |

Two separate frontends share one backend, reflecting the two very different actors in the system (Administrator vs. Digital Signage Display) and keeping the public-facing API surface as small as possible.

## Project Structure

```
ScheduleMate-Lecture-Hall-Digital-Signage-System_Disura/
├── backend/            NestJS + Prisma API
├── frontend-admin/     React (Vite) — Admin web app
├── frontend-signage/   React (Vite) — Digital Signage display app
```

## Installation & Setup

### Prerequisites

- Node.js (v20+ recommended)
- PostgreSQL (v16+; developed against v18)
- A free [Resend](https://resend.com) account (for real email delivery — no credit card required)

### 1. Clone and install

```bash
git clone https://github.com/Disura1/ScheduleMate-Lecture-Hall-Digital-Signage-System_Disura.git
cd ScheduleMate-Lecture-Hall-Digital-Signage-System_Disura

cd backend && npm install
cd ../frontend-admin && npm install
cd ../frontend-signage && npm install
```

### 2. Database setup

Create a PostgreSQL database:

```sql
CREATE DATABASE schedulemate_db;
```

### 3. Environment configuration

Each app has a `.env.example` — copy it to `.env` in the same folder and fill in real values. **Never commit the real `.env` files.**

**`backend/.env`**

```
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/schedulemate_db?schema=public"
JWT_SECRET="a long random string — generate with: node -e \"console.log(require('crypto').randomBytes(32).toString('hex'))\""
RESEND_API_KEY="your Resend API key, from resend.com/api-keys"
EMAIL_FROM="ScheduleMate <onboarding@resend.dev>"
FRONTEND_ADMIN_URL="http://localhost:5173"
```

**`frontend-admin/.env`**

```
VITE_API_URL=http://localhost:3000
```

**`frontend-signage/.env`**

```
VITE_API_URL=http://localhost:3000
VITE_DEVICE_IDENTIFIER=DSP-0001
```

### 4. Run database migrations and seed data

From `backend/`:

```bash
npx prisma migrate dev
npx prisma db seed
```

This creates the full fixed Sparkline Academy campus structure (both buildings, all floors, sides, and rooms per the documented naming convention and lab-floor assumptions) and two admin accounts for testing — see **Test Credentials** below.

### 5. Run all three apps

Each needs its own terminal:

```bash
# Terminal 1
cd backend && npm run start:dev        # http://localhost:3000

# Terminal 2
cd frontend-admin && npm run dev       # http://localhost:5173

# Terminal 3
cd frontend-signage && npm run dev     # http://localhost:5174
```

Both frontends have their dev server ports pinned (`5173` for Admin, `5174` for Signage) so they can run side by side reliably.

To see the Digital Signage app show real data, first register a display in the Admin app (Displays → Register Display) with a device ID matching `VITE_DEVICE_IDENTIFIER` (default: `DSP-0001`), and create at least one session for today in a room on that display's assigned floor/side.

## Test / Demo Credentials

Seeded by `npx prisma db seed`:

| Username     | Password                | Role        |
| ------------ | ----------------------- | ----------- |
| `disura.s`   | `NewSuperAdminPass123!` | Super Admin |
| `test.admin` | `ChangeMe123!`          | Admin       |

Login accepts either username or email for both accounts. Change these before any real deployment — they exist purely to demonstrate both role levels locally.

## Important Assumptions

- **Room naming convention:** `<BuildingCode>-<Floor><Side>-<RoomType><Number>`, e.g. `M-05A-L01` (Main, Floor 5, A Side, Lecture Room 1). Room codes are auto-generated by the system from the selected building/floor/side/type and cannot be typed manually, to guarantee the convention is always followed.
- **Lab-floor room counts** (not specified by the brief): Main Building lab floors (3, 5, 6) = 4 lab rooms/side; New Building lab floors (3, 10, 12, 13) = 3 lab rooms/side; New Building Floor 14 = 1 large lecture hall/side.
- **Server timezone:** the system assumes the server's local system timezone matches Sparkline Academy's real timezone — "today," "ongoing," and "upcoming" are all calculated against the server's local clock, not UTC.
- **Slide duration:** each signage slide is shown for 8 seconds before advancing.
- **Live refresh strategy:** the signage client polls the API roughly every 60 seconds and separately recalculates time-based status every second using its own clock, rather than requiring a server round-trip for every second.
- **Reschedule history:** rescheduling a session never edits the original record — it creates a new session row linked back to the one it replaced, and marks the old one `SUPERSEDED`. Only the latest version in a reschedule chain is ever shown as an active, actionable session.
- **Account creation:** there is no public admin sign-up. The first Super Admin account is created via the seed script; every account after that is created by an existing Super Admin and receives a real activation email to set their own password.
- **Username is permanent** once an account is created — it cannot be changed by anyone, including a Super Admin editing another admin's account.
- **Role changes are never self-directed** — a Super Admin cannot change their own role, and an Admin cannot request a role change for themselves, to prevent accidental lockout or self-escalation.
- **Admin accounts are deactivated, never deleted** — this preserves accountability, since every session records which admin created it.

## Known Limitations

- **Email sandbox restriction:** Resend's free-tier sandbox mode only delivers to the developer's own verified email address until a custom domain is verified. A real deployment would verify a domain to lift this restriction and send to any real recipient.
- No automated test suite beyond the default NestJS-generated spec file stubs; testing was done manually and iteratively against real data throughout development (see commit history).
- Room-conflict prevention is enforced in the application layer; a stricter database-level constraint (e.g. a PostgreSQL `EXCLUDE` constraint) was considered as a hardening step but not implemented, given the assignment's timeframe.
- The native browser time picker (`<input type="time">`) is used as-is rather than a custom component, so its open/close behaviour follows the browser's own standard interaction pattern.

## Repository

This project is developed in a personal GitHub repository (`https://github.com/Disura1/ScheduleMate-Lecture-Hall-Digital-Signage-System_Disura`), which remains the active development repo. A complete copy — full commit history included — has been migrated to the team organization for final review, per the team's process.

The final Pull Request requests **Sithum Buddhika Jayalal** as code reviewer.
