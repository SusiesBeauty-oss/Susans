const express = require('express');
const cors = require('cors');
const app = express();
const PORT = 5000;

// This allows your React app (usually running on port 3000) to securely talk to this server
app.use(cors());
app.use(express.json());

// ---------------- PRODUCT DATABASE ---------------- //
// This is your temporary free database. 
// Once everything is connected, this is exactly where we will route your dropshipping API!
const beautyProducts = [
    { 
        id: 1, 
        title: "Luminous Radiance Serum", 
        price: "45.00", 
        imageUrl: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80" 
    },
    { 
        id: 2, 
        title: "Rose Petal Hydration Mist", 
        price: "28.00", 
        imageUrl: "https://images.unsplash.com/photo-1556228578-0d85b1a4d571?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80" 
    },
    { 
        id: 3, 
        title: "Velvet Cloud Night Cream", 
        price: "52.00", 
        imageUrl: "https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80" 
    }
];

// ---------------- ROUTES ---------------- //

// When React asks for products, the server sends the array above
app.get('/api/products', (req, res) => {
    res.json(beautyProducts);
});

// Start the server
app.listen(PORT, () => {
    console.log(`✨ Susan's Beauty Backend is glowing on http://localhost:${PORT}`);
});