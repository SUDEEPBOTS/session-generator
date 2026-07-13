import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import axios from 'axios';

const Nav = () => {
  const location = useLocation();
  return (
    <div className="nav">
      <Link to="/" className={location.pathname === '/' ? 'active' : ''}>Generate</Link>
      <Link to="/help" className={location.pathname === '/help' ? 'active' : ''}>Help</Link>
      <Link to="/about" className={location.pathname === '/about' ? 'active' : ''}>About</Link>
      <Link to="/terms" className={location.pathname === '/terms' ? 'active' : ''}>Terms</Link>
    </div>
  );
};

const Generator = () => {
  const [step, setStep] = useState(1);
  const [phone, setPhone] = useState('');
  const [library, setLibrary] = useState('pyrogram');
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [phoneCodeHash, setPhoneCodeHash] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [sessionString, setSessionString] = useState('');
  const [needsPassword, setNeedsPassword] = useState(false);

  const API_URL = "http://localhost:8000/api"; // Default dev URL

  const handleSendCode = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await axios.post(`${API_URL}/send_code`, { phone_number: phone, library });
      setPhoneCodeHash(res.data.phone_code_hash);
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.detail || err.message);
    }
    setLoading(false);
  };

  const handleVerifyCode = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const payload = {
        phone_number: phone,
        phone_code_hash: phoneCodeHash,
        code,
        library,
        password: password || undefined
      };
      const res = await axios.post(`${API_URL}/verify_code`, payload);
      
      if (res.data.needs_password) {
        setNeedsPassword(true);
        setStep(3);
      } else {
        setSessionString(res.data.session_string);
        setStep(4);
      }
    } catch (err) {
      setError(err.response?.data?.detail || err.message);
    }
    setLoading(false);
  };

  return (
    <div className="card">
      <h1>Session Generator</h1>
      <p style={{textAlign: 'center'}}>Generate secure MTProto string sessions for Pyrogram or Telethon.</p>
      
      <div className="steps-indicator">
        <div className={`step-dot ${step >= 1 ? 'active' : ''}`}></div>
        <div className={`step-dot ${step >= 2 ? 'active' : ''}`}></div>
        <div className={`step-dot ${step >= 3 ? 'active' : ''}`}></div>
      </div>

      {error && <div className="error">{error}</div>}

      {step === 1 && (
        <form onSubmit={handleSendCode}>
          <div className="form-group">
            <label>Library</label>
            <select value={library} onChange={e => setLibrary(e.target.value)}>
              <option value="pyrogram">Pyrogram (V2)</option>
              <option value="telethon">Telethon</option>
            </select>
          </div>
          <div className="form-group">
            <label>Phone Number (with country code)</label>
            <input 
              type="text" 
              placeholder="+1234567890" 
              value={phone} 
              onChange={e => setPhone(e.target.value)} 
              required 
            />
          </div>
          <button type="submit" disabled={loading}>
            {loading ? 'Sending Code...' : 'Send OTP'}
          </button>
        </form>
      )}

      {step === 2 && (
        <form onSubmit={handleVerifyCode}>
          <div className="form-group">
            <label>Login Code</label>
            <input 
              type="text" 
              placeholder="12345" 
              value={code} 
              onChange={e => setCode(e.target.value)} 
              required 
            />
          </div>
          <button type="submit" disabled={loading}>
            {loading ? 'Verifying...' : 'Verify Code'}
          </button>
        </form>
      )}

      {step === 3 && (
        <form onSubmit={handleVerifyCode}>
          <div className="form-group">
            <label>Two-Step Verification Password</label>
            <input 
              type="password" 
              placeholder="Your 2FA password" 
              value={password} 
              onChange={e => setPassword(e.target.value)} 
              required 
            />
          </div>
          <button type="submit" disabled={loading}>
            {loading ? 'Logging in...' : 'Submit Password'}
          </button>
        </form>
      )}

      {step === 4 && (
        <div>
          <h2 style={{color: 'var(--accent)', textAlign: 'center'}}>Success!</h2>
          <p>Your {library} string session has been generated. Keep it safe and do not share it with anyone.</p>
          <div className="result-box">
            {sessionString}
          </div>
          <button 
            style={{marginTop: '1rem', background: 'white', color: 'var(--bg-dark)'}}
            onClick={() => {
              navigator.clipboard.writeText(sessionString);
              alert('Copied to clipboard!');
            }}
          >
            Copy Session String
          </button>
        </div>
      )}
    </div>
  );
};

const Help = () => (
  <div className="card">
    <h2>How to get API ID & API Hash?</h2>
    <p>We use our global API keys for generation so you don't have to provide yours. However, if you need them for your own bot:</p>
    <ol style={{paddingLeft: '1.5rem', color: 'var(--text-muted)', lineHeight: '1.8'}}>
      <li>Go to <a href="https://my.telegram.org" target="_blank" style={{color: 'var(--primary)'}}>my.telegram.org</a> and log in.</li>
      <li>Click on "API development tools".</li>
      <li>Fill in the application details (App title and short name can be anything).</li>
      <li>Click "Create application".</li>
      <li>Your <strong>App api_id</strong> and <strong>App api_hash</strong> will be displayed.</li>
    </ol>
  </div>
);

const About = () => (
  <div className="card">
    <h2>About Us</h2>
    <p>We provide a secure, fast, and easy way to generate Telegram string sessions for developers building Telegram bots and userbots.</p>
    <p>This tool connects directly to Telegram's servers. Sessions are generated purely in memory and are <strong>never stored</strong> on our servers.</p>
  </div>
);

const Terms = () => (
  <div className="card">
    <h2>Terms of Service</h2>
    <p>By using this tool, you agree to the following terms:</p>
    <ul style={{paddingLeft: '1.5rem', color: 'var(--text-muted)', lineHeight: '1.8'}}>
      <li>You are responsible for the security of your session string.</li>
      <li>Do not share your session string with anyone. It gives full access to your Telegram account.</li>
      <li>We are not responsible for any bans or account restrictions resulting from the use of userbots or third-party clients.</li>
      <li>This tool is provided "as is" without any warranties.</li>
    </ul>
  </div>
);

function App() {
  return (
    <Router>
      <div className="container">
        <Nav />
        <Routes>
          <Route path="/" element={<Generator />} />
          <Route path="/help" element={<Help />} />
          <Route path="/about" element={<About />} />
          <Route path="/terms" element={<Terms />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
