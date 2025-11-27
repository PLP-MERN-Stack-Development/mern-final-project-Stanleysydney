import React, { useState, useEffect, useRef, createContext, useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import io from 'socket.io-client';
import axios from 'axios';
import { 
  FaHome, FaUserShield, FaHandHoldingHeart, FaRobot, FaInfoCircle, 
  FaComment, FaHeart, FaShare, FaCheckCircle, FaTimes, FaFileUpload, 
  FaLock, FaMapMarkerAlt, FaSun, FaMoon, FaEnvelope, FaSignOutAlt, FaPhoneAlt, FaArrowLeft, FaGavel, FaHospital
} from 'react-icons/fa';
import './App.css';

// --- CONFIGURATION ---
const API_URL = 'http://localhost:5000'; 
const socket = io(API_URL);

// --- CONTEXTS ---
const ToastContext = createContext();
const AuthContext = createContext();

// --- 1. PROVIDERS ---

const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);
  const addToast = (msg, type = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, msg, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000);
  };
  return (
    <ToastContext.Provider value={addToast}>
      <div style={{position:'fixed', top:'20px', left:'50%', transform:'translateX(-50%)', zIndex:3000, display:'flex', flexDirection:'column', gap:'10px'}}>
        <AnimatePresence>
          {toasts.map(t => (
            <motion.div key={t.id} initial={{opacity:0, y:-20}} animate={{opacity:1, y:0}} exit={{opacity:0}} style={{background: t.type==='error'?'var(--danger)':'var(--brand-amber)', color:'white', padding:'12px 25px', borderRadius:'30px', fontWeight:'bold', display:'flex', alignItems:'center', gap:'10px', boxShadow:'0 5px 15px rgba(0,0,0,0.2)'}}>
              {t.type === 'error' ? <FaTimes /> : <FaCheckCircle />} {t.msg}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
      {children}
    </ToastContext.Provider>
  );
};

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const addToast = useContext(ToastContext);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    if (token && storedUser) setUser(JSON.parse(storedUser));
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const res = await axios.post(`${API_URL}/api/auth/login`, { email, password });
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      setUser(res.data.user);
      setShowAuthModal(false);
      addToast(`Welcome back, ${res.data.user.username}`);
    } catch (err) { addToast(err.response?.data?.msg || "Login failed", "error"); }
  };

  const register = async (userData) => {
    try {
      const res = await axios.post(`${API_URL}/api/auth/register`, userData);
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      setUser(res.data.user);
      setShowAuthModal(false);
      addToast("Account Created. Email alerts enabled.");
    } catch (err) { addToast(err.response?.data?.msg || "Registration failed", "error"); }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    addToast("Logged out successfully");
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, showAuthModal, setShowAuthModal, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

// --- 2. COMPONENTS ---

const AuthModal = () => {
  const { login, register, setShowAuthModal } = useContext(AuthContext);
  const [isRegister, setIsRegister] = useState(false);
  const [formData, setFormData] = useState({ username: '', email: '', password: '', region: 'Nairobi', emailNotifications: true });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isRegister) register(formData);
    else login(formData.email, formData.password);
  };

  return (
    <div className="modal-overlay" onClick={() => setShowAuthModal(false)} style={{position:'fixed', top:0, left:0, width:'100%', height:'100%', background:'rgba(0,0,0,0.8)', zIndex:2000, display:'flex', justifyContent:'center', alignItems:'center'}}>
      <div className="card" style={{width:'400px', padding:'30px', borderRadius:'15px'}} onClick={e => e.stopPropagation()}>
        <div style={{display:'flex', borderBottom:'1px solid var(--border-color)', marginBottom:'20px'}}>
          <div onClick={() => setIsRegister(false)} style={{flex:1, textAlign:'center', padding:'10px', cursor:'pointer', borderBottom: !isRegister ? '2px solid var(--brand-amber)' : 'none', color: !isRegister ? 'var(--text-main)' : 'var(--text-muted)'}}>LOGIN</div>
          <div onClick={() => setIsRegister(true)} style={{flex:1, textAlign:'center', padding:'10px', cursor:'pointer', borderBottom: isRegister ? '2px solid var(--brand-amber)' : 'none', color: isRegister ? 'var(--text-main)' : 'var(--text-muted)'}}>REGISTER</div>
        </div>
        <form onSubmit={handleSubmit}>
          {isRegister && <input className="input-field" placeholder="Username" onChange={e=>setFormData({...formData, username:e.target.value})} required />}
          <input className="input-field" placeholder="Email" type="email" onChange={e=>setFormData({...formData, email:e.target.value})} required />
          <input className="input-field" placeholder="Password" type="password" onChange={e=>setFormData({...formData, password:e.target.value})} required />
          {isRegister && (
             <div style={{marginTop:'10px', display:'flex', gap:'10px'}}>
                <input type="checkbox" checked={formData.emailNotifications} onChange={e=>setFormData({...formData, emailNotifications:e.target.checked})} />
                <label style={{fontSize:'14px', color:'var(--text-muted)'}}>Enable Email Notifications</label>
             </div>
          )}
          <button className="btn-main" style={{marginTop:'20px'}}>{isRegister ? 'Create Account' : 'Login'}</button>
        </form>
      </div>
    </div>
  );
};

