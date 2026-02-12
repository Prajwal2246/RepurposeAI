import React, { useState } from "react";
import {
  Search,
  Sparkles,
  ArrowRight,
  Loader2,
  AlertCircle,
  Copy,
  Check,
  Globe,
  Type,
  TrendingUp,
} from "lucide-react";

const GEMINI_KEY = import.meta.env.VITE_GEMINI_API_KEY;

/** * 1. BRAND SVG ICONS (Official Paths)
 */
const BrandIcon = ({ platform, className }) => {
  const icons = {
    LinkedIn: (
      <svg viewBox="0 0 24 24" fill="white" className={className}>
        <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
      </svg>
    ),
    Twitter: (
      <svg viewBox="0 0 24 24" fill="white" className={className}>
        {/* Modern X (Twitter) Logo Path */}
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
    YouTube: (
      <svg viewBox="0 0 24 24" fill="white" className={className}>
        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
      </svg>
    ),
  };
  return icons[platform] || <Sparkles size={20} className={className} />;
};

/** * 2. RESULT CARD COMPONENT
 */
const ResultCard = ({
  title,
  badge,
  content,
  secondaryContent,
  platform,
  colorClass,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    const fullText = secondaryContent
      ? `${content}\n\n${secondaryContent}`
      : content;
    await navigator.clipboard.writeText(fullText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-white rounded-[28px] border border-slate-200 p-6 flex flex-col h-full transition-all duration-300 hover:shadow-2xl hover:border-indigo-200 group">
      <div className="flex justify-between items-start mb-6">
        <div className="flex items-center gap-4">
          <div
            className={`p-3 rounded-2xl ${colorClass} bg-opacity-10 text-opacity-100 flex items-center justify-center`}
          >
            <div className={colorClass.replace("bg-", "text-")}>
              {platform === "SEO" ? (
                <Search size={22} fill="lightblue" />
              ) : (
                <BrandIcon platform={platform} className="w-5 h-5 " />
              )}
            </div>
          </div>
          <div>
            <h3 className="font-bold text-slate-800 text-[15px]">{title}</h3>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.1em]">
              {badge}
            </span>
          </div>
        </div>
        <button
          onClick={handleCopy}
          className="p-2.5 rounded-xl transition-all bg-slate-50 hover:bg-indigo-600 text-slate-400 hover:text-white"
        >
          {copied ? <Check size={16} /> : <Copy size={16} />}
        </button>
      </div>

      <div className="flex-grow flex flex-col">
        <div className="text-[14px] leading-relaxed text-slate-600 whitespace-pre-wrap font-medium mb-4">
          {content}
        </div>
        {secondaryContent && (
          <div className="mt-auto p-4 bg-slate-50 rounded-2xl border border-slate-100 text-[12px] text-slate-500 italic leading-snug">
            <span className="block font-bold text-[10px] text-slate-400 uppercase mb-1 not-italic tracking-wider">
              Video Concept:
            </span>
            {secondaryContent}
          </div>
        )}
      </div>
    </div>
  );
};

/** * 3. MAIN APP
 */
export default function App() {
  const [url, setUrl] = useState("");
  const [manualText, setManualText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [results, setResults] = useState(null);
  const [activeTab, setActiveTab] = useState("url");

  const extractContentFromUrl = async (targetUrl) => {
    try {
      const res = await fetch(
        `/api/proxy?url=${encodeURIComponent(targetUrl)}`,
      );

      // 1. Check if the proxy itself failed
      if (!res.ok) throw new Error(`Proxy error: ${res.status}`);

      const html = await res.text();
      const doc = new DOMParser().parseFromString(html, "text/html");

      // 1. Remove "Noise" elements immediately
      const noiseSelectors =
        "script, style, nav, footer, header, aside, .sidebar, #comments, .ads, noscript";
      doc.querySelectorAll(noiseSelectors).forEach((el) => el.remove());

      // 2. Targeted Selection (The Hierarchy of Truth)
      // We look for the most likely container of the actual content
      const selectors = [
        "article",
        "main",
        "[role='main']",
        ".post-content",
        ".article-body",
        "#content",
      ];

      let mainElement = null;
      for (const selector of selectors) {
        const found = doc.querySelector(selector);
        // Ensure the found element actually has significant text
        if (found && found.innerText.trim().length > 500) {
          mainElement = found;
          break;
        }
      }

      // 3. Fallback: If no semantic tags, find the div with the most paragraph text
      if (!mainElement) {
        const divs = Array.from(doc.querySelectorAll("div"));
        mainElement = divs.reduce((prev, curr) => {
          const prevPCount = prev?.querySelectorAll("p").length || 0;
          const currPCount = curr.querySelectorAll("p").length;
          return currPCount > prevPCount ? curr : prev;
        }, doc.body);
      }

      // 4. Clean up the resulting text
      const text = mainElement.innerText
        .replace(/\s+/g, " ") // Collapse whitespace
        .replace(/\n\s*\n/g, "\n") // Remove empty lines
        .trim();

      if (text.length < 100)
        throw new Error("Could not find meaningful content.");

      return { success: true, content: text.slice(0, 6000) }; // Slightly higher limit for better AI context
    } catch (err) {
      return {
        success: false,
        error:
          "Website blocked reading or no content found. Please paste text instead.",
      };
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
    - NO hashtag stuffing (max 3 at the very end).
    
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

    // Combine instructions for the model
    const fullPrompt = `${SYSTEM_INSTRUCTION}\n\n${prompt}`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: fullPrompt }] }],
          generationConfig: {
            responseMimeType: "application/json",
            temperature: 0.8, // Slightly higher for more "human" creative variance
          },
        }),
      },
    );

    const json = await response.json();
    return JSON.parse(json.candidates[0].content.parts[0].text);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const text =
        activeTab === "url"
          ? (await extractContentFromUrl(url)).content
          : manualText;
      if (!text || text.length < 50)
        throw new Error("Content too short to repurpose.");
      const data = await generateRepurposedContent(text);
      setResults(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFDFD] text-slate-900 font-sans p-6 md:p-12">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <header className="flex flex-col items-center text-center mb-16 animate-in fade-in duration-700">
          <div className="w-14 h-14 bg-indigo-600 rounded-[20px] flex items-center justify-center text-white mb-8 shadow-2xl shadow-indigo-200 ring-4 ring-indigo-50">
            <Sparkles size={28} />
          </div>
          <h1 className="text-6xl font-[1000] tracking-tighter mb-4 text-slate-900">
            Repurpose<span className="text-indigo-600">.ai</span>
          </h1>
          <p className="text-slate-400 font-medium text-lg max-w-xl leading-relaxed">
            Turn one article into a full week of high-performance social
            content.
          </p>
        </header>

        {/* Input Card */}
        <div className="max-w-2xl mx-auto bg-white rounded-[36px] p-5 shadow-[0_40px_100px_-20px_rgba(0,0,0,0.08)] border border-slate-100 mb-20">
          <div className="flex bg-slate-50 rounded-[24px] p-1.5 mb-6">
            {[
              ["url", Globe, "WEBSITE LINK"],
              ["text", Type, "RAW TEXT"],
            ].map(([id, Icon, label]) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`flex-1 flex items-center justify-center gap-2 py-3.5 rounded-[18px] text-[11px] font-black tracking-widest transition-all ${activeTab === id ? "bg-white text-indigo-600 shadow-sm" : "text-slate-400 hover:text-slate-600"}`}
              >
                <Icon size={14} /> {label}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-5 px-2 pb-2">
            {activeTab === "url" ? (
              <input
                type="url"
                placeholder="https://yourblog.com/post"
                className="w-full p-5 bg-slate-50 rounded-[22px] outline-none focus:ring-4 focus:ring-indigo-50/50 border-2 border-transparent focus:border-indigo-500 transition-all font-medium text-sm"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                required
              />
            ) : (
              <textarea
                placeholder="Paste text here..."
                className="w-full p-5 bg-slate-50 rounded-[22px] min-h-[160px] outline-none focus:ring-4 focus:ring-indigo-50/50 border-2 border-transparent focus:border-indigo-500 transition-all font-medium text-sm"
                value={manualText}
                onChange={(e) => setManualText(e.target.value)}
                required
              />
            )}
            <button
              disabled={loading}
              className="w-full bg-indigo-600 text-white font-bold py-5 rounded-[22px] hover:bg-indigo-700 transition-all flex items-center justify-center gap-3 disabled:opacity-50 shadow-xl shadow-indigo-100 active:scale-[0.98]"
            >
              {loading ? (
                <Loader2 className="animate-spin" />
              ) : (
                <TrendingUp size={20} />
              )}
              {loading ? "AI IS WORKING..." : "GENERATE CONTENT ASSETS"}
            </button>
          </form>
          {error && (
            <div className="mx-2 mt-4 p-4 bg-rose-50 text-rose-600 rounded-2xl text-[12px] font-bold flex items-center gap-3 border border-rose-100 animate-bounce">
              <AlertCircle size={16} />
              {error}
            </div>
          )}
        </div>

        {/* Results Grid */}
        {results && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-in fade-in slide-in-from-bottom-10 duration-1000">
            {results.linkedinPosts.map((p, i) => (
              <ResultCard
                key={`li-${i}`}
                title="LinkedIn"
                badge={p.angle}
                content={p.content}
                platform="LinkedIn"
                colorClass="bg-[#0077B5]"
              />
            ))}
            {results.twitterHooks.map((h, i) => (
              <ResultCard
                key={`tw-${i}`}
                title="X / Twitter"
                badge={h.framing}
                content={h.content}
                platform="Twitter"
                colorClass="bg-[#000000]"
              />
            ))}
            <ResultCard
              title="SEO Meta"
              badge="Optimization"
              content={results.metaDescription}
              platform="SEO"
              colorClass="bg-[#10B981]"
            />
            <ResultCard
              title="YouTube"
              badge="Strategy"
              content={results.videoScript.title}
              secondaryContent={results.videoScript.description}
              platform="YouTube"
              colorClass="bg-[#FF0000]"
            />
          </div>
        )}
      </div>
    </div>
  );
}
