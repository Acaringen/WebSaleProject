const express = require('express');
const cors = require('cors');

const app = express();
const port = 5001;

app.use(cors());
app.use(express.json());

// Test endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Test API is running' });
});

// Mock products endpoint
app.get('/api/products', (req, res) => {
  res.json({
    products: [],
    totalCount: 0,
    pageSize: 20,
    currentPage: 1,
    totalPages: 0
  });
});

// Mock create product endpoint
app.post('/api/products', (req, res) => {
  const product = req.body;
  console.log('Creating product:', product);
  
  // Mock response
  const createdProduct = {
    id: Math.random().toString(36).substr(2, 9),
    ...product,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  res.json(createdProduct);
});

// Mock dashboard stats
app.get('/api/dashboard/stats', (req, res) => {
  res.json({
    totalProducts: 0,
    totalOrders: 0,
    totalCustomers: 0,
    totalRevenue: 0,
    ordersGrowth: 0,
    customersGrowth: 0,
    revenueGrowth: 0
  });
});

app.listen(port, () => {
  console.log(`Test API running on http://localhost:${port}`);
});
