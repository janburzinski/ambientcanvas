"use client";
import { Brain, ChevronDown, Clock } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

const PAGE_CHAR_LIMIT = 1800; // Approximate, can be tuned for your layout
const LINE_HEIGHT_REM = 2.25;
const MAX_LINES = 32; // For a typical A4-like page
const AI_HELP_OPTIONS = [
    { label: "After 5s", value: 5000 },
    { label: "After 10s", value: 10000 },
    { label: "After 30s", value: 30000 },
];
const AUTOSAVE_INTERVAL = 10000; // ms

const AI_MODELS = [
    { label: "GPT-4", value: "gpt-4", disabled: true },
    { label: "GPT-3.5 Turbo", value: "gpt-3.5-turbo", disabled: false },
    { label: "Claude 3 Opus", value: "claude-3-opus", disabled: true },
    { label: "Claude 3 Sonnet", value: "claude-3-sonnet", disabled: false },
    { label: "Gemini 1.5 Pro", value: "gemini-1.5-pro", disabled: true },
    { label: "Llama 3 70B", value: "llama-3-70b", disabled: false },
    { label: "Mixtral 8x22B", value: "mixtral-8x22b", disabled: false },
];

// Helper to get the model label with icon
function ModelLabelWithIcon({ label, showIcon }: { label: string, showIcon?: boolean }) {
    return (
        <span className="flex items-center gap-1">
            {showIcon && <Brain size={16} className="text-[#a259ff] dark:text-[#c084fc]" />}
            {label}
        </span>
    );
}