const FeedItem = ({ report }) => {
  const [likes, setLikes] = useState(report.likes);
  const { user, setShowAuthModal } = useContext(AuthContext);

  const handleLike = async () => {
    if (!user) return setShowAuthModal(true);
    try { await axios.put(`${API_URL}/api/reports/${report._id}/like`); setLikes(likes + 1); } catch (e) {}
  };

  return (
    <div className="card">
      <div style={{display:'flex', justifyContent:'space-between', marginBottom:'10px'}}>
        <div style={{display:'flex', gap:'10px', alignItems:'center'}}>
          <div style={{width:'40px', height:'40px', borderRadius:'50%', background:'#333', display:'flex', alignItems:'center', justifyContent:'center'}}>
            {report.username === 'Anonymous' ? <FaUserShield /> : report.username[0]}
          </div>
          <div>
            <div style={{fontWeight:'bold'}}>{report.username} {report.username !== 'Anonymous' && <FaCheckCircle style={{color:'var(--brand-amber)'}}/>}</div>
            <div style={{fontSize:'12px', color:'var(--text-muted)'}}>{report.region} • {new Date(report.createdAt).toLocaleDateString()}</div>
          </div>
        </div>
        <span style={{color: report.status === 'Resolved' ? 'var(--success)' : 'var(--brand-amber)', fontSize:'12px', fontWeight:'bold'}}>{report.status}</span>
      </div>
      <p style={{lineHeight:'1.5'}}>{report.description}</p>
      {report.evidenceUrl && <img src={`${API_URL}/${report.evidenceUrl.replace(/\\/g, "/")}`} style={{width:'100%', borderRadius:'10px', marginTop:'10px'}} alt="evidence" />}
      <div style={{display:'flex', gap:'20px', marginTop:'15px', color:'var(--text-muted)'}}>
        <span onClick={handleLike} style={{cursor:'pointer', display:'flex', alignItems:'center', gap:'5px'}}><FaHeart color={likes > report.likes ? 'var(--danger)' : 'inherit'} /> {likes}</span>
        <span style={{display:'flex', alignItems:'center', gap:'5px'}}><FaComment /> {report.comments.length}</span>
      </div>
    </div>
  );
};

// --- 3. PAGES ---

