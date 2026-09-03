import React, { useState, useEffect } from 'react';
import './App.css';

// Automatically route API requests to localhost during testing, and live server in production
const API_BASE = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' 
  ? 'http://localhost:5000' 
  : 'https://susans.onrender.com';

const getDisplayTitle = (product) => {
  if (!product || !product.title) return '';
  let displayTitle = product.title;
  const lowerTitle = displayTitle.toLowerCase();
  
  if (lowerTitle.includes('bb cream')) {
    displayTitle = 'Foundation';
  } else if (lowerTitle.includes('task concealer')) {
    displayTitle = 'Concealer';
  }
  
  return displayTitle;
};

// ---------------- COMPONENTS ---------------- //

const FallingSparkles = () => {
  const sparkles = Array.from({ length: 40 }).map((_, i) => {
    const colors = ['#FFFFFF', '#E8C5C8', '#B38B8F'];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    return {
      id: i, 
      left: Math.random() * 100, 
      animationDuration: Math.random() * 2 + 2, 
      animationDelay: Math.random() * 1.5, 
      size: Math.random() * 15 + 10, 
      color: randomColor, 
      char: Math.random() > 0.5 ? '✦' : '✧' 
    };
  });

  return (
    <div className="sparkle-container" style={{ 
      position: 'fixed', 
      top: 0, 
      left: 0, 
      width: '100vw', 
      height: '100vh', 
      pointerEvents: 'none', 
      zIndex: 9999, 
      overflow: 'hidden' 
    }}>
      {sparkles.map(s => (
        <div key={s.id} style={{ 
          position: 'absolute', 
          top: '-50px', 
          left: `${s.left}vw`, 
          color: s.color, 
          fontSize: `${s.size}px`, 
          animation: `fall ${s.animationDuration}s linear ${s.animationDelay}s infinite` 
        }}>
          {s.char}
        </div>
      ))}
      <style>{`
        @keyframes fall { 
          0% { transform: translateY(-50px) rotate(0deg); opacity: 1; } 
          100% { transform: translateY(100vh) rotate(360deg); opacity: 0; } 
        }
        @keyframes spinSlow { 
          100% { transform: rotate(360deg); } 
        }
        @keyframes pulseSoft { 
          0%, 100% { opacity: 0.7; } 
          50% { opacity: 1; } 
        }
        @keyframes fadeIn { 
          from { opacity: 0; transform: translateY(10px); } 
          to { opacity: 1; transform: translateY(0); } 
        }
      `}</style>
    </div>
  );
};

const EmpowermentContainer = ({ children }) => (
  <div style={{ 
    margin: '0 auto', 
    maxWidth: '1000px', 
    padding: '60px 40px', 
    textAlign: 'center', 
    position: 'relative', 
    transition: 'all 0.5s ease' 
  }}>
    {children}
  </div>
);

const EmpowermentButton = ({ text, onClick }) => (
  <button 
    style={{
      backgroundColor: '#F2D4D7', 
      color: '#5C5454', 
      border: '1px solid #E8C5C8', 
      padding: '12px 50px', 
      fontSize: '32px', 
      fontFamily: "'Alex Brush', cursive", 
      fontWeight: '400',
      cursor: 'pointer', 
      transition: 'all 0.5s ease', 
      borderRadius: '30px', 
      boxShadow: '0 4px 15px rgba(232, 197, 200, 0.3)',
    }}
    onClick={onClick}
    onMouseOver={(e) => { 
      e.target.style.backgroundColor = '#FFFFFF'; 
      e.target.style.color = '#B38B8F'; 
      e.target.style.boxShadow = '0 6px 20px rgba(232, 197, 200, 0.5)'; 
    }}
    onMouseOut={(e) => { 
      e.target.style.backgroundColor = '#F2D4D7'; 
      e.target.style.color = '#5C5454'; 
      e.target.style.boxShadow = '0 4px 15px rgba(232, 197, 200, 0.3)'; 
    }}
  >
    {text}
  </button>
);

const QuizOptionButton = ({ text, onClick }) => (
  <button 
    style={{
      display: 'block', 
      width: '100%', 
      maxWidth: '450px', 
      margin: '12px auto', 
      backgroundColor: 'rgba(255, 255, 255, 0.7)', 
      color: '#5C5454', 
      border: '1px solid #E8C5C8',
      padding: '16px 25px', 
      fontSize: '1.2rem', 
      fontFamily: "'Cormorant Garamond', serif", 
      cursor: 'pointer', 
      transition: 'all 0.3s ease', 
      borderRadius: '15px', 
      letterSpacing: '1px'
    }}
    onClick={onClick}
    onMouseOver={(e) => { 
      e.target.style.backgroundColor = '#F2D4D7'; 
      e.target.style.borderColor = '#B38B8F'; 
      e.target.style.transform = 'translateY(-2px)'; 
    }}
    onMouseOut={(e) => { 
      e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.7)'; 
      e.target.style.borderColor = '#E8C5C8'; 
      e.target.style.transform = 'translateY(0)'; 
    }}
  >
    {text}
  </button>
);

const ProgressDots = ({ currentStep, totalSteps }) => (
  <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginBottom: '35px' }}>
    {Array.from({ length: totalSteps }).map((_, index) => (
      <div 
        key={index} 
        style={{ 
          width: '8px', 
          height: '8px', 
          borderRadius: '50%', 
          backgroundColor: index < currentStep ? '#B38B8F' : '#F2D4D7', 
          transition: 'background-color 0.5s ease' 
        }} 
      />
    ))}
  </div>
);

const EmpowermentLoader = ({ text }) => (
  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', margin: '40px 0' }}>
    <div style={{ animation: 'spinSlow 4s linear infinite', width: '60px', height: '60px' }}>
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#E8C5C8" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" strokeDasharray="4 4" />
        <path d="M12 2a10 10 0 0 1 10 10" stroke="#B38B8F" strokeWidth="1.5" />
        <circle cx="12" cy="2" r="2" fill="#FFFFFF" stroke="#B38B8F"/>
      </svg>
    </div>
    <p style={{ 
      fontFamily: "'Cormorant Garamond', serif", 
      fontSize: '1.3rem', 
      color: '#8A797A', 
      marginTop: '20px', 
      fontStyle: 'italic', 
      animation: 'pulseSoft 2s infinite' 
    }}>
      {text || "Curating your personalized routine..."}
    </p>
  </div>
);

const BlueprintCard = ({ label, value }) => (
  <div style={{ 
    backgroundColor: 'rgba(255, 255, 255, 0.8)', 
    border: '1px solid #E8C5C8', 
    borderRadius: '15px', 
    padding: '20px', 
    boxShadow: '0 4px 15px rgba(232, 197, 200, 0.15)', 
    display: 'flex', 
    flexDirection: 'column', 
    justifyContent: 'center' 
  }}>
    <p style={{ 
      margin: '0 0 5px 0', 
      fontSize: '1.1rem', 
      color: '#A89999', 
      fontFamily: "'Cormorant Garamond', serif", 
      fontStyle: 'italic' 
    }}>
      {label}
    </p>
    <p style={{ 
      margin: 0, 
      fontSize: '1.4rem', 
      color: '#5C5454', 
      fontFamily: "'Cormorant Garamond', serif", 
      fontWeight: 'bold' 
    }}>
      {value !== undefined ? value : 'Not specified'}
    </p>
  </div>
);

