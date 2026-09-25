import * as React from "react";
import { useToast } from "@/hooks/use-toast";
import { Toast, ToastDescription, ToastProvider, ToastTitle, ToastViewport, ToastPosition } from "./toast";
import { AnimatePresence } from "framer-motion";
import { Toaster as SonnerToaster } from "sonner";

export interface ToasterProps {
  position?: ToastPosition;
}

export function Toaster({ position = "top-right" }: ToasterProps) {
  const { toasts, dismiss } = useToast();

  return (
    <>
      {/* Sonner Toaster - Handles all `toast.*` calls from 'sonner' across the whole project */}
      <SonnerToaster
        position={position as any}
        richColors
        closeButton
        duration={3000}
        toastOptions={{
          className: "!rounded-xl !font-sans !shadow-2xl !backdrop-blur-md",
        }}
      />

      {/* Lightswind Toast Provider - Handles custom hook toasts */}
      <ToastProvider>
        <ToastViewport position={position}>
          <AnimatePresence mode="popLayout">
            {toasts.map(({ id, title, description, action, type, variant, duration, icon, avatar, ...props }) => {
              const toastVariant = variant || (
                type === "success" ? "success" :
                  type === "warning" ? "warning" :
                    type === "info" ? "info" :
                      type === "destructive" ? "destructive" :
                        type === "loading" ? "loading" :
                          "default"
              );

              return (
                <Toast
                  key={id}
                  {...props}
                  variant={toastVariant}
                  duration={duration}
                  icon={icon}
                  avatar={avatar}
                  onOpenChange={(open) => {
                    if (!open) dismiss(id);
                  }}
                >
                  <div className="grid gap-1">
                    {title && <ToastTitle>{title}</ToastTitle>}
                    {description && <ToastDescription>{description}</ToastDescription>}
                  </div>
                  {action}
                </Toast>
              );
            })}
          </AnimatePresence>
        </ToastViewport>
      </ToastProvider>
    </>
  );
}