export interface VMInstance {
  id: string;
  proxmoxId: number;
  labId: string;
  labName: string;
  name: string;
  os: string;
  ip: string;
  status: "online" | "offline" | "maintenance";
  owner: string;
  cpu: number;
  ram: number;
  storage: number;
  createdAt: string;
}

export interface Lab {
  id: string;
  name: string;
}

export interface InstancesResponse {
  labs: Lab[];
  instances: VMInstance[];
}
