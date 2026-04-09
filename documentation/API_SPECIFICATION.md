# API Specification: VDI Control Plane & Agent

## 1. Web-Panel Internal APIs (Next.js)

### 1.1 `GET /api/instances`
Retrieves a paginated list of VM instances with real-time status from Proxmox.

**Parameters:**
- `page` (number): Current page (default: 1).
- `limit` (number): Items per page (default: 12).
- `search` (string): Fuzzy search by hostname.
- `labId` (string/uuid): Filter by specific lab (Admin only).

**Response:**
```json
{
  "instances": [
    {
      "id": "uuid",
      "proxmoxId": 101,
      "labId": "uuid",
      "labName": "Lab Alpha",
      "name": "vds-host-01",
      "os": "NixOS",
      "ip": "192.168.1.50",
      "status": "online",
      "cpu": 15,
      "ram": 45,
      "createdAt": "ISO8601"
    }
  ],
  "labs": [{ "id": "uuid", "name": "Lab Alpha" }],
  "meta": { "total": 1, "page": 1, "limit": 12, "totalPages": 1 }
}
```

### 1.2 `GET /api/packages`
Retrieves the software repository catalog.

**Parameters:**
- `search`: Filter by name or description.
- `sortBy`: `name`, `version`, `createdAt`.
- `sortOrder`: `asc` or `desc`.

### 1.3 `POST /api/vm/package`
Triggers a GitOps package installation/removal for a specific VM.

**Request Payload:**
```json
{
  "vmId": "uuid",
  "packageId": "uuid",
  "action": "install" | "uninstall"
}
```

### 1.4 `POST /api/vm/console/spice`
Thin-client handshake for generating SPICE session files.

**Authentication:** `Bearer ${AGENT_SECRET}`

**Request Payload:**
```json
{
  "vmId": "uuid",
  "clientName": "terminal-01"
}
```

**Response:**
Returns a raw `.vv` file (`Content-Type: application/x-virt-viewer`) containing Proxmox SPICE tickets.

---

## 2. Agent Webhook (Inbound to Web-Panel)

### 2.1 `POST /api/agent/log`
Endpoint for VM-Agents to report build status and execution telemetry.

**Authentication:** `Bearer ${NEXTJS_API_KEY}`

**Payload Schema:**
```json
{
  "vmId": "string",
  "type": "NIX_SYNC_REQUESTED" | "NIX_BUILD_SUCCESS" | "NIX_BUILD_FAILED",
  "severity": "INFO" | "WARNING" | "ERROR" | "FATAL",
  "message": "Human readable status",
  "targetName": "hostname",
  "details": "Full shell output or stack trace"
}
```

---

## 3. VM-Agent API (Outbound to Agent)

### 3.1 `POST /api/sync`
Listener on Port 8081 within each VM instance.

**Authentication:** `Bearer ${AGENT_SECRET}`

**Request Payload:**
```json
{
  "vmId": "string",
  "callbackUrl": "https://vdi-admin.local/api/agent/log"
}
```

**Workflow:**
1. Validates PSK.
2. Returns `202 Accepted` immediately.
3. Spawns background process: `git pull --rebase`.
4. Executes: `sudo nixos-rebuild switch --flake .#vdi`.
5. POSTs results to `callbackUrl`.

---

## 4. Proxmox API Integration

The system utilizes the Proxmox VE API v2 via `PVEAPIToken`.

### 4.1 Utilized Endpoints
- **Provisioning:** `POST /nodes/{node}/qemu/{template_id}/clone`
- **Configuration:** `POST /nodes/{node}/qemu/{vmid}/config`
- **Power Management:** `POST /nodes/{node}/qemu/{vmid}/status/{start|stop|reboot}`
- **Resource Monitoring:** `GET /cluster/resources`
- **Console Proxy:** 
    - NoVNC: `POST /nodes/{node}/qemu/{vmid}/vncproxy`
    - SPICE: `POST /nodes/{node}/qemu/{vmid}/spiceproxy`
- **Guest Agent:** `GET /nodes/{node}/qemu/{vmid}/agent/network-get-interfaces` (Used for IPv4 resolution).