// DASHBOARD
const Dashboard = () => {
  const [reports, setReports] = useState([]);
  const [newPostText, setNewPostText] = useState('');
  const { user, setShowAuthModal } = useContext(AuthContext);
  const addToast = useContext(ToastContext);

  useEffect(() => {
    axios.get(`${API_URL}/api/reports`).then(res => setReports(res.data)).catch(() => {});
    socket.on('new_report', (rpt) => { setReports(prev => [rpt, ...prev]); addToast("New Alert in your feed"); });
    return () => socket.off('new_report');
  }, [addToast]);

  const handleQuickPost = async () => {
    if (!user) return setShowAuthModal(true);
    if (!newPostText.trim()) return;
    try {
        await axios.post(`${API_URL}/api/reports`, {
            username: user.username, description: newPostText, region: user.region || 'Nairobi'
        });
        setNewPostText('');
    } catch(err) { addToast("Failed to post", "error"); }
  };

  return (
    <div className="feed-container">
      <div style={{padding:'20px', borderBottom:'1px solid var(--border-color)'}}>
        <h2 style={{marginBottom:'20px'}}>Live Safety Feed</h2>
        <div style={{display:'flex', gap:'10px'}}>
          <div style={{width:'40px', height:'40px', borderRadius:'50%', background: user ? 'var(--brand-amber)' : '#555', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:'bold'}}>{user ? user.username[0] : '?'}</div>
          <div style={{flex:1}}>
            <textarea className="input-field" placeholder="What is happening in your area?" value={newPostText} onChange={e=>setNewPostText(e.target.value)} style={{border:'none', background:'transparent', fontSize:'18px', padding:'10px 0'}} onClick={() => !user && setShowAuthModal(true)} />
            <div style={{borderTop:'1px solid var(--border-color)', paddingTop:'10px', display:'flex', justifyContent:'flex-end'}}>
                <button className="btn-main" style={{width:'auto', padding:'8px 20px', marginTop:0}} onClick={handleQuickPost} disabled={!user}>Post Alert</button>
            </div>
          </div>
        </div>
      </div>
      {reports.map(r => <FeedItem key={r._id} report={r} />)}
    </div>
  );
};

// COORDINATORS
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
    { name: 'Thika', coord: 'Mrs. Mwangi', phone: '0799-000-999', email: 'thk.gbv@police.go.ke' },
    { name: 'Malindi', coord: 'Ofc. Juma', phone: '0710-101-010', email: 'mld.gbv@police.go.ke' },
    { name: 'Kakamega', coord: 'Insp. Nekesa', phone: '0720-202-020', email: 'kkm.gbv@police.go.ke' },
    { name: 'Meru', coord: 'Mr. Kirimi', phone: '0730-303-030', email: 'mru.gbv@police.go.ke' },
  ];

  return (
    <motion.div initial={{opacity:0}} animate={{opacity:1}} style={{paddingBottom:'40px'}}>
      <div style={{padding:'20px', borderBottom:'1px solid var(--border-color)'}}>
        <h2>Regional Coordinators</h2>
        <p style={{color:'var(--text-muted)'}}>Direct lines to Gender Desks across Kenya.</p>
      </div>
      <div style={{padding:'20px', display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(280px, 1fr))', gap:'20px'}}>
        {regions.map((r, i) => (
          <div key={i} className="card" style={{borderRadius:'15px', borderLeft:'4px solid var(--brand-amber)'}}>
            <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
              <h3 style={{fontSize:'18px'}}>{r.name}</h3>
              <span style={{fontSize:'10px', background:'var(--success)', color:'white', padding:'2px 6px', borderRadius:'4px'}}>ONLINE</span>
            </div>
            <p style={{marginTop:'10px', fontSize:'15px'}}>👤 {r.coord}</p>
            <p style={{fontWeight:'bold', color:'var(--brand-amber)', marginTop:'5px'}}><FaPhoneAlt /> {r.phone}</p>
            <p style={{fontSize:'13px', color:'var(--text-muted)', marginTop:'5px'}}>✉️ {r.email}</p>
            <button className="btn-main" style={{padding:'8px', marginTop:'15px', fontSize:'14px'}}>Call Securely</button>
          </div>
        ))}
      </div>
    </motion.div>
  );
};

