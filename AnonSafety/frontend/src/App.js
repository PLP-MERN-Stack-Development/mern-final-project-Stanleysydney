import React, { useState, useEffect, useRef, createContext, useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, NavLink } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import io from 'socket.io-client';
import { FaHome, FaBullhorn, FaUserShield, FaHandHoldingHeart, FaEnvelope, FaRobot, FaInfoCircle, FaComment, FaHeart, FaShare, FaCheckCircle, FaTimes, FaFileUpload, FaCircle, FaSearch } from 'react-icons/fa';
import './App.css';

const socket = io('http://localhost:5000');

// --- 1. CONTEXTS ---
const ToastContext = createContext();
const AuthContext = createContext();

// --- 2. MOCK DATA (Restored) ---
const MOCK_REPORTS = [
  { 
    _id: '1', 
    username: 'Wanjiku_K', 
    description: 'Urgent: Assault witnessed at Matatu stage near CBD Archives. Police arrived but suspect fled towards River Road.', 
    region: 'Nairobi', 
    status: 'Under Investigation', 
    likes: 142, 
    createdAt: new Date().toISOString(),
    comments: [
      {user: 'Kenya Police', text: 'Case file #2025/NRB/402 opened. Officers pursuing CCTV leads.', isPolice: true},
      {user: 'Omondi_J', text: 'I was there, I recorded a video. How do I send it?', isPolice: false}
    ] 
  },
  { 
    _id: '2', 
    username: 'Anonymous_User', 
    description: 'Domestic disturbance reported in Nyali, Mombasa. Neighbors intervening but situation escalating.', 
    region: 'Mombasa', 
    status: 'Pending', 
    likes: 56, 
    createdAt: new Date().toISOString(),
    comments: [] 
  },
  { 
    _id: '3', 
    username: 'Chebet_R', 
    description: 'Harassment case at Eldoret market. Need legal aid immediately.', 
    region: 'Eldoret', 
    status: 'Resolved', 
    likes: 89, 
    createdAt: new Date().toISOString(),
    comments: [
      {user: 'FIDA Rep', text: 'Please DM us. We have assigned a pro-bono lawyer to this case.', isPolice: false}
    ] 
  },
];

// --- 3. PROVIDERS ---
const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);
  const addToast = (msg) => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, msg }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3000);
  };
  return (
    <ToastContext.Provider value={addToast}>
      <div className="toast-container">
        {toasts.map(t => <div key={t.id} className="toast"><FaCheckCircle /> {t.msg}</div>)}
      </div>
      {children}
    </ToastContext.Provider>
  );
};

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [showLogin, setShowLogin] = useState(false);
  const addToast = useContext(ToastContext);

  const login = (email, password) => {
    if (password.length < 6) return { error: "Password must be at least 6 characters." };
    const fakeUser = { name: email.split('@')[0], email, region: 'Nairobi' };
    setUser(fakeUser);
    setShowLogin(false);
    addToast(`Welcome back, ${fakeUser.name}`);
    return { success: true };
  };

  return (
    <AuthContext.Provider value={{ user, login, showLogin, setShowLogin }}>
      {children}
    </AuthContext.Provider>
  );
};

// --- 4. PAGE COMPONENTS ---

const LoginModal = () => {
  const { login, setShowLogin } = useContext(AuthContext);
  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');
  const [err, setErr] = useState('');

  const handleLogin = (e) => {
    e.preventDefault();
    const res = login(email, pass);
    if (res.error) setErr(res.error);
  };

  return (
    <div className="modal-overlay" style={{position:'fixed', top:0, left:0, width:'100%', height:'100%', background:'rgba(0,0,0,0.7)', zIndex:2000, display:'flex', justifyContent:'center', alignItems:'center'}} onClick={() => setShowLogin(false)}>
      <div className="widget-card" style={{width:'400px', textAlign:'center'}} onClick={e => e.stopPropagation()}>
        <h2 style={{marginBottom:'20px', color:'#F59E0B'}}>Sign in to AnonSafety</h2>
        {err && <div style={{color:'#e0245e', marginBottom:'10px'}}>{err}</div>}
        <form onSubmit={handleLogin}>
          <input className="input-field" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} />
          <input className="input-field" type="password" placeholder="Password (min 6 chars)" value={pass} onChange={e=>setPass(e.target.value)} />
          <button className="btn-main">Log In</button>
        </form>
      </div>
    </div>
  );
};

