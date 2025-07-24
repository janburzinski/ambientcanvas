"use client";
import { Lock, Moon, Shield, Sliders, Sun, User } from "lucide-react";
import { useEffect, useState } from "react";

const FONT_SIZE_OPTIONS = [
    { label: "Small", value: "sm" },
    { label: "Medium", value: "md" },
    { label: "Large", value: "lg" },
];
const LINE_SPACING_OPTIONS = [
    { label: "Compact", value: "compact" },
    { label: "Comfortable", value: "comfortable" },
    { label: "Loose", value: "loose" },
];

const SECTIONS = [
    { key: "user", label: "User", icon: <User size={18} className="mr-2" /> },
    { key: "privacy", label: "Privacy", icon: <Shield size={18} className="mr-2" /> },
    { key: "security", label: "Security", icon: <Lock size={18} className="mr-2" /> },
    { key: "customizability", label: "Customizability", icon: <Sliders size={18} className="mr-2" /> },
];

export default function SettingsPage() {
    const [isDark, setIsDark] = useState(false);
    const [fontSize, setFontSize] = useState("md");
    const [lineSpacing, setLineSpacing] = useState("comfortable");
    const [activeSection, setActiveSection] = useState("user");

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
        const fs = localStorage.getItem("fontSize");
        if (fs) setFontSize(fs);
        const ls = localStorage.getItem("lineSpacing");
        if (ls) setLineSpacing(ls);
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

    function handleFontSize(val: string) {
        setFontSize(val);
        localStorage.setItem("fontSize", val);
    }
    function handleLineSpacing(val: string) {
        setLineSpacing(val);
        localStorage.setItem("lineSpacing", val);
    }

    // Example usage data (replace with real data as needed)
    const usage = 6000; // words used
    const usageLimit = 10000; // total allowed
    const usagePercent = Math.min(usage / usageLimit, 1);
    // Example daily usage data (last 7 days)
    const dailyUsage = [1200, 800, 1500, 900, 600, 1100, 900];
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const maxDay = Math.max(...dailyUsage, 1);

    return (
        <main className="min-h-screen flex flex-col items-center justify-start bg-neutral-50 dark:bg-neutral-950 py-16 px-4 font-sans">
            <div className="w-full max-w-4xl mx-auto flex bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-none overflow-hidden min-h-[500px]">
                {/* Sidebar */}
                <nav className="w-56 border-r border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 py-8 flex flex-col gap-1">
                    <h2 className="text-xs font-semibold text-neutral-400 uppercase px-6 mb-4 tracking-widest">Settings</h2>
                    {SECTIONS.map(section => (
                        <button
                            key={section.key}
                            onClick={() => setActiveSection(section.key)}
                            className={`flex items-center w-full px-6 py-2 text-left rounded-lg transition font-medium text-base mb-1
                                ${activeSection === section.key
                                    ? "bg-neutral-100 dark:bg-neutral-900 text-black dark:text-white shadow-sm"
                                    : "text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-900"}
                            `}
                            aria-current={activeSection === section.key ? "page" : undefined}
                        >
                            {section.icon}
                            {section.label}
                        </button>
                    ))}
                </nav>
                {/* Content Area */}
                <section className="flex-1 p-10 flex flex-col gap-8">
                    {activeSection === "user" && (
                        <>
                            {/* Total Usage Progress Bar */}
                            <div className="mb-8">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-base font-semibold text-neutral-700 dark:text-neutral-200">Total Usage</span>
                                    <span className="text-sm font-medium text-neutral-500 dark:text-neutral-400">{usage.toLocaleString('en-US')} / {usageLimit.toLocaleString('en-US')} words</span>
                                </div>
                                <div className="w-full h-4 bg-neutral-200 dark:bg-neutral-800 rounded-full overflow-hidden">
                                    <div
                                        className="h-4 rounded-full bg-gradient-to-r from-[#a259ff] to-[#c084fc] transition-all duration-500"
                                        style={{ width: `${usagePercent * 100}%` }}
                                    />
                                </div>
                            </div>
                            {/* Usage Graph (last 7 days) */}
                            <div className="mb-8">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-base font-semibold text-neutral-700 dark:text-neutral-200">Usage (Last 7 Days)</span>
                                </div>
                                <div className="flex items-end gap-3 h-32 w-full px-2">
                                    {dailyUsage.map((val, i) => (
                                        <div key={i} className="flex flex-col items-center group w-8">
                                            <div
                                                className="w-full rounded-t-md bg-gradient-to-t from-[#a259ff] to-[#c084fc] dark:from-[#a259ff] dark:to-[#c084fc] transition-all duration-500 relative"
                                                style={{ height: `${(val / maxDay) * 100}%`, minHeight: '8px' }}
                                                title={`${val} words`}
                                            >
                                                <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs text-neutral-500 dark:text-neutral-400 opacity-0 group-hover:opacity-100 pointer-events-none bg-white dark:bg-neutral-900 px-2 py-1 rounded shadow transition">{val}</span>
                                            </div>
                                            <span className="mt-2 text-xs text-neutral-400 dark:text-neutral-500">{days[i]}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </>
                    )}
                    {activeSection === "user" && (
                        <div>
                            <h1 className="text-2xl font-bold text-black dark:text-white mb-2">User</h1>
                            <div className="text-neutral-500 dark:text-neutral-400 text-sm mb-4">User profile and account settings will appear here.</div>
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-full bg-neutral-200 dark:bg-neutral-800" />
                                <div>
                                    <div className="font-medium text-black dark:text-white">Your Name</div>
                                    <div className="text-xs text-neutral-400">user@email.com</div>
                                </div>
                            </div>
                        </div>
                    )}
                    {activeSection === "privacy" && (
                        <div>
                            <h1 className="text-2xl font-bold text-black dark:text-white mb-2">Privacy</h1>
                            <div className="text-neutral-500 dark:text-neutral-400 text-sm mb-4">Privacy controls and data management will appear here.</div>
                            <div className="flex items-center justify-between py-2">
                                <span className="text-base text-neutral-700 dark:text-neutral-200">Data Collection</span>
                                <span className="text-xs text-neutral-400">(Coming soon)</span>
                            </div>
                        </div>
                    )}
                    {activeSection === "security" && (
                        <div>
                            <h1 className="text-2xl font-bold text-black dark:text-white mb-2">Security</h1>
                            <div className="text-neutral-500 dark:text-neutral-400 text-sm mb-4">Security options and password management will appear here.</div>
                            <div className="flex items-center justify-between py-2">
                                <span className="text-base text-neutral-700 dark:text-neutral-200">Change Password</span>
                                <span className="text-xs text-neutral-400">(Coming soon)</span>
                            </div>
                        </div>
                    )}
                    {activeSection === "customizability" && (
                        <div>
                            <h1 className="text-2xl font-bold text-black dark:text-white mb-2">Customizability</h1>
                            <div className="flex items-center justify-between mb-6">
                                <span className="text-base text-neutral-700 dark:text-neutral-200">Dark Mode</span>
                                <button
                                    onClick={toggleDarkMode}
                                    aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
                                    className="p-2 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-900 border border-transparent focus:outline-none focus-visible:ring-2 focus-visible:ring-[#a259ff] transition"
                                >
                                    {isDark ? <Sun size={20} /> : <Moon size={20} />}
                                </button>
                            </div>
                            <div className="flex flex-col gap-2 mb-4">
                                <span className="text-base text-neutral-700 dark:text-neutral-200 mb-1">Font Size</span>
                                <div className="flex gap-2">
                                    {FONT_SIZE_OPTIONS.map(opt => (
                                        <button
                                            key={opt.value}
                                            onClick={() => handleFontSize(opt.value)}
                                            className={`px-4 py-2 rounded-lg font-medium border transition text-base focus:outline-none focus-visible:ring-2 focus-visible:ring-[#a259ff] ${fontSize === opt.value
                                                ? "bg-[#a259ff] dark:bg-[#c084fc] text-white border-[#a259ff] dark:border-[#c084fc]"
                                                : "bg-neutral-100 dark:bg-neutral-900 text-black dark:text-white border-neutral-200 dark:border-neutral-800 hover:bg-[#f3eaff] dark:hover:bg-[#23232b]"
                                                }`}
                                            aria-pressed={fontSize === opt.value}
                                        >
                                            {opt.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className="flex flex-col gap-2">
                                <span className="text-base text-neutral-700 dark:text-neutral-200 mb-1">Line Spacing</span>
                                <div className="flex gap-2">
                                    {LINE_SPACING_OPTIONS.map(opt => (
                                        <button
                                            key={opt.value}
                                            onClick={() => handleLineSpacing(opt.value)}
                                            className={`px-4 py-2 rounded-lg font-medium border transition text-base focus:outline-none focus-visible:ring-2 focus-visible:ring-[#a259ff] ${lineSpacing === opt.value
                                                ? "bg-[#a259ff] dark:bg-[#c084fc] text-white border-[#a259ff] dark:border-[#c084fc]"
                                                : "bg-neutral-100 dark:bg-neutral-900 text-black dark:text-white border-neutral-200 dark:border-neutral-800 hover:bg-[#f3eaff] dark:hover:bg-[#23232b]"
                                                }`}
                                            aria-pressed={lineSpacing === opt.value}
                                        >
                                            {opt.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </section>
            </div>
        </main>
    );
} 