// ABOUT
const About = () => (
  <motion.div initial={{opacity:0}} animate={{opacity:1}}>
    <div style={{padding:'20px', borderBottom:'1px solid var(--border-color)'}}>
        <h2>About AnonSafety</h2>
    </div>
    <div style={{padding:'25px'}}>
      <div className="card" style={{borderRadius:'15px', marginBottom:'25px'}}>
        <h3 style={{color:'var(--brand-amber)', marginBottom:'15px'}}>Our Mission in Kenya</h3>
        <p style={{lineHeight:'1.8', fontSize:'15px'}}>
          AnonSafety was born out of necessity. It serves as a bridge between silent suffering and active justice.
          We provide a millions-Scale, High-Performance platform designed specifically for the timid and anonymous victim.
          Our mission is to empower silence and ensure justice by securely forwarding verified reports to Regional Coordinators, 
          trusted NGOs, and the National Police Service.
        </p>
      </div>

      <div className="card" style={{borderRadius:'15px', marginBottom:'25px'}}>
        <h3 style={{marginBottom:'15px'}}>How We Protect You</h3>
        <ul style={{lineHeight:'2', fontSize:'15px'}}>
          <li><strong>100% Anonymity:</strong> Report as a "Guest" without account creation.</li>
          <li><strong>Zero-Knowledge Encryption:</strong> We do not log your IP address.</li>
          <li><strong>Direct Routing:</strong> Cases go straight to Gender Desks.</li>
          <li><strong>Partnerships:</strong> Connected with RedCross and FIDA Kenya.</li>
        </ul>
      </div>

      <div className="card" style={{borderRadius:'15px'}}>
        <h3>Contact HQ</h3>
        <p style={{marginTop:'10px'}}><strong>Location:</strong> Upper Hill, Nairobi</p>
        <p><strong>Emergency:</strong> 999 / 112</p>
        <p><strong>GBV Hotline:</strong> 1195</p>
      </div>
    </div>
  </motion.div>
);

