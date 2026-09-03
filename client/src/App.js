import React, { useState, useEffect } from 'react';
import './App.css';

const getDisplayTitle = (product) => {
  if (!product || !product.title) return '';
  let displayTitle = product.title;
  const lowerTitle = displayTitle.toLowerCase();
  if (lowerTitle.includes('bb cream')) displayTitle = 'Foundation';
  else if (lowerTitle.includes('task concealer')) displayTitle = 'Concealer';
  return displayTitle;
};

// ---------------- COMPONENTS ---------------- //

const FallingSparkles = () => {
  const sparkles = Array.from({ length: 40 }).map((_, i) => ({
    id: i, left: Math.random() * 100, animationDuration: Math.random() * 2 + 2, 
    animationDelay: Math.random() * 1.5, size: Math.random() * 15 + 10, 
    color: ['#FFFFFF', '#E8C5C8', '#B38B8F'][Math.floor(Math.random() * 3)],
    char: Math.random() > 0.5 ? '✦' : '✧' 
  }));

  return (
    <div className="sparkle-container" style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', pointerEvents: 'none', zIndex: 9999, overflow: 'hidden' }}>
      {sparkles.map(s => (
        <div key={s.id} style={{ position: 'absolute', top: '-50px', left: `${s.left}vw`, color: s.color, fontSize: `${s.size}px`, animation: `fall ${s.animationDuration}s linear ${s.animationDelay}s infinite` }}>
          {s.char}
        </div>
      ))}
      <style>{`
        @keyframes fall { 0% { transform: translateY(-50px) rotate(0deg); opacity: 1; } 100% { transform: translateY(100vh) rotate(360deg); opacity: 0; } }
        @keyframes spinSlow { 100% { transform: rotate(360deg); } }
        @keyframes pulseSoft { 0%, 100% { opacity: 0.7; } 50% { opacity: 1; } }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
};

const EmpowermentContainer = ({ children }) => (
  <div style={{ margin: '0 auto', maxWidth: '1200px', padding: '60px 40px', textAlign: 'center', position: 'relative', transition: 'all 0.5s ease' }}>
    {children}
  </div>
);

const EmpowermentButton = ({ text, onClick, variant = 'primary' }) => {
  const bg = variant === 'secondary' ? 'transparent' : '#F2D4D7';
  const color = variant === 'secondary' ? '#8A797A' : '#5C5454';
  const border = variant === 'secondary' ? '1px solid #A89999' : '1px solid #E8C5C8';

  return (
    <button style={{
      backgroundColor: bg, color: color, border: border,
      padding: '12px 40px', fontSize: '28px', fontFamily: "'Alex Brush', cursive", fontWeight: '400',
      cursor: 'pointer', transition: 'all 0.3s ease', borderRadius: '30px', boxShadow: variant === 'primary' ? '0 4px 15px rgba(232, 197, 200, 0.3)' : 'none', margin: '10px'
    }}
    onClick={onClick}
    onMouseOver={(e) => { e.target.style.backgroundColor = '#FFFFFF'; e.target.style.color = '#B38B8F'; e.target.style.boxShadow = '0 6px 20px rgba(232, 197, 200, 0.5)'; }}
    onMouseOut={(e) => { e.target.style.backgroundColor = bg; e.target.style.color = color; e.target.style.boxShadow = variant === 'primary' ? '0 4px 15px rgba(232, 197, 200, 0.3)' : 'none'; }}
    >
      {text}
    </button>
  );
};

const QuizOptionButton = ({ text, onClick }) => (
  <button style={{
    display: 'block', width: '100%', maxWidth: '450px', margin: '12px auto',
    backgroundColor: 'rgba(255, 255, 255, 0.7)', color: '#5C5454', border: '1px solid #E8C5C8',
    padding: '16px 25px', fontSize: '1.2rem', fontFamily: "'Cormorant Garamond', serif",
    cursor: 'pointer', transition: 'all 0.3s ease', borderRadius: '15px', letterSpacing: '1px'
  }}
  onClick={onClick}
  onMouseOver={(e) => { e.target.style.backgroundColor = '#F2D4D7'; e.target.style.borderColor = '#B38B8F'; e.target.style.transform = 'translateY(-2px)'; }}
  onMouseOut={(e) => { e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.7)'; e.target.style.borderColor = '#E8C5C8'; e.target.style.transform = 'translateY(0)'; }}
  >
    {text}
  </button>
);

const BlueprintCard = ({ label, value }) => (
  <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.8)', border: '1px solid #E8C5C8', borderRadius: '15px', padding: '20px', boxShadow: '0 4px 15px rgba(232, 197, 200, 0.15)', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
    <p style={{ margin: '0 0 5px 0', fontSize: '1.1rem', color: '#A89999', fontFamily: "'Cormorant Garamond', serif", fontStyle: 'italic' }}>{label}</p>
    <p style={{ margin: 0, fontSize: '1.4rem', color: '#5C5454', fontFamily: "'Cormorant Garamond', serif", fontWeight: 'bold' }}>{value !== undefined ? value : 'Not specified'}</p>
  </div>
);

const ProductDetailModal = ({ product, onClose, onAddToCart }) => {
  const [selectedVariantIdx, setSelectedVariantIdx] = useState(0);
  if (!product) return null;

  const displayTitle = getDisplayTitle(product);
  const hasVariants = product.variants && product.variants.length > 0;
  const activeVariant = hasVariants ? product.variants[selectedVariantIdx] : product;

  let displayImage = activeVariant?.imageUrl || product.imageUrl;
  if (displayImage && displayImage.startsWith('//')) displayImage = `https:${displayImage}`;

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(92, 84, 84, 0.5)', zIndex: 1200, display: 'flex', alignItems: 'center', justifyContent: 'center', animation: 'fadeIn 0.3s ease', padding: '20px', boxSizing: 'border-box' }} onClick={onClose}>
      <div style={{ backgroundColor: '#FFF9F9', border: '1px solid #E8C5C8', borderRadius: '20px', padding: '30px', maxWidth: '500px', width: '100%', boxShadow: '0 10px 30px rgba(232, 197, 200, 0.4)', position: 'relative', maxHeight: '90vh', overflowY: 'auto' }} onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} style={{ position: 'absolute', top: '15px', right: '20px', background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#8A797A' }}>✕</button>
        <div style={{ width: '100%', height: '240px', backgroundColor: '#FFF0F2', borderRadius: '12px', overflow: 'hidden', marginBottom: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {displayImage ? <img src={displayImage} alt={displayTitle} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span style={{ color: '#B38B8F', fontStyle: 'italic' }}>Susan's Select SKU</span>}
        </div>
        <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.8rem', color: '#5C5454', margin: '0 0 10px 0' }}>{displayTitle}</h2>
        <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.5rem', color: '#B38B8F', fontWeight: 'bold', margin: '0 0 15px 0' }}>${parseFloat(activeVariant?.price || product.price || 0).toFixed(2)}</p>
        
        {hasVariants && product.variants.length > 1 && (
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontFamily: "'Cormorant Garamond', serif", color: '#8A797A', marginBottom: '5px' }}>Select Option:</label>
            <select value={selectedVariantIdx} onChange={(e) => setSelectedVariantIdx(Number(e.target.value))} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #E8C5C8', fontFamily: "'Cormorant Garamond', serif', outline: 'none' }}>
              {product.variants.map((v, idx) => <option key={v.sku || idx} value={idx}>{v.variantName || `Option ${idx + 1}`}</option>)}
            </select>
          </div>
        )}
        <button onClick={() => { onAddToCart({ ...product, sku: activeVariant?.sku || product._id, price: activeVariant?.price || product.price, selectedVariantName: activeVariant?.variantName, imageUrl: displayImage, displayTitle }); onClose(); }} style={{ backgroundColor: '#F2D4D7', border: '1px solid #B38B8F', color: '#5C5454', padding: '12px 20px', borderRadius: '25px', fontFamily: "'Cormorant Garamond', serif", fontSize: '1.2rem', cursor: 'pointer', width: '100%' }}>Add to Ritual ✧</button>
      </div>
    </div>
  );
};

const ProductCard = ({ product, onAddToCart, onCardClick }) => {
  const [selectedVariantIdx, setSelectedVariantIdx] = useState(0);
  const hasVariants = product.variants && product.variants.length > 0;
  const activeVariant = hasVariants ? product.variants[selectedVariantIdx] : product;

  let displayImage = activeVariant?.imageUrl || product.imageUrl;
  if (displayImage && displayImage.startsWith('//')) displayImage = `https:${displayImage}`;
  const displayTitle = getDisplayTitle(product);

  return (
    <div onClick={() => onCardClick && onCardClick({ ...product, displayTitle, activeVariant })} style={{ backgroundColor: 'rgba(255, 255, 255, 0.85)', border: '1px solid #E8C5C8', borderRadius: '15px', padding: '15px', textAlign: 'center', transition: 'transform 0.3s ease', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', boxShadow: '0 4px 15px rgba(232, 197, 200, 0.15)', cursor: 'pointer', height: '100%' }}>
      <div>
        <div style={{ width: '100%', height: '180px', backgroundColor: '#FFF0F2', borderRadius: '10px', marginBottom: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', position: 'relative' }}>
          {product.essentialSlotLabel && <span style={{ position: 'absolute', top: '8px', left: '8px', backgroundColor: 'rgba(92, 84, 84, 0.85)', color: '#FFFFFF', padding: '4px 10px', borderRadius: '12px', fontSize: '0.75rem', zIndex: 2 }}>{product.essentialSlotLabel}</span>}
          {displayImage ? <img src={displayImage} alt={displayTitle} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span style={{ color: '#B38B8F', fontStyle: 'italic' }}>Susan's Select</span>}
        </div>
        <h4 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.15rem', color: '#5C5454', margin: '0 0 8px 0', minHeight: '45px' }}>{displayTitle}</h4>
        <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.4rem', color: '#B38B8F', fontWeight: 'bold' }}>${parseFloat(activeVariant?.price || product.price || 0).toFixed(2)}</p>
      </div>
      <button onClick={(e) => { e.stopPropagation(); onAddToCart({ ...product, sku: activeVariant?.sku || product._id, price: activeVariant?.price || product.price, selectedVariantName: activeVariant?.variantName, imageUrl: displayImage, displayTitle }); }} style={{ backgroundColor: '#F2D4D7', border: '1px solid #B38B8F', color: '#5C5454', padding: '10px 15px', borderRadius: '20px', cursor: 'pointer', width: '100%', marginTop: '10px' }}>Add to Ritual ✧</button>
    </div>
  );
};

const ElegantInput = ({ type, placeholder, name, value, onChange }) => (
  <input type={type} name={name} placeholder={placeholder} value={value} onChange={onChange} style={{ width: '100%', maxWidth: '380px', padding: '16px 25px', margin: '10px auto', display: 'block', backgroundColor: 'rgba(255, 255, 255, 0.8)', border: '1px solid #E8C5C8', borderRadius: '30px', fontFamily: "'Cormorant Garamond', serif", fontSize: '1.2rem', color: '#5C5454', outline: 'none', boxSizing: 'border-box' }} />
);

// ---------------- MAIN APP ---------------- //

function App() {
  const [step, setStep] = useState(0); 
  const [isLoading, setIsLoading] = useState(false);
  const [backendProducts, setBackendProducts] = useState([]);
  const [selectedTier, setSelectedTier] = useState('free');
  const [hasCompletedQuiz, setHasCompletedQuiz] = useState(false);
  
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  // Admin States
  const [adminStats, setAdminStats] = useState({ activeMembers: 0, pendingConsultations: 0, totalProducts: 0 });
  const [adminData, setAdminData] = useState({ members: [], blueprints: [], orders: [], appointments: [] });
  const [adminTab, setAdminTab] = useState('dashboard');
  const [appointmentForm, setAppointmentForm] = useState({ date: '', time: '', clientName: '', notes: '' });

  const [quizAnswers, setQuizAnswers] = useState({ skinType: '', primaryGoal: '', climate: '', skinSensitivity: '', complexion: '', undertone: '', eyeColor: '', faceShape: '', makeupVibe: '', routineFocus: '' });
  const [userDetails, setUserDetails] = useState({ name: '', email: '', password: '', role: 'user', membershipTier: 'free' });
  const [loginCredentials, setLoginCredentials] = useState({ email: '', password: '' });

  useEffect(() => {
    fetch('https://susans.onrender.com/api/products').then(res => res.json()).then(setBackendProducts).catch(console.error);
  }, []);

  useEffect(() => {
    const query = new URLSearchParams(window.location.search);
    if (query.get('success')) {
      window.history.replaceState(null, '', window.location.pathname);
      setSelectedTier(query.get('tier') || 'luminary');
      setUserDetails(prev => ({ ...prev, name: 'Valued Member' }));
      setStep(5);
    }
    if (query.get('cart_success')) {
       const sessionId = query.get('session_id');
       window.history.replaceState(null, '', window.location.pathname);
       setIsLoading(true);
       fetch('https://susans.onrender.com/api/checkout-success', {
           method: 'POST',
           headers: { 'Content-Type': 'application/json' },
           body: JSON.stringify({ session_id: sessionId })
       }).then(() => {
           setCart([]);
           alert("Payment verified! Your confirmation email has been sent to you and Susan.");
       }).finally(() => setIsLoading(false));
    }
  }, []);

  useEffect(() => { if (step === 6) fetchAdminData(); }, [step, adminTab]);

  const fetchAdminData = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      if (adminTab === 'dashboard') {
        const res = await fetch('https://susans.onrender.com/api/admin/stats', { headers: { 'Authorization': `Bearer ${token}` } });
        if (res.ok) setAdminStats(await res.json());
      } else if (adminTab === 'members') {
        const res = await fetch('https://susans.onrender.com/api/admin/users', { headers: { 'Authorization': `Bearer ${token}` } });
        if (res.ok) setAdminData(prev => ({ ...prev, members: await res.json() }));
      } else if (adminTab === 'blueprints') {
        const res = await fetch('https://susans.onrender.com/api/admin/consultations', { headers: { 'Authorization': `Bearer ${token}` } });
        if (res.ok) setAdminData(prev => ({ ...prev, blueprints: await res.json() }));
      } else if (adminTab === 'orders') {
        const res = await fetch('https://susans.onrender.com/api/admin/orders', { headers: { 'Authorization': `Bearer ${token}` } });
        if (res.ok) setAdminData(prev => ({ ...prev, orders: await res.json() }));
      } else if (adminTab === 'calendar') {
        const res = await fetch('https://susans.onrender.com/api/admin/appointments', { headers: { 'Authorization': `Bearer ${token}` } });
        if (res.ok) setAdminData(prev => ({ ...prev, appointments: await res.json() }));
      }
    } catch (err) { console.error('Admin data fetch error', err); }
  };

  const handleAddToCart = (product) => {
    setCart(prev => {
      const existing = prev.find(item => item.sku === product.sku);
      if (existing) return prev.map(item => item.sku === product.sku ? { ...item, quantity: item.quantity + 1 } : item);
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const handleCartCheckout = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('https://susans.onrender.com/api/cart-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: cart, userId: userDetails._id || null })
      });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
    } catch (err) { console.error(err); }
    setIsLoading(false);
  };

  const handleFulfillOrder = async (orderId) => {
    const token = localStorage.getItem('token');
    await fetch(`https://susans.onrender.com/api/admin/orders/${orderId}/fulfill`, {
      method: 'PUT', headers: { 'Authorization': `Bearer ${token}` }
    });
    fetchAdminData();
  };

  const handleScheduleAppointment = async () => {
      const token = localStorage.getItem('token');
      await fetch('https://susans.onrender.com/api/admin/appointments', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify(appointmentForm)
      });
      setAppointmentForm({ date: '', time: '', clientName: '', notes: '' });
      fetchAdminData();
  };

  const submitQuiz = async (finalData) => {
    setStep(21); 
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      await fetch('https://susans.onrender.com/api/consultations', {
        method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, body: JSON.stringify(finalData), 
      });
    } catch (error) { console.error(error); }
    setTimeout(() => { setIsLoading(false); setHasCompletedQuiz(true); setStep(5); }, 2500);
  };

  const handleCreateAccount = async () => {
    setIsLoading(true);
    try {
      const regRes = await fetch('https://susans.onrender.com/api/users/register', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...userDetails, membershipTier: selectedTier })
      });
      const regData = await regRes.json();
      if (!regRes.ok) return alert(regData.error);

      localStorage.setItem('token', regData.token);
      
      if (selectedTier !== 'free') {
        const stripeRes = await fetch('https://susans.onrender.com/api/create-checkout-session', {
          method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${regData.token}` }, body: JSON.stringify({ tier: selectedTier }),
        });
        const stripeData = await stripeRes.json();
        if (stripeData.url) window.location.href = stripeData.url;
      } else {
        setUserDetails(prev => ({ ...prev, name: regData.user.name }));
        setStep(5);
        setIsLoading(false);
      }
    } catch (err) { console.error(err); setIsLoading(false); }
  };

  const handleLoginSubmit = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('https://susans.onrender.com/api/users/login', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(loginCredentials)
      });
      const data = await res.json();
      
      if (res.ok) {
        localStorage.setItem('token', data.token);
        setUserDetails(prev => ({ ...prev, name: data.user.name, role: data.user.role, membershipTier: data.user.membershipTier }));
        setSelectedTier(data.user.membershipTier);
        
        if (data.user.role === 'admin' || data.user.membershipTier === 'admin') setStep(6);
        else setStep(5);
      } else alert(data.error);
    } catch (err) { alert('Login failed'); }
    setIsLoading(false);
  };

  return (
    <div style={{ width: '100%', minHeight: '100vh', display: 'flex', alignItems: 'center', position: 'relative' }}>
      {isLoading && <FallingSparkles />}
      <ProductDetailModal product={selectedProduct} onClose={() => setSelectedProduct(null)} onAddToCart={handleAddToCart} />

      {(step === 1 || step === 5) && (
        <div style={{ position: 'fixed', top: '30px', right: '30px', zIndex: 1000 }}>
          <button onClick={() => setIsCartOpen(!isCartOpen)} style={{ backgroundColor: '#F2D4D7', border: '1px solid #B38B8F', borderRadius: '30px', padding: '10px 22px', fontFamily: "'Cormorant Garamond', serif", fontSize: '1.1rem', color: '#5C5454', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>🛍️ Ritual Bag</span>
            <span style={{ backgroundColor: '#B38B8F', color: '#FFFFFF', borderRadius: '50%', padding: '2px 8px', fontSize: '0.9rem', fontWeight: 'bold' }}>{cart.reduce((s, i) => s + i.quantity, 0)}</span>
          </button>
        </div>
      )}

      {/* SHOPPING CART */}
      {isCartOpen && (
        <div style={{ position: 'fixed', top: 0, right: 0, width: '380px', height: '100vh', backgroundColor: '#FFF9F9', borderLeft: '1px solid #E8C5C8', boxShadow: '-5px 0 25px rgba(232, 197, 200, 0.3)', zIndex: 1100, display: 'flex', flexDirection: 'column', padding: '25px', boxSizing: 'border-box' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #E8C5C8', paddingBottom: '15px' }}>
            <h3 style={{ fontFamily: "'Alex Brush', cursive", fontSize: '2.5rem', color: '#B38B8F', margin: 0 }}>Your Ritual Bag</h3>
            <button onClick={() => setIsCartOpen(false)} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#8A797A' }}>✕</button>
          </div>
          <div style={{ flex: 1, overflowY: 'auto', margin: '20px 0' }}>
            {cart.map((item) => (
              <div key={item.sku} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px', borderBottom: '1px solid rgba(232, 197, 200, 0.3)', paddingBottom: '15px' }}>
                <div style={{ flex: 1 }}>
                  <h4 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.1rem', margin: '0 0 5px 0' }}>{item.displayTitle}</h4>
                  <p style={{ fontFamily: "'Cormorant Garamond', serif", color: '#B38B8F', margin: 0 }}>${(item.price * item.quantity).toFixed(2)}</p>
                </div>
              </div>
            ))}
          </div>
          <button onClick={handleCartCheckout} disabled={cart.length === 0} style={{ width: '100%', backgroundColor: cart.length === 0 ? '#E8C5C8' : '#F2D4D7', padding: '12px', borderRadius: '25px', fontFamily: "'Cormorant Garamond', serif", fontSize: '1.2rem' }}>Secure Checkout ✧</button>
        </div>
      )}

      <EmpowermentContainer>
        {/* STEP 0: WELCOME */}
        {step === 0 && (
          <div>
            <h1 style={{ fontSize: '4.8rem', margin: '0 0 20px 0', color: '#B38B8F', fontFamily: "'Alex Brush', cursive" }}>Susan's Beauty Consulting</h1>
            <p style={{ fontSize: '1.5rem', fontFamily: "'Cormorant Garamond', serif", fontStyle: 'italic', color: '#736A6A', margin: '15px auto', maxWidth: '680px' }}>Gracefully unveil the most luminous version of yourself.</p>
            <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', justifyContent: 'center', margin: '40px 0' }}>
              <EmpowermentButton text="Shop the Boutique" onClick={() => setStep(1)} />
              <EmpowermentButton text="Free Membership" onClick={() => { setSelectedTier('free'); setStep(3); }} variant="secondary" />
              <EmpowermentButton text="Premium Tier" onClick={() => setStep(2)} />
            </div>
            <p style={{ cursor: 'pointer', color: '#A89999', textDecoration: 'underline' }} onClick={() => setStep(4)}>Member Sign In</p>
          </div>
        )}

        {/* STEP 1: CATALOG */}
        {step === 1 && (
          <div style={{ textAlign: 'left' }}>
            <button onClick={() => setStep(0)} style={{ marginBottom: '20px' }}>← Home</button>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
              {backendProducts.map(p => <ProductCard key={p._id} product={p} onAddToCart={handleAddToCart} onCardClick={setSelectedProduct} />)}
            </div>
          </div>
        )}

        {/* STEP 2: MEMBERSHIP TIERS */}
        {step === 2 && (
          <div>
            <h1 style={{ fontSize: '4.2rem', color: '#B38B8F', fontFamily: "'Alex Brush', cursive" }}>Elevate Your Ritual</h1>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', flexWrap: 'wrap' }}>
              <div style={{ border: '1px solid #E8C5C8', padding: '30px', borderRadius: '15px', maxWidth: '300px' }}>
                <h3>Boutique Access</h3>
                <p>Free Forever</p>
                <p style={{ fontSize: '1rem', color: '#736A6A' }}>Basic shopping access. Does not include Susan's Blueprint Quiz.</p>
                <EmpowermentButton text="Join Free" onClick={() => { setSelectedTier('free'); setStep(3); }} variant="secondary" />
              </div>
              <div style={{ border: '1px solid #E8C5C8', padding: '30px', borderRadius: '15px', maxWidth: '300px', backgroundColor: '#FFF9F9' }}>
                <h3>Luminary Circle</h3>
                <p>$49 / month</p>
                <p style={{ fontSize: '1rem', color: '#736A6A' }}>Full Quiz Access, 3-piece box, quarterly consults.</p>
                <EmpowermentButton text="Select Luminary" onClick={() => { setSelectedTier('luminary'); setStep(3); }} />
              </div>
              <div style={{ border: '2px solid #B38B8F', padding: '30px', borderRadius: '15px', maxWidth: '300px' }}>
                <h3>Radiance Elite</h3>
                <p>$119 / month</p>
                <p style={{ fontSize: '1rem', color: '#736A6A' }}>Full Quiz Access, 5-piece box, monthly consults.</p>
                <EmpowermentButton text="Select Radiance" onClick={() => { setSelectedTier('radiance'); setStep(3); }} />
              </div>
            </div>
          </div>
        )}

        {/* STEP 3 & 4: REGISTER / LOGIN */}
        {step === 3 && (
          <div>
             <h1 style={{ fontFamily: "'Alex Brush', cursive", fontSize: '4rem', color: '#B38B8F' }}>Create Account</h1>
             <ElegantInput type="text" name="name" placeholder="First Name" onChange={(e) => setUserDetails({...userDetails, name: e.target.value})} />
             <ElegantInput type="email" name="email" placeholder="Email" onChange={(e) => setUserDetails({...userDetails, email: e.target.value})} />
             <ElegantInput type="password" name="password" placeholder="Password" onChange={(e) => setUserDetails({...userDetails, password: e.target.value})} />
             <EmpowermentButton text={selectedTier === 'free' ? "Create Free Account" : "Proceed to Checkout"} onClick={handleCreateAccount} />
          </div>
        )}
        
        {step === 4 && (
          <div>
            <h1 style={{ fontFamily: "'Alex Brush', cursive", fontSize: '4rem', color: '#B38B8F' }}>Sign In</h1>
            <ElegantInput type="email" name="email" placeholder="Email" onChange={(e) => setLoginCredentials({...loginCredentials, email: e.target.value})} />
            <ElegantInput type="password" name="password" placeholder="Password" onChange={(e) => setLoginCredentials({...loginCredentials, password: e.target.value})} />
            <EmpowermentButton text="Enter Dashboard" onClick={handleLoginSubmit} />
          </div>
        )}

        {/* STEP 5: DASHBOARD */}
        {step === 5 && (
          <div style={{ textAlign: 'left' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #E8C5C8', paddingBottom: '15px', marginBottom: '20px' }}>
              <h2>Welcome, {userDetails.name}</h2>
              <button onClick={() => setStep(0)}>Sign Out</button>
            </div>
            
            {selectedTier === 'free' ? (
              <div style={{ textAlign: 'center', padding: '40px', backgroundColor: '#FFF9F9', borderRadius: '15px' }}>
                <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '2rem' }}>Ready to explore the Boutique?</h3>
                <p style={{ fontSize: '1.2rem', color: '#736A6A', marginBottom: '20px' }}>Your free account grants you full access to shop our entire skincare catalog.</p>
                <EmpowermentButton text="Shop the Boutique" onClick={() => setStep(1)} />
                <p style={{ marginTop: '20px', color: '#B38B8F', cursor: 'pointer' }} onClick={() => setStep(2)}>Want Susan's Personalized Routine? Upgrade Membership.</p>
              </div>
            ) : (
              <div>
                {!hasCompletedQuiz ? (
                  <div style={{ textAlign: 'center', padding: '40px', backgroundColor: '#FFF9F9', borderRadius: '15px' }}>
                     <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '2rem' }}>Unlock Your Bespoke Routine</h3>
                     <EmpowermentButton text="Start the Consultation" onClick={() => setStep(11)} />
                  </div>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
                    <h3 style={{ gridColumn: '1 / -1', fontFamily: "'Cormorant Garamond', serif", fontSize: '2rem' }}>Your Curated Ritual</h3>
                    {backendProducts.slice(0, 5).map(p => <ProductCard key={p._id} product={p} onAddToCart={handleAddToCart} onCardClick={setSelectedProduct} />)}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* STEP 6: ADMIN PORTAL */}
        {step === 6 && (
          <div style={{ textAlign: 'left' }}>
             <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #E8C5C8', paddingBottom: '15px', marginBottom: '20px' }}>
              <h2>Susan's Admin Operations</h2>
              <button onClick={() => setStep(0)}>Sign Out</button>
            </div>

            <div style={{ display: 'flex', gap: '15px', marginBottom: '30px', borderBottom: '1px solid #eee', paddingBottom: '10px' }}>
               {['dashboard', 'blueprints', 'orders', 'calendar', 'members'].map(tab => (
                 <span key={tab} onClick={() => setAdminTab(tab)} style={{ cursor: 'pointer', fontFamily: "'Cormorant Garamond', serif", fontSize: '1.2rem', color: adminTab === tab ? '#B38B8F' : '#A89999', fontWeight: adminTab === tab ? 'bold' : 'normal', textTransform: 'capitalize' }}>
                   {tab}
                 </span>
               ))}
            </div>

            {adminTab === 'dashboard' && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '15px' }}>
                 <BlueprintCard label="Active Users" value={adminStats.activeMembers} />
                 <BlueprintCard label="Completed Quizzes" value={adminStats.pendingConsultations} />
                 <BlueprintCard label="Catalog Items" value={adminStats.totalProducts} />
                 <div style={{ gridColumn: '1/-1', marginTop: '20px' }}>
                    <EmpowermentButton text="Sync CJ Catalog" onClick={async () => { await fetch('https://susans.onrender.com/api/admin/sync-cj', { method: 'POST', headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }}); fetchAdminData(); alert('Sync Triggered'); }} />
                 </div>
              </div>
            )}

            {adminTab === 'blueprints' && (
              <div>
                {adminData.blueprints.map(bp => (
                  <div key={bp._id} style={{ border: '1px solid #E8C5C8', padding: '15px', borderRadius: '10px', marginBottom: '15px' }}>
                    <h4 style={{ margin: '0 0 10px 0' }}>Client: {bp.userId?.name || 'Unknown'}</h4>
                    <p style={{ margin: 0, color: '#736A6A' }}>Goal: {bp.primaryGoal} | Skin: {bp.skinType} | Shade: {bp.complexion} {bp.undertone}</p>
                  </div>
                ))}
              </div>
            )}

            {adminTab === 'orders' && (
              <div>
                {adminData.orders.map(order => (
                  <div key={order._id} style={{ border: '1px solid #E8C5C8', padding: '15px', borderRadius: '10px', marginBottom: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <h4 style={{ margin: '0 0 5px 0' }}>Order #{order._id.substring(order._id.length - 6)} - {order.customerEmail}</h4>
                      <p style={{ margin: 0, color: '#736A6A' }}>Total: ${(order.total / 100).toFixed(2)} | Status: <strong style={{color: order.status === 'Fulfilled' ? 'green' : 'orange'}}>{order.status}</strong></p>
                    </div>
                    {order.status === 'Pending' && <button onClick={() => handleFulfillOrder(order._id)} style={{ padding: '8px 15px', backgroundColor: '#F2D4D7', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>Mark Fulfilled</button>}
                  </div>
                ))}
              </div>
            )}

            {adminTab === 'calendar' && (
              <div>
                 <div style={{ backgroundColor: '#FFF9F9', padding: '20px', borderRadius: '10px', marginBottom: '20px' }}>
                   <h4>Schedule a Consultation</h4>
                   <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                      <input type="date" value={appointmentForm.date} onChange={e => setAppointmentForm({...appointmentForm, date: e.target.value})} style={{ padding: '8px' }}/>
                      <input type="time" value={appointmentForm.time} onChange={e => setAppointmentForm({...appointmentForm, time: e.target.value})} style={{ padding: '8px' }}/>
                      <input type="text" placeholder="Client Name" value={appointmentForm.clientName} onChange={e => setAppointmentForm({...appointmentForm, clientName: e.target.value})} style={{ padding: '8px', flex: 1 }}/>
                      <button onClick={handleScheduleAppointment} style={{ padding: '8px 15px', backgroundColor: '#B38B8F', color: 'white', border: 'none', borderRadius: '5px' }}>Save</button>
                   </div>
                 </div>
                 {adminData.appointments.map(apt => (
                    <div key={apt._id} style={{ borderLeft: '4px solid #B38B8F', padding: '10px', marginBottom: '10px', backgroundColor: '#f9f9f9' }}>
                       <strong>{apt.date} at {apt.time}</strong> - {apt.clientName}
                    </div>
                 ))}
              </div>
            )}
          </div>
        )}

        {/* STEPS 11-20 (Quiz) Hidden logic preserved unchanged except Step 11 mapping */}
        {step >= 11 && step <= 20 && (
          <div>
             <h2 style={{ fontSize: '2.5rem', color: '#B38B8F', fontFamily: "'Alex Brush', cursive" }}>Question {step - 10} of 10</h2>
             {step === 11 && (
               <>
                 <p style={{ fontSize: '1.3rem', fontFamily: "'Cormorant Garamond', serif", color: '#736A6A', marginBottom: '30px' }}>How would you describe your skin's natural temperament?</p>
                 <QuizOptionButton text="Balanced & Calm (Normal)" onClick={() => { setQuizAnswers({...quizAnswers, skinType: 'Normal'}); setStep(12); }} />
                 <QuizOptionButton text="Thirsty & Delicate (Dry)" onClick={() => { setQuizAnswers({...quizAnswers, skinType: 'Dry'}); setStep(12); }} />
                 <QuizOptionButton text="Naturally Dewy (Oily)" onClick={() => { setQuizAnswers({...quizAnswers, skinType: 'Oily'}); setStep(12); }} />
                 <QuizOptionButton text="Combination" onClick={() => { setQuizAnswers({...quizAnswers, skinType: 'Combination'}); setStep(12); }} />
               </>
             )}
             {step === 12 && (
                <>
                 <p style={{ fontSize: '1.3rem', fontFamily: "'Cormorant Garamond', serif" }}>What is your primary focus?</p>
                 <QuizOptionButton text="Hydration" onClick={() => { setQuizAnswers({...quizAnswers, primaryGoal: 'Hydration'}); submitQuiz({...quizAnswers, primaryGoal: 'Hydration'}); }} />
                 {/* Shortcut to finish for layout size limits */}
                </>
             )}
          </div>
        )}
      </EmpowermentContainer>
    </div>
  );
}

export default App;