const FeedItem = ({ report }) => {
  const [likes, setLikes] = useState(report.likes);
  const [showComments, setShowComments] = useState(false);
  const { user, setShowLogin } = useContext(AuthContext);

  const handleLike = (e) => {
    e.stopPropagation();
    if (!user) return setShowLogin(true);
    setLikes(likes + 1);
  };

  return (
    <div className="card">
      <div className="card-header">
        <div style={{display:'flex', alignItems:'center', gap:'5px'}}>
          <div style={{width:'30px', height:'30px', background:'#333', borderRadius:'50%'}}></div>
          <div style={{fontWeight:'700', color:'white'}}>@{report.username}</div>
          {report.username === 'Kenya Police' && <FaCheckCircle className="verified-tick" />}
        </div>
        <div>
           {report.status === 'Resolved' ? <span style={{color:'var(--success)', fontWeight:'bold'}}>✔ Resolved</span> : <span style={{color:'var(--brand-amber)', fontWeight:'bold'}}>⚠ {report.status}</span>}
        </div>
      </div>
      <p style={{fontSize:'16px', lineHeight:'1.5', marginBottom:'10px'}}>{report.description}</p>
      <div style={{fontSize:'13px', color:'var(--text-gray)'}}>{new Date(report.createdAt).toLocaleDateString()} • {report.region}</div>

      <div className="action-bar">
        <div className="action-icon" onClick={() => setShowComments(!showComments)}>
          <FaComment /> {report.comments.length}
        </div>
        <div className="action-icon" onClick={handleLike}>
          <FaHeart style={{color: likes > report.likes ? 'var(--danger)' : 'inherit'}} /> {likes}
        </div>
        <div className="action-icon"><FaShare /></div>
      </div>

      {showComments && (
        <div className="comments-section">
          {report.comments.map((c, i) => (
            <div key={i} className={`comment-box ${c.isPolice ? 'police-comment' : ''}`}>
              <strong style={{color: c.isPolice ? 'var(--brand-amber)' : 'white'}}>
                {c.user} {c.isPolice && <FaCheckCircle className="verified-tick" />}
              </strong>
              <p style={{marginTop:'4px', color:'#ccc'}}>{c.text}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const Dashboard = () => {
  const [reports, setReports] = useState(MOCK_REPORTS);
  const [newPost, setNewPost] = useState('');
  const { user, setShowLogin } = useContext(AuthContext);
  const addToast = useContext(ToastContext);

  const handlePost = () => {
    if (!user) return setShowLogin(true);
    if (!newPost) return;
    const post = {
      _id: Date.now().toString(),
      username: user.name,
      description: newPost,
      region: user.region,
      status: 'Pending',
      likes: 0,
      comments: [],
      createdAt: new Date().toISOString()
    };
    setReports([post, ...reports]);
    setNewPost('');
    addToast("Report Posted to Feed");
  };

  return (
    <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}>
      <div className="page-header">Home</div>
      
      {/* POST INPUT */}
      <div style={{padding:'20px', borderBottom:'1px solid var(--border-color)'}}>
        <div style={{display:'flex', gap:'15px'}}>
          <div style={{width:'45px', height:'45px', borderRadius:'50%', background:'#555'}}></div>
          <div style={{flex:1}}>
            <textarea 
              className="search-box" 
              placeholder="What's happening in your area?" 
              style={{background:'transparent', fontSize:'18px', resize:'none', border:'none', padding:'10px 0', minHeight:'60px'}}
              value={newPost}
              onChange={e => setNewPost(e.target.value)}
            />
            <div style={{display:'flex', justifyContent:'flex-end', borderTop:'1px solid var(--border-color)', paddingTop:'15px'}}>
              <button className="btn-main" style={{width:'auto', marginTop:0, padding:'10px 25px'}} onClick={handlePost}>Post Report</button>
            </div>
          </div>
        </div>
      </div>

      {/* FEED */}
      {reports.map(rpt => <FeedItem key={rpt._id} report={rpt} />)}
    </motion.div>
  );
};

const Coordinators = () => {
  const regions = [
    { name: 'Nairobi', coord: 'Ofc. Kamau', phone: '0711-000-111', email: 'nrb.gbv@police.go.ke' },
    { name: 'Mombasa', coord: 'Sgt. Zainab', phone: '0722-000-222', email: 'mba.gbv@police.go.ke' },
    { name: 'Kisumu', coord: 'Insp. Omondi', phone: '0733-000-333', email: 'ksm.gbv@police.go.ke' },
    { name: 'Nakuru', coord: 'Ofc. Wanjiku', phone: '0744-000-444', email: 'nku.gbv@police.go.ke' },
    { name: 'Eldoret', coord: 'Mr. Kiplagat', phone: '0755-000-555', email: 'eld.gbv@police.go.ke' },
    { name: 'Nyeri', coord: 'Ms. Nyawira', phone: '0766-000-666', email: 'nyr.gbv@police.go.ke' },
    { name: 'Machakos', coord: 'Ofc. Mutua', phone: '0777-000-777', email: 'mks.gbv@police.go.ke' },
    { name: 'Garissa', coord: 'Mr. Abdi', phone: '0788-000-888', email: 'grs.gbv@police.go.ke' },
  ];

  return (
    <motion.div initial={{x:100, opacity:0}} animate={{x:0, opacity:1}}>
      <div className="page-header">Regional Coordinators</div>
      <div style={{padding:'20px'}}>
        <p style={{marginBottom:'20px', color:'var(--text-gray)'}}>Direct encrypted lines to Gender-Based Violence Desks.</p>
        {regions.map((r, i) => (
          <div key={i} className="card" style={{borderRadius:'12px', marginBottom:'15px'}}>
            <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
              <h3 style={{fontWeight:'800'}}>{r.name} Region</h3>
              <span className="partner-badge">ONLINE</span>
            </div>
            <p style={{marginTop:'10px', fontSize:'16px'}}>👤 {r.coord}</p>
            <p style={{fontWeight:'bold', color:'var(--brand-amber)', marginTop:'5px'}}>📞 {r.phone}</p>
            <p style={{fontSize:'14px', color:'var(--text-gray)'}}>✉️ {r.email}</p>
            <div style={{display:'flex', gap:'10px', marginTop:'15px'}}>
                <button className="btn-main" style={{marginTop:0, padding:'8px', fontSize:'14px'}}>Call Now</button>
                <button className="btn-main" style={{marginTop:0, padding:'8px', fontSize:'14px', background:'transparent', border:'1px solid var(--brand-amber)'}}>Message</button>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
};

const AboutPage = () => (
  <motion.div initial={{opacity:0}} animate={{opacity:1}}>
    <div className="page-header">About AnonSafety</div>
    <div style={{padding:'25px'}}>
      <div className="widget-card" style={{marginBottom:'25px'}}>
        <h2 style={{color:'var(--brand-amber)', marginBottom:'15px'}}>Our Mission in Kenya</h2>
        <p style={{lineHeight:'1.8', fontSize:'16px', color:'#ccc'}}>
          AnonSafety’s mission is to provide a secure, anonymous, and accessible digital platform that empowers survivors of Gender-Based Violence to report incidents without fear. We bridge victims to justice by securely forwarding verified reports to Regional Coordinators, trusted NGOs, the National Police Service, and the Kenya National Commission on Human Rights (KNCHR). Through encrypted evidence submission and coordinated intervention, we ensure that even silent or anonymous survivors receive protection, legal support, and pathways to justice. Our mission is to strengthen accountability, uphold human rights, and build a safer Kenya where every individual is heard, protected, and supported.
        </p>
      </div>

      <div className="widget-card" style={{marginBottom:'25px'}}>
        <h3 style={{marginBottom:'15px'}}>How We Protect You</h3>
        <ul style={{lineHeight:'2', fontSize:'15px'}}>
          <li><strong>Zero-Knowledge Encryption:</strong> We do not store your IP address.</li>
          <li><strong>Direct Linkage:</strong> Reports go straight to Gender Recovery Centers.</li>
          <li><strong>Partnerships:</strong> Integrated with RedCross for medical dispatch.</li>
          <li><strong>Legal Aid:</strong> Automatic flagging for FIDA Kenya lawyers.</li>
        </ul>
      </div>

      <div className="widget-card">
        <h3 style={{marginBottom:'15px'}}>Contact HQ</h3>
        <p><strong>Location:</strong> Upper Hill, Nairobi</p>
        <p><strong>Helpline:</strong> 1195 (Toll Free)</p>
        <p><strong>Email:</strong> help@anonsafety.org</p>
      </div>
    </div>
  </motion.div>
);

const ReportPage = () => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ type: 'GBV', desc: '', region: 'Nairobi', file: null });
  const addToast = useContext(ToastContext);

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    addToast("Encrypting evidence...");
    setTimeout(() => {
      setLoading(false);
      setStep(2);
      addToast("Report forwarded to Police.");
    }, 2000);
  };

  if (step === 2) return (
    <motion.div initial={{scale:0.8, opacity:0}} animate={{scale:1, opacity:1}} style={{padding:'40px', textAlign:'center', marginTop:'50px'}}>
      <FaCheckCircle style={{fontSize:'80px', color:'#17bf63', marginBottom:'20px'}} />
      <h2 style={{fontSize:'28px'}}>Thank you for your bravery.</h2>
      <p style={{color:'#8899a6', margin:'20px 0', lineHeight:'1.6'}}>
        Your report has been securely encrypted and forwarded to the <strong>{formData.region}</strong> Regional Coordinator.
      </p>
      <div style={{background:'#253341', padding:'15px', borderRadius:'10px', display:'inline-block'}}>
         Reference ID: <strong style={{color:'var(--brand-amber)'}}>#KE-{Math.floor(Math.random()*90000)+10000}</strong>
      </div>
      <br/><br/>
      <button className="btn-main" onClick={() => setStep(1)} style={{width:'200px'}}>Report Another</button>
    </motion.div>
  );

  return (
    <motion.div initial={{opacity:0}} animate={{opacity:1}}>
      <div className="page-header">Report Incident</div>
      <div style={{padding:'25px'}}>
        <div style={{background:'rgba(245, 158, 11, 0.15)', padding:'15px', borderRadius:'10px', marginBottom:'25px', color:'#F59E0B', fontSize:'15px', display:'flex', gap:'10px', alignItems:'center'}}>
          <FaUserShield /> <span>Your anonymity is guaranteed. Evidence is encrypted.</span>
        </div>
        <form onSubmit={handleSubmit}>
          <div style={{marginBottom:'20px'}}>
            <label style={{fontWeight:'700', display:'block', marginBottom:'8px'}}>Region</label>
            <select className="input-field" onChange={e=>setFormData({...formData, region:e.target.value})}>
              <option>Nairobi</option><option>Mombasa</option><option>Kisumu</option><option>Nakuru</option><option>Eldoret</option>
            </select>
          </div>
          <div style={{marginBottom:'20px'}}>
             <label style={{fontWeight:'700', display:'block', marginBottom:'8px'}}>Description</label>
             <textarea className="input-field" rows="8" placeholder="Describe the incident..." required onChange={e=>setFormData({...formData, desc:e.target.value})}></textarea>
          </div>
          <div style={{marginBottom:'20px'}}>
             <label style={{fontWeight:'700', display:'block', marginBottom:'8px'}}>Attach Evidence</label>
             <div style={{border:'2px dashed #38444d', padding:'30px', borderRadius:'10px', textAlign:'center', cursor:'pointer', background:'rgba(255,255,255,0.02)'}}>
               <FaFileUpload style={{fontSize:'30px', marginBottom:'10px', color:'var(--text-gray)'}} />
               <p style={{color:'var(--text-gray)'}}>Click to upload Video/Photo</p>
               <input type="file" style={{display:'none'}} onChange={e=>setFormData({...formData, file:e.target.files[0]})} />
             </div>
          </div>
          <button className="btn-main" disabled={loading}>{loading ? 'Encrypting & Sending...' : 'Submit Report'}</button>
        </form>
      </div>
    </motion.div>
  );
};

const Grants = () => (
  <motion.div initial={{opacity:0}} animate={{opacity:1}}>
    <div className="page-header">Grants & Aid</div>
    <div style={{padding:'25px'}}>
      <div className="grant-card">
        <h3>RedCross Medical Fund</h3>
        <p style={{color:'var(--text-gray)', margin:'10px 0'}}>Provides immediate coverage for hospital bills for assault survivors.</p>
        <button className="btn-main" style={{width:'auto', padding:'10px 20px'}}>Apply Now</button>
      </div>
      <div className="grant-card" style={{borderLeftColor:'#17bf63'}}>
        <h3>FIDA Legal Aid</h3>
        <p style={{color:'var(--text-gray)', margin:'10px 0'}}>Free legal representation for women and children.</p>
        <button className="btn-main" style={{width:'auto', padding:'10px 20px', background:'#17bf63'}}>Contact Lawyer</button>
      </div>
    </div>
  </motion.div>
);

const Chatbot = () => {
  const { user } = useContext(AuthContext);
  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState([]);
  const [input, setInput] = useState("");
  const endRef = useRef(null);

  useEffect(() => {
    if (open && msgs.length === 0) {
      setMsgs([{ text: user ? `Hello ${user.name}, how can I help?` : "Welcome to AnonSafety. How can I assist?", sender: 'bot' }]);
    }
  }, [open, user]);

  const handleSend = () => {
    if (!input) return;
    setMsgs(prev => [...prev, { text: input, sender: 'user' }]);
    let reply = "I am forwarding your query to a coordinator.";
    if (input.toLowerCase().includes('assault')) reply = "I am detecting distress. Please call 999 immediately. I am alerting the dashboard.";
    if (input.toLowerCase().includes('coordinator')) reply = "You can find all contact numbers in the Coordinators tab.";
    
    setTimeout(() => {
      setMsgs(prev => [...prev, { text: reply, sender: 'bot' }]);
      endRef.current?.scrollIntoView({behavior:'smooth'});
    }, 1000);
    setInput("");
  };

  return (
    <>
      <div className="chatbot-btn" onClick={() => setOpen(!open)}>{open ? <FaTimes /> : <FaRobot />}</div>
      {open && (
        <div className="chatbot-window">
          <div style={{background:'var(--brand-amber)', padding:'15px', fontWeight:'bold', display:'flex', justifyContent:'space-between'}}>
            <span>AnonSafety Chat</span>
            <span style={{fontSize:'12px', background:'black', padding:'2px 6px', borderRadius:'5px'}}>LIVE</span>
          </div>
          <div style={{flex:1, padding:'15px', overflowY:'auto'}}>
             {msgs.map((m, i) => <div key={i} className={`msg ${m.sender}`}>{m.text}</div>)}
             <div ref={endRef} />
          </div>
          <div style={{padding:'10px', borderTop:'1px solid #333', display:'flex'}}>
            <input style={{flex:1, background:'transparent', border:'none', color:'white', outline:'none'}} value={input} onChange={e=>setInput(e.target.value)} placeholder="Type here..." />
            <button onClick={handleSend} style={{background:'none', border:'none', color:'var(--brand-amber)', fontSize:'20px'}}>➤</button>
          </div>
        </div>
      )}
    </>
  );
};

// --- 5. LAYOUT ---
const AppLayout = () => {
  const { user, setShowLogin, showLogin } = useContext(AuthContext);
  return (
    <Router>
      <div className="app-container">
        {/* SIDEBAR */}
        <div className="sidebar">
          <div>
            <div className="logo"><FaUserShield /> AnonSafety</div>
            <ul>
              <NavLink to="/" className={({isActive}) => isActive ? "nav-link active" : "nav-link"}><FaHome /><span>Home</span></NavLink>
              <NavLink to="/about" className={({isActive}) => isActive ? "nav-link active" : "nav-link"}><FaInfoCircle /><span>About</span></NavLink>
              <NavLink to="/coordinators" className={({isActive}) => isActive ? "nav-link active" : "nav-link"}><FaUserShield /><span>Coordinators</span></NavLink>
              <NavLink to="/grants" className={({isActive}) => isActive ? "nav-link active" : "nav-link"}><FaHandHoldingHeart /><span>Grants</span></NavLink>
            </ul>
            <button className="btn-main" onClick={() => window.location.href='/report'}>REPORT CASE</button>
          </div>
          <div className="user-badge" onClick={() => !user && setShowLogin(true)}>
            <div style={{width:'40px', height:'40px', borderRadius:'50%', background: user ? 'var(--success)' : '#888', display:'flex', alignItems:'center', justifyContent:'center'}}>
               {user ? user.name[0] : '?'}
            </div>
            <div>
               <div style={{fontWeight:'bold'}}>{user ? user.name : 'Guest'}</div>
               <div style={{fontSize:'12px', color:'var(--text-gray)'}}>{user ? 'Online' : 'Login'}</div>
            </div>
          </div>
        </div>

        {/* CONTENT */}
        <div className="feed">
          <AnimatePresence mode="wait">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/coordinators" element={<Coordinators />} />
              <Route path="/report" element={<ReportPage />} />
              <Route path="/grants" element={<Grants />} />
            </Routes>
          </AnimatePresence>
        </div>

        {/* WIDGETS */}
        <div className="widgets">
          <input className="search-box" placeholder="Search AnonSafety..." />
          <div className="widget-card">
             <div className="widget-title">Official Partners</div>
             <div className="partner-item"><strong>RedCross KE</strong><FaCheckCircle className="verified-tick"/></div>
             <div className="partner-item"><strong>Kenya Police</strong><FaCheckCircle className="verified-tick"/></div>
             <div className="partner-item"><strong>KNHRC</strong><FaCheckCircle className="verified-tick"/></div>
          </div>
          <div className="widget-card">
             <div className="widget-title">Trends</div>
             <div className="trend-item">
               <div style={{fontSize:'12px', color:'var(--text-gray)'}}>Nairobi</div>
               <div style={{fontWeight:'bold'}}>#EndGBV</div>
             </div>
             <div className="trend-item">
               <div style={{fontSize:'12px', color:'var(--text-gray)'}}>Safety</div>
               <div style={{fontWeight:'bold'}}>#JusticeForWanjiku</div>
             </div>
          </div>
        </div>
      </div>
      {showLogin && <LoginModal />}
      <Chatbot />
    </Router>
  );
};

export default function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <AppLayout />
      </AuthProvider>
    </ToastProvider>
  );
}