"use client";
import { Menu, Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

export default function Header({ onSidebarToggle }: { onSidebarToggle: () => void }) {
    const [isDark, setIsDark] = useState(false);

    useEffect(() => {
        // On mount, set initial mode from localStorage or system
        const stored = localStorage.getItem("theme");
        if (stored === "dark" || (!stored && window.matchMedia("(prefers-color-scheme: dark)").matches)) {
            document.documentElement.classList.add("dark");
            setIsDark(true);
        } else {
            document.documentElement.classList.remove("dark");
            setIsDark(false);
        }
    }, []);

    function toggleDarkMode() {
        if (isDark) {
            document.documentElement.classList.remove("dark");
            localStorage.setItem("theme", "light");
            setIsDark(false);
        } else {
            document.documentElement.classList.add("dark");
            localStorage.setItem("theme", "dark");
            setIsDark(true);
        }
    }

    return (
        <header className="fixed top-0 left-0 w-full h-16 bg-white dark:bg-black border-b shadow-sm z-30 flex items-center px-6 font-sans">
            <button
                className="md:hidden mr-4 p-2 rounded hover:bg-neutral-100 dark:hover:bg-neutral-900 focus:outline-none"
                aria-label="Open sidebar"
                onClick={onSidebarToggle}
            >
                <Menu size={24} />
            </button>
            <div className="flex items-center gap-2 font-bold text-xl tracking-tight">
                <span>✒️ WriteFlow</span>
            </div>
            <div className="ml-auto flex items-center gap-2">
                <button
                    onClick={toggleDarkMode}
                    aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
                    className="p-2 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-900 border border-transparent focus:outline-none focus-visible:ring-2 focus-visible:ring-[#a259ff] transition"
                >
                    {isDark ? <Sun size={20} /> : <Moon size={20} />}
                </button>
                <button
                    className="px-5 py-2 rounded border border-neutral-300 bg-white dark:bg-black hover:bg-neutral-100 dark:hover:bg-neutral-900 transition text-neutral-800 dark:text-white font-medium focus:outline-none"
                    aria-label="Login"
                >
                    Login
                </button>
            </div>
        </header>
    );
} 