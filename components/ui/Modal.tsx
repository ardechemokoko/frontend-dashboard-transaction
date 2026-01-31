"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { createPortal } from "react-dom";

interface ModalProps {
  open: boolean;
  onClose?: () => void;
  children: ReactNode;
  /** Largeur max : sm, md, lg (défaut: md) */
  size?: "sm" | "md" | "lg";
}

const sizeClasses = {
  sm: "max-w-sm",
  md: "max-w-lg",
  lg: "max-w-2xl",
};

export default function Modal({ open, onClose, children, size = "md" }: ModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);

  // Bloquer le scroll du body quand la modale est ouverte
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  // Fermer sur Escape
  useEffect(() => {
    if (!open || !onClose) return;
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        onClose?.();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  // Fermer en cliquant sur l'overlay
  function handleOverlayClick(e: React.MouseEvent) {
    if (e.target === overlayRef.current && onClose) {
      onClose();
    }
  }

  if (!open) return null;

  const modal = (
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150 overflow-y-auto"
      role="dialog"
      aria-modal="true"
    >
      <div
        className={`bg-white dark:bg-slate-800 rounded shadow-2xl w-full my-auto max-h-[calc(100vh-1.5rem)] ${sizeClasses[size]} border border-slate-200 dark:border-slate-700 overflow-y-auto overflow-x-hidden animate-in zoom-in-95 duration-150 shrink-0`}
      >
        {children}
      </div>
    </div>
  );

  // Utiliser createPortal pour monter la modale directement dans le body
  if (typeof window === "undefined") return null;
  return createPortal(modal, document.body);
}