const ProductDetailModal = ({ product, onClose, onAddToCart }) => {
  const [selectedVariantIdx, setSelectedVariantIdx] = useState(0);
  
  if (!product) return null;

  const displayTitle = getDisplayTitle(product);
  const hasVariants = product.variants && product.variants.length > 0;
  const activeVariant = hasVariants ? product.variants[selectedVariantIdx] : product;
  const displayImage = activeVariant?.imageUrl || product.imageUrl;
  const formattedImageUrl = displayImage && displayImage.startsWith('//') ? `https:${displayImage}` : displayImage;

  return (
    <div 
      style={{ 
        position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', 
        backgroundColor: 'rgba(92, 84, 84, 0.5)', zIndex: 1200, display: 'flex', 
        alignItems: 'center', justifyContent: 'center', animation: 'fadeIn 0.3s ease', 
        padding: '20px', boxSizing: 'border-box' 
      }} 
      onClick={onClose}
    >
      <div 
        style={{ 
          backgroundColor: '#FFF9F9', border: '1px solid #E8C5C8', borderRadius: '20px', 
          padding: '30px', maxWidth: '500px', width: '100%', 
          boxShadow: '0 10px 30px rgba(232, 197, 200, 0.4)', position: 'relative', 
          maxHeight: '90vh', overflowY: 'auto' 
        }} 
        onClick={(e) => e.stopPropagation()}
      >
        <button 
          onClick={onClose} 
          style={{ 
            position: 'absolute', top: '15px', right: '20px', background: 'none', 
            border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#8A797A' 
          }}
        >
          ✕
        </button>
        
        <div style={{ 
          width: '100%', height: '240px', backgroundColor: '#FFF0F2', 
          borderRadius: '12px', overflow: 'hidden', marginBottom: '20px', 
          display: 'flex', alignItems: 'center', justifyContent: 'center' 
        }}>
          {formattedImageUrl ? (
            <img src={formattedImageUrl} alt={displayTitle} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <span style={{ color: '#B38B8F', fontStyle: 'italic' }}>Susan's Select SKU</span>
          )}
        </div>
        
        <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.8rem', color: '#5C5454', margin: '0 0 10px 0' }}>
          {displayTitle}
        </h2>
        
        <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.5rem', color: '#B38B8F', fontWeight: 'bold', margin: '0 0 15px 0' }}>
          ${parseFloat(activeVariant?.price || product.price || 0).toFixed(2)}
        </p>
        
        {product.description && (
          <p 
            style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.1rem', color: '#736A6A', lineHeight: '1.6', margin: '0 0 20px 0' }} 
            dangerouslySetInnerHTML={{ __html: product.description }} 
          />
        )}
        
        {hasVariants && product.variants.length > 1 && (
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontFamily: "'Cormorant Garamond', serif", color: '#8A797A', marginBottom: '5px' }}>
              Select Option:
            </label>
            <select 
              value={selectedVariantIdx} 
              onChange={(e) => setSelectedVariantIdx(Number(e.target.value))} 
              style={{ 
                width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #E8C5C8', 
                fontFamily: "'Cormorant Garamond', serif", color: '#5C5454', backgroundColor: '#FFF9F9', outline: 'none' 
              }}
            >
              {product.variants.map((v, idx) => (
                <option key={v.sku || idx} value={idx}>
                  {v.variantName && v.variantName !== v.sku ? v.variantName : `Option ${idx + 1}`}
                </option>
              ))}
            </select>
          </div>
        )}
        
        <button 
          onClick={() => { 
            onAddToCart({ 
              ...product, 
              sku: activeVariant?.sku || product.sku || product._id, 
              price: activeVariant?.price || product.price, 
              selectedVariantName: activeVariant?.variantName, 
              imageUrl: activeVariant?.imageUrl || product.imageUrl, 
              displayTitle: displayTitle 
            }); 
            onClose(); 
          }}
          style={{ 
            backgroundColor: '#F2D4D7', border: '1px solid #B38B8F', color: '#5C5454', 
            padding: '12px 20px', borderRadius: '25px', fontFamily: "'Cormorant Garamond', serif", 
            fontSize: '1.2rem', cursor: 'pointer', width: '100%', transition: 'all 0.3s ease' 
          }}
        >
          Add to Ritual ✧
        </button>
      </div>
    </div>
  );
};

