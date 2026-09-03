require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const axios = require('axios');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');

// MAKE SURE STRIPE_SECRET_KEY in .env STARTS WITH "sk_live_" FOR PRODUCTION
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const app = express();

// ---------------- MIDDLEWARE & RATE LIMITING ---------------- //
// CORS relaxed to allow local testing and specific domains
app.use(cors({
  origin: '*',
  credentials: true
}));
app.use(express.json());

const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 10, message: 'Too many authentication attempts' });

const verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Access denied. No token provided.' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret_key');
    req.user = decoded; 
    next();
  } catch (err) {
    res.status(403).json({ error: 'Invalid or expired token.' });
  }
};

const requireAdmin = (req, res, next) => {
  verifyToken(req, res, () => {
    if (req.user && req.user.role === 'admin') {
      next();
    } else {
      res.status(403).json({ error: 'Access denied. Administrator privileges required.' });
    }
  });
};

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// ---------------- MONGODB SCHEMAS ---------------- //
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  membershipTier: { type: String, enum: ['basic', 'radiance', 'luminary', 'admin'], default: 'basic' }
}, { timestamps: true });
const User = mongoose.model('User', userSchema);

const consultationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  skinType: String, primaryGoal: String, climate: String, skinSensitivity: String,
  complexion: String, undertone: String, eyeColor: String, faceShape: String,
  makeupVibe: String, routineFocus: String, createdAt: { type: Date, default: Date.now }
});
const Consultation = mongoose.model('Consultation', consultationSchema);

const productSchema = new mongoose.Schema({
  title: { type: String, required: true }, description: String, imageUrl: String, tags: [String],
  variants: [{ sku: { type: String, required: true }, variantName: String, price: Number, imageUrl: String }]
});
const Product = mongoose.model('Product', productSchema);

const orderSchema = new mongoose.Schema({
  customerEmail: String,
  items: Array,
  totalAmount: Number,
  status: { type: String, enum: ['pending', 'shipped', 'completed'], default: 'pending' },
  createdAt: { type: Date, default: Date.now }
});
const Order = mongoose.model('Order', orderSchema);


// ---------------- STRICT TITLE & CATEGORY CLASSIFIER ---------------- //
const categorizeProduct = (title = '', categoryName = '') => {
  const t = `${title} ${categoryName}`.toLowerCase();
  const isDevice = (t.includes('shaver') || t.includes('razor') || t.includes('hair removal') || t.includes('massager') || t.includes('facial tool'));
  if (isDevice) return ['device'];
  const tags = [];
  if (t.includes('cleanser') || t.includes('wash') || t.includes('makeup remover')) tags.push('cleanser');
  if (t.includes('serum') || t.includes('essence')) tags.push('serum');
  if (t.includes('moisturizer') || t.includes('cream') || t.includes('lotion')) tags.push('moisturizer');
  if (t.includes('eye cream') || t.includes('eye gel')) tags.push('eyecream');
  if (t.includes('sunscreen') || t.includes('spf')) tags.push('sunscreen');
  if (t.includes('lipstick') || t.includes('lip')) tags.push('lipstick');
  if (t.includes('foundation') || t.includes('bb cream') || t.includes('primer')) tags.push('foundation');
  if (t.includes('concealer') || t.includes('task concealer')) tags.push('concealer');
  if (t.includes('mascara') || t.includes('lash')) tags.push('mascara');
  if (t.includes('eyeshadow') || t.includes('eyeliner') || t.includes('eyebrow')) tags.push('eyeshadow');
  if (t.includes('blush') || t.includes('bronzer') || t.includes('highlighter')) tags.push('blush');
  return tags.length > 0 ? tags : ['skincare'];
};

// ---------------- DATABASE CLEANUP & CJ SYNC ---------------- //
const reIndexExistingProducts = async () => {
  try {
    const existingProducts = await Product.find({});
    for (const product of existingProducts) {
      const correctTags = categorizeProduct(product.title, product.tags.join(' '));
      if (JSON.stringify(product.tags) !== JSON.stringify(correctTags)) {
        product.tags = correctTags;
        await product.save();
      }
    }
  } catch (err) { console.error("⚠️ Error re-indexing database:", err.message); }
};

