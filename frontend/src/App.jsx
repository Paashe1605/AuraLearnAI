import { useState, useEffect, useRef } from 'react'
import mermaid from 'mermaid'
import ReactMarkdown from 'react-markdown'

// Default English UI Strings
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

const defaultUI = {
  headerTitle: "AuraLearn.",
  heroTitle: "Break the barrier of \nknowledge.",
  heroSubtitle: "Learn complex topics through curated videos, summarized and translated instantly by our AI Agents.",
  searchPlaceholder: "What do you want to learn today? (e.g. Agentic AI)",
  searchButton: "Vibe Learn",
  workingButton: "Agents Working...",
  originalSource: "Best Agent Picked YouTube Videos",
  watchOnYoutube: "Watch on YouTube",
  agentSummary: "Agent Summary & Insights",
  playAudio: "Listen Audio Summary",
  pauseAudio: "Pause Audio",
  diveDeeper: "Want to dive deeper?",
  exportNotebookLM: "Export Content"
};

// SVG Icons
const YoutubeLogo = () => (
  <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor" style={{ color: '#ff0000' }}>
    <path d="M21.582,6.186c-0.23-0.86-0.908-1.538-1.768-1.768C18.254,4,12,4,12,4S5.746,4,4.186,4.418c-0.86,0.23-1.538,0.908-1.768,1.768C2,7.746,2,12,2,12s0,4.254,0.418,5.814c0.23,0.86,0.908,1.538,1.768,1.768C5.746,20,12,20,12,20s6.254,0,7.814-0.418c0.86-0.23,1.538-0.908,1.768-1.768C22,16.254,22,12,22,12S22,7.746,21.582,6.186z M10,15.464V8.536L16,12L10,15.464z"/>
  </svg>
);

const AudioIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
    <path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path>
    <path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path>
  </svg>
);

const PauseIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="6" y="4" width="4" height="16"></rect>
    <rect x="14" y="4" width="4" height="16"></rect>
  </svg>
);

const NotebookLMIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{color: '#8b5cf6'}}>
    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
    <polyline points="10 2 10 13 7 16 10 16 2"></polyline>
  </svg>
);

const GeminiIcon = ({ className, style }) => (
  <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#4285f4', ...style }}>
    <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
  </svg>
);

const BrainIcon = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 1.98-3A2.5 2.5 0 0 1 9.5 2Z"/>
    <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-1.98-3A2.5 2.5 0 0 0 14.5 2Z"/>
  </svg>
);

const AtomIcon = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="1"/>
    <path d="M20.2 20.2c2.04-2.03.02-7.36-4.5-11.9-4.54-4.52-9.87-6.54-11.9-4.5-2.04 2.03-.02 7.36 4.5 11.9 4.54 4.52 9.87 6.54 11.9 4.5Z"/>
    <path d="M15.7 3.8c-2.04-2.03-7.36-.02-11.9 4.5-4.54 4.52-6.54 9.87-4.5 11.9 2.04 2.03 7.36.02 11.9-4.5 4.54-4.52 6.54-9.87 4.5-11.9Z"/>
  </svg>
);

const GlobeIcon = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <line x1="2" y1="12" x2="22" y2="12"/>
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
  </svg>
);

const SunIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{color: '#facc15'}}>
    <circle cx="12" cy="12" r="5"></circle>
    <line x1="12" y1="1" x2="12" y2="3"></line>
    <line x1="12" y1="21" x2="12" y2="23"></line>
    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
    <line x1="1" y1="12" x2="3" y2="12"></line>
    <line x1="21" y1="12" x2="23" y2="12"></line>
    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
  </svg>
);

const MoonIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{color: '#93c5fd'}}>
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
  </svg>
);

const CloudIcon = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{color: '#4285f4'}}>
    <path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z"/>
  </svg>
);

const KaggleIcon = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{color: '#20BEFF'}}>
    <path d="M5 2h4v20H5V2z"/><path d="m20.5 24-8.8-9.8L19.5 2h-5l-5.6 9.3v3L15.3 24h5.2z"/>
  </svg>
);