const ProductCard = ({ product, onAddToCart, onCardClick }) => {
  const [selectedVariantIdx, setSelectedVariantIdx] = useState(0);
  const hasVariants = product.variants && product.variants.length > 0;
  const activeVariant = hasVariants ? product.variants[selectedVariantIdx] : product;
  const displayImage = activeVariant?.imageUrl || product.imageUrl;
  const formattedImageUrl = displayImage && displayImage.startsWith('//') ? `https:${displayImage}` : displayImage;
  const displayTitle = getDisplayTitle(product);
  const enrichedProduct = { ...product, displayTitle, activeVariant };

  return (
    <div 
      onClick={() => onCardClick && onCardClick(enrichedProduct)} 
      style={{ 
        backgroundColor: 'rgba(255, 255, 255, 0.85)', border: '1px solid #E8C5C8', 
        borderRadius: '15px', padding: '15px', textAlign: 'center', 
        transition: 'transform 0.3s ease, box-shadow 0.3s ease', display: 'flex', 
        flexDirection: 'column', justifyContent: 'space-between', 
        boxShadow: '0 4px 15px rgba(232, 197, 200, 0.15)', height: '100%', cursor: 'pointer' 
      }} 
      onMouseOver={(e) => { 
        e.currentTarget.style.transform = 'translateY(-5px)'; 
        e.currentTarget.style.boxShadow = '0 8px 25px rgba(232, 197, 200, 0.3)'; 
      }} 
      onMouseOut={(e) => { 
        e.currentTarget.style.transform = 'translateY(0)'; 
        e.currentTarget.style.boxShadow = '0 4px 15px rgba(232, 197, 200, 0.15)'; 
      }}
    >
      <div>
        <div style={{ 
          width: '100%', height: '180px', backgroundColor: '#FFF0F2', 
          borderRadius: '10px', marginBottom: '15px', display: 'flex', 
          alignItems: 'center', justifyContent: 'center', overflow: 'hidden', position: 'relative' 
        }}>
          {product.essentialSlotLabel && (
            <span style={{ 
              position: 'absolute', top: '8px', left: '8px', backgroundColor: 'rgba(92, 84, 84, 0.85)', 
              color: '#FFFFFF', padding: '4px 10px', borderRadius: '12px', fontSize: '0.75rem', 
              fontFamily: "'Cormorant Garamond', serif", letterSpacing: '0.5px', zIndex: 2 
            }}>
              {product.essentialSlotLabel}
            </span>
          )}
          {formattedImageUrl ? (
            <img src={formattedImageUrl} alt={displayTitle} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={(e) => { e.target.style.display = 'none'; }} />
          ) : (
            <span style={{ color: '#B38B8F', fontFamily: "'Cormorant Garamond', serif", fontStyle: 'italic' }}>Susan's Select SKU</span>
          )}
        </div>
        
        <h4 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.15rem', color: '#5C5454', margin: '0 0 8px 0', minHeight: '45px', lineHeight: '1.3' }}>
          {displayTitle}
        </h4>
        
        <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.4rem', color: '#B38B8F', fontWeight: 'bold', margin: '0 0 10px 0' }}>
          ${parseFloat(activeVariant?.price || product.price || 0).toFixed(2)}
        </p>

        {hasVariants && product.variants.length > 1 && (
          <div onClick={(e) => e.stopPropagation()}>
            <select 
              value={selectedVariantIdx} 
              onChange={(e) => setSelectedVariantIdx(Number(e.target.value))} 
              style={{ 
                width: '100%', padding: '8px', marginBottom: '15px', borderRadius: '8px', 
                border: '1px solid #E8C5C8', fontFamily: "'Cormorant Garamond', serif", 
                color: '#5C5454', backgroundColor: '#FFF9F9', outline: 'none' 
              }}
            >
              {product.variants.map((v, idx) => (
                <option key={v.sku || idx} value={idx}>
                  {v.variantName && v.variantName !== v.sku ? v.variantName : `Option ${idx + 1}`}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>
      
      <button 
        onClick={(e) => { 
          e.stopPropagation(); 
          onAddToCart({ 
            ...product, 
            sku: activeVariant?.sku || product.sku || product._id, 
            price: activeVariant?.price || product.price, 
            selectedVariantName: activeVariant?.variantName, 
            imageUrl: activeVariant?.imageUrl || product.imageUrl, 
            displayTitle: displayTitle 
          }); 
        }}
        style={{ 
          backgroundColor: '#F2D4D7', border: '1px solid #B38B8F', color: '#5C5454', 
          padding: '10px 15px', borderRadius: '20px', fontFamily: "'Cormorant Garamond', serif", 
          fontSize: '1.05rem', cursor: 'pointer', width: '100%', marginTop: 'auto', transition: 'all 0.3s ease' 
        }}
        onMouseOver={(e) => { e.target.style.backgroundColor = '#FFFFFF'; e.target.style.color = '#B38B8F'; }}
        onMouseOut={(e) => { e.target.style.backgroundColor = '#F2D4D7'; e.target.style.color = '#5C5454'; }}
      >
        Add to Ritual ✧
      </button>
    </div>
  );
};

const ElegantInput = ({ type, placeholder, name, value, onChange }) => (
  <input 
    type={type} 
    name={name} 
    placeholder={placeholder} 
    value={value} 
    onChange={onChange} 
    style={{ 
      width: '100%', maxWidth: '380px', padding: '16px 25px', margin: '10px auto', 
      display: 'block', backgroundColor: 'rgba(255, 255, 255, 0.8)', border: '1px solid #E8C5C8', 
      borderRadius: '30px', fontFamily: "'Cormorant Garamond', serif", fontSize: '1.2rem', 
      color: '#5C5454', outline: 'none', boxSizing: 'border-box', transition: 'all 0.3s ease' 
    }} 
    onFocus={(e) => { 
      e.target.style.backgroundColor = '#FFFFFF'; 
      e.target.style.boxShadow = '0 0 10px rgba(232, 197, 200, 0.4)'; 
    }} 
    onBlur={(e) => { 
      e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.8)'; 
      e.target.style.boxShadow = 'none'; 
    }} 
  />
);

// ---------------- MAIN APP ---------------- //

function App() {
  const [step, setStep] = useState(0); 
  const [isLoading, setIsLoading] = useState(false);
  const [isSubscribing, setIsSubscribing] = useState(false); 
  const [backendProducts, setBackendProducts] = useState([]);
  const [selectedTier, setSelectedTier] = useState('luminary');
  const [hasCompletedQuiz, setHasCompletedQuiz] = useState(false);
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  // Admin Data State
  const [adminTab, setAdminTab] = useState('overview'); 
  const [adminStats, setAdminStats] = useState({ activeMembers: 0, totalOrders: 0, totalProducts: 0 });
  const [adminMembers, setAdminMembers] = useState([]);
  const [adminOrders, setAdminOrders] = useState([]);

  const [quizAnswers, setQuizAnswers] = useState({ 
    skinType: '', primaryGoal: '', climate: '', skinSensitivity: '', 
    complexion: '', undertone: '', eyeColor: '', faceShape: '', 
    makeupVibe: '', routineFocus: '' 
  });
  const [userDetails, setUserDetails] = useState({ name: '', email: '', password: '', role: 'user' });
  const [loginCredentials, setLoginCredentials] = useState({ email: '', password: '' });

  useEffect(() => {
    const fetchBackendData = async () => {
      try {
        const response = await fetch(`${API_BASE}/api/products`);
        if (response.ok) {
          const data = await response.json();
          setBackendProducts(data);
        }
      } catch (error) {
        console.error('Failed to connect to backend data:', error);
      }
    };
    fetchBackendData();
  }, []);

  useEffect(() => {
    const query = new URLSearchParams(window.location.search);
    if (query.get('success')) {
      const tierStr = query.get('tier') || 'luminary';
      window.history.replaceState(null, '', window.location.pathname);
      setSelectedTier(tierStr);
      setUserDetails(prev => ({ ...prev, name: 'Valued Member' }));
      setIsSubscribing(true);
      setStep(5);
    }
    if (query.get('canceled')) {
      window.history.replaceState(null, '', window.location.pathname);
      setStep(0);
    }
    if (query.get('cart_success')) {
       window.history.replaceState(null, '', window.location.pathname);
       setCart([]);
       alert("Thank you! Your ritual essentials are being prepared for you.");
    }
  }, []);

  useEffect(() => {
    if (step === 6) fetchAdminData();
  }, [step]);

  const fetchAdminData = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      const statsRes = await fetch(`${API_BASE}/api/admin/stats`, { headers: { 'Authorization': `Bearer ${token}` } });
      if (statsRes.ok) setAdminStats(await statsRes.json());

      const usersRes = await fetch(`${API_BASE}/api/admin/users`, { headers: { 'Authorization': `Bearer ${token}` } });
      if (usersRes.ok) setAdminMembers(await usersRes.json());

      const ordersRes = await fetch(`${API_BASE}/api/admin/orders`, { headers: { 'Authorization': `Bearer ${token}` } });
      if (ordersRes.ok) setAdminOrders(await ordersRes.json());
    } catch (err) {
      console.error('Failed to load admin stats/users:', err);
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    const token = localStorage.getItem('token');
    try {
      await fetch(`${API_BASE}/api/admin/orders/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ status: newStatus })
      });
      fetchAdminData();
    } catch (error) {
      console.error("Failed to update order");
    }
  };

  const deleteProduct = async (productId) => {
    const token = localStorage.getItem('token');
    if(!window.confirm("Are you sure you want to delete this product?")) return;
    try {
      await fetch(`${API_BASE}/api/admin/products/${productId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const response = await fetch(`${API_BASE}/api/products`);
      if (response.ok) setBackendProducts(await response.json());
    } catch (error) {
      console.error("Failed to delete product");
    }
  };

  const handleAddToCart = (product) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.sku === product.sku);
      if (existingItem) {
        return prevCart.map(item => 
          item.sku === product.sku ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prevCart, { ...product, quantity: 1 }];
    });
  };

  const handleUpdateQuantity = (sku, delta) => {
    setCart(prevCart => prevCart.map(item => {
      if (item.sku === sku) {
        const newQty = item.quantity + delta;
        return newQty > 0 ? { ...item, quantity: newQty } : null;
      }
      return item;
    }).filter(Boolean));
  };

  const handleRemoveFromCart = (sku) => {
    setCart(prevCart => prevCart.filter(item => item.sku !== sku));
  };

  const calculateCartTotal = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0).toFixed(2);
  };

  const handleCartCheckout = async () => {
    setIsLoading(true);
    const token = localStorage.getItem('token'); 
    try {
      const res = await fetch(`${API_BASE}/api/cart-checkout`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ items: cart })
      });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
    } catch (error) {
      console.error('Checkout error:', error);
    }
    setIsLoading(false);
  };

  const triggerCjSync = async () => {
    setIsLoading(true);
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${API_BASE}/api/admin/sync-cj`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      alert(data.message || 'CJ Sync initiated');
      fetchAdminData();
    } catch (err) {
      alert('Failed to trigger CJ catalog sync.');
    }
    setIsLoading(false);
  };

  const getCuratedRecommendations = () => {
    if (!backendProducts || backendProducts.length === 0) return [];
    
    const essentialSlots = [
      { id: 1, label: 'Gentle Cleanser', keywords: ['cleanser', 'wash', 'foam', 'gel', 'amino', 'cleanse'] },
      { id: 2, label: 'Hydrating Serum', keywords: ['serum', 'hyaluronic', 'essence', 'ampoule', 'liquid', 'repair'] },
      { id: 3, label: 'Daily Moisturizer', keywords: ['moisturizer', 'cream', 'lotion', 'hydrator', 'moist', 'day cream'] },
      { id: 4, label: 'Broad-Spectrum SPF', keywords: ['sunscreen', 'spf', 'sun', 'uv', 'shield', 'protect'] },
      { id: 5, label: 'Foundation', keywords: ['bb', 'tint', 'foundation', 'base', 'cushion', 'cc'] },
      { id: 6, label: 'Concealer', keywords: ['concealer', 'cover', 'correct', 'brightener', 'spot', 'task concealer'] },
      { id: 7, label: 'Eyebrow Definer', keywords: ['brow', 'eyebrow', 'pencil', 'shape', 'sculpt'] },
      { id: 8, label: 'Cream Blush', keywords: ['blush', 'cheek', 'rouge', 'tint', 'palette'] },
      { id: 9, label: 'Everyday Mascara', keywords: ['mascara', 'lash', 'curl', 'volume', 'lengthening'] },
      { id: 10, label: 'Tinted Lip Oil / Balm', keywords: ['lip', 'gloss', 'balm', 'oil', 'lipstick', 'glaze'] }
    ];

    const activeTraits = Object.values(quizAnswers).filter(t => t !== '').map(t => t.toLowerCase().trim());
    
    const scoredProducts = backendProducts.map(product => {
      let matchScore = 1;
      const title = (product.title || '').toLowerCase();
      const description = (product.description || '').toLowerCase();
      const productTags = (product.tags || []).map(t => t.toLowerCase().trim());
      
      activeTraits.forEach((trait, index) => {
        const weight = (index === 0 || index === 1) ? 3 : 1;
        if (productTags.includes(trait) || title.includes(trait)) matchScore += weight * 2;
        if (description.includes(trait)) matchScore += weight;
      });
      return { ...product, matchScore, title, description, productTags };
    });

    const curatedSelection = [];
    const usedProductIds = new Set();
    
    essentialSlots.forEach(slot => {
      let candidates = scoredProducts.filter(p => {
        const id = p._id || p.title;
        if (usedProductIds.has(id)) return false;
        return slot.keywords.some(kw => p.title.includes(kw) || p.description.includes(kw) || p.productTags.some(t => t.includes(kw)));
      });
      
      if (candidates.length === 0) {
        candidates = scoredProducts.filter(p => !usedProductIds.has(p._id || p.title));
      }
      
      if (candidates.length > 0) {
        candidates.sort((a, b) => b.matchScore - a.matchScore);
        const selected = candidates[0];
        usedProductIds.add(selected._id || selected.title);
        curatedSelection.push({ ...selected, essentialSlotLabel: slot.label });
      }
    });
    return curatedSelection;
  };

  const handleAnswer = (field, value) => {
    const updatedAnswers = { ...quizAnswers, [field]: value };
    setQuizAnswers(updatedAnswers);
    if (step < 20) {
      setStep(step + 1); 
    } else {
      submitQuiz(updatedAnswers); 
    }
  };

  const submitQuiz = async (finalData) => {
    setStep(21); 
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      await fetch(`${API_BASE}/api/consultations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(finalData), 
      });
    } catch (error) {
      console.error('Failed to save consultation to backend:', error);
    }
    setTimeout(() => { 
      setIsLoading(false); 
      setHasCompletedQuiz(true); 
      setStep(5); 
    }, 2500);
  };

  const handleInputChange = (e) => setUserDetails({ ...userDetails, [e.target.name]: e.target.value });
  const handleLoginInputChange = (e) => setLoginCredentials({ ...loginCredentials, [e.target.name]: e.target.value });

  const handleCreateAccount = async () => {
    setIsLoading(true);
    try {
      const regRes = await fetch(`${API_BASE}/api/users/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...userDetails, membershipTier: selectedTier })
      });
      const regData = await regRes.json();
      
      if (!regRes.ok) {
        alert(regData.error || 'Failed to create account');
        setIsLoading(false);
        return;
      }
      localStorage.setItem('token', regData.token);

      if (isSubscribing) {
        const stripeRes = await fetch(`${API_BASE}/api/create-checkout-session`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${regData.token}` },
          body: JSON.stringify({ tier: selectedTier }),
        });
        const stripeData = await stripeRes.json();
        if (stripeData.url) window.location.href = stripeData.url;
      } else {
        setIsLoading(false);
        setStep(5);
      }
    } catch (err) {
      console.error('Failed to save user account:', err);
      setIsLoading(false);
    }
  };

  const handleLoginSubmit = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/users/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginCredentials)
      });
      const data = await res.json();
      
      if (res.ok) {
        localStorage.setItem('token', data.token);
        setUserDetails(prev => ({ ...prev, name: data.user.name, role: data.user.role }));
        setSelectedTier(data.user.membershipTier);
        setIsSubscribing(data.user.membershipTier !== 'basic');
        setStep(data.user.role === 'admin' ? 6 : 5); 
      } else {
        alert(data.error || 'Login failed');
      }
    } catch (err) {
      alert('An error occurred while logging in');
    }
    setIsLoading(false);
  };

  const handleLogOut = () => {
    localStorage.removeItem('token');
    setUserDetails({ name: '', email: '', password: '', role: 'user' });
    setLoginCredentials({ email: '', password: '' });
    setSelectedTier('luminary');
    setHasCompletedQuiz(false);
    setCart([]);
    setStep(0);
  };

  const activeCascadingTags = Object.values(quizAnswers).filter(Boolean);

  return (
    <div style={{ width: '100%', minHeight: '100vh', display: 'flex', alignItems: 'center', position: 'relative' }}>
      {isLoading && <FallingSparkles />}
      <ProductDetailModal product={selectedProduct} onClose={() => setSelectedProduct(null)} onAddToCart={handleAddToCart} />

      {(step === 1 || step === 5) && (
        <div style={{ position: 'fixed', top: '30px', right: '30px', zIndex: 1000 }}>
          <button 
            onClick={() => setIsCartOpen(!isCartOpen)} 
            style={{ 
              backgroundColor: '#F2D4D7', border: '1px solid #B38B8F', borderRadius: '30px', 
              padding: '10px 22px', fontFamily: "'Cormorant Garamond', serif", fontSize: '1.1rem', 
              color: '#5C5454', cursor: 'pointer', boxShadow: '0 4px 15px rgba(232, 197, 200, 0.4)', 
              display: 'flex', alignItems: 'center', gap: '8px' 
            }}
          >
            <span>🛍️ Ritual Bag</span>
            <span style={{ 
              backgroundColor: '#B38B8F', color: '#FFFFFF', borderRadius: '50%', 
              padding: '2px 8px', fontSize: '0.9rem', fontWeight: 'bold' 
            }}>
              {cart.reduce((sum, item) => sum + item.quantity, 0)}
            </span>
          </button>
        </div>
      )}

      {/* SHOPPING CART MODAL */}
      {isCartOpen && (
        <div style={{ 
          position: 'fixed', top: 0, right: 0, width: '380px', height: '100vh', 
          backgroundColor: '#FFF9F9', borderLeft: '1px solid #E8C5C8', 
          boxShadow: '-5px 0 25px rgba(232, 197, 200, 0.3)', zIndex: 1100, display: 'flex', 
          flexDirection: 'column', padding: '25px', boxSizing: 'border-box', animation: 'fadeIn 0.3s ease' 
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #E8C5C8', paddingBottom: '15px' }}>
            <h3 style={{ fontFamily: "'Alex Brush', cursive", fontSize: '2.5rem', color: '#B38B8F', margin: 0 }}>Your Ritual Bag</h3>
            <button onClick={() => setIsCartOpen(false)} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#8A797A' }}>✕</button>
          </div>
          <div style={{ flex: 1, overflowY: 'auto', margin: '20px 0' }}>
            {cart.length === 0 ? (
              <p style={{ fontFamily: "'Cormorant Garamond', serif", color: '#8A797A', fontStyle: 'italic', textAlign: 'center', marginTop: '50px' }}>Your ritual bag is empty.</p>
            ) : (
              cart.map((item) => (
                <div key={item.sku} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px', borderBottom: '1px solid rgba(232, 197, 200, 0.3)', paddingBottom: '15px' }}>
                  <div style={{ flex: 1, paddingRight: '10px' }}>
                    <h4 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.1rem', color: '#5C5454', margin: '0 0 5px 0' }}>
                      {item.displayTitle || getDisplayTitle(item)} {item.selectedVariantName && item.selectedVariantName !== item.sku ? `(${item.selectedVariantName})` : ''}
                    </h4>
                    <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1rem', color: '#B38B8F', margin: 0, fontWeight: 'bold' }}>${(item.price * item.quantity).toFixed(2)}</p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <button onClick={() => handleUpdateQuantity(item.sku, -1)} style={{ background: '#F2D4D7', border: '1px solid #E8C5C8', borderRadius: '5px', cursor: 'pointer', width: '25px', height: '25px' }}>-</button>
                    <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.1rem', color: '#5C5454' }}>{item.quantity}</span>
                    <button onClick={() => handleUpdateQuantity(item.sku, 1)} style={{ background: '#F2D4D7', border: '1px solid #E8C5C8', borderRadius: '5px', cursor: 'pointer', width: '25px', height: '25px' }}>+</button>
                    <button onClick={() => handleRemoveFromCart(item.sku)} style={{ background: 'none', border: 'none', color: '#A89999', cursor: 'pointer', fontSize: '1rem', marginLeft: '5px' }}>🗑️</button>
                  </div>
                </div>
              ))
            )}
          </div>
          <div style={{ borderTop: '1px solid #E8C5C8', paddingTop: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
              <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.3rem', color: '#5C5454' }}>Total:</span>
              <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.5rem', fontWeight: 'bold', color: '#B38B8F' }}>${calculateCartTotal()}</span>
            </div>
            <button onClick={handleCartCheckout} disabled={cart.length === 0} style={{ width: '100%', backgroundColor: cart.length === 0 ? '#E8C5C8' : '#F2D4D7', border: '1px solid #B38B8F', borderRadius: '25px', padding: '12px', fontFamily: "'Cormorant Garamond', serif", fontSize: '1.2rem', color: '#5C5454', cursor: cart.length === 0 ? 'not-allowed' : 'pointer' }}>Secure Checkout ✧</button>
          </div>
        </div>
      )}

      <EmpowermentContainer>
        {step === 0 && (
          <div style={{ animation: 'fadeIn 1s ease' }}>
            <h1 style={{ fontSize: '4.8rem', margin: '0 0 20px 0', color: '#B38B8F', fontFamily: "'Alex Brush', cursive", fontWeight: '400', lineHeight: '1.1' }}>
              Susan's Beauty Consulting
            </h1>
            <p style={{ fontSize: '1.5rem', lineHeight: '1.9', fontFamily: "'Cormorant Garamond', serif", fontStyle: 'italic', color: '#736A6A', margin: '15px auto', maxWidth: '680px' }}>
              Gracefully unveil the most luminous version of yourself. Through bespoke skincare rituals and refined makeup artistry, we illuminate your natural essence.
            </p>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '40px auto' }}>
              <div style={{ width: '80px', height: '1px', backgroundColor: '#E8C5C8' }}></div>
              <span style={{ color: '#E8C5C8', margin: '0 15px', fontSize: '1.2rem' }}>✧</span>
              <div style={{ width: '80px', height: '1px', backgroundColor: '#E8C5C8' }}></div>
            </div>
            <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'center' }}>
              <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', justifyContent: 'center' }}>
                <EmpowermentButton text="Shop the Collection" onClick={() => setStep(1)} />
                <EmpowermentButton text="Free Sign Up" onClick={() => { setSelectedTier('basic'); setIsSubscribing(false); setStep(3); }} />
                <EmpowermentButton text="Premium Subscriptions" onClick={() => setStep(2)} />
              </div>
              <p 
                style={{ cursor: 'pointer', color: '#A89999', textDecoration: 'underline', fontFamily: "'Cormorant Garamond', serif", fontSize: '1.1rem', transition: 'color 0.3s ease', marginTop: '10px' }} 
                onClick={() => setStep(4)} 
                onMouseOver={(e) => e.target.style.color = '#736A6A'} 
                onMouseOut={(e) => e.target.style.color = '#A89999'}
              >
                Already a member? Sign in
              </p>
            </div>
          </div>
        )}

        {step === 1 && (
          <div style={{ animation: 'fadeIn 1s ease', textAlign: 'left' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
              <h1 style={{ fontSize: '3.8rem', margin: 0, color: '#B38B8F', fontFamily: "'Alex Brush', cursive", fontWeight: '400' }}>The Boutique</h1>
              <button 
                onClick={() => setStep(0)} 
                style={{ background: 'none', border: '1px solid #E8C5C8', borderRadius: '20px', padding: '8px 20px', color: '#736A6A', fontFamily: "'Cormorant Garamond', serif", cursor: 'pointer', fontSize: '1.1rem' }}
              >
                ← Home
              </button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
              {backendProducts.length > 0 ? (
                backendProducts.map((product) => (
                  <ProductCard key={product._id || product.title} product={product} onAddToCart={handleAddToCart} onCardClick={setSelectedProduct} />
                ))
              ) : (
                <p style={{ fontFamily: "'Cormorant Garamond', serif", color: '#736A6A', fontSize: '1.2rem', fontStyle: 'italic' }}>Fetching live boutique inventory...</p>
              )}
            </div>
          </div>
        )}

        {step === 2 && (
          <div style={{ animation: 'fadeIn 1.5s ease' }}>
            <h1 style={{ fontSize: '4.2rem', margin: '0 0 10px 0', color: '#B38B8F', fontFamily: "'Alex Brush', cursive", fontWeight: '400', lineHeight: '1.1' }}>
              Elevate Your Ritual
            </h1>
            <p style={{ fontSize: '1.4rem', lineHeight: '1.8', fontFamily: "'Cormorant Garamond', serif", color: '#736A6A', margin: '15px auto 35px', maxWidth: '600px' }}>
              Unlock Susan's Consultation Quiz and bespoke curation.
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '30px', flexWrap: 'wrap', marginBottom: '35px' }}>
              <div style={{ border: '1px solid rgba(232, 197, 200, 0.6)', borderRadius: '20px', padding: '40px 30px', backgroundColor: 'rgba(255, 255, 255, 0.7)', flex: '1', minWidth: '300px', maxWidth: '400px', boxShadow: '0 10px 30px rgba(232, 197, 200, 0.15)' }}>
                <h3 style={{ fontSize: '2.2rem', color: '#8A797A', fontFamily: "'Cormorant Garamond', serif", margin: '0 0 10px 0' }}>The Luminary Circle</h3>
                <p style={{ fontSize: '1.8rem', color: '#5C5454', margin: '0 0 25px 0', fontFamily: "'Alex Brush', cursive" }}>$49 <span style={{fontSize: '1rem', fontStyle: 'italic', color: '#A89999'}}>/ month</span></p>
                <ul style={{ textAlign: 'left', listStyle: 'none', padding: 0, margin: '0 0 35px 0', color: '#736A6A', fontFamily: "'Cormorant Garamond', serif", fontSize: '1.25rem', lineHeight: '2' }}>
                  <li>✧ Full access to Curation Quiz</li>
                  <li>✧ 3-piece skin care ritual box</li>
                  <li>✧ Quarterly 1-on-1 consultation</li>
                  <li>✧ 10% boutique discount</li>
                </ul>
                <EmpowermentButton text="Select Luminary" onClick={() => { setSelectedTier('luminary'); setIsSubscribing(true); setStep(3); }} />
              </div>
              <div style={{ border: '1px solid rgba(179, 139, 143, 0.8)', borderRadius: '20px', padding: '40px 30px', backgroundColor: 'rgba(255, 255, 255, 0.9)', flex: '1', minWidth: '300px', maxWidth: '400px', boxShadow: '0 10px 30px rgba(179, 139, 143, 0.25)' }}>
                <h3 style={{ fontSize: '2.2rem', color: '#B38B8F', fontFamily: "'Cormorant Garamond', serif", margin: '0 0 10px 0' }}>The Radiance Elite</h3>
                <p style={{ fontSize: '1.8rem', color: '#5C5454', margin: '0 0 25px 0', fontFamily: "'Alex Brush', cursive" }}>$119 <span style={{fontSize: '1rem', fontStyle: 'italic', color: '#A89999'}}>/ month</span></p>
                <ul style={{ textAlign: 'left', listStyle: 'none', padding: 0, margin: '0 0 35px 0', color: '#736A6A', fontFamily: "'Cormorant Garamond', serif", fontSize: '1.25rem', lineHeight: '2' }}>
                  <li>✧ Full access to Curation Quiz</li>
                  <li>✧ 5-piece premium box</li>
                  <li>✧ Monthly 1-on-1 consultations</li>
                  <li>✧ 25% off the boutique</li>
                </ul>
                <EmpowermentButton text="Select Radiance" onClick={() => { setSelectedTier('radiance'); setIsSubscribing(true); setStep(3); }} />
              </div>
            </div>
            <p style={{ cursor: 'pointer', color: '#A89999', textDecoration: 'underline', fontFamily: "'Cormorant Garamond', serif", fontSize: '1.1rem' }} onClick={() => setStep(0)}>← Back to Home</p>
          </div>
        )}

        {step === 3 && (
          <div style={{ animation: 'fadeIn 1s ease' }}>
            <h1 style={{ fontSize: '4.2rem', margin: '0 0 10px 0', color: '#B38B8F', fontFamily: "'Alex Brush', cursive", fontWeight: '400' }}>
              Join {selectedTier === 'radiance' ? 'The Radiance Elite' : selectedTier === 'basic' ? 'Basic Access' : 'The Luminary Circle'}
            </h1>
            <p style={{ fontSize: '1.4rem', fontFamily: "'Cormorant Garamond', serif", color: '#736A6A', margin: '15px auto 35px' }}>
              Enter your details below to create your account.
            </p>
            {isLoading ? <EmpowermentLoader text={isSubscribing ? "Connecting to payment gateway..." : "Creating your account..."} /> : (
              <div style={{ maxWidth: '400px', margin: '0 auto' }}>
                <ElegantInput type="text" name="name" placeholder="Your First Name" value={userDetails.name} onChange={handleInputChange} />
                <ElegantInput type="email" name="email" placeholder="Email Address" value={userDetails.email} onChange={handleInputChange} />
                <ElegantInput type="password" name="password" placeholder="Create a Password" value={userDetails.password} onChange={handleInputChange} />
                <div style={{ marginTop: '35px' }}>
                  <EmpowermentButton text={isSubscribing ? "Proceed to Checkout" : "Create Account"} onClick={handleCreateAccount} />
                </div>
                <p style={{ cursor: 'pointer', color: '#A89999', textDecoration: 'underline', fontFamily: "'Cormorant Garamond', serif", fontSize: '1.1rem', marginTop: '20px' }} onClick={() => setStep(0)}>← Back</p>
              </div>
            )}
          </div>
        )}

        {step === 4 && (
          <div style={{ animation: 'fadeIn 1s ease' }}>
            <h1 style={{ fontSize: '4.2rem', margin: '0 0 10px 0', color: '#B38B8F', fontFamily: "'Alex Brush', cursive", fontWeight: '400' }}>Welcome Back</h1>
            <p style={{ fontSize: '1.4rem', fontFamily: "'Cormorant Garamond', serif", color: '#736A6A', margin: '15px auto 35px' }}>
              Sign in to access your dashboard.
            </p>
            {isLoading ? <EmpowermentLoader text="Verifying credentials securely..." /> : (
              <div style={{ maxWidth: '400px', margin: '0 auto' }}>
                <ElegantInput type="email" name="email" placeholder="Email Address" value={loginCredentials.email} onChange={handleLoginInputChange} />
                <ElegantInput type="password" name="password" placeholder="Password" value={loginCredentials.password} onChange={handleLoginInputChange} />
                <div style={{ marginTop: '35px' }}>
                  <EmpowermentButton text="Sign In" onClick={handleLoginSubmit} />
                </div>
                <p style={{ cursor: 'pointer', color: '#A89999', textDecoration: 'underline', fontFamily: "'Cormorant Garamond', serif", fontSize: '1.1rem', marginTop: '20px' }} onClick={() => setStep(0)}>← Back</p>
              </div>
            )}
          </div>
        )}

        {step === 5 && (
          <div style={{ animation: 'fadeIn 1.5s ease' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid rgba(232, 197, 200, 0.4)', paddingBottom: '15px' }}>
              <span style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: 'italic', color: '#A89999', fontSize: '1.2rem' }}>
                Welcome, {userDetails.name || 'Valued Member'}
              </span>
              <button 
                onClick={handleLogOut} 
                style={{ background: 'none', border: '1px solid #E8C5C8', borderRadius: '20px', padding: '5px 15px', color: '#736A6A', fontFamily: "'Cormorant Garamond', serif", cursor: 'pointer', fontSize: '1rem' }}
              >
                Sign Out
              </button>
            </div>
            <h1 style={{ fontSize: '3.8rem', margin: '0 0 10px 0', color: '#B38B8F', fontFamily: "'Alex Brush', cursive", fontWeight: '400' }}>Your Dashboard</h1>
            
            {selectedTier === 'basic' ? (
               <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.8)', border: '1px solid #E8C5C8', borderRadius: '15px', padding: '40px', boxShadow: '0 4px 15px rgba(232, 197, 200, 0.15)', margin: '40px 0' }}>
                 <h3 style={{ fontSize: '2.2rem', color: '#5C5454', fontFamily: "'Cormorant Garamond', serif", margin: '0 0 15px 0' }}>Boutique Access Activated</h3>
                 <p style={{ fontSize: '1.2rem', color: '#736A6A', fontFamily: "'Cormorant Garamond', serif", marginBottom: '30px' }}>
                   Your free membership grants you exclusive access to shop our beautiful collections. Upgrade anytime to receive a curated regimen blueprint.
                 </p>
                 <EmpowermentButton text="Enter the Boutique" onClick={() => setStep(1)} />
               </div>
            ) : !hasCompletedQuiz ? (
              <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.8)', border: '1px solid #E8C5C8', borderRadius: '15px', padding: '40px', boxShadow: '0 4px 15px rgba(232, 197, 200, 0.15)', margin: '40px 0' }}>
                <h3 style={{ fontSize: '2.2rem', color: '#5C5454', fontFamily: "'Cormorant Garamond', serif", margin: '0 0 15px 0' }}>Unlock Your Bespoke Routine</h3>
                <p style={{ fontSize: '1.2rem', color: '#736A6A', fontFamily: "'Cormorant Garamond', serif", marginBottom: '30px' }}>
                  Take the Consultation Quiz to generate your custom routine.
                </p>
                <EmpowermentButton text="Start the Consultation" onClick={() => setStep(11)} />
              </div>
            ) : (
              <>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '15px', textAlign: 'left', marginBottom: '45px' }}>
                  <BlueprintCard label="Skin Temperament" value={quizAnswers.skinType} />
                  <BlueprintCard label="Primary Vision" value={quizAnswers.primaryGoal} />
                  <BlueprintCard label="Climate Context" value={quizAnswers.climate} />
                  <BlueprintCard label="Complexion Canvas" value={quizAnswers.complexion} />
                  <BlueprintCard label="Undertone" value={quizAnswers.undertone} />
                </div>
                <div style={{ textAlign: 'left', marginBottom: '40px' }}>
                  <h2 style={{ fontSize: '2.8rem', margin: '0 0 5px 0', color: '#B38B8F', fontFamily: "'Alex Brush', cursive", fontWeight: '400' }}>Your Everyday Essentials</h2>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
                    {getCuratedRecommendations().map((product) => (
                      <ProductCard key={product._id || product.title} product={product} onAddToCart={handleAddToCart} onCardClick={setSelectedProduct} />
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* STEP 6: SUSAN'S ADMIN PORTAL */}
        {step === 6 && (
          <div style={{ animation: 'fadeIn 1.5s ease', textAlign: 'left', width: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid rgba(232, 197, 200, 0.4)', paddingBottom: '15px' }}>
              <span style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: 'italic', color: '#A89999', fontSize: '1.2rem' }}>Susan's Operations Control</span>
              <button 
                onClick={handleLogOut} 
                style={{ background: 'none', border: '1px solid #E8C5C8', borderRadius: '20px', padding: '5px 15px', color: '#736A6A', fontFamily: "'Cormorant Garamond', serif", cursor: 'pointer', fontSize: '1rem' }}
              >
                Sign Out
              </button>
            </div>
            
            <h1 style={{ fontSize: '3.8rem', margin: '0 0 10px 0', color: '#B38B8F', fontFamily: "'Alex Brush', cursive", fontWeight: '400' }}>Admin Portal</h1>

            <div style={{ display: 'flex', gap: '15px', marginBottom: '25px', flexWrap: 'wrap' }}>
               <button onClick={() => setAdminTab('overview')} style={{ padding: '10px 20px', borderRadius: '15px', border: '1px solid #E8C5C8', background: adminTab === 'overview' ? '#F2D4D7' : '#fff', color: '#5C5454' }}>Overview</button>
               <button onClick={() => setAdminTab('orders')} style={{ padding: '10px 20px', borderRadius: '15px', border: '1px solid #E8C5C8', background: adminTab === 'orders' ? '#F2D4D7' : '#fff', color: '#5C5454' }}>Orders Dashboard</button>
               <button onClick={() => setAdminTab('members')} style={{ padding: '10px 20px', borderRadius: '15px', border: '1px solid #E8C5C8', background: adminTab === 'members' ? '#F2D4D7' : '#fff', color: '#5C5454' }}>Members & Blueprints</button>
               <button onClick={() => setAdminTab('products')} style={{ padding: '10px 20px', borderRadius: '15px', border: '1px solid #E8C5C8', background: adminTab === 'products' ? '#F2D4D7' : '#fff', color: '#5C5454' }}>Site Products</button>
            </div>

            {adminTab === 'overview' && (
               <div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px', marginBottom: '40px' }}>
                    <BlueprintCard label="Active Members" value={adminStats.activeMembers} />
                    <BlueprintCard label="Total Orders" value={adminStats.totalOrders} />
                    <BlueprintCard label="Total Inventory Items" value={adminStats.totalProducts} />
                  </div>
                  <EmpowermentButton text="Sync CJ Catalog" onClick={triggerCjSync} />
               </div>
            )}

            {adminTab === 'orders' && (
               <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.9)', border: '1px solid #E8C5C8', borderRadius: '15px', padding: '20px', overflowX: 'auto' }}>
                  <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.8rem', color: '#5C5454', marginTop: 0 }}>Order Fulfillment</h3>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: "'Cormorant Garamond', serif", fontSize: '1.1rem' }}>
                    <thead>
                      <tr style={{ borderBottom: '2px solid #E8C5C8', textAlign: 'left', color: '#B38B8F' }}>
                        <th style={{ padding: '10px' }}>ID / Customer</th>
                        <th style={{ padding: '10px' }}>Total</th>
                        <th style={{ padding: '10px' }}>Status</th>
                        <th style={{ padding: '10px' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {adminOrders.map((o) => (
                        <tr key={o._id} style={{ borderBottom: '1px solid rgba(232, 197, 200, 0.4)' }}>
                          <td style={{ padding: '10px' }}>{o._id.substring(0,6)}... <br/><small>{o.customerEmail}</small></td>
                          <td style={{ padding: '10px' }}>${o.totalAmount.toFixed(2)}</td>
                          <td style={{ padding: '10px', textTransform: 'capitalize' }}>{o.status}</td>
                          <td style={{ padding: '10px', display: 'flex', gap: '10px' }}>
                             {o.status === 'pending' && <button onClick={() => updateOrderStatus(o._id, 'shipped')} style={{ background: '#F2D4D7', border: 'none', padding: '5px 10px', borderRadius: '8px' }}>Mark Shipped</button>}
                             {o.status === 'shipped' && <button onClick={() => updateOrderStatus(o._id, 'completed')} style={{ background: '#E8C5C8', border: 'none', padding: '5px 10px', borderRadius: '8px' }}>Mark Completed</button>}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
               </div>
            )}

            {adminTab === 'members' && (
               <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.9)', border: '1px solid #E8C5C8', borderRadius: '15px', padding: '20px', overflowX: 'auto' }}>
                  <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.8rem', color: '#5C5454', marginTop: 0 }}>Client Blueprints & Subscriptions</h3>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: "'Cormorant Garamond', serif", fontSize: '1.1rem' }}>
                    <thead>
                      <tr style={{ borderBottom: '2px solid #E8C5C8', textAlign: 'left', color: '#B38B8F' }}>
                        <th style={{ padding: '10px' }}>Name</th>
                        <th style={{ padding: '10px' }}>Tier</th>
                        <th style={{ padding: '10px' }}>Blueprint Details</th>
                      </tr>
                    </thead>
                    <tbody>
                      {adminMembers.map((m) => (
                        <tr key={m._id} style={{ borderBottom: '1px solid rgba(232, 197, 200, 0.4)' }}>
                          <td style={{ padding: '10px' }}>{m.name}<br/><small>{m.email}</small></td>
                          <td style={{ padding: '10px', textTransform: 'capitalize' }}>{m.membershipTier}</td>
                          <td style={{ padding: '10px', fontSize: '0.95rem' }}>
                            {m.blueprint ? (
                               Object.entries(m.blueprint).map(([key, val]) => (
                                 !['userId', '_id', 'createdAt', '__v'].includes(key) && val ? (
                                   <span key={key} style={{ background: '#FFF0F2', padding: '2px 6px', borderRadius: '5px', margin: '2px', display: 'inline-block' }}>
                                     {key}: {val}
                                   </span>
                                 ) : null
                               ))
                            ) : "No Blueprint Completed"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
               </div>
            )}

            {adminTab === 'products' && (
               <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.9)', border: '1px solid #E8C5C8', borderRadius: '15px', padding: '20px', overflowX: 'auto' }}>
                  <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.8rem', color: '#5C5454', marginTop: 0 }}>Catalog Management</h3>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: "'Cormorant Garamond', serif", fontSize: '1.1rem' }}>
                    <thead>
                      <tr style={{ borderBottom: '2px solid #E8C5C8', textAlign: 'left', color: '#B38B8F' }}>
                        <th style={{ padding: '10px' }}>Title</th>
                        <th style={{ padding: '10px' }}>Category Tags</th>
                        <th style={{ padding: '10px' }}>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {backendProducts.map((p) => (
                        <tr key={p._id} style={{ borderBottom: '1px solid rgba(232, 197, 200, 0.4)' }}>
                          <td style={{ padding: '10px' }}>{p.title}</td>
                          <td style={{ padding: '10px' }}>{p.tags?.join(', ')}</td>
                          <td style={{ padding: '10px' }}>
                             <button onClick={() => deleteProduct(p._id)} style={{ background: 'transparent', color: 'red', border: '1px solid red', padding: '5px 10px', borderRadius: '8px', cursor: 'pointer' }}>Delete</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
               </div>
            )}
          </div>
        )}

        {/* STEPS 11-20: CASCADING QUIZ */}
        {step >= 11 && step <= 20 && (
          <div style={{ animation: 'fadeIn 0.5s ease' }}>
            <ProgressDots currentStep={step - 10} totalSteps={10} />
            {step === 11 && (
              <>
                <h2 style={{ fontSize: '2.5rem', color: '#B38B8F', fontFamily: "'Alex Brush', cursive", fontWeight: '400', marginBottom: '10px' }}>Let's Begin</h2>
                <p style={{ fontSize: '1.3rem', fontFamily: "'Cormorant Garamond', serif", color: '#736A6A', marginBottom: '30px' }}>How would you describe your skin's natural temperament?</p>
                <QuizOptionButton text="Balanced & Calm (Normal)" onClick={() => handleAnswer('skinType', 'Normal')} />
                <QuizOptionButton text="Thirsty & Delicate (Dry)" onClick={() => handleAnswer('skinType', 'Dry')} />
                <QuizOptionButton text="Naturally Dewy (Oily)" onClick={() => handleAnswer('skinType', 'Oily')} />
                <QuizOptionButton text="A Little Bit of Everything (Combination)" onClick={() => handleAnswer('skinType', 'Combination')} />
              </>
            )}
            {step === 12 && (
              <>
                <h2 style={{ fontSize: '2.5rem', color: '#B38B8F', fontFamily: "'Alex Brush', cursive", fontWeight: '400', marginBottom: '10px' }}>Your Vision</h2>
                <p style={{ fontSize: '1.3rem', fontFamily: "'Cormorant Garamond', serif", color: '#736A6A', marginBottom: '30px' }}>What is your primary focus for your skincare journey?</p>
                <QuizOptionButton text="Age-Defying & Firming" onClick={() => handleAnswer('primaryGoal', 'Anti-Aging')} />
                <QuizOptionButton text="Deep Hydration & Plumping" onClick={() => handleAnswer('primaryGoal', 'Hydration')} />
                <QuizOptionButton text="Clearing & Balancing" onClick={() => handleAnswer('primaryGoal', 'Acne Control')} />
                <QuizOptionButton text="Ultimate Glow & Radiance" onClick={() => handleAnswer('primaryGoal', 'Radiance')} />
              </>
            )}
            {step === 13 && (
              <>
                <h2 style={{ fontSize: '2.5rem', color: '#B38B8F', fontFamily: "'Alex Brush', cursive", fontWeight: '400', marginBottom: '10px' }}>Your Environment</h2>
                <p style={{ fontSize: '1.3rem', fontFamily: "'Cormorant Garamond', serif", color: '#736A6A', marginBottom: '30px' }}>What best describes your daily climate or surroundings?</p>
                <QuizOptionButton text="Humid & Tropical" onClick={() => handleAnswer('climate', 'Humid')} />
                <QuizOptionButton text="Arid, Dry, or Air-Conditioned" onClick={() => handleAnswer('climate', 'Dry')} />
                <QuizOptionButton text="Temperate & Balanced" onClick={() => handleAnswer('climate', 'Temperate')} />
                <QuizOptionButton text="Urban & Variable" onClick={() => handleAnswer('climate', 'Urban')} />
              </>
            )}
            {step === 14 && (
              <>
                <h2 style={{ fontSize: '2.5rem', color: '#B38B8F', fontFamily: "'Alex Brush', cursive", fontWeight: '400', marginBottom: '10px' }}>Delicate Details</h2>
                <p style={{ fontSize: '1.3rem', fontFamily: "'Cormorant Garamond', serif", color: '#736A6A', marginBottom: '30px' }}>How does your skin typically react to new active ingredients?</p>
                <QuizOptionButton text="Resilient (Rarely reacts)" onClick={() => handleAnswer('skinSensitivity', 'Resilient')} />
                <QuizOptionButton text="Occasionally Sensitive" onClick={() => handleAnswer('skinSensitivity', 'Occasional')} />
                <QuizOptionButton text="Highly Reactive & Delicate" onClick={() => handleAnswer('skinSensitivity', 'Reactive')} />
                <QuizOptionButton text="Unpredictable" onClick={() => handleAnswer('skinSensitivity', 'Unpredictable')} />
              </>
            )}
            {step === 15 && (
              <>
                <h2 style={{ fontSize: '2.5rem', color: '#B38B8F', fontFamily: "'Alex Brush', cursive", fontWeight: '400', marginBottom: '10px' }}>Your Canvas</h2>
                <p style={{ fontSize: '1.3rem', fontFamily: "'Cormorant Garamond', serif", color: '#736A6A', marginBottom: '30px' }}>How would you describe your beautiful complexion depth?</p>
                <QuizOptionButton text="Fair & Porcelain" onClick={() => handleAnswer('complexion', 'Fair')} />
                <QuizOptionButton text="Light & Peachy" onClick={() => handleAnswer('complexion', 'Light')} />
                <QuizOptionButton text="Medium & Golden" onClick={() => handleAnswer('complexion', 'Medium')} />
                <QuizOptionButton text="Tan, Olive, or Deep" onClick={() => handleAnswer('complexion', 'Deep')} />
              </>
            )}
            {step === 16 && (
              <>
                <h2 style={{ fontSize: '2.5rem', color: '#B38B8F', fontFamily: "'Alex Brush', cursive", fontWeight: '400', marginBottom: '10px' }}>Undertone Nuance</h2>
                <p style={{ fontSize: '1.3rem', fontFamily: "'Cormorant Garamond', serif", color: '#736A6A', marginBottom: '30px' }}>What is your skin's underlying undertone?</p>
                <QuizOptionButton text="Cool (Pink/Blue hints)" onClick={() => handleAnswer('undertone', 'Cool')} />
                <QuizOptionButton text="Warm (Golden/Peach hints)" onClick={() => handleAnswer('undertone', 'Warm')} />
                <QuizOptionButton text="Neutral (Balanced mix)" onClick={() => handleAnswer('undertone', 'Neutral')} />
                <QuizOptionButton text="Olive (Rich golden-green)" onClick={() => handleAnswer('undertone', 'Olive')} />
              </>
            )}
            {step === 17 && (
              <>
                <h2 style={{ fontSize: '2.5rem', color: '#B38B8F', fontFamily: "'Alex Brush', cursive", fontWeight: '400', marginBottom: '10px' }}>Windows to the Soul</h2>
                <p style={{ fontSize: '1.3rem', fontFamily: "'Cormorant Garamond', serif", color: '#736A6A', marginBottom: '30px' }}>What is the captivating color of your eyes?</p>
                <QuizOptionButton text="Warm Brown or Amber" onClick={() => handleAnswer('eyeColor', 'Brown')} />
                <QuizOptionButton text="Striking Blue or Grey" onClick={() => handleAnswer('eyeColor', 'Blue')} />
                <QuizOptionButton text="Enchanting Green" onClick={() => handleAnswer('eyeColor', 'Green')} />
                <QuizOptionButton text="Mesmerizing Hazel" onClick={() => handleAnswer('eyeColor', 'Hazel')} />
              </>
            )}
            {step === 18 && (
              <>
                <h2 style={{ fontSize: '2.5rem', color: '#B38B8F', fontFamily: "'Alex Brush', cursive", fontWeight: '400', marginBottom: '10px' }}>Your Silhouette</h2>
                <p style={{ fontSize: '1.3rem', fontFamily: "'Cormorant Garamond', serif", color: '#736A6A', marginBottom: '30px' }}>Which of these best describes your unique facial structure?</p>
                <QuizOptionButton text="Softly Oval or Long" onClick={() => handleAnswer('faceShape', 'Oval')} />
                <QuizOptionButton text="Beautifully Round" onClick={() => handleAnswer('faceShape', 'Round')} />
                <QuizOptionButton text="Striking Square or Rectangle" onClick={() => handleAnswer('faceShape', 'Square')} />
                <QuizOptionButton text="Delicate Heart or Diamond" onClick={() => handleAnswer('faceShape', 'Heart')} />
              </>
            )}
            {step === 19 && (
              <>
                <h2 style={{ fontSize: '2.5rem', color: '#B38B8F', fontFamily: "'Alex Brush', cursive", fontWeight: '400', marginBottom: '10px' }}>Your Aesthetic</h2>
                <p style={{ fontSize: '1.3rem', fontFamily: "'Cormorant Garamond', serif", color: '#736A6A', marginBottom: '30px' }}>When it comes to makeup, what is your signature vibe?</p>
                <QuizOptionButton text="Effortless & Barely There" onClick={() => handleAnswer('makeupVibe', 'Natural')} />
                <QuizOptionButton text="Soft, Romantic Glamour" onClick={() => handleAnswer('makeupVibe', 'Soft Glam')} />
                <QuizOptionButton text="Bold & Showstopping" onClick={() => handleAnswer('makeupVibe', 'Full Glam')} />
                <QuizOptionButton text="Creative & Trendsetting" onClick={() => handleAnswer('makeupVibe', 'Edgy')} />
              </>
            )}
            {step === 20 && (
              <>
                <h2 style={{ fontSize: '2.5rem', color: '#B38B8F', fontFamily: "'Alex Brush', cursive", fontWeight: '400', marginBottom: '10px' }}>Regimen Focus</h2>
                <p style={{ fontSize: '1.3rem', fontFamily: "'Cormorant Garamond', serif", color: '#736A6A', marginBottom: '30px' }}>What formulation texture do you prefer most in your daily ritual?</p>
                <QuizOptionButton text="Lightweight Serums & Essences" onClick={() => handleAnswer('routineFocus', 'Serums')} />
                <QuizOptionButton text="Rich, Nourishing Creams" onClick={() => handleAnswer('routineFocus', 'Creams')} />
                <QuizOptionButton text="Long-Wear Pigments & Kits" onClick={() => handleAnswer('routineFocus', 'Kits')} />
                <QuizOptionButton text="Glossy, Dewy Finishes" onClick={() => handleAnswer('routineFocus', 'Gloss')} />
              </>
            )}

            {activeCascadingTags.length > 0 && (
              <div style={{ marginTop: '50px', paddingTop: '20px', borderTop: '1px solid rgba(232, 197, 200, 0.4)', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1rem', color: '#B38B8F', textTransform: 'uppercase', letterSpacing: '2px', margin: '0 0 10px 0', fontWeight: 'bold' }}>
                  Live Curation
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'center', maxWidth: '600px', marginBottom: '15px' }}>
                  {activeCascadingTags.map((tag, i) => (
                    <span key={i} style={{ backgroundColor: 'rgba(232, 197, 200, 0.2)', color: '#736A6A', padding: '4px 12px', borderRadius: '15px', fontSize: '0.9rem', border: '1px solid #E8C5C8', fontFamily: "'Cormorant Garamond', serif" }}>
                      + {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {step === 21 && (
           <div style={{ animation: 'fadeIn 1s ease', padding: '40px 0' }}>
             <EmpowermentLoader text="Susan is curating your unique blueprint..." />
           </div>
        )}
      </EmpowermentContainer>
    </div>
  );
}

export default App;