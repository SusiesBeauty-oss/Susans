require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const axios = require('axios');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const app = express();

// ---------------- MIDDLEWARE & RATE LIMITING ---------------- //
app.use(cors());
app.use(express.json());

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 10, 
  message: 'Too many authentication attempts, please try again after 15 minutes'
});

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) return res.status(401).json({ error: 'Access denied. No token provided.' });

  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret_key');
    req.user = verified;
    next();
  } catch (err) {
    res.status(400).json({ error: 'Invalid token.' });
  }
};

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// ---------------- MONGODB SCHEMAS ---------------- //
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  membershipTier: { type: String, default: 'luminary' },
  createdAt: { type: Date, default: Date.now }
});
const User = mongoose.model('User', userSchema);

const consultationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  skinType: String,
  primaryGoal: String,
  climate: String,
  skinSensitivity: String,
  complexion: String,
  undertone: String,
  eyeColor: String,
  faceShape: String,
  makeupVibe: String,
  routineFocus: String,
  createdAt: { type: Date, default: Date.now }
});
const Consultation = mongoose.model('Consultation', consultationSchema);

const productSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  imageUrl: String,
  tags: [String],
  variants: [{
    sku: { type: String, required: true },
    variantName: String, 
    price: Number,
    imageUrl: String 
  }]
});
const Product = mongoose.model('Product', productSchema);

// ---------------- STRICT TITLE & CATEGORY CLASSIFIER ---------------- //
const categorizeProduct = (title = '', categoryName = '') => {
  const t = `${title} ${categoryName}`.toLowerCase();

  const isDevice = (
    t.includes('shaver') || t.includes('razor') || t.includes('epilator') ||
    t.includes('trimmer') || t.includes('hair removal') || t.includes('massager') ||
    t.includes('blackhead remover') || t.includes('beauty instrument') ||
    t.includes('cleaning instrument') || t.includes('brush machine') ||
    t.includes('hair clipper') || t.includes('depilator') || t.includes('facial tool') ||
    t.includes('gua sha') || t.includes('derma roller') || t.includes('pore vacuum')
  );

  if (isDevice) return ['device'];

  const tags = [];
  if (t.includes('cleanser') || t.includes('facial wash') || t.includes('face wash') ||
      t.includes('cleansing foam') || t.includes('cleansing oil') || t.includes('cleansing balm') ||
      t.includes('cleansing gel') || t.includes('micellar') || t.includes('makeup remover')) tags.push('cleanser');
  if (t.includes('serum') || t.includes('essence') || t.includes('ampoule') || t.includes('booster')) tags.push('serum');
  if (t.includes('moisturizer') || t.includes('moisturizing') || t.includes('moisturising') ||
      t.includes('face cream') || t.includes('day cream') || t.includes('night cream') ||
      t.includes('hydration cream') || t.includes('lotion')) tags.push('moisturizer');
  if (t.includes('eye cream') || t.includes('eye serum') || t.includes('under eye') || t.includes('eye gel')) tags.push('eyecream');
  if (t.includes('sunscreen') || t.includes('sunblock') || t.includes('spf') || t.includes('sun cream')) tags.push('sunscreen');
  if (t.includes('lipstick') || t.includes('lip gloss') || t.includes('lip tint') || t.includes('lip balm') || t.includes('lip liner')) tags.push('lipstick');
  if (t.includes('foundation') || t.includes('bb cream') ||
      t.includes('cc cream') || t.includes('makeup base') || t.includes('face primer') || t.includes('setting powder')) tags.push('foundation');
  if (t.includes('concealer') || t.includes('cover') || t.includes('correct') || t.includes('brightener') || t.includes('task concealer')) tags.push('concealer');
  if (t.includes('mascara') || t.includes('eyelash') || t.includes('lash serum')) tags.push('mascara');
  if (t.includes('eyeshadow') || t.includes('eye shadow') || t.includes('eyeliner') || t.includes('eyebrow')) tags.push('eyeshadow');
  if (t.includes('blush') || t.includes('bronzer') || t.includes('contour') || t.includes('highlighter')) tags.push('blush');
  if (t.includes('mask') || t.includes('sheet mask') || t.includes('clay mask') || t.includes('peel off')) tags.push('mask');

  return tags.length > 0 ? tags : ['skincare'];
};

