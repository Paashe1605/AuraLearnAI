import { useState, useEffect, useRef } from 'react'

// Default English UI Strings
const defaultUI = {
  headerTitle: "AuraLearn.",
  heroTitle: "Break the barrier of \nknowledge.",
  heroSubtitle: "Learn complex topics through curated videos, summarized and translated instantly by our AI Agents.",
  searchPlaceholder: "What do you want to learn today? (e.g. RAG in Computer Science)",
  searchButton: "Vibe Learn",
  workingButton: "Agents Working...",
  originalSource: "Original Video Source",
  watchOnYoutube: "Watch on YouTube",
  agentSummary: "Agent Summary",
  playAudio: "▶️ Play Audio Summary",
  diveDeeper: "Want to dive deeper?",
  diveDeeperSub: "Export this curated content straight to Google NotebookLM for a personalized study session.",
  exportNotebookLM: "Export to NotebookLM"
};

function App() {
  const [theme, setTheme] = useState('dark');
  const [topic, setTopic] = useState('');
  const [language, setLanguage] = useState('Hindi (India)');
  
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  
  const [isRecording, setIsRecording] = useState(false);
  const recognitionRef = useRef(null);

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
      
      recognitionRef.current.onerror = (event) => {
        console.error("Speech recognition error", event.error);
        setIsRecording(false);
      };
    }
  }, []);

  // Theme setup
  useEffect(() => {
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
      setTheme('light');
    }
  }, []);

  const toggleTheme = () => setTheme(prev => prev === 'dark' ? 'light' : 'dark');

  // Trigger UI Translation when language changes
  useEffect(() => {
    if (language === 'English') {
      setUi(defaultUI);
      return;
    }
    const translateUI = async () => {
      setTranslatingUI(true);
      try {
        const response = await fetch('http://localhost:8000/api/translate-ui', {
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

  const toggleRecording = () => {
    if (!recognitionRef.current) {
      alert("Speech recognition is not supported in this browser.");
      return;
    }
    if (isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
    } else {
      // Set recognition language based on current selection if possible, otherwise default to en-US
      recognitionRef.current.lang = 'en-US'; 
      recognitionRef.current.start();
      setIsRecording(true);
      setTopic(''); // Clear existing to start fresh dictation
    }
  };

  const handleSearch = async () => {
    if (!topic) return;
    setLoading(true);
    setResult(null);
    try {
      const response = await fetch('http://localhost:8000/api/learn', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic, language })
      });
      const data = await response.json();
      if (data.success) {
        setResult(data.data);
      } else {
        alert("Error: " + data.message);
      }
    } catch (err) {
      alert("Failed to connect to backend agents.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={`min-h-screen ${theme}`}>
      {/* Animated Background Blobs */}
      <div className="blob-container">
        <div className="blob blob-1"></div>
        <div className="blob blob-2"></div>
      </div>

      <div className="container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem', position: 'relative', zIndex: 1 }}>
        
        {/* Header */}
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4rem' }}>
          <h1 className="text-gradient" style={{ fontSize: '2.5rem', fontWeight: '800', letterSpacing: '-0.05em' }}>
            {ui.headerTitle || "AuraLearn."}
          </h1>
          <button className="btn glass-panel" onClick={toggleTheme}>
            {theme === 'dark' ? '☀️ Light Mode' : '🌙 Dark Mode'}
          </button>
        </header>

        {/* Hero Section */}
        <main className="animate-fade-in" style={{ textAlign: 'center', marginTop: result ? '2vh' : '10vh', transition: 'margin 0.5s cubic-bezier(0.4, 0, 0.2, 1)' }}>
          <h2 style={{ fontSize: '4.5rem', fontWeight: '800', lineHeight: '1.1', marginBottom: '1.5rem', letterSpacing: '-0.03em', whiteSpace: 'pre-line' }}>
            {ui.heroTitle ? ui.heroTitle.split('\\n').map((line, i) => i === 1 ? <span key={i} className="text-gradient">{line}</span> : line + " ") : "Break the barrier of knowledge."}
          </h2>
          <p style={{ fontSize: '1.25rem', color: 'var(--text-secondary)', maxWidth: '650px', margin: '0 auto 3rem auto', opacity: translatingUI ? 0.5 : 1, transition: 'opacity 0.3s' }}>
            {ui.heroSubtitle}
          </p>
          
          {/* Search Box */}
          <div className="glass-panel" style={{ maxWidth: '900px', margin: '0 auto', padding: '0.75rem', display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
            
            <div style={{ flex: 2, display: 'flex', alignItems: 'center', background: 'transparent', borderRadius: '1rem', border: '1px solid var(--glass-border)', padding: '0.5rem 1rem' }}>
              <input 
                type="text" 
                placeholder={ui.searchPlaceholder} 
                value={topic}
                onChange={e => setTopic(e.target.value)}
                style={{ 
                  width: '100%',
                  background: 'transparent',
                  color: 'var(--text-primary)',
                  fontSize: '1.1rem',
                  outline: 'none',
                  border: 'none'
                }} 
              />
              <button onClick={toggleRecording} className={`mic-btn ${isRecording ? 'mic-active' : ''}`} title="Speak to search">
                🎤
              </button>
            </div>
            
            <div style={{ flex: 1, display: 'flex', gap: '0.5rem', minWidth: '250px' }}>
              <select 
                value={language}
                onChange={e => setLanguage(e.target.value)}
                style={{
                  width: '100%',
                  padding: '1rem',
                  borderRadius: '1rem',
                  border: '1px solid var(--glass-border)', 
                  background: 'var(--bg-secondary)',
                  color: 'var(--text-primary)',
                  fontSize: '1rem',
                  outline: 'none',
                  cursor: 'pointer'
                }}
              >
                <optgroup label="Indian Regional">
                  <option value="Hindi (India)">Hindi</option>
                  <option value="Marathi (India)">Marathi</option>
                  <option value="Tamil (India)">Tamil</option>
                  <option value="Bengali (India)">Bengali</option>
                  <option value="Telugu (India)">Telugu</option>
                </optgroup>
                <optgroup label="Major International">
                  <option value="English">English</option>
                  <option value="Spanish">Spanish</option>
                  <option value="French">French</option>
                  <option value="Mandarin">Mandarin (Chinese)</option>
                  <option value="Arabic">Arabic</option>
                  <option value="German">German</option>
                  <option value="Japanese">Japanese</option>
                </optgroup>
              </select>
            </div>

            <button className="btn btn-primary" onClick={handleSearch} disabled={loading || translatingUI} style={{ padding: '1rem 2rem' }}>
              {loading ? (ui.workingButton || 'Working...') : (ui.searchButton || 'Learn')}
            </button>
          </div>

          {/* Results Area */}
          {result && (
            <div className="glass-panel animate-fade-in" style={{ marginTop: '4rem', padding: '2.5rem', textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              
              <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
                <div style={{ flex: 1, minWidth: '300px' }}>
                  <h3 style={{ fontSize: '1.4rem', marginBottom: '1rem', fontWeight: '600' }}>{ui.originalSource}</h3>
                  <div style={{ background: '#000', borderRadius: '1rem', padding: '1.5rem', color: '#fff', boxShadow: '0 10px 25px rgba(0,0,0,0.2)' }}>
                    <p style={{ fontWeight: '600', fontSize: '1.1rem', marginBottom: '0.5rem' }}>{result.video.title}</p>
                    <a href={`https://www.youtube.com/watch?v=${result.video.video_id}`} target="_blank" style={{ color: 'var(--accent-primary)', textDecoration: 'none', fontWeight: '600', display: 'inline-block', marginTop: '0.5rem' }}>
                      {ui.watchOnYoutube} ↗
                    </a>
                  </div>
                </div>
                
                <div style={{ flex: 1.5, minWidth: '300px' }}>
                  <h3 style={{ fontSize: '1.4rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '1rem', fontWeight: '600' }}>
                    {ui.agentSummary} ({language})
                    <button className="btn glass-panel" style={{ fontSize: '0.9rem', padding: '0.5rem 1rem' }}>
                      {ui.playAudio}
                    </button>
                  </h3>
                  <div style={{ padding: '1.5rem', borderRadius: '1rem', background: 'var(--bg-secondary)', border: '1px solid var(--glass-border)' }}>
                    <pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'inherit', color: 'var(--text-secondary)', fontSize: '1.05rem', lineHeight: '1.7' }}>
                      {result.localized_content.translated_text}
                    </pre>
                  </div>
                </div>
              </div>

              {/* NotebookLM Export */}
              <div style={{ marginTop: '1.5rem', borderTop: '1px solid var(--glass-border)', paddingTop: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                  <h4 style={{ fontSize: '1.3rem', marginBottom: '0.25rem', fontWeight: '600' }}>{ui.diveDeeper}</h4>
                  <p style={{ color: 'var(--text-secondary)' }}>{ui.diveDeeperSub}</p>
                </div>
                <button className="btn btn-primary" style={{ background: 'var(--accent-secondary)' }}>
                  {ui.exportNotebookLM}
                </button>
              </div>

            </div>
          )}
        </main>
      </div>
    </div>
  )
}

export default App