const InfinityIcon = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{color: '#fbbf24'}}>
    <path d="M12 12c-2-2.67-4-4-6-4a4 4 0 1 0 0 8c2 0 4-1.33 6-4Zm0 0c2 2.67 4 4 6 4a4 4 0 1 0 0-8c-2 0-4 1.33-6 4Z"/>
  </svg>
);

const CodeIcon = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{color: '#10b981'}}>
    <polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/>
  </svg>
);

const CopyIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
  </svg>
);

const CheckIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{color: '#22c55e'}}>
    <polyline points="20 6 9 17 4 12"></polyline>
  </svg>
);

const AwardIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{color: '#fbbf24'}}>
    <circle cx="12" cy="8" r="7"></circle>
    <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"></polyline>
  </svg>
);

const DNAIcon = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{color: '#f43f5e'}}>
    <path d="M2 15c6.667-6 13.333 0 20-6M2 9c6.667 6 13.333 0 20 6"/>
    <path d="M5.5 11.5v1M9.5 9v6M14.5 9v6M18.5 11.5v1"/>
  </svg>
);

const FloatingLogos = () => (
  <div className="floating-logos-container">
    <div className="floating-logo" style={{ left: '10%', animationDuration: '28s', animationDelay: '0s' }}><GeminiIcon /></div>
    <div className="floating-logo" style={{ left: '30%', animationDuration: '35s', animationDelay: '-10s' }}><NotebookLMIcon /></div>
    <div className="floating-logo" style={{ left: '50%', animationDuration: '25s', animationDelay: '-5s' }}><YoutubeLogo /></div>
    <div className="floating-logo" style={{ left: '70%', animationDuration: '30s', animationDelay: '-15s' }}><BrainIcon /></div>
    <div className="floating-logo" style={{ left: '90%', animationDuration: '22s', animationDelay: '-2s' }}><AtomIcon /></div>
    <div className="floating-logo" style={{ left: '20%', animationDuration: '32s', animationDelay: '-20s' }}><GlobeIcon /></div>
    <div className="floating-logo" style={{ left: '80%', animationDuration: '26s', animationDelay: '-8s' }}><CloudIcon /></div>
    <div className="floating-logo" style={{ left: '40%', animationDuration: '34s', animationDelay: '-18s' }}><KaggleIcon /></div>
    <div className="floating-logo" style={{ left: '15%', animationDuration: '29s', animationDelay: '-12s' }}><InfinityIcon /></div>
    <div className="floating-logo" style={{ left: '60%', animationDuration: '27s', animationDelay: '-7s' }}><CodeIcon /></div>
    <div className="floating-logo" style={{ left: '85%', animationDuration: '31s', animationDelay: '-22s' }}><DNAIcon /></div>
  </div>
);

