"use client";

import { useEffect } from "react";
import { io } from "socket.io-client";
import { toast, Toaster } from "sonner";
import { AlertCircle, CheckCircle2, Info, Zap } from "lucide-react";

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Connect to the WebSocket server
    const socket = io();

    socket.on("new-notification", (data: any) => {
      // Logic to show different toast styles based on notification type
      const toastOptions = {
        description: data.message,
        duration: 5000,
      };

      switch (data.type) {
        case "RESOURCE_CRITICAL":
          toast.error(data.title, {
            ...toastOptions,
            icon: <Zap className="w-4 h-4 text-red-500 animate-pulse" />,
          });
          break;
        case "SUCCESS":
          toast.success(data.title, {
            ...toastOptions,
            icon: <CheckCircle2 className="w-4 h-4 text-green-500" />,
          });
          break;
        case "ERROR":
          toast.error(data.title, {
            ...toastOptions,
            icon: <AlertCircle className="w-4 h-4 text-red-500" />,
          });
          break;
        case "WARNING":
          toast.warning(data.title, {
            ...toastOptions,
          });
          break;
        default:
          toast.info(data.title, {
            ...toastOptions,
            icon: <Info className="w-4 h-4 text-blue-500" />,
          });
      }

      // Optional: Play a subtle notification sound
      const audio = new Audio("/notification-chime.mp3");
      audio.play().catch(() => { });
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  return (
    <>
      <Toaster
        position="top-right"
        expand={true}
        richColors
        closeButton
      />
      {children}
    </>
  );
}
