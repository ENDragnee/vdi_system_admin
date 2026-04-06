"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw, Check } from "lucide-react";
import axios from "axios";

export function PackageSyncButton({ vmIp }: { vmIp: string }) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSync = async () => {
    setLoading(true);
    try {
      await axios.post(`http://${vmIp}:8081/api/sync`, {
        callbackUrl: `${window.location.origin}/api/agent/log`
      }, {
        headers: { "Authorization": `Bearer ${process.env.NEXT_PUBLIC_AGENT_SECRET}` }
      });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (e) {
      alert("Agent unreachable at " + vmIp);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button variant="outline" onClick={handleSync} disabled={loading}>
      {success ? <Check className="w-4 h-4 mr-2 text-green-500" /> : <RefreshCw className={`w-4 h-4 mr-2 ${loading && 'animate-spin'}`} />}
      Force VM Rebuild
    </Button>
  );
}