// ---------------- DATABASE CLEANUP & RE-INDEXING ---------------- //
const reIndexExistingProducts = async () => {
  console.log("🧹 Running database sanitization to re-classify pre-existing items...");
  try {
    const existingProducts = await Product.find({});
    let cleanedCount = 0;
    for (const product of existingProducts) {
      const correctTags = categorizeProduct(product.title, product.tags.join(' '));
      if (JSON.stringify(product.tags) !== JSON.stringify(correctTags)) {
        product.tags = correctTags;
        await product.save();
        cleanedCount++;
      }
    }
    console.log(`✅ Sanitized and re-indexed ${cleanedCount} existing products in MongoDB.`);
  } catch (err) {
    console.error("⚠️ Error re-indexing database:", err.message);
  }
};

// ---------------- CJ DROPSHIPPING PRODUCT SYNC ---------------- //
const fetchFromCJEndpoint = async (endpointUrl, accessToken) => {
  let page = 1;
  let hasMore = true;
  const itemsList = [];
  while (hasMore) {
    try {
      console.log(`🔍 Fetching from CJ endpoint ${endpointUrl} (Page ${page})...`);
      const response = await axios.get(endpointUrl, {
        headers: {
          'CJ-Access-Token': accessToken,
          'Content-Type': 'application/json'
        },
        params: { pageNum: page, pageSize: 100 }
      });
      const list = response.data?.data?.list || response.data?.data?.content || [];
      if (list.length > 0) {
        itemsList.push(...list);
        page++;
        await delay(1200);
      } else {
        hasMore = false;
      }
    } catch (err) {
      console.warn(`⚠️ Endpoint error on ${endpointUrl}:`, err.message);
      hasMore = false;
    }
  }
  return itemsList;
};

const syncCJProducts = async () => {
  await reIndexExistingProducts();
  console.log("🔄 Authenticating with CJ Dropshipping API...");
  try {
    const authResponse = await axios.post(
      'https://developers.cjdropshipping.com/api2.0/v1/authentication/getAccessToken',
      { apiKey: process.env.CJ_API_KEY },
      { headers: { 'Content-Type': 'application/json' } }
    );

    const accessToken = authResponse.data?.data?.accessToken;
    if (!accessToken) {
      console.error("❌ Failed to retrieve CJ Access Token:", authResponse.data);
      return;
    }

    console.log("✅ Authenticated. Fetching connected product inventory...");
    let rawProducts = await fetchFromCJEndpoint('https://developers.cjdropshipping.com/api2.0/v1/product/connect/list', accessToken);

    if (rawProducts.length === 0) {
      rawProducts = await fetchFromCJEndpoint('https://developers.cjdropshipping.com/api2.0/v1/product/myProduct/query', accessToken);
    }

    if (rawProducts.length === 0) {
      console.log("⚠️ No products retrieved from CJ API.");
      return;
    }

    // Extract unique Product IDs to fetch full product cards
    const uniquePids = [...new Set(rawProducts.map(item => item.pid || item.id || item.productId))].filter(Boolean);
    console.log(`📦 Fetching full product cards for ${uniquePids.length} unique items...`);

    for (const pid of uniquePids) {
      await delay(1200); // Gentle throttling
      try {
        const detailRes = await axios.get('https://developers.cjdropshipping.com/api2.0/v1/product/query', {
          headers: { 'CJ-Access-Token': accessToken },
          params: { pid }
        });
        
        const details = detailRes.data?.data;
        if (details) {
          const title = details.productNameEn || details.productName;
          const cleanTitle = title.toLowerCase().trim();
          
          // Dynamic Shipping Calculation based on weight
          const weight = parseFloat(details.productWeight || 200);
          const estimatedShipping = 4.50 + (weight * 0.015); // Base fee + weight metric
          
          // Map exact variations
          const mappedVariants = (details.variants || []).map(v => {
            const baseVPrice = parseFloat(v.sellPrice || 0);
            // Ensure shipping cost is factored in before markup
            const finalPrice = baseVPrice > 0 ? parseFloat(((baseVPrice + estimatedShipping) * 3).toFixed(2)) : 19.99;
            
            return {
              sku: v.variantSku,
              variantName: v.variantKey || v.variantName || v.variantSku,
              price: finalPrice,
              imageUrl: v.variantImage || details.productImage
            };
          });

          if (mappedVariants.length > 0) {
            await Product.findOneAndUpdate(
              { title: title },
              {
                title: title,
                description: details.description || '',
                imageUrl: details.productImage,
                tags: categorizeProduct(title, details.categoryName || ''),
                variants: mappedVariants
              },
              { upsert: true, returnDocument: 'after' }
            );
          }
        }
      } catch (e) {
        console.warn(`⚠️ Failed to pull full card for PID ${pid}:`, e.message);
      }
    }
    console.log("🚀 Full CJ Dropshipping catalog sync & variation grouping complete!");
  } catch (error) {
    console.error("❌ Error during CJ Dropshipping sync:", error.response?.data || error.message);
  }
};