const fetchFromCJEndpoint = async (endpointUrl, accessToken) => {
  let page = 1, hasMore = true, itemsList = [];
  while (hasMore) {
    try {
      const response = await axios.get(endpointUrl, { headers: { 'CJ-Access-Token': accessToken }, params: { pageNum: page, pageSize: 100 } });
      const list = response.data?.data?.list || response.data?.data?.content || [];
      if (list.length > 0) { itemsList.push(...list); page++; await delay(1200); } else hasMore = false;
    } catch (err) { hasMore = false; }
  }
  return itemsList;
};

const syncCJProducts = async () => {
  await reIndexExistingProducts();
  try {
    const authResponse = await axios.post('https://developers.cjdropshipping.com/api2.0/v1/authentication/getAccessToken', { apiKey: process.env.CJ_API_KEY }, { headers: { 'Content-Type': 'application/json' } });
    const accessToken = authResponse.data?.data?.accessToken;
    if (!accessToken) return;

    let rawProducts = await fetchFromCJEndpoint('https://developers.cjdropshipping.com/api2.0/v1/product/connect/list', accessToken);
    if (rawProducts.length === 0) {
      await delay(2000);
      rawProducts = await fetchFromCJEndpoint('https://developers.cjdropshipping.com/api2.0/v1/product/myProduct/query', accessToken);
    }
    const uniquePids = [...new Set(rawProducts.map(item => item.pid || item.id || item.productId))].filter(Boolean);
    for (const pid of uniquePids) {
      await delay(1200);
      try {
        const detailRes = await axios.get('https://developers.cjdropshipping.com/api2.0/v1/product/query', { headers: { 'CJ-Access-Token': accessToken }, params: { pid } });
        const details = detailRes.data?.data;
        if (details) {
          const title = details.productNameEn || details.productName;
          const mappedVariants = (details.variants || []).map(v => {
            const baseVPrice = parseFloat(v.sellPrice || 0);
            return { sku: v.variantSku, variantName: v.variantKey || v.variantName || v.variantSku, price: baseVPrice > 0 ? parseFloat(((baseVPrice + (4.50 + (parseFloat(details.productWeight || 200) * 0.015))) * 3).toFixed(2)) : 19.99, imageUrl: v.variantImage || details.productImage };
          });
          if (mappedVariants.length > 0) {
            await Product.findOneAndUpdate({ title }, { title, description: details.description || '', imageUrl: details.productImage, tags: categorizeProduct(title, details.categoryName || ''), variants: mappedVariants }, { upsert: true, returnDocument: 'after' });
          }
        }
      } catch (e) { }
    }
  } catch (error) { console.error("❌ CJ Sync error."); }
};


// ---------------- EXPRESS ROUTES ---------------- //
app.get('/api/products', async (req, res) => {
  try {
    const products = await Product.find(req.query.category ? { tags: new RegExp(`^${req.query.category}$`, 'i') } : {});
    res.status(200).json(products);
  } catch (error) { res.status(500).json({ error: 'Failed to fetch' }); }
});