// --- NEW GRANTS COMPONENT (WAIVER FORM & LAWYER LIST) ---
const Grants = () => {
  const [view, setView] = useState('main'); // 'main', 'waiver', 'lawyers'
  const addToast = useContext(ToastContext);
  const [loading, setLoading] = useState(false);

  // WAIVER FORM STATE
  const [waiverData, setWaiverData] = useState({
    fullName: '', hospital: '', patientNo: '', county: 'Nairobi', description: '', contact: ''
  });

  const handleWaiverSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    // Simulate Backend API Call
    setTimeout(() => {
      setLoading(false);
      addToast("Application Sent to RedCross & NGAAF");
      setView('main');
      setWaiverData({ fullName: '', hospital: '', patientNo: '', county: 'Nairobi', description: '', contact: '' });
    }, 2000);
  };

  // MOCK LAWYERS DATA
  const lawyers = [
    { name: "Wakili Ochieng", firm: "Kituo Cha Sheria", type: "Criminal Defense", email: "ochieng@kituo.or.ke" },
    { name: "Adv. Sarah Maina", firm: "FIDA Kenya", type: "Family Law & GBV", email: "sarah@fidakenya.org" },
    { name: "Kamau & Associates", firm: "Private (Pro-Bono)", type: "Civil Rights", email: "probono@kamaulegal.co.ke" },
    { name: "Legal Aid Centre", firm: "Nairobi HQ", type: "General Assistance", email: "help@legalaid.go.ke" },
    { name: "Adv. Fatuma Ali", firm: "Muslim Sisters Network", type: "Sharia & Family", email: "fatuma@msn.or.ke" },
  ];

  // MAIN VIEW
  if (view === 'main') return (
    <motion.div initial={{opacity:0}} animate={{opacity:1}}>
      <div style={{padding:'20px', borderBottom:'1px solid var(--border-color)'}}>
          <h2>Grants & Aid Portal</h2>
      </div>
      <div style={{padding:'25px'}}>
        <div className="card" style={{borderRadius:'15px', marginBottom:'20px', borderLeft:'5px solid #E0245E'}}>
          <h3><FaHospital /> RedCross Medical Fund</h3>
          <p style={{color:'var(--text-muted)', margin:'10px 0'}}>
            Provides immediate coverage for hospital bills for assault survivors who cannot afford treatment.
          </p>
          <button className="btn-main" style={{width:'auto', padding:'10px 20px', background:'#E0245E'}} onClick={() => setView('waiver')}>
            Apply for Waiver
          </button>
        </div>
        
        <div className="card" style={{borderRadius:'15px', borderLeft:'5px solid #17BF63'}}>
          <h3><FaGavel /> FIDA Legal Representation</h3>
          <p style={{color:'var(--text-muted)', margin:'10px 0'}}>
            Connect with pro-bono lawyers willing to take up GBV and Child Protection cases for free.
          </p>
          <button className="btn-main" style={{width:'auto', padding:'10px 20px', background:'#17BF63'}} onClick={() => setView('lawyers')}>
            Contact Lawyer
          </button>
        </div>
      </div>
    </motion.div>
  );

  // WAIVER FORM VIEW
  if (view === 'waiver') return (
    <motion.div initial={{x:20, opacity:0}} animate={{x:0, opacity:1}}>
       <div style={{padding:'20px', borderBottom:'1px solid var(--border-color)', display:'flex', alignItems:'center', gap:'15px'}}>
          <FaArrowLeft style={{cursor:'pointer'}} onClick={() => setView('main')} />
          <h2>Medical Waiver Application</h2>
       </div>
       <div style={{padding:'25px'}}>
         <div style={{background:'rgba(224, 36, 94, 0.1)', padding:'15px', borderRadius:'10px', color:'#E0245E', marginBottom:'20px'}}>
            <FaInfoCircle /> Only for emergency GBV cases. Data is shared with RedCross Kenya securely.
         </div>
         <form onSubmit={handleWaiverSubmit}>
            <label>Full Name (Or Alias)</label>
            <input className="input-field" value={waiverData.fullName} onChange={e=>setWaiverData({...waiverData, fullName:e.target.value})} required />
            
            <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'20px'}}>
                <div>
                    <label>Hospital Name</label>
                    <input className="input-field" placeholder="e.g. KNH" value={waiverData.hospital} onChange={e=>setWaiverData({...waiverData, hospital:e.target.value})} required />
                </div>
                <div>
                    <label>Patient/Admission No.</label>
                    <input className="input-field" placeholder="Optional" value={waiverData.patientNo} onChange={e=>setWaiverData({...waiverData, patientNo:e.target.value})} />
                </div>
            </div>

            <label>County/Region</label>
            <select className="input-field" value={waiverData.county} onChange={e=>setWaiverData({...waiverData, county:e.target.value})}>
                <option>Nairobi</option><option>Mombasa</option><option>Kisumu</option><option>Nakuru</option><option>Eldoret</option>
            </select>

            <label>Description of Injuries / Situation</label>
            <textarea className="input-field" rows="4" value={waiverData.description} onChange={e=>setWaiverData({...waiverData, description:e.target.value})} required></textarea>

            <label>Contact Phone/Email</label>
            <input className="input-field" value={waiverData.contact} onChange={e=>setWaiverData({...waiverData, contact:e.target.value})} required />

            <button className="btn-main" style={{background:'#E0245E'}} disabled={loading}>{loading ? 'Submitting Application...' : 'Submit Application'}</button>
         </form>
       </div>
    </motion.div>
  );

  // LAWYER LIST VIEW
  if (view === 'lawyers') return (
    <motion.div initial={{x:20, opacity:0}} animate={{x:0, opacity:1}}>
       <div style={{padding:'20px', borderBottom:'1px solid var(--border-color)', display:'flex', alignItems:'center', gap:'15px'}}>
          <FaArrowLeft style={{cursor:'pointer'}} onClick={() => setView('main')} />
          <h2>Pro-Bono Legal Directory</h2>
       </div>
       <div style={{padding:'25px'}}>
          <p style={{color:'var(--text-muted)', marginBottom:'20px'}}>Click on an email to contact a lawyer directly.</p>
          {lawyers.map((lawyer, i) => (
             <div key={i} className="card" style={{borderRadius:'10px', marginBottom:'15px', borderLeft:'4px solid #17BF63'}}>
                <div style={{display:'flex', justifyContent:'space-between'}}>
                    <h3 style={{fontSize:'18px'}}>{lawyer.name}</h3>
                    <span style={{fontSize:'12px', background:'var(--bg-dim)', padding:'4px 8px', borderRadius:'4px'}}>{lawyer.firm}</span>
                </div>
                <p style={{color:'var(--text-muted)', fontSize:'14px', margin:'5px 0'}}>Spec: {lawyer.type}</p>
                <a href={`mailto:${lawyer.email}`} style={{color:'#17BF63', fontWeight:'bold', display:'flex', alignItems:'center', gap:'8px', marginTop:'10px'}}>
                   <FaEnvelope /> {lawyer.email}
                </a>
             </div>
          ))}
       </div>
    </motion.div>
  );
};

