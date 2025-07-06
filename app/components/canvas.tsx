"use client";

import { useState, useEffect, useRef } from "react";

// 5s, 10s, 15s
const DELAY_OPTIONS = [5000, 10000, 15000];

export default function Canvas() {
    const [title, setTitle] = useState("")
    const [text, setText] = useState("")
    const [thought, setThought] = useState<string | null>(null)
    const [showToast, setShowToast] = useState(false)
    const [delay, setDelay] = useState(DELAY_OPTIONS[0])
    const autoTriggered = useRef(false)
    const inactivityTimer = useRef<NodeJS.Timeout | null>(null)

    async function handleGenerateThought() {
        if (!title.trim() || !text.trim()) return;

        try {
            const res = await fetch(`/api/generate-thought?title=${encodeURIComponent(title)}&text=${encodeURIComponent(text)}`);
            const data = await res.json();
            setThought(data.thought || "No thought generated.");
            setShowToast(true);
            setTimeout(() => setShowToast(false), 4000);
        } catch {
            setThought("Failed to generate thought.");
            setShowToast(true);
            setTimeout(() => setShowToast(false), 4000);
        }
    }

    // reset inactivity timer on input change
    useEffect(() => {
        if (autoTriggered.current) return;
        if (inactivityTimer.current) clearTimeout(inactivityTimer.current);
        if (!title.trim() || !text.trim()) return;

        inactivityTimer.current = setTimeout(() => {
            if (!autoTriggered.current) {
                autoTriggered.current = true;
                handleGenerateThought();
            }
        }, delay);
        return () => {
            if (inactivityTimer.current) clearTimeout(inactivityTimer.current);
        };
    }, [title, text, delay]);

    // reset auto-trigger if user edits after auto-generation
    useEffect(() => {
        if (autoTriggered.current && (title.trim() === "" || text.trim() === "")) {
            autoTriggered.current = false;
        }
    }, [title, text]);

    return (
        <main className="fixed inset-0 min-h-screen min-w-full bg-white flex items-center justify-center">
            {showToast && thought && (
                <div
                    className="fixed top-4 left-4 z-50 bg-white text-black px-6 py-3 rounded shadow border border-neutral-200 animate-fade-in min-w-[200px] max-w-xs break-words"
                    role="status"
                    aria-live="polite"
                >
                    {thought}
                </div>
            )}

            <section
                className="w-full max-w-2xl min-h-[60vh] mx-4 p-8 flex flex-col gap-6 shadow-none rounded-none border-none bg-transparent"
                aria-label="Blank Canvas"
            >
                <div className="flex items-center gap-4 mb-2">
                    <span className="text-sm text-neutral-500">Auto-generate after</span>
                    <div className="flex gap-2">
                        {DELAY_OPTIONS.map(opt => (
                            <button
                                key={opt}
                                type="button"
                                onClick={() => {
                                    autoTriggered.current = false;
                                    setDelay(opt);
                                }}
                                className={`px-3 py-1 rounded transition text-sm font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400
                                    ${delay === opt ? "bg-neutral-800 text-white" : "bg-neutral-200 text-neutral-700 hover:bg-neutral-300"}`}
                                aria-pressed={delay === opt}
                                aria-label={`Set delay to ${opt / 1000} seconds`}
                            >
                                {opt / 1000}s
                            </button>
                        ))}
                    </div>
                </div>
                <input
                    type="text"
                    placeholder="Title"
                    value={title}
                    onChange={e => {
                        autoTriggered.current = false;
                        setTitle(e.target.value);
                    }}
                    className="text-3xl font-semibold bg-transparent outline-none placeholder:text-neutral-300 mb-2 border-none focus:ring-0 focus:border-none"
                    aria-label="Title"
                    autoFocus
                />
                <textarea
                    placeholder="Start writing your thoughts..."
                    value={text}
                    onChange={e => {
                        autoTriggered.current = false;
                        setText(e.target.value);
                    }}
                    className="flex-1 resize-none bg-transparent outline-none text-lg placeholder:text-neutral-300 border-none focus:ring-0 focus:border-none"
                    aria-label="Text"
                    rows={10}
                />
            </section>

            <style>{`
                .animate-fade-in {
                    animation: fadeIn 0.3s;
                }
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(-10px);}
                    to { opacity: 1; transform: translateY(0);}
                }
            `}</style>
        </main>
    );
}