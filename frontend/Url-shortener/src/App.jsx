import { useState } from 'react'
import './App.css'

function App() {
  const [originalUrl, setOriginalUrl] = useState('')
  const [customUrl, setCustomUrl] = useState('')
  const [shortenedUrl, setShortenedUrl] = useState('')
  const [urlHistory, setUrlHistory] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)
  const [useCustomUrl, setUseCustomUrl] = useState(false)
  const [currentPage, setCurrentPage] = useState('home') //
  const [batchUrls, setBatchUrls] = useState('')
  const [useExpiry, setUseExpiry] = useState(true)
  const [validityMinutes, setValidityMinutes] = useState(30)

  const generateShortCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    let result = ''
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return result
  }

  const isValidUrl = (string) => {
    try {
      new URL(string)
      return true
    } catch (_) {
      return false
    }
  }

  // Validate custom URL format
  const isValidCustomUrl = (string) => {
    const customUrlRegex = /^[a-zA-Z0-9-_]+$/
    return customUrlRegex.test(string) && string.length >= 3 && string.length <= 20
  }

  // Handle URL shortening
  const handleShorten = async (e) => {
    e.preventDefault()
    setError('')
    setCopied(false)

    if (!originalUrl.trim()) {
      setError('Please enter a URL')
      return
    }

    if (!isValidUrl(originalUrl)) {
      setError('Please enter a valid URL (include http:// or https://)')
      return
    }

    // Validate custom URL if enabled
    if (useCustomUrl && customUrl.trim()) {
      if (!isValidCustomUrl(customUrl)) {
        setError('Custom URL must be 3-20 characters long and contain only letters, numbers, hyphens, and underscores')
        return
      }
      
      // Check if custom URL already exists in history
      const existingUrl = urlHistory.find(entry => 
        entry.short === `https://short.ly/${customUrl}`
      )
      if (existingUrl) {
        setError('This custom URL is already taken. Please choose a different one.')
        return
      }
    }

    setIsLoading(true)

    // Simulate API call delay
    setTimeout(() => {
      const shortCode = useCustomUrl && customUrl.trim() ? customUrl : generateShortCode()
      const newShortUrl = `https://short.ly/${shortCode}`
      
      setShortenedUrl(newShortUrl)
      
      // Add to history
      const newEntry = {
        id: Date.now(),
        original: originalUrl,
        short: newShortUrl,
        timestamp: new Date().toLocaleString(),
        isCustom: useCustomUrl && customUrl.trim(),
        clicks: 0,
        lastClicked: null,
        expiresAt: useExpiry ? Date.now() + Number(validityMinutes || 30) * 60 * 1000 : null
      }
      setUrlHistory(prev => [newEntry, ...prev])
      
      setIsLoading(false)
      
      // Clear custom URL input after successful creation
      if (useCustomUrl) {
        setCustomUrl('')
        setUseCustomUrl(false)
      }
    }, 1000)
  }
  
  const handleBatchShorten = (e) => {
    e.preventDefault()
    setError('')
    const lines = batchUrls.split(/\r?\n/).map(l => l.trim()).filter(Boolean)
    if (lines.length === 0) {
      setError('Please enter at least one URL')
      return
    }
    if (lines.length > 5) {
      setError('You can shorten up to 5 URLs at a time')
      return
    }

    const entries = []
    for (const line of lines) {
      if (!isValidUrl(line)) {
        setError(`Invalid URL: ${line}. Include http:// or https://`)
        return
      }
      const shortCode = generateShortCode()
      const newShortUrl = `https://short.ly/${shortCode}`
      entries.push({
        id: Date.now() + Math.floor(Math.random() * 10000),
        original: line,
        short: newShortUrl,
        timestamp: new Date().toLocaleString(),
        isCustom: false,
        clicks: 0,
        lastClicked: null,
        expiresAt: useExpiry ? Date.now() + Number(validityMinutes || 30) * 60 * 1000 : null
      })
    }

    setUrlHistory(prev => [...entries, ...prev])
    setBatchUrls('')
  }

  // Handle clicking on shortened URL to redirect
  const handleUrlClick = (originalUrl, urlId) => {
    // Check expiry
    let targetEntry = null
    if (urlId) {
      targetEntry = urlHistory.find(e => e.id === urlId)
    } else {
      // fallback: find latest entry with this original
      targetEntry = urlHistory.find(e => e.original === originalUrl)
    }
    if (targetEntry && targetEntry.expiresAt && Date.now() > targetEntry.expiresAt) {
      alert('This link has expired.')
      return
    }

    window.open(originalUrl, '_blank')
    
    // Update click count
    if (urlId) {
      setUrlHistory(prev => prev.map(entry => 
        entry.id === urlId 
          ? { 
              ...entry, 
              clicks: entry.clicks + 1, 
              lastClicked: new Date().toLocaleString() 
            }
          : entry
      ))
    }
  }

  // Copy to clipboard
  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shortenedUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy: ', err)
    }
  }

  const clearHistory = () => {
    setUrlHistory([])
    setShortenedUrl('')
    setOriginalUrl('')
    setCustomUrl('')
    setError('')
    setUseCustomUrl(false)
  }

  return (
    <div className="app">
      <header className="header">
        <h1 className="title">
          <span className="title-icon">🔗</span>
          URL Shortener
        </h1>
        <p className="subtitle">Transform long URLs into short, shareable links</p>
        
        <nav className="navigation">
          <button 
            className={`nav-btn ${currentPage === 'home' ? 'active' : ''}`}
            onClick={() => setCurrentPage('home')}
          >
            Home
          </button>
          <button 
            className={`nav-btn ${currentPage === 'stats' ? 'active' : ''}`}
            onClick={() => setCurrentPage('stats')}
          >
            Statistics
          </button>
        </nav>
      </header>

      <main className="main">
        {currentPage === 'home' ? (
          <>
            <div className="shortener-container">
          <form onSubmit={handleShorten} className="url-form">
            <div className="input-group">
              <input
                type="url"
                value={originalUrl}
                onChange={(e) => setOriginalUrl(e.target.value)}
                placeholder="Enter your long URL here"
                className="url-input"
                disabled={isLoading}
              />
              <button 
                type="submit" 
                className="shorten-btn"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <span className="spinner"></span>
                    Shortening...
                  </>
                ) : (
                  'Shorten URL'
                )}
              </button>
            </div>
            
            <div className="custom-url-section">
              <div className="custom-url-toggle">
                <label className="toggle-label">
                  <input
                    type="checkbox"
                    checked={useCustomUrl}
                    onChange={(e) => setUseCustomUrl(e.target.checked)}
                    className="toggle-checkbox"
                  />
                  <span className="toggle-text">Use custom URL</span>
                </label>
              </div>
              
              {useCustomUrl && (
                <div className="custom-url-input-group">
                  <div className="custom-url-prefix">https://short.ly/</div>
                  <input
                    type="text"
                    value={customUrl}
                    onChange={(e) => setCustomUrl(e.target.value)}
                    placeholder="your-custom-url"
                    className="custom-url-input"
                    disabled={isLoading}
                    maxLength={20}
                  />
                </div>
              )}
            </div>
            
            {error && <div className="error-message">{error}</div>}
          </form>

          <div className="batch-container">
            <h3>Batch shorten (up to 5)</h3>
            <form onSubmit={handleBatchShorten} className="batch-form">
              <textarea
                className="batch-textarea"
                placeholder="Enter up to 5 URLs, one per line..."
                rows={5}
                value={batchUrls}
                onChange={(e) => setBatchUrls(e.target.value)}
              />
              <div className="batch-actions">
                <div className="expiry-controls">
                  <label className="toggle-label">
                    <input
                      type="checkbox"
                      checked={useExpiry}
                      onChange={(e) => setUseExpiry(e.target.checked)}
                      className="toggle-checkbox"
                    />
                    <span className="toggle-text">Set validity</span>
                  </label>
                  {useExpiry && (
                    <div className="expiry-input-group">
                      <label className="expiry-label" htmlFor="validityMinutes">Validity (minutes):</label>
                      <input
                        id="validityMinutes"
                        type="number"
                        min={1}
                        max={24 * 60}
                        value={validityMinutes}
                        onChange={(e) => setValidityMinutes(e.target.value)}
                        className="expiry-input"
                      />
                      <span className="expiry-hint">Default is 30</span>
                    </div>
                  )}
                </div>
                <button type="submit" className="shorten-btn">Shorten All</button>
              </div>
            </form>
          </div>

          {shortenedUrl && (
            <div className="result-container">
              <div className="result-header">
                <h3>Your shortened URL:</h3>
              </div>
              <div className="result-content">
                <div className="short-url-display">
                  <span 
                    className="short-url clickable-url" 
                    onClick={() => handleUrlClick(originalUrl)}
                    title="Click to visit original URL"
                  >
                    {shortenedUrl}
                  </span>
                  <button 
                    onClick={copyToClipboard}
                    className={`copy-btn ${copied ? 'copied' : ''}`}
                  >
                    {copied ? '✓ Copied!' : 'Copy'}
                  </button>
                </div>
                <div className="url-info">
                  <p>Click the shortened URL above to visit: <strong>{originalUrl}</strong></p>
                </div>
              </div>
            </div>
          )}
        </div>

        {urlHistory.length > 0 && (
          <div className="history-container">
            <div className="history-header">
              <h3>Recent URLs</h3>
              <button onClick={clearHistory} className="clear-btn">
                Clear All
              </button>
            </div>
            <div className="history-list">
              {urlHistory.map((entry) => (
                <div key={entry.id} className="history-item">
                  <div className="history-content">
                    <div className="original-url">
                      <strong>Original:</strong> {entry.original}
                    </div>
                    <div className="short-url">
                      <strong>Short:</strong> 
                      <span 
                        className="clickable-url" 
                        onClick={() => handleUrlClick(entry.original, entry.id)}
                        title="Click to visit original URL"
                      >
                        {entry.short}
                      </span>
                      {entry.isCustom && <span className="custom-badge">Custom</span>}
                    </div>
                    <div className="timestamp">
                      {entry.timestamp}
                      {entry.expiresAt && (
                        <>
                          {' '}
                          <span className={Date.now() > entry.expiresAt ? 'expired-badge' : 'valid-badge'}>
                            {Date.now() > entry.expiresAt ? 'Expired' : `Valid until ${new Date(entry.expiresAt).toLocaleString()}`}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                  <button 
                    onClick={() => navigator.clipboard.writeText(entry.short)}
                    className="copy-history-btn"
                  >
                    📋
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
          </>
        ) : (
          <div className="stats-container">
            <div className="stats-header">
              <h2>URL Statistics</h2>
              <div className="stats-summary">
                <div className="stat-card">
                  <div className="stat-number">{urlHistory.length}</div>
                  <div className="stat-label">Total URLs</div>
                </div>
                <div className="stat-card">
                  <div className="stat-number">{urlHistory.reduce((sum, entry) => sum + entry.clicks, 0)}</div>
                  <div className="stat-label">Total Clicks</div>
                </div>
                <div className="stat-card">
                  <div className="stat-number">{urlHistory.filter(entry => entry.isCustom).length}</div>
                  <div className="stat-label">Custom URLs</div>
                </div>
              </div>
            </div>

            <div className="stats-table-container">
              <h3>All Shortened URLs</h3>
              {urlHistory.length === 0 ? (
                <div className="no-data">
                  <p>No URLs have been shortened yet.</p>
                  <button 
                    className="nav-btn"
                    onClick={() => setCurrentPage('home')}
                  >
                    Create Your First URL
                  </button>
                </div>
              ) : (
                <div className="stats-table">
                  <div className="table-header">
                    <div className="col-short" data-label="Short URL">Short URL</div>
                    <div className="col-original" data-label="Original URL">Original URL</div>
                    <div className="col-clicks" data-label="Clicks">Clicks</div>
                    <div className="col-created" data-label="Created">Created</div>
                    <div className="col-last" data-label="Last Clicked">Last Clicked</div>
                    <div className="col-type" data-label="Type">Type</div>
                    <div className="col-actions" data-label="Actions">Actions</div>
                  </div>
                  {urlHistory.map((entry) => (
                    <div key={entry.id} className="table-row">
                      <div className="col-short" data-label="Short URL">
                        <span 
                          className="clickable-url" 
                          onClick={() => handleUrlClick(entry.original, entry.id)}
                          title="Click to visit original URL"
                        >
                          {entry.short}
                        </span>
                      </div>
                      <div className="col-original" data-label="Original URL" title={entry.original}>
                        {entry.original.length > 50 
                          ? `${entry.original.substring(0, 50)}...` 
                          : entry.original
                        }
                      </div>
                      <div className="col-clicks" data-label="Clicks">
                        <span className="click-count">{entry.clicks}</span>
                      </div>
                      <div className="col-created" data-label="Created">{entry.timestamp}</div>
                      <div className="col-last" data-label="Last Clicked">
                        {entry.lastClicked || 'Never'}
                      </div>
                      <div className="col-type" data-label="Type">
                        {entry.isCustom ? (
                          <span className="custom-badge">Custom</span>
                        ) : (
                          <span className="random-badge">Random</span>
                        )}
                      </div>
                      <div className="col-expiry" data-label="Expiry">
                        {entry.expiresAt ? (
                          Date.now() > entry.expiresAt ?
                            <span className="expired-badge">Expired</span> :
                            <span className="valid-badge">Valid until {new Date(entry.expiresAt).toLocaleString()}</span>
                        ) : (
                          <span className="no-expiry">No expiry</span>
                        )}
                      </div>
                      <div className="col-actions" data-label="Actions">
                        <button 
                          onClick={() => navigator.clipboard.writeText(entry.short)}
                          className="copy-btn-small"
                          title="Copy URL"
                        >
                          📋
        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      <footer className="footer">
        <p>Made using React + Vite</p>
      </footer>
      </div>
  )
}

export default App