function App() {
  const [theme, setTheme] = useState('dark');
  const [topic, setTopic] = useState('');
  const [language, setLanguage] = useState('English');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  const [activeTab, setActiveTab] = useState('beginner');
  
  // Audio state
  const [audioPlaying, setAudioPlaying] = useState(false);
  const [audioLoading, setAudioLoading] = useState(false);
  const audioRef = useRef(null);
  
  // Diagram state
  const [isDiagramExpanded, setIsDiagramExpanded] = useState(false);
  
  // Copy state
  const [copiedGems, setCopiedGems] = useState(false);
  
  const [isRecording, setIsRecording] = useState(false);
  const recognitionRef = useRef(null);
  const resultContainerRef = useRef(null);

  // i18n Translation State
  const [ui, setUi] = useState(defaultUI);
  const [translatingUI, setTranslatingUI] = useState(false);

  // Initialize Speech Recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = true;

      recognitionRef.current.onresult = (event) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        setTopic(transcript);
      };

      recognitionRef.current.onend = () => {
        setIsRecording(false);
      };
    }
  }, []);

  // Theme setup
  useEffect(() => {
    document.documentElement.className = theme;
  }, [theme]);

  const toggleTheme = () => setTheme(prev => prev === 'dark' ? 'light' : 'dark');

  // Trigger UI Translation
  useEffect(() => {
    if (language === 'English') {
      setUi(defaultUI);
      return;
    }
    const translateUI = async () => {
      setTranslatingUI(true);
      try {
        const response = await fetch(`${API_BASE_URL}/api/translate-ui`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ language, ui_payload: defaultUI })
        });
        const data = await response.json();
        if (data.success && data.data) {
          setUi(data.data);
        }
      } catch (err) {
        console.error("UI Translation failed.", err);
      } finally {
        setTranslatingUI(false);
      }
    };
    translateUI();
  }, [language]);

  // Mermaid Rendering
  useEffect(() => {
    if (result && result.mermaid_diagram) {
      mermaid.initialize({ startOnLoad: false, theme: theme === 'dark' ? 'dark' : 'default' });
      mermaid.contentLoaded();
      try {
        mermaid.run({ nodes: [document.getElementById('mermaid-diagram')] });
        if (isDiagramExpanded) {
           mermaid.run({ nodes: [document.getElementById('mermaid-diagram-fullscreen')] });
        }
      } catch (e) {
        console.error("Mermaid error:", e);
      }
    }
  }, [result, theme, isDiagramExpanded]);

  const toggleRecording = () => {
    if (!recognitionRef.current) return;
    if (isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
    } else {
      recognitionRef.current.lang = 'en-US'; 
      recognitionRef.current.start();
      setIsRecording(true);
      setTopic('');
    }
  };

  const handleSearch = async () => {
    if (!topic) return;
    setLoading(true);
    setResult(null);
    setError(null);
    if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
        setAudioPlaying(false);
    }
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/learn`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic, language })
      });
      const data = await response.json();
      if (data.success) {
        setResult(data.data);
        if (data.data.translated_topic) {
           setTopic(data.data.translated_topic);
        }
        setTimeout(() => {
            if (resultContainerRef.current) {
                resultContainerRef.current.scrollIntoView({ behavior: 'smooth' });
            }
        }, 100);
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError("Failed to connect to backend agents.");
    } finally {
      setLoading(false);
    }
  };

  const toggleAudio = async () => {
    if (!result || !result.audio_script) return;
    
    if (audioPlaying && audioRef.current) {
        audioRef.current.pause();
        setAudioPlaying(false);
        return;
    }
    
    if (!audioRef.current) {
        setAudioLoading(true);
        const audioUrl = `${API_BASE_URL}/api/audio?text=${encodeURIComponent(result.audio_script)}&lang=${encodeURIComponent(language)}`;
        audioRef.current = new Audio(audioUrl);
        audioRef.current.onended = () => setAudioPlaying(false);
        audioRef.current.onerror = () => {
            setAudioPlaying(false);
            setAudioLoading(false);
        };
        audioRef.current.oncanplaythrough = () => {
            setAudioLoading(false);
        };
    }
    
    try {
        setAudioPlaying(true);
        await audioRef.current.play();
    } catch (err) {
        console.error("Audio play failed:", err);
        setAudioPlaying(false);
        setAudioLoading(false);
    }
  };

  const handleExportNotebookLM = () => {
    if (!result) return;
    
    const content = `
# AuraLearn Study Guide: ${topic}

## AI Instructions for NotebookLM:
NotebookLM, please act as my expert tutor for the topic "${topic}". 
Use the summary and provided YouTube video URLs below as the foundational knowledge. 
Generate a comprehensive study guide, a set of 5 quiz questions, and a detailed explanation of the core concepts.

## Agent Summary (${language}):
${result.translated_summary}

## Recommended Videos:
- Beginner: https://www.youtube.com/watch?v=${result.beginner_video?.video_id}
- Intermediate: https://www.youtube.com/watch?v=${result.intermediate_video?.video_id}
- Advanced: https://www.youtube.com/watch?v=${result.advanced_video?.video_id}

