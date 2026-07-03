import { useState, useEffect } from 'react'

function App() {
  const [theme, setTheme] = useState('dark')
  const [topic, setTopic] = useState('')
  const [language, setLanguage] = useState('Hindi')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)

  useEffect(() => {
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
      setTheme('light')
    }
  }, [])

  useEffect(() => {
    document.documentElement.className = theme
  }, [theme])

  const toggleTheme = () => setTheme(prev => prev === 'dark' ? 'light' : 'dark')

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
    <div className={`min-h-screen ${theme === 'dark' ? 'dark' : ''}`}>
      <div className="container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
        
        {/* Header */}
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4rem' }}>
          <h1 className="text-gradient" style={{ fontSize: '2.5rem', fontWeight: '800', letterSpacing: '-0.05em' }}>
            AuraLearn.
          </h1>
          <button className="btn glass-panel" onClick={toggleTheme}>
            {theme === 'dark' ? '☀️ Light Mode' : '🌙 Dark Mode'}
          </button>
        </header>

        {/* Hero Section */}
        <main className="animate-fade-in" style={{ textAlign: 'center', marginTop: result ? '2vh' : '10vh', transition: 'margin 0.5s ease' }}>
          <h2 style={{ fontSize: '4rem', fontWeight: '800', lineHeight: '1.2', marginBottom: '1.5rem', letterSpacing: '-0.02em' }}>
            Break the barrier of <br/>
            <span className="text-gradient">knowledge.</span>
          </h2>
          <p style={{ fontSize: '1.25rem', color: 'var(--text-secondary)', maxWidth: '600px', margin: '0 auto 3rem auto' }}>
            Learn complex topics through curated videos, summarized and translated instantly by our AI Agents.
          </p>
          
          {/* Search Box */}
          <div className="glass-panel" style={{ maxWidth: '800px', margin: '0 auto', padding: '1rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <input 
              type="text" 
              placeholder="What do you want to learn today? (e.g. RAG in Computer Science)" 
              value={topic}
              onChange={e => setTopic(e.target.value)}
              style={{ 
                flex: 2, 
                minWidth: '200px',
                padding: '1rem 1.5rem', 
                borderRadius: '0.75rem', 
                border: '1px solid var(--glass-border)', 
                background: 'transparent',
                color: 'var(--text-primary)',
                fontSize: '1.1rem',
                outline: 'none'
              }} 
            />
            <select 
              value={language}
              onChange={e => setLanguage(e.target.value)}
              style={{
                flex: 1,
                padding: '1rem',
                borderRadius: '0.75rem',
                border: '1px solid var(--glass-border)', 
                background: 'var(--bg-secondary)',
                color: 'var(--text-primary)',
                fontSize: '1rem',
                outline: 'none'
              }}
            >
              <option value="Hindi">Hindi (India)</option>
              <option value="Marathi">Marathi (India)</option>
              <option value="Tamil">Tamil (India)</option>
              <option value="Spanish">Spanish</option>
              <option value="French">French</option>
            </select>
            <button className="btn btn-primary" onClick={handleSearch} disabled={loading} style={{ padding: '0 2rem' }}>
              {loading ? 'Agents Working...' : 'Vibe Learn'}
            </button>
          </div>

          {/* Results Area */}
          {result && (
            <div className="glass-panel animate-fade-in" style={{ marginTop: '4rem', padding: '2rem', textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              
              <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
                <div style={{ flex: 1, minWidth: '300px' }}>
                  <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Original Video Source</h3>
                  <div style={{ background: '#000', borderRadius: '1rem', padding: '1rem', color: '#fff' }}>
                    <p style={{ fontWeight: 'bold' }}>{result.video.title}</p>
                    <a href={`https://www.youtube.com/watch?v=${result.video.video_id}`} target="_blank" style={{ color: 'var(--accent-primary)' }}>Watch on YouTube</a>
                  </div>
                </div>
                
                <div style={{ flex: 1.5, minWidth: '300px' }}>
                  <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    Agent Summary ({language})
                    <button className="btn glass-panel" style={{ fontSize: '0.9rem', padding: '0.5rem 1rem' }}>
                      ▶️ Play Audio Summary
                    </button>
                  </h3>
                  <div style={{ padding: '1.5rem', borderRadius: '1rem', background: 'var(--bg-secondary)', border: '1px solid var(--glass-border)' }}>
                    <pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'inherit', color: 'var(--text-secondary)' }}>
                      {result.localized_content.translated_text}
                    </pre>
                  </div>
                </div>
              </div>

              {/* NotebookLM Export */}
              <div style={{ marginTop: '1rem', borderTop: '1px solid var(--glass-border)', paddingTop: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h4 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>Want to dive deeper?</h4>
                  <p style={{ color: 'var(--text-secondary)' }}>Export this curated content straight to Google NotebookLM for a personalized study session.</p>
                </div>
                <button className="btn btn-primary" style={{ background: 'var(--accent-secondary)' }}>
                  Export to NotebookLM
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
