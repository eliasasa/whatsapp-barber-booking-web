"use client";

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { ToastContainer } from "./ToastContainer";

export type ToastType = "success" | "error" | "info" | "warning";

export interface ToastMessage {
    id: string;
    title: string;
    description?: string;
    type: ToastType;
}

interface ToastContextData {
    addToast: (message: Omit<ToastMessage, "id">) => string;
    removeToast: (id: string) => void;
}

interface ToastProviderProps {
    children: ReactNode;
}

const ToastContext = createContext<ToastContextData | null>(null);
const TOAST_DURATION = 5000;

function createToastId() {
    if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
        return crypto.randomUUID();
    }

    return `toast-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function ToastProvider({ children }: ToastProviderProps) {
    const [messages, setMessages] = useState<ToastMessage[]>([]);

    const removeToast = useCallback((id: string) => {
        setMessages((prev) => prev.filter((msg) => msg.id !== id));
    }, []);

    const addToast = useCallback(({ title, description, type }: Omit<ToastMessage, "id">) => {
        const id = createToastId();
        const toast: ToastMessage = { id, title, description, type };

        setMessages((prev) => [toast, ...prev]);

        return id;
    }, [removeToast]);

    const value = useMemo(
        () => ({ addToast, removeToast }),
        [addToast, removeToast],
    );

    return (
        <ToastContext.Provider value={value}>
            {children}
            <ToastContainer messages={messages} removeToast={removeToast} />
        </ToastContext.Provider>
    );
}

export function useToast() {
    const context = useContext(ToastContext);

    if (!context) {
        throw new Error("useToast must be used within a ToastProvider");
    }

    return context;
}