// REPORT PAGE
const ReportPage = () => {
  const { user } = useContext(AuthContext);
  const addToast = useContext(ToastContext);
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    region: 'Nairobi', date: '', time: '', desc: '', perp: '', email: '', file: null
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const d = new FormData();
    d.append('description', `[${formData.date} @ ${formData.time}] ${formData.desc}. Perpetrator: ${formData.perp}`);
    d.append('region', formData.region);
    d.append('username', user ? user.username : 'Anonymous');
    if (formData.email) d.append('contactEmail', formData.email);
    if (formData.file) d.append('evidence', formData.file);

    try {
      await axios.post(`${API_URL}/api/reports`, d, { headers: { 'Content-Type': 'multipart/form-data' } });
      setLoading(false); setStep(2); addToast("Report Encrypted & Sent");
    } catch (err) { setLoading(false); addToast("Submission Failed", "error"); }
  };

  if (step === 2) return (
    <div style={{padding:'50px', textAlign:'center'}}>
      <FaCheckCircle size={80} color="var(--success)" />
      <h2 style={{marginTop:'20px'}}>Received. Forwarded to {formData.region} Desk.</h2>
      <p style={{color:'var(--text-muted)', margin:'20px 0'}}>
        {formData.email ? `Updates will be sent to: ${formData.email}` : "You chose not to receive email updates."}
      </p>
      <button className="btn-main" onClick={() => setStep(1)} style={{width:'200px'}}>Submit Another</button>
    </div>
  );

  return (
    <div style={{padding:'20px'}}>
      <div style={{background:'rgba(245, 158, 11, 0.1)', padding:'15px', borderRadius:'10px', color:'var(--brand-amber)', marginBottom:'20px', display:'flex', gap:'10px', alignItems:'center'}}>
        <FaLock /> <span>Secure, Encrypted, and Anonymous. We collect details to build a strong case.</span>
      </div>
      <form onSubmit={handleSubmit}>
        <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'20px'}}>
           <div><label>Region</label><select className="input-field" onChange={e=>setFormData({...formData, region:e.target.value})}><option>Nairobi</option><option>Mombasa</option><option>Kisumu</option><option>Nakuru</option><option>Eldoret</option><option>Nyeri</option><option>Machakos</option></select></div>
           <div><label>Date</label><input type="date" className="input-field" onChange={e=>setFormData({...formData, date:e.target.value})} required /></div>
        </div>
        <label>Time</label><input type="time" className="input-field" onChange={e=>setFormData({...formData, time:e.target.value})} required/>
        <label>Description</label><textarea className="input-field" rows="5" placeholder="Describe the event..." onChange={e=>setFormData({...formData, desc:e.target.value})} required></textarea>
        <label>Perpetrator Details</label><input className="input-field" placeholder="Name, appearance, vehicle..." onChange={e=>setFormData({...formData, perp:e.target.value})} />
        <label>Evidence</label><input type="file" className="input-field" onChange={e=>setFormData({...formData, file:e.target.files[0]})} />
        
        <div style={{marginTop:'20px', padding:'15px', border:'1px solid var(--border-color)', borderRadius:'10px'}}>
          <label style={{display:'flex', alignItems:'center', gap:'10px', fontWeight:'bold'}}><FaEnvelope /> Receive Case Updates?</label>
          <input className="input-field" type="email" placeholder={user ? user.email : "Enter email for anonymous updates..."} value={user ? user.email : formData.email} onChange={e=>setFormData({...formData, email:e.target.value})} disabled={!!user} style={{marginTop:'10px'}} />
        </div>

        <button className="btn-main" style={{marginTop:'20px'}} disabled={loading}>{loading ? 'Encrypting...' : 'Submit Report'}</button>
      </form>
    </div>
  );
};

