# Web Panel: VDI Control Plane (Next.js/TypeScript)

This directory contains the Next.js application that serves as the primary control plane for the VDI System. It provides a web-based interface for managing VMs, users, packages, and monitoring telemetry.

## 1. Installation & Environment Configuration

### 1.1 Prerequisites
- Node.js (v18+) & pnpm
- PostgreSQL database
- Kafka broker
- InfluxDB instance

### 1.2 Environment Variables
Create a `.env` file based on `.env.example` with the following critical variables:

| Variable | Description |
| :--- | :--- |
| `DATABASE_URL` | Connection string for PostgreSQL. |
| `PROXMOX_URL` | Base URL for the Proxmox API (e.g., `https://pve.vds-host.local:8006/api2/json`). |
| `PROXMOX_API_TOKEN` | Proxmox API token (`USER@REALM!TOKENID=UUID`). |
| `PROXMOX_NODE` | The Proxmox node where VMs are managed (e.g., `pve`). |
| `KAFKA_BROKER` | Address of the Kafka broker (e.g., `kafka.vds-host.local:9092`). |
| `INFLUX_URL` | InfluxDB API URL. |
| `INFLUX_TOKEN` | InfluxDB API token. |
| `INFLUX_ORG` | InfluxDB organization name. |
| `INFLUX_BUCKET` | InfluxDB bucket name (e.g., `vdi_bucket`). |
| `NIXOS_CONFIG_DIR` | Absolute path to the `nixos-config` Git repository (for GitOps). |
| `NEXTAUTH_SECRET` | Secret for NextAuth JWT signing. |
| `NEXTAUTH_URL` | Base URL for NextAuth callbacks. |
| `NEXTJS_API_KEY` | Shared secret for authenticating inbound webhook calls from `vm-agent`. |

### 1.3 Setup
1.  Install dependencies: `pnpm install`
2.  Run Prisma migrations: `pnpm prisma migrate dev`
3.  Seed the database (optional): `pnpm tsx prisma/seed.ts`

## 2. Execution Logic

The application runs using `server.ts` which orchestrates the Next.js frontend with backend services.

### 2.1 Execution Logic (Next.js + WebSocket Worker)
The application utilizes a custom server to bridge Next.js with Kafka and WebSockets. The following commands are the standard way to run the project:

- **Development:**
  ```bash
  pnpm dev:websocket
  ```
- **Build:**
  ```bash
  pnpm build:websocket
  ```
- **Production Start:**
  ```bash
  pnpm start:websocket
  ```

These commands utilize `tsx` to execute `server.ts`, which initializes the Next.js handler while simultaneously running the Kafka consumer and Socket.io server.

## 3. GitOps Workflow

The Web-Panel acts as the initiator for configuration changes within the NixOS environment.

1.  **Nix File Modification:** When a user installs or uninstalls a package, the `POST /api/vm/package` endpoint directly modifies the `packages.nix` file within the Git repository specified by `NIXOS_CONFIG_DIR`.
2.  **Git Commit & Push:** The system then executes a `git add`, `git commit -m "..."`, and `git push origin main` sequence from within the `NIXOS_CONFIG_DIR`.
3.  **VM Agent Sync:** The Web-Panel sends a `POST /api/sync` request to the target VM's `vm-agent`, triggering it to pull the latest changes and rebuild its NixOS configuration. This ensures that the desired state defined in Git is applied to the VM.