## Playlist:
https://www.youtube.com/playlist?list=${result.playlist?.video_id}

---
Generated by AuraLearn Agents
    `.trim();

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `AuraLearn_${topic.replace(/\s+/g, '_')}_StudyGuide.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };
  
  const getGemsPrompt = () => {
      let videoUrl = "";
      if (activeTab === 'playlist') {
          videoUrl = `https://www.youtube.com/playlist?list=${result.playlist?.video_id}`;
      } else {
          videoUrl = `https://www.youtube.com/watch?v=${result[`${activeTab}_video`]?.video_id}`;
      }
      return `I am learning about "${topic}". I just watched this video: ${videoUrl}\n\nPlease act as my tutor and test my knowledge. Ask me 3 challenging questions about this specific topic to see what I've learned!`;
  };

  const handleCopyGemsPrompt = () => {
      navigator.clipboard.writeText(getGemsPrompt());
      setCopiedGems(true);
      setTimeout(() => setCopiedGems(false), 2000);
  };

  return (
    <div className="min-h-screen">
      <FloatingLogos />
      <div className="blob-container">
        <div className="blob blob-1"></div>
        <div className="blob blob-2"></div>
      </div>

      <div className="container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem', position: 'relative', zIndex: 1 }}>
        
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4rem' }}>
          <h1 className="text-gradient" style={{ fontSize: '2.5rem', fontWeight: '800', letterSpacing: '-0.05em' }}>
            {ui.headerTitle || "AuraLearn."}
          </h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            {translatingUI && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent-primary)', fontSize: '0.9rem' }}>
                <div style={{ animation: 'spin 2s linear infinite' }}><GeminiIcon /></div> Translating UI...
              </div>
            )}
            <button className="btn glass-panel" onClick={toggleTheme} style={{ color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
              {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
            </button>
          </div>
        </header>

        <main className="animate-fade-in" style={{ textAlign: 'center', marginTop: result ? '2vh' : '10vh', transition: 'margin 0.5s cubic-bezier(0.4, 0, 0.2, 1)' }}>
          <h2 style={{ fontSize: '4.5rem', fontWeight: '800', lineHeight: '1.1', marginBottom: '1.5rem', letterSpacing: '-0.03em', whiteSpace: 'pre-line' }}>
            {ui.heroTitle ? ui.heroTitle.split('\n').map((line, i) => i === 1 ? <span key={i} className="text-gradient">{line}</span> : line + " ") : "Break the barrier of knowledge."}
          </h2>
          <p style={{ fontSize: '1.25rem', color: 'var(--text-secondary)', maxWidth: '650px', margin: '0 auto 3rem auto', opacity: translatingUI ? 0.5 : 1, transition: 'opacity 0.3s' }}>
            {ui.heroSubtitle}
          </p>
          
          <div className="glass-panel" style={{ maxWidth: '1000px', margin: '0 auto', padding: '0.75rem', display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <div style={{ flex: 2, display: 'flex', alignItems: 'center', background: 'transparent', borderRadius: '1rem', border: '1px solid var(--glass-border)', padding: '0.5rem 1rem' }}>
              <input 
                type="text" 
                placeholder={ui.searchPlaceholder} 
                value={topic}
                onChange={e => setTopic(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') handleSearch(); }}
                style={{ width: '100%', background: 'transparent', color: 'var(--text-primary)', fontSize: '1.1rem', outline: 'none', border: 'none' }} 
              />
              <button onClick={toggleRecording} className={`mic-btn ${isRecording ? 'mic-active' : ''}`} title="Speak to search">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--text-secondary)' }}>
                  <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"></path>
                  <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
                  <line x1="12" y1="19" x2="12" y2="22"></line>
                </svg>
              </button>
            </div>
            
            <div style={{ flex: 1, display: 'flex', gap: '0.5rem', minWidth: '200px' }}>
              <select 
                value={language}
                onChange={e => setLanguage(e.target.value)}
                style={{ width: '100%', padding: '1rem', borderRadius: '1rem', border: '1px solid var(--glass-border)', background: 'var(--bg-secondary)', color: 'var(--text-primary)', fontSize: '1rem', outline: 'none', cursor: 'pointer' }}
              >
                <optgroup label="Major International">
                  <option value="English">English</option>
                  <option value="Spanish">Spanish</option>
                  <option value="French">French</option>
                  <option value="German">German</option>
                  <option value="Japanese">Japanese</option>
                  <option value="Chinese">Chinese</option>
                  <option value="Russian">Russian</option>
                  <option value="Portuguese">Portuguese</option>
                </optgroup>
                <optgroup label="Indian Regional">
                  <option value="Hindi (India)">Hindi</option>
                  <option value="Marathi (India)">Marathi</option>
                  <option value="Tamil (India)">Tamil</option>
                  <option value="Telugu (India)">Telugu</option>
                  <option value="Kannada (India)">Kannada</option>
                  <option value="Bengali (India)">Bengali</option>
                </optgroup>
              </select>
            </div>

            <button className="btn btn-primary" onClick={handleSearch} disabled={loading || translatingUI} style={{ padding: '1rem 2rem', position: 'relative', minWidth: '160px', overflow: 'hidden' }}>
              {loading ? (
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontWeight: 'bold' }}>
                  <div className="gemini-loader-icon"><GeminiIcon style={{ color: '#ffffff' }} /></div> 
                  {ui.workingButton || 'Working...'}
                </span>
              ) : (ui.searchButton || 'Learn')}
            </button>
          </div>

          {error && (
            <div className="animate-fade-in" style={{ marginTop: '2rem', padding: '1rem', borderRadius: '1rem', background: 'rgba(255, 0, 0, 0.1)', border: '1px solid rgba(255, 0, 0, 0.3)', color: '#ff6b6b', maxWidth: '600px', margin: '2rem auto 0 auto', textAlign: 'left' }}>
              <strong>Oops!</strong> {error}
            </div>
          )}

          {result && (
            <div ref={resultContainerRef} className="glass-panel animate-fade-in" style={{ marginTop: '4rem', padding: '2.5rem', textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              
              <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
                {/* Left Column: Videos & UI Image */}
                <div style={{ flex: 1, minWidth: '350px', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  
                  {/* AI Generated Image */}
                  {result.image_url && (
                    <div style={{ borderRadius: '1rem', overflow: 'hidden', border: '1px solid var(--glass-border)', boxShadow: '0 10px 25px rgba(0,0,0,0.2)' }}>
                      <img src={result.image_url} alt="AI Representation" style={{ width: '100%', height: 'auto', display: 'block' }} />
                    </div>
                  )}

                  {/* Video Selector Tabs */}
                  <div>
                    <h3 style={{ fontSize: '1.4rem', marginBottom: '1rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <YoutubeLogo /> {ui.originalSource}
                    </h3>
                    <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
                      {['beginner', 'intermediate', 'advanced', 'playlist'].map(tab => (
                        <button 
                          key={tab}
                          onClick={() => setActiveTab(tab)}
                          className={`btn ${activeTab === tab ? 'btn-primary' : 'glass-panel'}`}
                          style={{ padding: '0.5rem 1rem', fontSize: '0.9rem', textTransform: 'capitalize', color: activeTab === tab ? '#fff' : 'var(--text-primary)' }}
                        >
                          {tab}
                        </button>
                      ))}
                    </div>
                    
                    <div style={{ background: '#000', borderRadius: '1rem', padding: '1.5rem', color: '#fff', boxShadow: '0 10px 25px rgba(0,0,0,0.2)' }}>
                      <p style={{ fontWeight: '600', fontSize: '1.1rem', marginBottom: '0.5rem', textTransform: 'capitalize' }}>Best Recommended {activeTab}</p>
                      <a 
                        href={activeTab === 'playlist' ? `https://www.youtube.com/playlist?list=${result[activeTab]?.video_id}` : `https://www.youtube.com/watch?v=${result[`${activeTab}_video`]?.video_id}`} 
                        target="_blank" 
                        rel="noreferrer" 
                        style={{ color: 'var(--accent-primary)', textDecoration: 'none', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem' }}
                      >
                        <YoutubeLogo /> {ui.watchOnYoutube} ↗
                      </a>
                    </div>
                  </div>
                  
                  {/* Gemini Gems Section */}
                  <div style={{ background: 'var(--bg-secondary)', borderRadius: '1rem', padding: '1.5rem', border: '1px solid var(--glass-border)' }}>
                     <h4 style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                       <GeminiIcon /> Test Your Knowledge with Gemini
                     </h4>
                     <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                       Want to check what you've learned from the {activeTab} video? Copy our optimized prompt and ask Gemini directly!
                     </p>
                     
                     <div style={{ background: 'var(--bg-primary)', padding: '1rem', borderRadius: '0.5rem', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1rem', border: '1px solid var(--glass-border)', fontFamily: 'monospace' }}>
                        {getGemsPrompt()}
                     </div>
                     
                     <div style={{ display: 'flex', gap: '1rem' }}>
                        <button onClick={handleCopyGemsPrompt} className="btn glass-panel" style={{ flex: 1, padding: '0.75rem', fontSize: '0.9rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                           {copiedGems ? <><CheckIcon /> Copied!</> : <><CopyIcon /> Copy Prompt</>}
                        </button>
                        <a href="https://gemini.google.com/" target="_blank" rel="noreferrer" className="btn btn-primary" style={{ flex: 1, textDecoration: 'none', padding: '0.75rem', fontSize: '0.9rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                           Open Gemini ↗
                        </a>
                     </div>
                  </div>
                  
                </div>
                
                {/* Right Column: Summary & Diagram */}
                <div style={{ flex: 1.5, minWidth: '350px', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  <div>
                    <h3 style={{ fontSize: '1.4rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '1rem', fontWeight: '600' }}>
                      {ui.agentSummary}
                      <button className="btn glass-panel" onClick={toggleAudio} disabled={audioLoading} style={{ fontSize: '0.9rem', padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-primary)' }}>
                        {audioLoading ? (
                          <><div style={{ animation: 'spin 1s linear infinite', width: '16px', height: '16px', border: '2px solid var(--text-secondary)', borderTopColor: 'var(--accent-primary)', borderRadius: '50%' }}></div> Loading...</>
                        ) : audioPlaying ? (
                          <><PauseIcon /> {ui.pauseAudio || 'Pause'}</>
                        ) : (
                          <><AudioIcon /> {ui.playAudio}</>
                        )}
                      </button>
                    </h3>
                    <div style={{ padding: '1.5rem', borderRadius: '1rem', background: 'var(--bg-secondary)', border: '1px solid var(--glass-border)' }}>
                      <div className="markdown-body">
                         <ReactMarkdown>{result.translated_summary}</ReactMarkdown>
                      </div>
                    </div>
                  </div>

                  {/* Authentic Certifications */}
                  {result.certifications && result.certifications.length > 0 && (
                     <div>
                       <h3 style={{ fontSize: '1.4rem', marginBottom: '1rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                         <AwardIcon /> Authentic Certifications
                       </h3>
                       <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                         {result.certifications.map((cert, idx) => (
                           <a key={idx} href={cert.url} target="_blank" rel="noreferrer" className="glass-panel" style={{ padding: '1.25rem', textDecoration: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem', transition: 'all 0.2s' }}>
                             <span style={{ fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--accent-primary)' }}>{cert.level}</span>
                             <h4 style={{ fontSize: '1rem', fontWeight: '600', color: 'var(--text-primary)', lineHeight: '1.3' }}>{cert.title}</h4>
                             <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{cert.provider}</p>
                           </a>
                         ))}
                       </div>
                     </div>
                  )}

                  {/* Mermaid Diagram */}
                  {result.mermaid_diagram && (
                    <div style={{ padding: '1.5rem', borderRadius: '1rem', background: 'var(--bg-secondary)', border: '1px solid var(--glass-border)', display: 'flex', flexDirection: 'column' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                        <h4 style={{ fontSize: '1.1rem', fontWeight: '600', color: 'var(--text-primary)' }}>Structural Diagram</h4>
                        <button onClick={() => setIsDiagramExpanded(true)} className="btn glass-panel" style={{ padding: '0.25rem 0.75rem', fontSize: '0.8rem', color: 'var(--text-primary)' }}>
                          Enlarge ⤢
                        </button>
                      </div>
                      <div id="mermaid-diagram" className="mermaid" style={{ display: 'flex', justifyContent: 'center', overflow: 'hidden', maxHeight: '300px' }}>
                        {result.mermaid_diagram.replace(/```mermaid/g, '').replace(/```/g, '')}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* NotebookLM Export */}
              <div style={{ marginTop: '1.5rem', borderTop: '1px solid var(--glass-border)', paddingTop: '2.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '2rem' }}>
                <div style={{ flex: 1, minWidth: '350px' }}>
                  <h4 style={{ fontSize: '1.8rem', marginBottom: '1rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <NotebookLMIcon /> {ui.diveDeeper}
                  </h4>
                  <div className="notebook-steps" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                     <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                       <span style={{ background: 'var(--accent-primary)', color: 'white', width: '28px', height: '28px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>1</span>
                       <p style={{ margin: 0, color: 'var(--text-secondary)' }}>Click <strong>Export Content</strong> to save your curation.</p>
                     </div>
                     <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                       <span style={{ background: 'var(--accent-primary)', color: 'white', width: '28px', height: '28px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>2</span>
                       <p style={{ margin: 0, color: 'var(--text-secondary)' }}>Go to <a href="https://notebooklm.google.com" target="_blank" rel="noreferrer" style={{ color: 'var(--accent-primary)' }}>Google NotebookLM</a>.</p>
                     </div>
                     <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                       <span style={{ background: 'var(--accent-primary)', color: 'white', width: '28px', height: '28px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>3</span>
                       <p style={{ margin: 0, color: 'var(--text-secondary)' }}>Create a New Notebook and <strong>upload the saved text file</strong>.</p>
                     </div>
                     <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                       <span style={{ background: 'var(--accent-primary)', color: 'white', width: '28px', height: '28px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>4</span>
                       <p style={{ margin: 0, color: 'var(--text-secondary)' }}>Instantly generate Podcasts, Study Guides, and Quizzes!</p>
                     </div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <button onClick={handleExportNotebookLM} className="btn btn-primary" style={{ background: 'var(--accent-secondary)', display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '1.25rem 2.5rem', fontSize: '1.2rem', borderRadius: '1.5rem' }}>
                     {ui.exportNotebookLM}
                  </button>
                </div>
              </div>

            </div>
          )}
        </main>
      </div>
      
      {/* Diagram Fullscreen Modal */}
      {isDiagramExpanded && result && result.mermaid_diagram && (
        <div className="modal-overlay" onClick={(e) => { if (e.target.className === 'modal-overlay') setIsDiagramExpanded(false); }}>
           <div className="modal-content">
             <button className="modal-close" onClick={() => setIsDiagramExpanded(false)}>✕</button>
             <h3 style={{ marginBottom: '1.5rem', fontWeight: '600' }}>Structural Diagram</h3>
             <div id="mermaid-diagram-fullscreen" className="mermaid" style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
                {result.mermaid_diagram.replace(/```mermaid/g, '').replace(/```/g, '')}
             </div>
           </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        .gemini-loader-icon {
          animation: spin 1.5s linear infinite;
          display: flex;
          align-items: center;
          justify-content: center;
          filter: drop-shadow(0 0 6px rgba(255, 255, 255, 0.8));
        }
      `}} />
    </div>
  )
}

export default App