app.post('/api/users/register', authLimiter, async (req, res) => {
  try {
    const { name, email, password, membershipTier } = req.body;
    if (await User.findOne({ email })) return res.status(400).json({ error: 'Email already in use.' });
    const newUser = new User({ name, email, password: await bcrypt.hash(password, await bcrypt.genSalt(10)), membershipTier: membershipTier || 'basic', role: 'user' });
    const savedUser = await newUser.save();
    res.status(201).json({ user: { id: savedUser._id, name: savedUser.name, email: savedUser.email, membershipTier: savedUser.membershipTier, role: savedUser.role }, token: jwt.sign({ _id: savedUser._id, role: savedUser.role, membershipTier: savedUser.membershipTier }, process.env.JWT_SECRET || 'fallback_secret_key', { expiresIn: '24h' }) });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

app.post('/api/users/login', authLimiter, async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user || !(await bcrypt.compare(req.body.password, user.password))) return res.status(400).json({ error: 'Invalid email or password.' });
    
    // Elevate Susan if membershipTier was accidentally used instead of role
    if (user.membershipTier === 'admin' && user.role !== 'admin') {
       user.role = 'admin';
       await user.save();
    }
    res.json({ user: { id: user._id, name: user.name, email: user.email, membershipTier: user.membershipTier, role: user.role }, token: jwt.sign({ _id: user._id, role: user.role, membershipTier: user.membershipTier }, process.env.JWT_SECRET || 'fallback_secret_key', { expiresIn: '24h' }) });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

app.post('/api/consultations', verifyToken, async (req, res) => {
  try { res.status(201).json(await (new Consultation({ ...req.body, userId: req.user._id })).save()); } 
  catch (error) { res.status(500).json({ error: error.message }); }
});


// ---------------- ADMIN ROUTES (Total Site Control) ---------------- //
app.get('/api/admin/stats', requireAdmin, async (req, res) => {
  try { res.json({ activeMembers: await User.countDocuments({ role: 'user' }), totalOrders: await Order.countDocuments(), totalProducts: await Product.countDocuments() }); } 
  catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/admin/users', requireAdmin, async (req, res) => {
  try {
    const users = await User.find({}, '-password').lean().sort({ createdAt: -1 });
    const consultations = await Consultation.find().lean();
    const merged = users.map(u => ({ ...u, blueprint: consultations.find(c => c.userId?.toString() === u._id.toString()) || null }));
    res.json(merged);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/admin/orders', requireAdmin, async (req, res) => {
  try { res.json(await Order.find().sort({ createdAt: -1 })); } catch (err) { res.status(500).json({ error: err.message }); }
});

app.put('/api/admin/orders/:id', requireAdmin, async (req, res) => {
  try { res.json(await Order.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true })); } 
  catch (err) { res.status(500).json({ error: err.message }); }
});

app.delete('/api/admin/products/:id', requireAdmin, async (req, res) => {
  try { res.json(await Product.findByIdAndDelete(req.params.id)); } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/admin/sync-cj', requireAdmin, async (req, res) => {
  try { syncCJProducts(); res.json({ message: 'CJ Dropshipping sync initiated successfully.' }); } 
  catch (err) { res.status(500).json({ error: err.message }); }
});


// ---------------- STRIPE CHECKOUT ROUTES ---------------- //
app.post('/api/create-checkout-session', verifyToken, async (req, res) => {
  try {
    const tier = req.body.tier;
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'], mode: 'subscription', 
      line_items: [{ price_data: { currency: 'usd', product_data: { name: tier === 'radiance' ? "The Radiance Elite Membership" : "The Luminary Circle Membership" }, unit_amount: tier === 'radiance' ? 11900 : 4900, recurring: { interval: 'month' } }, quantity: 1 }],
      success_url: `https://www.susansbeautyconsulting.com/?success=true&tier=${tier}`, cancel_url: `https://www.susansbeautyconsulting.com/?canceled=true`,
    });
    res.json({ url: session.url });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

app.post('/api/cart-checkout', async (req, res) => {
  try {
    const { items } = req.body;
    let authHeader = req.headers['authorization'];
    let userEmail = 'Guest Checkout';
    if (authHeader) {
      try { userEmail = jwt.verify(authHeader.split(' ')[1], process.env.JWT_SECRET || 'fallback_secret_key').email || 'Guest Checkout'; } catch (e) {}
    }

    // Save pending order to Admin Portal
    await (new Order({ customerEmail: userEmail, items: items, totalAmount: items.reduce((sum, item) => sum + (item.price * item.quantity), 0), status: 'pending' })).save();

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'], mode: 'payment', shipping_address_collection: { allowed_countries: ['US', 'CA', 'GB', 'AU'] },
      line_items: items.map(item => ({ price_data: { currency: 'usd', product_data: { name: item.displayTitle || item.title, images: item.imageUrl ? [item.imageUrl.startsWith('//') ? `https:${item.imageUrl}` : item.imageUrl] : [] }, unit_amount: Math.round(item.price * 100) }, quantity: item.quantity })),
      success_url: `https://www.susansbeautyconsulting.com/?cart_success=true`, cancel_url: `https://www.susansbeautyconsulting.com/?cart_canceled=true`,
    });
    res.json({ url: session.url });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/beauty_app';

mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('✧ Connected securely to MongoDB');
    app.listen(PORT, () => { console.log(`✧ Backend API running gracefully on port ${PORT}`); syncCJProducts(); });
  })
  .catch((err) => console.error('Failed to connect to MongoDB:', err));