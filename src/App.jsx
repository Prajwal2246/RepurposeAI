import React, { useState } from "react";
import {
  Search,
  Sparkles,
  Loader2,
  AlertCircle,
  Copy,
  Check,
  Globe,
  Type,
  TrendingUp,
  Zap,
  LayoutTemplate,
} from "lucide-react";

const GEMINI_KEY = import.meta.env.VITE_GEMINI_API_KEY;

const BrandIcon = ({ platform, className }) => {
  const icons = {
    LinkedIn: (
      <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
      </svg>
    ),
    Twitter: (
      <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
    YouTube: (
      <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
      </svg>
    ),
  };
  return icons[platform] || <Sparkles size={20} className={className} />;
};

const ResultCard = ({ title, badge, content, secondaryContent, platform, themeColor }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    const fullText = secondaryContent ? `${content}\n\n${secondaryContent}` : content;
    await navigator.clipboard.writeText(fullText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="group relative bg-white/70 backdrop-blur-xl rounded-3xl border border-white/50 p-7 flex flex-col h-full transition-all duration-300 hover:shadow-2xl hover:shadow-indigo-500/10 hover:-translate-y-1 hover:bg-white">
      <div className="flex justify-between items-start mb-6">
        <div className="flex items-center gap-4">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm transition-colors ${themeColor}`}>
            {platform === "SEO" ? <Search size={20} className="text-white" /> : <BrandIcon platform={platform} className="w-5 h-5 text-white" />}
          </div>
          <div>
            <h3 className="font-bold text-slate-800 text-base">{title}</h3>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{badge}</span>
          </div>
        </div>
        <button
          onClick={handleCopy}
          className="p-2.5 rounded-xl transition-all bg-slate-100/50 text-slate-400 hover:bg-indigo-600 hover:text-white active:scale-95"
        >
          {copied ? <Check size={16} /> : <Copy size={16} />}
        </button>
      </div>
      <div className="flex-grow flex flex-col">
        <div className="text-[14px] leading-relaxed text-slate-600 font-medium mb-6 whitespace-pre-wrap">{content}</div>
        {secondaryContent && (
          <div className="mt-auto p-4 bg-slate-50/80 rounded-2xl border border-slate-100 text-xs text-slate-500">
            <div className="flex items-center gap-2 mb-2 text-indigo-500 font-bold text-[10px] uppercase tracking-wider">
              <Zap size={12} /> Strategy Note
            </div>
            <div className="italic leading-relaxed">{secondaryContent}</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default function App() {
  const [url, setUrl] = useState("");
  const [manualText, setManualText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [results, setResults] = useState(null);
  const [activeTab, setActiveTab] = useState("url");

  const parseHtml = (html) => {
    const doc = new DOMParser().parseFromString(html, "text/html");
    const noiseSelectors = "script, style, nav, footer, header, aside, .sidebar, #comments, .ads, noscript";
    doc.querySelectorAll(noiseSelectors).forEach((el) => el.remove());

    const selectors = ["article", "main", "[role='main']", ".post-content", ".article-body", "#content"];
    let mainElement = null;

    for (const selector of selectors) {
      const found = doc.querySelector(selector);
      if (found && found.innerText.trim().length > 500) {
        mainElement = found;
        break;
      }
    }

    if (!mainElement) {
      const divs = Array.from(doc.querySelectorAll("div"));
      mainElement = divs.reduce((prev, curr) => {
        const prevPCount = prev?.querySelectorAll("p").length || 0;
        const currPCount = curr.querySelectorAll("p").length;
        return currPCount > prevPCount ? curr : prev;
      }, doc.body);
    }

    const text = mainElement.innerText
      .replace(/\s+/g, " ")
      .replace(/\n\s*\n/g, "\n")
      .trim();

    if (text.length < 100) throw new Error("Content too short.");
    return { success: true, content: text.slice(0, 6000) };
  };

  const extractContentFromUrl = async (targetUrl) => {
    try {
      const res = await fetch(`/api/scrape?url=${encodeURIComponent(targetUrl)}`);
      if (res.ok) {
        const html = await res.text();
        return parseHtml(html);
      }
    } catch (e) {
      console.warn(e);
    }

    try {
      const res = await fetch(`https://corsproxy.io/?${encodeURIComponent(targetUrl)}`);
      if (!res.ok) throw new Error("Both proxies failed.");
      const html = await res.text();
      return parseHtml(html);
    } catch (err) {
      return { success: false, error: "Could not extract content. Security blocking active." };
    }
  };

  const generateRepurposedContent = async (text) => {
    const SYSTEM_INSTRUCTION = `
    You are a world-class Social Media Ghostwriter. 
    Your goal is to repurpose technical or long-form content into high-engagement social assets.
    
    ### NEGATIVE CONSTRAINTS (DO NOT USE):
    - NO generic openings: "In today's digital landscape," "Have you ever wondered," "Unlock your potential."
    - NO corporate jargon: "synergy," "tapestry," "delve," "game-changer," "leverage."
    - NO emojis in the middle of sentences.
    - NO exclamation marks in LinkedIn hooks.
    
    ### WRITING STYLE:
    - LinkedIn: Use "The Hook, The Meat, The Re-hook." Start with a punchy 1-sentence statement. Use frequent line breaks. Tone: Authoritative yet accessible.
    - Twitter: High-tension hooks. Focus on "contrarian truth" or "curated list."
    - SEO: No-nonsense, 155 characters max, focus on intent.
  `;

    const prompt = `
    TASK: Analyze the provided CONTENT and generate:
    1. 3 LinkedIn posts (Different angles: contrarian, educational, storytelling).
    2. 3 Twitter hooks (Different framings: the "how-to", the "warning", the "listicle").
    3. 1 Meta Description.
    4. 1 YouTube Video Strategy (Title and 2-sentence hook).

    RETURN ONLY VALID JSON:
    {
      "linkedinPosts": [{"angle": "...", "content": "..."}],
      "twitterHooks": [{"framing": "...", "content": "..."}],
      "metaDescription": "...",
      "videoScript": {"title": "...", "description": "..."}
    }

    CONTENT: ${text}
  `;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: `${SYSTEM_INSTRUCTION}\n\n${prompt}` }] }],
          generationConfig: { responseMimeType: "application/json", temperature: 0.8 },
        }),
      }
    );

    const json = await response.json();
    return JSON.parse(json.candidates[0].content.parts[0].text);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const result = activeTab === "url" ? await extractContentFromUrl(url) : { success: true, content: manualText };
      
      if (!result.success) throw new Error(result.error);
      if (!result.content || result.content.length < 50) throw new Error("Content too short to repurpose.");
      
      const data = await generateRepurposedContent(result.content);
      setResults(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 selection:bg-indigo-100 selection:text-indigo-700 font-sans">
      <div className="w-full h-full p-6 md:p-12 max-w-7xl mx-auto">
        
        <header className="flex flex-col items-center text-center mb-16 pt-8 animate-in fade-in slide-in-from-top-4 duration-700">
          <div className="flex items-center gap-3 px-4 py-1.5 bg-white border border-slate-200 rounded-full shadow-sm mb-6">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-[11px] font-bold tracking-widest text-slate-500 uppercase">Vibe Coder v1.0</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-[800] tracking-tight text-slate-900 mb-6">
            Repurpose<span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600">.ai</span>
          </h1>
          <p className="text-slate-500 font-medium text-lg md:text-xl max-w-2xl leading-relaxed">
            Stop rewriting content manually. Turn one URL into a full week of high-performance social assets in seconds.
          </p>
        </header>

        <div className="max-w-3xl mx-auto mb-20">
          <div className="bg-white rounded-[32px] p-2 shadow-xl shadow-indigo-100/50 border border-slate-100">
            <div className="flex p-1 bg-slate-100/50 rounded-[24px] mb-2">
              {[["url", Globe, "URL Import"], ["text", Type, "Paste Text"]].map(([id, Icon, label]) => (
                <button
                  key={id}
                  onClick={() => setActiveTab(id)}
                  className={`flex-1 flex items-center justify-center gap-2 py-4 rounded-[20px] text-sm font-bold transition-all duration-300 ${
                    activeTab === id 
                      ? "bg-white text-indigo-600 shadow-md ring-1 ring-black/5" 
                      : "text-slate-400 hover:text-slate-600 hover:bg-white/50"
                  }`}
                >
                  <Icon size={16} strokeWidth={2.5} /> {label}
                </button>
              ))}
            </div>

            <form onSubmit={handleSubmit} className="p-4 flex flex-col gap-4">
              <div className="relative group">
                {activeTab === "url" ? (
                  <input
                    type="url"
                    placeholder="Paste your blog post URL here..."
                    className="w-full bg-slate-50 hover:bg-slate-50/80 focus:bg-white text-slate-800 p-6 rounded-2xl outline-none border-2 border-transparent focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all font-medium placeholder:text-slate-400"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    required
                  />
                ) : (
                  <textarea
                    placeholder="Paste your raw content here..."
                    className="w-full bg-slate-50 hover:bg-slate-50/80 focus:bg-white text-slate-800 p-6 rounded-2xl min-h-[160px] outline-none border-2 border-transparent focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all font-medium placeholder:text-slate-400 resize-none"
                    value={manualText}
                    onChange={(e) => setManualText(e.target.value)}
                    required
                  />
                )}
                {activeTab === "url" && (
                   <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-slate-300">
                     <LayoutTemplate size={20} />
                   </div>
                )}
              </div>

              <button
                disabled={loading}
                className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white p-6 rounded-2xl font-bold text-lg tracking-wide shadow-lg shadow-indigo-200/50 transition-all active:scale-[0.99] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-3"
              >
                {loading ? <Loader2 className="animate-spin" /> : <Sparkles fill="white" size={20} />}
                {loading ? "Generating Assets..." : "Generate Magic"}
              </button>
            </form>
          </div>

          {error && (
            <div className="mt-6 p-4 bg-rose-50 border border-rose-100 text-rose-600 rounded-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
              <AlertCircle size={20} />
              <span className="font-semibold text-sm">{error}</span>
            </div>
          )}
        </div>

        {results && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-20 animate-in fade-in slide-in-from-bottom-8 duration-700">
            {results.linkedinPosts.map((p, i) => (
              <ResultCard key={`li-${i}`} title="LinkedIn" badge={p.angle} content={p.content} platform="LinkedIn" themeColor="bg-[#0077B5]" />
            ))}
            {results.twitterHooks.map((h, i) => (
              <ResultCard key={`tw-${i}`} title="X / Twitter" badge={h.framing} content={h.content} platform="Twitter" themeColor="bg-slate-900" />
            ))}
            <ResultCard title="SEO Meta" badge="Optimization" content={results.metaDescription} platform="SEO" themeColor="bg-emerald-500" />
            <ResultCard title="YouTube" badge="Video Strategy" content={results.videoScript.title} secondaryContent={results.videoScript.description} platform="YouTube" themeColor="bg-red-600" />
          </div>
        )}
      </div>
    </div>
  );
}