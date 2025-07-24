"use client";
import AuthModal from "@/components/AuthModal";
import Sidebar from "@/components/Sidebar";
import { useState } from "react";

export default function Layout({ children }: { children: React.ReactNode }) {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
    const [authOpen, setAuthOpen] = useState(false);

    return (
        <div className="min-h-screen min-w-full bg-white dark:bg-neutral-950 flex flex-col">
            <div className="flex flex-1 flex-row min-h-0 min-w-0">
                <Sidebar
                    open={sidebarOpen}
                    onClose={() => setSidebarOpen(false)}
                    collapsed={sidebarCollapsed}
                    onCollapseToggle={() => setSidebarCollapsed((c) => !c)}
                />
                <main
                    className="flex-1 flex flex-col min-h-0 min-w-0 pt-16 px-2 md:px-8 transition-all duration-300"
                    aria-label="Main content"
                    style={{ minHeight: 'calc(100vh - 4rem)' }}
                >
                    {children}
                </main>
            </div>
            <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} />
        </div>
    );
} 