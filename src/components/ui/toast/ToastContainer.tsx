"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { ToastMessage } from "./ToastContext";
import { Toast } from "./Toast";

interface ToastContainerProps {
    messages: ToastMessage[];
    removeToast: (id: string) => void;
}

export function ToastContainer({messages, removeToast}: ToastContainerProps) {
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    if (!isMounted) {
        return null;
    }

    return createPortal(
        <div
            id="toast-portal"
            className="fixed inset-x-0 bottom-0 z-[9999] flex justify-center px-4 pb-[calc(1rem+env(safe-area-inset-bottom))] pointer-events-none sm:justify-end sm:px-6 sm:pb-6"
        >
            <div className="flex w-full max-w-sm flex-col-reverse gap-3 sm:max-w-md">
                {messages.map((message) => (
                    <div key={message.id} className="pointer-events-auto">
                        <Toast message={message} onRemove={removeToast} />
                    </div>
                ))}
            </div>
        </div>,
        document.body,
    );
}