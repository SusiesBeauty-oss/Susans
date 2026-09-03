require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const axios = require('axios');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const nodemailer = require('nodemailer');

const app = express();

app.use(cors({ origin: ['https://www.susansbeautyconsulting.com', 'https://susiesbeauty-oss.github.io', 'http://localhost:3000'], credentials: true }));
app.use(express.json());

const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 20 });

// Email Transporter (Use ENV vars for production)
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.ethereal.email',
  port: process.env.SMTP_PORT || 587,
  auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
});

const authenticateToken = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Access denied.' });
  try { req.user = jwt.verify(token, process.env.JWT_SECRET || 'fallback'); next(); }
  catch (err) { res.status(400).json({ error: 'Invalid token.' }); }
};

const authenticateAdmin = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user || (user.role !== 'admin' && user.membershipTier !== 'admin')) return res.status(403).json({ error: 'Admin access required.' });
    next();
  } catch (err) { res.status(500).json({ error: 'Admin auth failed.' }); }
};

// ---------------- SCHEMAS ---------------- //
const User = mongoose.model('User', new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  membershipTier: { type: String, default: 'free' },
  role: { type: String, default: 'user' }, 
  createdAt: { type: Date, default: Date.now }
}));

const Consultation = mongoose.model('Consultation', new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  skinType: String, primaryGoal: String, complexion: String, undertone: String,
  createdAt: { type: Date, default: Date.now }
}));

const Product = mongoose.model('Product', new mongoose.Schema({
  title: { type: String, required: true }, description: String, imageUrl: String, tags: [String],
  variants: [{ sku: { type: String, required: true }, variantName: String, price: Number, imageUrl: String }]
}));

const Order = mongoose.model('Order', new mongoose.Schema({
  stripeSessionId: String, customerEmail: String, items: Array, total: Number,
  status: { type: String, default: 'Pending' }, createdAt: { type: Date, default: Date.now }
}));

const Appointment = mongoose.model('Appointment', new mongoose.Schema({
  date: String, time: String, clientName: String, notes: String, createdAt: { type: Date, default: Date.now }
}));

// ---------------- ROUTES ---------------- //
app.get('/api/products', async (req, res) => res.json(await Product.find({})));

app.post('/api/users/register', authLimiter, async (req, res) => {
  try {
    const { name, email, password, membershipTier } = req.body;
    if (await User.findOne({ email })) return res.status(400).json({ error: 'Email exists.' });
    const user = await new User({ name, email, password: await bcrypt.hash(password, 10), membershipTier }).save();
    const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET || 'fallback', { expiresIn: '24h' });
    res.status(201).json({ user: { id: user._id, name: user.name, role: user.role, membershipTier: user.membershipTier }, token });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

app.post('/api/users/login', authLimiter, async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user || !(await bcrypt.compare(req.body.password, user.password))) return res.status(400).json({ error: 'Invalid credentials.' });
    res.json({ user: { id: user._id, name: user.name, role: user.role, membershipTier: user.membershipTier }, token: jwt.sign({ _id: user._id }, process.env.JWT_SECRET || 'fallback', { expiresIn: '24h' }) });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

app.post('/api/consultations', authenticateToken, async (req, res) => res.status(201).json(await new Consultation({ ...req.body, userId: req.user._id }).save()));

// Admin Portal Data endpoints
app.get('/api/admin/stats', authenticateToken, authenticateAdmin, async (req, res) => {
  res.json({ activeMembers: await User.countDocuments(), pendingConsultations: await Consultation.countDocuments(), totalProducts: await Product.countDocuments() });
});
app.get('/api/admin/users', authenticateToken, authenticateAdmin, async (req, res) => res.json(await User.find({}, '-password').sort({ createdAt: -1 })));
app.get('/api/admin/consultations', authenticateToken, authenticateAdmin, async (req, res) => res.json(await Consultation.find().populate('userId', 'name email').sort({ createdAt: -1 })));
app.get('/api/admin/orders', authenticateToken, authenticateAdmin, async (req, res) => res.json(await Order.find().sort({ createdAt: -1 })));
app.put('/api/admin/orders/:id/fulfill', authenticateToken, authenticateAdmin, async (req, res) => {
  const order = await Order.findByIdAndUpdate(req.params.id, { status: 'Fulfilled' }, { new: true });
  res.json(order);
});
app.get('/api/admin/appointments', authenticateToken, authenticateAdmin, async (req, res) => res.json(await Appointment.find().sort({ date: 1 })));
app.post('/api/admin/appointments', authenticateToken, authenticateAdmin, async (req, res) => res.status(201).json(await new Appointment(req.body).save()));

// Checkout & Email Notifications
app.post('/api/cart-checkout', async (req, res) => {
  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'], mode: 'payment',
      shipping_address_collection: { allowed_countries: ['US', 'CA', 'GB', 'AU'] },
      line_items: req.body.items.map(item => ({ price_data: { currency: 'usd', product_data: { name: item.displayTitle || item.title }, unit_amount: Math.round(item.price * 100) }, quantity: item.quantity })),
      success_url: `https://www.susansbeautyconsulting.com/?cart_success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `https://www.susansbeautyconsulting.com/?canceled=true`,
      metadata: { cartItems: JSON.stringify(req.body.items.map(i => ({sku: i.sku, qty: i.quantity, price: i.price}))) }
    });
    res.json({ url: session.url });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

app.post('/api/checkout-success', async (req, res) => {
  try {
    const session = await stripe.checkout.sessions.retrieve(req.body.session_id);
    if (session.payment_status === 'paid') {
      const existing = await Order.findOne({ stripeSessionId: session.id });
      if (!existing) {
         const order = await new Order({ stripeSessionId: session.id, customerEmail: session.customer_details.email, total: session.amount_total, status: 'Pending', items: JSON.parse(session.metadata.cartItems || '[]') }).save();
         
         await transporter.sendMail({
           from: '"Susan\'s Beauty" <noreply@susansbeautyconsulting.com>',
           to: session.customer_details.email,
           subject: 'Your Ritual Essentials Are Confirmed',
           text: 'Thank you for your order! Susan is preparing your items now.'
         }).catch(console.error);

         await transporter.sendMail({
           from: '"System" <noreply@susansbeautyconsulting.com>',
           to: 'susan.coke@susansbeautyconsulting.com',
           subject: 'New Order Received!',
           text: `A new order was placed by ${session.customer_details.email} for $${(session.amount_total/100).toFixed(2)}. Check Admin portal to fulfill.`
         }).catch(console.error);
      }
      res.json({ success: true });
    }
  } catch (error) { res.status(500).json({ error: error.message }); }
});

mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/beauty_app').then(() => {
  app.listen(process.env.PORT || 5000, () => console.log('✧ API Running'));
});