export default function WritingCanvas() {
    const [pages, setPages] = useState([
        { header: '', text: '' }
    ]);
    const [currentPage, setCurrentPage] = useState(0);
    const [thought, setThought] = useState<string | null>(null);
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState<string | null>(null);
    const [showLineNumbers, setShowLineNumbers] = useState(false);
    const autoTriggered = useRef(false);
    const [aiHelpDelay, setAiHelpDelay] = useState(AI_HELP_OPTIONS[0].value);
    const [aiThinking, setAiThinking] = useState(false);
    const aiTimeout = useRef<NodeJS.Timeout | null>(null);
    const [supportOpen, setSupportOpen] = useState(false);
    const [supportForm, setSupportForm] = useState({ name: '', email: '', message: '' });
    const [supportSent, setSupportSent] = useState(false);
    const [askAiOpen, setAskAiOpen] = useState(false);
    const [aiQuestion, setAiQuestion] = useState("");
    const [aiAnswer, setAiAnswer] = useState("");
    const [aiLoading, setAiLoading] = useState(false);
    const [aiChat, setAiChat] = useState<{ role: 'user' | 'ai', content: string }[]>([]);
    const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
    const [focusMode, setFocusMode] = useState(false);
    const textareaRef = useRef<HTMLTextAreaElement | null>(null);
    const [aiTimingPopoverOpen, setAiTimingPopoverOpen] = useState(false);
    const [hoveredButton, setHoveredButton] = useState<string | null>(null);
    const [modelPopoverOpen, setModelPopoverOpen] = useState(false);
    const [selectedModel, setSelectedModel] = useState(AI_MODELS.find(m => !m.disabled)?.value || "gpt-3.5-turbo");
    const [aiTimingAnchor, setAiTimingAnchor] = useState<HTMLElement | null>(null);
    const [modelAnchor, setModelAnchor] = useState<HTMLElement | null>(null);

    // Word and page count
    const totalWords = pages.reduce((acc, p) => acc + (p.text.trim().split(/\s+/).filter(Boolean).length), 0);
    const pageCount = pages.length;

    // Handle text change and auto-paging
    function handleTextChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
        const newText = e.target.value;
        let newPages = [...pages];
        // Prevent typing beyond the page limit
        if (newText.length > PAGE_CHAR_LIMIT) {
            newPages[currentPage].text = newText.slice(0, PAGE_CHAR_LIMIT);
        } else {
            newPages[currentPage].text = newText;
        }
        setPages(newPages);
        // Auto-scroll to caret
        setTimeout(() => {
            if (textareaRef.current) {
                const textarea = textareaRef.current;
                const caret = textarea.selectionStart;
                // Only scroll if caret is near the bottom
                const lineHeight = parseFloat(getComputedStyle(textarea).lineHeight || '24');
                const lines = textarea.value.substr(0, caret).split("\n").length;
                const visibleLines = Math.floor(textarea.clientHeight / lineHeight);
                if (lines > visibleLines - 2) {
                    textarea.scrollTop = textarea.scrollHeight;
                }
            }
        }, 0);
        // AI help timer logic
        if (aiTimeout.current) clearTimeout(aiTimeout.current);
        setAiThinking(false);
        aiTimeout.current = setTimeout(() => {
            setAiThinking(true);
            handleGenerateThought().finally(() => setAiThinking(false));
        }, aiHelpDelay);
    }

    function handleHeaderChange(e: React.ChangeEvent<HTMLInputElement>) {
        const newHeader = e.target.value;
        let newPages = [...pages];
        newPages[currentPage].header = newHeader;
        setPages(newPages);
    }

    function goToPage(idx: number) {
        if (idx >= 0 && idx < pages.length) setCurrentPage(idx);
    }

    async function handleGenerateThought() {
        const title = pages[currentPage].header;
        const text = pages[currentPage].text;
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

    function addNewPage() {
        setPages(prev => [...prev, { header: '', text: '' }]);
        setCurrentPage(pages.length); // Go to the new page
    }

    // Keyboard shortcut for Ask AI (CMD+K or CTRL+K)
    useEffect(() => {
        function handleKey(e: KeyboardEvent) {
            if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
                e.preventDefault();
                setAskAiOpen(true);
            }
        }
        window.addEventListener("keydown", handleKey);
        return () => window.removeEventListener("keydown", handleKey);
    }, []);

    // Clear timer on unmount or page change
    useEffect(() => {
        return () => {
            if (aiTimeout.current) clearTimeout(aiTimeout.current);
        };
    }, [currentPage, aiHelpDelay]);

    // Auto-save effect
    useEffect(() => {
        if (!pages[currentPage].text) return;
        const interval = setInterval(() => {
            setSaveStatus('saving');
            // Simulate save (replace with real API call if needed)
            setTimeout(() => {
                setSaveStatus('saved');
                setTimeout(() => setSaveStatus('idle'), 2000);
            }, 1200);
        }, AUTOSAVE_INTERVAL);
        return () => clearInterval(interval);
    }, [pages, currentPage]);

    // Focus mode: hide toolbar, sidebar, overlays
    useEffect(() => {
        if (!focusMode) return;
        function handleEsc(e: KeyboardEvent) {
            if (e.key === "Escape") setFocusMode(false);
        }
        window.addEventListener("keydown", handleEsc);
        return () => window.removeEventListener("keydown", handleEsc);
    }, [focusMode]);

    // Close popovers when clicking outside
    useEffect(() => {
        function handleClick(e: MouseEvent) {
            setAiTimingPopoverOpen(false);
            setModelPopoverOpen(false);
        }
        if (aiTimingPopoverOpen || modelPopoverOpen) {
            window.addEventListener('click', handleClick);
            return () => window.removeEventListener('click', handleClick);
        }
    }, [aiTimingPopoverOpen, modelPopoverOpen]);

    function showCustomToast(message: string) {
        setToastMessage(message);
        setShowToast(true);
        setTimeout(() => setShowToast(false), 2500);
    }

    return (
        <main className="fixed inset-0 min-h-screen min-w-full flex flex-col items-center justify-start bg-gradient-to-br from-neutral-100/80 via-white/60 to-blue-50/60 dark:from-neutral-900/90 dark:via-neutral-950/80 dark:to-[#18181b] transition-colors duration-300">
            {showToast && toastMessage && !focusMode && (
                <div className="fixed top-4 right-6 z-[9999] bg-white/80 dark:bg-neutral-900/90 text-black dark:text-white px-6 py-3 rounded-xl shadow-lg border border-neutral-200 dark:border-neutral-800 animate-fade-in min-w-[200px] max-w-xs break-words font-sans backdrop-blur-md" role="status" aria-live="polite">
                    {toastMessage}
                </div>
            )}
            {showToast && thought && !focusMode && !toastMessage && (
                <div className="fixed top-4 right-6 z-[9999] bg-white/80 dark:bg-neutral-900/90 text-black dark:text-white px-6 py-3 rounded-xl shadow-lg border border-neutral-200 dark:border-neutral-800 animate-fade-in min-w-[200px] max-w-xs break-words font-sans backdrop-blur-md" role="status" aria-live="polite">
                    {thought}
                </div>
            )}
            {/* Focus mode overlay: blur everything except the canvas */}
            {focusMode && (
                <div
                    className="fixed inset-0 z-[1000] pointer-events-auto backdrop-blur-[8px] bg-black/10 transition-all duration-300 animate-fade-in"
                    aria-hidden="true"
                    onClick={() => setFocusMode(false)}
                />
            )}
            <section
                className="w-full flex-1 flex flex-col items-center justify-start px-2 sm:px-4 py-8"
                aria-label="Writing Canvas"
                style={{ minHeight: '100vh' }}
            >
                {/* Centered Toolbar, matches canvas width */}
                {!focusMode && (
                    <div className="w-full flex justify-center mb-6">
                        <div className="w-[min(100vw,794px)] max-w-full">
                            <div className="bg-white/70 dark:bg-neutral-900/80 backdrop-blur-md border border-neutral-200 dark:border-neutral-800 shadow-lg flex items-center px-6 py-3 rounded-2xl transition-all duration-300 gap-x-6">
                                {/* Left group: Page navigation */}
                                <div className="flex items-center gap-x-2">
                                    <button
                                        className="rounded-full p-2 hover:bg-neutral-100 transition disabled:opacity-40 disabled:cursor-not-allowed"
                                        onClick={() => goToPage(currentPage - 1)}
                                        disabled={currentPage === 0}
                                        aria-label="Previous page"
                                        title="Previous page"
                                    >
                                        <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M15 19l-7-7 7-7" /></svg>
                                    </button>
                                    <span className="text-sm font-semibold text-black dark:text-white bg-neutral-100 dark:bg-neutral-900 rounded px-3 py-1 select-none border border-neutral-200 dark:border-neutral-800" aria-live="polite" aria-atomic="true">
                                        Page {currentPage + 1} / {pages.length}
                                    </span>
                                    <button
                                        className="rounded-full p-2 hover:bg-neutral-100 transition disabled:opacity-40 disabled:cursor-not-allowed"
                                        onClick={() => goToPage(currentPage + 1)}
                                        disabled={currentPage === pages.length - 1}
                                        aria-label="Next page"
                                        title="Next page"
                                    >
                                        <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M9 5l7 7-7 7" /></svg>
                                    </button>
                                    <button
                                        className="rounded-full p-2 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-100 transition font-semibold shadow-sm ml-2"
                                        onClick={addNewPage}
                                        aria-label="Add new page"
                                        title="Add new page"
                                    >
                                        <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9" /><path d="M12 8v8M8 12h8" /></svg>
                                    </button>
                                </div>
                                {/* Divider */}
                                <div className="h-8 border-l border-neutral-200 dark:border-neutral-800 mx-4" />
                                {/* Right group: Utilities */}
                                <div className="flex items-center gap-x-2 relative">
                                    {/* AI Help Timing Popover Button */}
                                    <div className="relative">
                                        <button
                                            className="rounded-full p-2 hover:bg-neutral-100 dark:hover:bg-neutral-900 transition"
                                            onClick={e => {
                                                e.stopPropagation();
                                                setAiTimingPopoverOpen(v => !v);
                                                setModelPopoverOpen(false);
                                                setAiTimingAnchor(e.currentTarget);
                                            }}
                                            aria-label="AI help timing"
                                            title="AI help timing"
                                            onMouseEnter={() => setHoveredButton('ai-timing')}
                                            onMouseLeave={() => setHoveredButton(null)}
                                            onFocus={() => setHoveredButton('ai-timing')}
                                            onBlur={() => setHoveredButton(null)}
                                        >
                                            <Clock size={18} />
                                        </button>
                                        {hoveredButton === 'ai-timing' && (
                                            <div className="absolute left-1/2 -translate-x-1/2 top-12 z-50 bg-neutral-800 text-white text-xs rounded px-2 py-1 shadow pointer-events-none whitespace-nowrap" role="tooltip">
                                                AI Helper Timing
                                            </div>
                                        )}
                                        {aiTimingPopoverOpen && aiTimingAnchor && typeof window !== 'undefined' && createPortal(
                                            (() => {
                                                const rect = aiTimingAnchor.getBoundingClientRect();
                                                return (
                                                    <div
                                                        className="fixed z-[9999] bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl shadow-lg p-4 min-w-[180px] flex flex-col gap-2 animate-fade-in"
                                                        style={{
                                                            top: rect.bottom + 8,
                                                            left: rect.left,
                                                            background: 'white',
                                                            backgroundColor: 'white',
                                                        }}
                                                        onClick={e => e.stopPropagation()}
                                                    >
                                                        <div className="text-xs font-semibold text-neutral-800 dark:text-neutral-100 mb-2">AI Help Timing</div>
                                                        {AI_HELP_OPTIONS.map(opt => (
                                                            <button
                                                                key={opt.value}
                                                                className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition ${aiHelpDelay === opt.value ? 'bg-[#a259ff] dark:bg-[#c084fc] text-white' : 'hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-800 dark:text-neutral-100'}`}
                                                                onClick={() => { setAiHelpDelay(opt.value); setAiTimingPopoverOpen(false); showCustomToast(`AI Helper Timing set to ${opt.label}`); }}
                                                                aria-pressed={aiHelpDelay === opt.value}
                                                            >
                                                                {opt.label}
                                                            </button>
                                                        ))}
                                                    </div>
                                                );
                                            })(),
                                            document.body
                                        )}
                                    </div>
                                    <div className="relative">
                                        <button
                                            className="rounded-full p-2 hover:bg-neutral-100 transition"
                                            onClick={() => setAskAiOpen(true)}
                                            aria-label="Ask AI (Cmd/Ctrl+K)"
                                            title="Ask AI (Cmd/Ctrl+K)"
                                            onMouseEnter={() => setHoveredButton('ask-ai')}
                                            onMouseLeave={() => setHoveredButton(null)}
                                            onFocus={() => setHoveredButton('ask-ai')}
                                            onBlur={() => setHoveredButton(null)}
                                        >
                                            <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="4" /><path d="M8 9h8M8 13h6" /></svg>
                                        </button>
                                        {hoveredButton === 'ask-ai' && (
                                            <div className="absolute left-1/2 -translate-x-1/2 top-12 z-50 bg-neutral-800 text-white text-xs rounded px-2 py-1 shadow pointer-events-none whitespace-nowrap" role="tooltip">
                                                Ask AI (Cmd/Ctrl+K)
                                            </div>
                                        )}
                                    </div>
                                    <div className="relative">
                                        <button
                                            className={`rounded-full p-2 ${showLineNumbers ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200' : 'hover:bg-neutral-100'} transition`}
                                            onClick={() => setShowLineNumbers(v => !v)}
                                            aria-label="Toggle line numbers"
                                            title="Toggle line numbers"
                                            onMouseEnter={() => setHoveredButton('line-numbers')}
                                            onMouseLeave={() => setHoveredButton(null)}
                                            onFocus={() => setHoveredButton('line-numbers')}
                                            onBlur={() => setHoveredButton(null)}
                                        >
                                            <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" /></svg>
                                        </button>
                                        {hoveredButton === 'line-numbers' && (
                                            <div className="absolute left-1/2 -translate-x-1/2 top-12 z-50 bg-neutral-800 text-white text-xs rounded px-2 py-1 shadow pointer-events-none whitespace-nowrap" role="tooltip">
                                                Toggle line numbers
                                            </div>
                                        )}
                                    </div>
                                    <div className="relative">
                                        <button
                                            className={`rounded-full p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition ${focusMode ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200' : ''}`}
                                            onClick={() => setFocusMode(v => !v)}
                                            aria-label="Toggle focus mode"
                                            title="Toggle focus mode"
                                            onMouseEnter={() => setHoveredButton('focus-mode')}
                                            onMouseLeave={() => setHoveredButton(null)}
                                            onFocus={() => setHoveredButton('focus-mode')}
                                            onBlur={() => setHoveredButton(null)}
                                        >
                                            <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="4" y="4" width="16" height="16" rx="4" /><path d="M9 9h6v6H9z" /></svg>
                                        </button>
                                        {hoveredButton === 'focus-mode' && (
                                            <div className="absolute left-1/2 -translate-x-1/2 top-12 z-50 bg-neutral-800 text-white text-xs rounded px-2 py-1 shadow pointer-events-none whitespace-nowrap" role="tooltip">
                                                Toggle focus mode
                                            </div>
                                        )}
                                    </div>
                                    {/* Model Selector Popover Button */}
                                    <div className="relative">
                                        <button
                                            className="rounded-full px-3 py-2 flex items-center gap-1 border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-sm font-medium transition"
                                            onClick={e => {
                                                e.stopPropagation();
                                                setModelPopoverOpen(v => !v);
                                                setAiTimingPopoverOpen(false);
                                                setModelAnchor(e.currentTarget);
                                            }}
                                            aria-label="Select AI Model"
                                            title="Select AI Model"
                                            onMouseEnter={() => setHoveredButton('model')}
                                            onMouseLeave={() => setHoveredButton(null)}
                                            onFocus={() => setHoveredButton('model')}
                                            onBlur={() => setHoveredButton(null)}
                                        >
                                            <span className="truncate max-w-[120px]">
                                                <ModelLabelWithIcon label={AI_MODELS.find(m => m.value === selectedModel)?.label || "Select Model"} showIcon />
                                            </span>
                                            <ChevronDown size={16} />
                                        </button>
                                        {hoveredButton === 'model' && (
                                            <div className="absolute left-1/2 -translate-x-1/2 top-12 z-50 bg-neutral-800 text-white text-xs rounded px-2 py-1 shadow pointer-events-none whitespace-nowrap" role="tooltip">
                                                Select AI Model
                                            </div>
                                        )}
                                        {modelPopoverOpen && modelAnchor && typeof window !== 'undefined' && createPortal(
                                            (() => {
                                                const rect = modelAnchor.getBoundingClientRect();
                                                return (
                                                    <div
                                                        className="fixed z-[9999] bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl shadow-lg p-2 min-w-[180px] flex flex-col gap-1 animate-fade-in"
                                                        style={{
                                                            top: rect.bottom + 8,
                                                            left: rect.left,
                                                            background: 'white',
                                                            backgroundColor: 'white',
                                                        }}
                                                        onClick={e => e.stopPropagation()}
                                                    >
                                                        <div className="text-xs font-semibold text-neutral-800 dark:text-neutral-100 mb-2 px-2">AI Model</div>
                                                        {AI_MODELS.map(model => (
                                                            <button
                                                                key={model.value}
                                                                className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition flex items-center gap-2 ${selectedModel === model.value ? 'bg-[#a259ff] dark:bg-[#c084fc] text-white' : 'hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-800 dark:text-neutral-100'} ${model.disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                                                                onClick={() => { if (!model.disabled) { setSelectedModel(model.value); setModelPopoverOpen(false); showCustomToast(`Model changed to ${model.label}`); } }}
                                                                aria-pressed={selectedModel === model.value}
                                                                disabled={model.disabled}
                                                            >
                                                                <ModelLabelWithIcon label={model.label} showIcon={model.value === selectedModel} />
                                                                {model.disabled && <span className="ml-auto text-xs text-neutral-400">(Unavailable)</span>}
                                                            </button>
                                                        ))}
                                                    </div>
                                                );
                                            })(),
                                            document.body
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
                {/* Writing Area as A4 paper */}
                <div className="relative w-full flex justify-center px-2 sm:px-6 py-8 md:py-12 z-[1010]">
                    <div className="flex flex-col items-stretch bg-white/80 dark:bg-neutral-900/80 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-2xl mx-auto"
                        style={{
                            width: 'min(100vw, 794px)',
                            maxWidth: '100%',
                            aspectRatio: '210/297', // A4 ratio
                            height: 'auto',
                            minHeight: '60vh',
                        }}
                    >
                        <div className="flex-1 flex flex-row w-full gap-6 p-10 md:p-16">
                            {showLineNumbers && !focusMode && (
                                <div className="flex flex-col items-end pr-4 select-none text-xs text-neutral-300 font-mono pt-[2px]" style={{ minWidth: '2.5rem' }}>
                                    {Array.from({ length: MAX_LINES }).map((_, i) => (
                                        <span key={i} style={{ height: `${LINE_HEIGHT_REM}rem`, lineHeight: `${LINE_HEIGHT_REM}rem` }}>{i + 1}</span>
                                    ))}
                                </div>
                            )}
                            <div className="flex-1 flex flex-col gap-6 font-serif leading-relaxed text-lg text-neutral-900 dark:text-neutral-100 min-h-0">
                                <input
                                    type="text"
                                    placeholder="Untitled page"
                                    value={pages[currentPage].header}
                                    onChange={handleHeaderChange}
                                    className="text-4xl font-bold bg-transparent outline-none placeholder:text-neutral-300 dark:placeholder:text-neutral-600 border-none focus:ring-0 focus:border-none w-full px-0 mb-2 tracking-tight text-neutral-900 dark:text-neutral-100 font-sans"
                                    aria-label="Page header"
                                    style={{
                                        lineHeight: '2.8rem',
                                        height: '2.8rem',
                                        marginTop: 0,
                                        marginBottom: 0,
                                        paddingTop: 0,
                                        paddingBottom: 0,
                                    }}
                                    disabled={focusMode}
                                />
                                <textarea
                                    placeholder="Start writing your thoughts..."
                                    value={pages[currentPage].text}
                                    onChange={handleTextChange}
                                    className="flex-1 w-full resize-none bg-transparent outline-none placeholder:text-neutral-400 dark:placeholder:text-neutral-600 border-none focus:ring-0 focus:border-none px-0 text-xl font-serif leading-loose text-neutral-900 dark:text-neutral-100 min-h-0"
                                    aria-label="Text"
                                    rows={22}
                                    style={{
                                        background: 'none',
                                        lineHeight: '2.2rem',
                                        marginTop: 0,
                                        paddingTop: 0,
                                    }}
                                    disabled={focusMode && false}
                                    ref={textareaRef}
                                />
                            </div>
                        </div>
                        {/* Word/Page Count (sticky at bottom, always visible) */}
                        <div className="sticky bottom-0 flex justify-end w-full bg-transparent pt-4 mt-2 px-10 md:px-16">
                            <div className="text-xs text-neutral-500 dark:text-neutral-400 bg-white/80 dark:bg-neutral-900/80 px-4 py-2 rounded-full shadow font-sans select-none border border-neutral-200 dark:border-neutral-800">
                                {totalWords} words · {pageCount} page{pageCount !== 1 ? 's' : ''}
                            </div>
                        </div>
                    </div>
                </div>
                {/* Ask AI Modal */}
                {askAiOpen && (
                    <div className="fixed inset-0 z-[10000] flex items-end justify-center sm:items-center bg-black/30 dark:bg-black/60 backdrop-blur-sm">
                        <div className="relative w-full max-w-lg mx-auto bg-white/80 dark:bg-neutral-900/90 border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-fade-in-up" style={{ minHeight: '480px', maxHeight: '90vh' }}>
                            {/* Close button */}
                            <button type="button" onClick={() => setAskAiOpen(false)} className="absolute top-4 right-4 z-20 p-2 rounded-full text-black dark:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 focus:outline-none transition" aria-label="Close chat">
                                <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M18 6L6 18M6 6l12 12" /></svg>
                            </button>
                            {/* Chat area */}
                            <div className="flex-1 flex flex-col gap-4 px-6 pt-8 pb-4 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 120px)' }}>
                                {aiChat.length === 0 && (
                                    <div className="flex flex-col items-center justify-center h-full text-neutral-400 dark:text-neutral-500 select-none">
                                        <svg width="48" height="48" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" className="mb-2 text-[#a259ff] dark:text-[#c084fc]"><rect x="3" y="3" width="18" height="18" rx="4" /><path d="M8 9h8M8 13h6" /></svg>
                                        <div className="text-lg font-semibold mb-1">Ask anything…</div>
                                        <div className="text-sm">Get instant writing help, ideas, or feedback.</div>
                                    </div>
                                )}
                                {aiChat.map((msg, i) => (
                                    <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}>
                                        <div
                                            className={`max-w-[80%] px-5 py-3 rounded-2xl text-base leading-relaxed font-sans shadow-sm transition-all
                                                ${msg.role === 'user'
                                                    ? 'bg-[#a259ff] dark:bg-[#c084fc] text-white rounded-br-md'
                                                    : 'bg-white/80 dark:bg-neutral-800 text-black dark:text-white border border-neutral-200 dark:border-neutral-800 rounded-bl-md'}
                                            `}
                                            style={{ wordBreak: 'break-word' }}
                                        >
                                            {msg.content}
                                        </div>
                                    </div>
                                ))}
                                {aiLoading && (
                                    <div className="flex justify-start animate-fade-in">
                                        <div className="max-w-[80%] px-5 py-3 rounded-2xl bg-white/80 dark:bg-neutral-800 text-black dark:text-white border border-neutral-200 dark:border-neutral-800 shadow-sm font-sans rounded-bl-md">
                                            <span className="opacity-60">AI is typing…</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                            {/* Input area */}
                            <form
                                onSubmit={async (e) => {
                                    e.preventDefault();
                                    if (!aiQuestion.trim()) return;
                                    setAiChat([...aiChat, { role: 'user', content: aiQuestion }]);
                                    setAiLoading(true);
                                    setAiQuestion("");
                                    try {
                                        const res = await fetch("/api/generate-thought?title=Custom&text=" + encodeURIComponent(aiQuestion));
                                        const data = await res.json();
                                        setAiChat(chat => [...chat, { role: 'ai', content: data.thought || "No answer generated." }]);
                                    } catch {
                                        setAiChat(chat => [...chat, { role: 'ai', content: "Failed to get an answer." }]);
                                    }
                                    setAiLoading(false);
                                }}
                                className="flex items-center gap-2 px-6 py-5 border-t border-neutral-200 dark:border-neutral-800 bg-white/80 dark:bg-neutral-900/90 sticky bottom-0 font-sans"
                                style={{ zIndex: 2 }}
                            >
                                <input
                                    type="text"
                                    placeholder="Ask anything…"
                                    value={aiQuestion}
                                    onChange={e => setAiQuestion(e.target.value)}
                                    className="flex-1 text-base px-5 py-4 h-auto rounded-full font-sans bg-neutral-100 dark:bg-neutral-800 text-black dark:text-white border border-neutral-200 dark:border-neutral-800 placeholder:text-neutral-400 dark:placeholder:text-neutral-600 outline-none focus:ring-2 focus:ring-[#a259ff] dark:focus:ring-[#c084fc] transition"
                                    autoFocus
                                    disabled={aiLoading}
                                />
                                <button
                                    type="submit"
                                    className="rounded-full px-6 py-4 text-base font-semibold font-sans bg-[#a259ff] dark:bg-[#c084fc] text-white hover:bg-[#8b3dff] dark:hover:bg-[#a259ff] transition disabled:opacity-50"
                                    disabled={aiLoading || !aiQuestion.trim()}
                                    aria-label="Send"
                                >
                                    <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
                                </button>
                            </form>
                            <style>{`
                                .animate-fade-in-up { animation: fadeInUp 0.25s; }
                                @keyframes fadeInUp { from { opacity: 0; transform: translateY(24px);} to { opacity: 1; transform: translateY(0);} }
                                .animate-fade-in { opacity: 0; animation: fadeIn 0.2s forwards; }
                                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
                            `}</style>
                        </div>
                    </div>
                )}
            </section>
            <style>{`
                .animate-fade-in {
                    animation: fadeIn 0.4s;
                }
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(-6px);}
                    to { opacity: 1; transform: translateY(0);}
                }
            `}</style>
        </main>
    );
} 