// ---------------- EXPRESS ROUTES ---------------- //

app.get('/api/products', async (req, res) => {
  try {
    const { category } = req.query;
    const filter = category ? { tags: new RegExp(`^${category}$`, 'i') } : {};
    const products = await Product.find(filter);
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

app.post('/api/users/register', authLimiter, async (req, res) => {
  try {
    const { name, email, password, membershipTier } = req.body;
    
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ error: 'Email already in use.' });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      membershipTier: membershipTier || 'luminary'
    });

    const savedUser = await newUser.save();
    const token = jwt.sign({ _id: savedUser._id }, process.env.JWT_SECRET || 'fallback_secret_key', { expiresIn: '24h' });

    res.status(201).json({ user: { id: savedUser._id, name: savedUser.name, email: savedUser.email, membershipTier: savedUser.membershipTier }, token });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/users/login', authLimiter, async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: 'Invalid email or password.' });

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) return res.status(400).json({ error: 'Invalid email or password.' });

    const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET || 'fallback_secret_key', { expiresIn: '24h' });

    res.json({ user: { id: user._id, name: user.name, email: user.email, membershipTier: user.membershipTier }, token });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/consultations', authenticateToken, async (req, res) => {
  try {
    const newConsultation = new Consultation({
      ...req.body,
      userId: req.user._id
    });
    const savedConsultation = await newConsultation.save();
    res.status(201).json(savedConsultation);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Subscription Membership Checkout
app.post('/api/create-checkout-session', authenticateToken, async (req, res) => {
  try {
    const { tier } = req.body;
    let unit_amount = 4900; 
    let productName = "The Luminary Circle Membership";
    let productDescription = "3-piece skin care ritual box, quarterly 1-on-1 consultation with Susan, and 10% boutique discount.";

    if (tier === 'radiance') {
      unit_amount = 11900; 
      productName = "The Radiance Elite Membership";
      productDescription = "5-piece premium skin care ritual box, monthly 1-on-1 consultations with Susan, 25% off the boutique, and new product early updates.";
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'subscription', 
      line_items: [{
        price_data: {
          currency: 'usd',
          product_data: { name: productName, description: productDescription },
          unit_amount: unit_amount,
          recurring: { interval: 'month' },
        },
        quantity: 1,
      }],
      success_url: `http://localhost:3000/?success=true&tier=${tier}`,
      cancel_url: `http://localhost:3000/?canceled=true`,
    });

    res.json({ url: session.url });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Single Purchase Cart Checkout (UPDATED)
app.post('/api/cart-checkout', async (req, res) => {
  try {
    const { items } = req.body;
    const line_items = items.map(item => ({
      price_data: {
        currency: 'usd',
        product_data: {
          name: item.displayTitle || item.title,
          images: item.imageUrl ? [item.imageUrl.startsWith('//') ? `https:${item.imageUrl}` : item.imageUrl] : [],
        },
        unit_amount: Math.round(item.price * 100), 
      },
      quantity: item.quantity,
    }));

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      
      // NEW REQUIRED ADDITIONS FOR DROPSHIPPING
      shipping_address_collection: {
        allowed_countries: ['US', 'CA', 'GB', 'AU'], // Collect address so products can be shipped
      },
      metadata: {
        // Track the SKUs so Susan knows exactly which items to order via CJ Dropshipping
        skus: items.map(i => i.sku).join(',').substring(0, 499) 
      },

      line_items,
      success_url: `http://localhost:3000/?cart_success=true`,
      cancel_url: `http://localhost:3000/?cart_canceled=true`,
    });

    res.json({ url: session.url });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ---------------- SERVER INITIALIZATION ---------------- //
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/beauty_app';

mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('✧ Connected securely to MongoDB');
    app.listen(PORT, () => {
      console.log(`✧ Backend API running gracefully on port ${PORT}`);
      syncCJProducts(); 
    });
  })
  .catch((err) => console.error('Failed to connect to MongoDB:', err));