// CHATBOT
const Chatbot = () => {
  const { user } = useContext(AuthContext);
  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState([]);
  const [input, setInput] = useState("");
  const [step, setStep] = useState(0); 
  const endRef = useRef(null);
  
  useEffect(() => {
    if (open && msgs.length === 0) {
       if(user) { setMsgs([{ text: `Hello ${user.username}. I see you. You are safe here. Can you tell me what happened?`, sender: 'bot' }]); setStep(1); }
       else { setMsgs([{ text: "Hello. I am the AnonSafety Assistant. Before we start, may I know your name or alias?", sender: 'bot' }]); setStep(0); }
    }
  }, [open, user]);

  const handleSend = () => {
    if (!input.trim()) return;
    setMsgs(prev => [...prev, { text: input, sender: 'user' }]);
    setInput("");
    setTimeout(() => {
      let reply = "";
      if (step === 0) { reply = `Hello ${input}. I see you. You are safe here. Can you tell me what happened?`; setStep(1); }
      else if (step === 1) { reply = "I am so sorry you are going through this. It is not your fault. We are here to help."; setStep(2); }
      else if (step === 2) { reply = "I have forwarded your details to the relevant Gender Desk. You will receive updates via your email shortly."; setStep(3); }
      else { reply = "Is there anything else I can help you with?"; }
      setMsgs(prev => [...prev, { text: reply, sender: 'bot' }]);
      endRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 1000);
  };

  return (
    <>
      <div className="chatbot-btn" onClick={() => setOpen(!open)} style={{position:'fixed', bottom:'30px', right:'30px', width:'60px', height:'60px', background:'var(--brand-amber)', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'24px', cursor:'pointer', boxShadow:'0 5px 15px rgba(0,0,0,0.3)', color:'white', zIndex:1000}}>
        {open ? <FaTimes /> : <FaRobot />}
      </div>
      {open && (
        <div className="chatbot-window">
          <div style={{background:'var(--brand-amber)', padding:'15px', color:'white', fontWeight:'bold'}}>AnonSafety Support</div>
          <div style={{flex:1, padding:'15px', overflowY:'auto', background:'var(--bg-card)'}}>
            {msgs.map((m, i) => <div key={i} className={`msg ${m.sender}`}>{m.text}</div>)}
            <div ref={endRef} />
          </div>
          <div style={{padding:'10px', background:'var(--bg-dim)', display:'flex'}}>
            <input className="input-field" style={{margin:0, border:'none'}} value={input} onChange={e=>setInput(e.target.value)} onKeyPress={e=> e.key==='Enter' && handleSend()} placeholder="Type here..." />
            <button onClick={handleSend} style={{background:'none', border:'none', fontSize:'20px', marginLeft:'10px', cursor:'pointer', color:'var(--brand-amber)'}}>➤</button>
          </div>
        </div>
      )}
    </>
  );
};

// 5. MAIN LAYOUT
const AppLayout = () => {
  const { user, setShowAuthModal, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [darkMode, setDarkMode] = useState(true);

  const toggleTheme = () => {
    setDarkMode(!darkMode);
    document.body.classList.toggle('light-mode');
  };

  return (
    <div className="app-container">
      {/* SIDEBAR */}
      <div className="sidebar">
        <div>
          <h1 style={{color:'var(--brand-amber)', display:'flex', alignItems:'center', gap:'10px', fontSize:'24px', marginBottom:'30px'}}>
            <FaUserShield /> AnonSafety
          </h1>
          <nav>
            <div className="nav-link" onClick={()=>navigate('/')}><FaHome /> Feed</div>
            <div className="nav-link" onClick={()=>navigate('/about')}><FaInfoCircle /> About</div>
            <div className="nav-link" onClick={()=>navigate('/coordinators')}><FaMapMarkerAlt /> Coordinators</div>
            <div className="nav-link" onClick={()=>navigate('/grants')}><FaHandHoldingHeart /> Grants</div>
          </nav>
          <button className="btn-main" style={{marginTop:'20px'}} onClick={()=>navigate('/report')}>REPORT CASE</button>
        </div>

        <div className="user-controls">
          <div className="theme-switch" onClick={toggleTheme}>
             {darkMode ? <FaSun /> : <FaMoon />} <span>{darkMode ? 'Light Mode' : 'Dark Mode'}</span>
          </div>
          <div className="user-badge" onClick={() => user ? logout() : setShowAuthModal(true)}>
            <div style={{width:'40px', height:'40px', borderRadius:'50%', background: user ? 'var(--success)' : '#888', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:'bold', fontSize:'18px', color:'white'}}>
               {user ? user.username[0] : '?'}
            </div>
            <div>
               <div style={{fontWeight:'bold'}}>{user ? user.username : 'Guest'}</div>
               <div style={{fontSize:'12px', color:'var(--text-muted)'}}>{user ? 'Sign Out' : 'Login / Register'}</div>
            </div>
          </div>
        </div>
      </div>

      {/* MAIN CONTENT AREA */}
      <div className="feed">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/report" element={<ReportPage />} />
          <Route path="/about" element={<About />} />
          <Route path="/coordinators" element={<Coordinators />} />
          <Route path="/grants" element={<Grants />} />
        </Routes>
      </div>

      {/* WIDGETS */}
      <div className="widgets">
        <input className="input-field" placeholder="Search..." style={{borderRadius:'20px'}} />
        <div className="card" style={{borderRadius:'20px'}}>
           <h3>Status</h3>
           <p style={{marginTop:'10px', display:'flex', alignItems:'center', gap:'10px'}}><FaCheckCircle color="var(--success)"/> System Operational</p>
           {user && user.emailNotifications && <p style={{marginTop:'5px', fontSize:'13px', color:'var(--text-muted)'}}>Email Alerts Active</p>}
        </div>
        <div className="card" style={{borderRadius:'20px'}}>
            <h3>Official Partners</h3>
            <div style={{marginTop:'10px', display:'flex', justifyContent:'space-between', borderBottom:'1px solid var(--border-color)', paddingBottom:'5px'}}>
               <span>Police</span> <FaCheckCircle color="var(--brand-amber)"/>
            </div>
            <div style={{marginTop:'10px', display:'flex', justifyContent:'space-between'}}>
               <span>FIDA Kenya</span> <FaCheckCircle color="var(--brand-amber)"/>
            </div>
         </div>
      </div>

      {/* OVERLAYS */}
      <Chatbot />
      {useContext(AuthContext).showAuthModal && <AuthModal />}
    </div>
  );
};

export default function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <Router>
          <AppLayout />
        </Router>
      </AuthProvider>
    </ToastProvider>
  );
}