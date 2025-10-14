const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const port = 5001;
const dataFile = path.join(__dirname, 'products.json');
const cartFile = path.join(__dirname, 'carts.json');
const ordersFile = path.join(__dirname, 'orders.json');
const customersFile = path.join(__dirname, 'customers.json');

app.use(cors());
app.use(express.json());

// Products dosyasını oku veya oluştur
let products = [];
if (fs.existsSync(dataFile)) {
  try {
    products = JSON.parse(fs.readFileSync(dataFile, 'utf8'));
  } catch (error) {
    console.log('Products dosyası okunamadı, yeni başlıyoruz');
    products = [];
  }
}

// Carts dosyasını oku veya oluştur
let carts = {};
if (fs.existsSync(cartFile)) {
  try {
    carts = JSON.parse(fs.readFileSync(cartFile, 'utf8'));
  } catch (error) {
    console.log('Carts dosyası okunamadı, yeni başlıyoruz');
    carts = {};
  }
}

// Orders dosyasını oku veya oluştur
let orders = [];
if (fs.existsSync(ordersFile)) {
  try {
    orders = JSON.parse(fs.readFileSync(ordersFile, 'utf8'));
  } catch (error) {
    console.log('Orders dosyası okunamadı, yeni başlıyoruz');
    orders = [];
  }
}

// Customers dosyasını oku veya oluştur
let customers = [];
if (fs.existsSync(customersFile)) {
  try {
    customers = JSON.parse(fs.readFileSync(customersFile, 'utf8'));
  } catch (error) {
    console.log('Customers dosyası okunamadı, yeni başlıyoruz');
    customers = [];
  }
}

// Products dosyasını kaydet
function saveProducts() {
  fs.writeFileSync(dataFile, JSON.stringify(products, null, 2));
}

// Customers dosyasını kaydet
function saveCustomers() {
  fs.writeFileSync(customersFile, JSON.stringify(customers, null, 2));
}

// Carts dosyasını kaydet
function saveCarts() {
  fs.writeFileSync(cartFile, JSON.stringify(carts, null, 2));
}

// Orders dosyasını kaydet
function saveOrders() {
  fs.writeFileSync(ordersFile, JSON.stringify(orders, null, 2));
}

// Test endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'WebSale API is running',
    timestamp: new Date().toISOString(),
    productsCount: products.length
  });
});

// Ürün listesi getir
app.get('/api/products', (req, res) => {
  const { category, searchTerm, isActive, page = 1, pageSize = 20 } = req.query;
  
  let filteredProducts = [...products];
  
  // Filtreleme
  if (category) {
    filteredProducts = filteredProducts.filter(p => p.category === category);
  }
  
  if (searchTerm) {
    filteredProducts = filteredProducts.filter(p => 
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }
  
  if (isActive !== undefined) {
    filteredProducts = filteredProducts.filter(p => p.isActive === (isActive === 'true'));
  }
  
  // Sayfalama
  const startIndex = (page - 1) * pageSize;
  const endIndex = startIndex + parseInt(pageSize);
  const paginatedProducts = filteredProducts.slice(startIndex, endIndex);
  
  res.json({
    products: paginatedProducts,
    totalCount: filteredProducts.length,
    pageSize: parseInt(pageSize),
    currentPage: parseInt(page),
    totalPages: Math.ceil(filteredProducts.length / pageSize)
  });
});

// Tek ürün getir
app.get('/api/products/:id', (req, res) => {
  const product = products.find(p => p.id === req.params.id);
  if (product) {
    res.json(product);
  } else {
    res.status(404).json({ error: 'Ürün bulunamadı' });
  }
});

// Ürün oluştur
app.post('/api/products', (req, res) => {
  const productData = req.body;
  
  // Validasyon
  if (!productData.name || !productData.price || !productData.sku) {
    return res.status(400).json({ error: 'Ürün adı, fiyat ve SKU gereklidir' });
  }
  
  // Yeni ürün oluştur
  const newProduct = {
    id: Math.random().toString(36).substr(2, 9),
    ...productData,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  products.push(newProduct);
  saveProducts();
  
  console.log('Yeni ürün oluşturuldu:', newProduct.name);
  res.status(201).json(newProduct);
});

// Ürün güncelle
app.put('/api/products/:id', (req, res) => {
  const productIndex = products.findIndex(p => p.id === req.params.id);
  
  if (productIndex === -1) {
    return res.status(404).json({ error: 'Ürün bulunamadı' });
  }
  
  products[productIndex] = {
    ...products[productIndex],
    ...req.body,
    updatedAt: new Date().toISOString()
  };
  
  saveProducts();
  res.json(products[productIndex]);
});

// Ürün sil
app.delete('/api/products/:id', (req, res) => {
  const productIndex = products.findIndex(p => p.id === req.params.id);
  
  if (productIndex === -1) {
    return res.status(404).json({ error: 'Ürün bulunamadı' });
  }
  
  const deletedProduct = products.splice(productIndex, 1)[0];
  saveProducts();
  
  console.log('Ürün silindi:', deletedProduct.name);
  res.json({ message: 'Ürün başarıyla silindi' });
});

// Cart endpoint'leri
// Müşteri sepetini getir
app.get('/api/cart/cart/:customerId', (req, res) => {
  const { customerId } = req.params;
  
  if (!carts[customerId]) {
    carts[customerId] = {
      id: customerId,
      items: [],
      totalAmount: 0,
      totalItems: 0
    };
  }
  
  res.json(carts[customerId]);
});

// Sepete ürün ekle
app.post('/api/cart/cart/add-item', (req, res) => {
  const { customerId, productId, productName, price, quantity, productImage } = req.body;
  
  if (!customerId || !productId || !quantity) {
    return res.status(400).json({ error: 'customerId, productId ve quantity gereklidir' });
  }
  
  // Müşteri sepeti yoksa oluştur
  if (!carts[customerId]) {
    carts[customerId] = {
      id: customerId,
      items: [],
      totalAmount: 0,
      totalItems: 0
    };
  }
  
  // Ürün zaten sepette var mı kontrol et
  const existingItem = carts[customerId].items.find(item => item.productId === productId);
  
  if (existingItem) {
    // Miktarı güncelle
    existingItem.quantity += quantity;
    existingItem.totalPrice = existingItem.quantity * existingItem.price;
  } else {
    // Yeni ürün ekle
    carts[customerId].items.push({
      productId,
      productName: productName || 'Ürün',
      price,
      quantity,
      totalPrice: price * quantity,
      productImage: productImage || null
    });
  }
  
  // Sepet toplamını güncelle
  carts[customerId].totalItems = carts[customerId].items.reduce((sum, item) => sum + item.quantity, 0);
  carts[customerId].totalAmount = carts[customerId].items.reduce((sum, item) => sum + item.totalPrice, 0);
  
  saveCarts();
  
  console.log(`Ürün sepete eklendi: ${productName} (${quantity} adet)`);
  res.json(carts[customerId]);
});

// Sepetten ürün çıkar
app.delete('/api/cart/cart/:customerId/items/:productId', (req, res) => {
  const { customerId, productId } = req.params;
  
  if (!carts[customerId]) {
    return res.status(404).json({ error: 'Sepet bulunamadı' });
  }
  
  carts[customerId].items = carts[customerId].items.filter(item => item.productId !== productId);
  
  // Sepet toplamını güncelle
  carts[customerId].totalItems = carts[customerId].items.reduce((sum, item) => sum + item.quantity, 0);
  carts[customerId].totalAmount = carts[customerId].items.reduce((sum, item) => sum + item.totalPrice, 0);
  
  saveCarts();
  res.json(carts[customerId]);
});

// Orders endpoint'leri
// Tüm siparişleri getir (admin için)
app.get('/api/orders', (req, res) => {
  const { status, customerId } = req.query;
  
  let filteredOrders = [...orders];
  
  if (status) {
    filteredOrders = filteredOrders.filter(order => order.status === status);
  }
  
  if (customerId) {
    filteredOrders = filteredOrders.filter(order => order.customerId === customerId);
  }
  
  res.json({
    orders: filteredOrders,
    totalCount: filteredOrders.length
  });
});

// Tek sipariş getir
app.get('/api/orders/:orderId', (req, res) => {
  const order = orders.find(o => o.id === req.params.orderId);
  if (order) {
    res.json(order);
  } else {
    res.status(404).json({ error: 'Sipariş bulunamadı' });
  }
});

// Sipariş oluştur
app.post('/api/orders', (req, res) => {
  const { customerId, customerName, customerEmail, items, totalAmount, shippingAddress, paymentMethod, coordinates } = req.body;
  
  if (!customerId || !items || !totalAmount) {
    return res.status(400).json({ error: 'customerId, items ve totalAmount gereklidir' });
  }
  
  const newOrder = {
    id: `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`,
    customerId,
    customerName: customerName || 'Anonim Müşteri',
    customerEmail: customerEmail || '',
    items: [...items],
    totalAmount,
    shippingAddress: shippingAddress || {},
    paymentMethod: paymentMethod || 'Kredi Kartı',
    coordinates: coordinates || null, // Harita koordinatları
    status: 'created', // created -> approved -> shipped -> delivered
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    notes: ''
  };
  
  orders.push(newOrder);
  saveOrders();
  
  // Sipariş oluşturulduktan sonra sepeti temizle
  if (carts[customerId]) {
    carts[customerId].items = [];
    carts[customerId].totalItems = 0;
    carts[customerId].totalAmount = 0;
    saveCarts();
  }
  
  console.log(`Yeni sipariş oluşturuldu: ${newOrder.id}`);
  res.status(201).json(newOrder);
});

// Sipariş durumunu güncelle (admin için)
app.put('/api/orders/:orderId/status', (req, res) => {
  const { status, notes } = req.body;
  
  if (!status) {
    return res.status(400).json({ error: 'status gereklidir' });
  }
  
  const validStatuses = ['created', 'approved', 'shipped', 'delivered', 'cancelled'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ error: 'Geçersiz sipariş durumu' });
  }
  
  const orderIndex = orders.findIndex(o => o.id === req.params.orderId);
  if (orderIndex === -1) {
    return res.status(404).json({ error: 'Sipariş bulunamadı' });
  }
  
  orders[orderIndex].status = status;
  orders[orderIndex].updatedAt = new Date().toISOString();
  if (notes) {
    orders[orderIndex].notes = notes;
  }
  
  saveOrders();
  
  console.log(`Sipariş durumu güncellendi: ${req.params.orderId} -> ${status}`);
  res.json(orders[orderIndex]);
});

// Dashboard istatistikleri
app.get('/api/dashboard/stats', (req, res) => {
  const totalRevenue = orders.reduce((sum, order) => {
    return order.status !== 'cancelled' ? sum + order.totalAmount : sum;
  }, 0);
  
  const recentOrders = orders.filter(order => {
    const orderDate = new Date(order.createdAt);
    const lastWeek = new Date();
    lastWeek.setDate(lastWeek.getDate() - 7);
    return orderDate >= lastWeek;
  }).length;
  
  res.json({
    totalProducts: products.length,
    totalOrders: orders.length,
    totalCustomers: new Set(orders.map(o => o.customerId)).size,
    totalRevenue: totalRevenue,
    ordersGrowth: recentOrders,
    customersGrowth: 0,
    revenueGrowth: 0
  });
});

// Müşteri endpoint'leri
// Tüm müşterileri getir
app.get('/api/customers', (req, res) => {
  // Her müşteri için sipariş istatistiklerini hesapla
  const customersWithStats = customers.map(customer => {
    const customerOrders = orders.filter(order => order.customerId === customer.id);
    const totalSpent = customerOrders.reduce((sum, order) => sum + order.totalAmount, 0);
    
    return {
      id: customer.id,
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
      address: customer.address,
      createdAt: customer.createdAt,
      lastLogin: customer.lastLogin,
      totalOrders: customerOrders.length,
      totalSpent: totalSpent,
      status: customer.status || 'active'
    };
  });
  
  res.json({ customers: customersWithStats });
});

// Müşteri kaydet (storefront'tan gelen kayıtlar için)
app.post('/api/customers', (req, res) => {
  const { name, email, password, phone, address } = req.body;
  
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Ad, email ve şifre gereklidir' });
  }
  
  // Email kontrolü
  const existingCustomer = customers.find(c => c.email === email);
  if (existingCustomer) {
    return res.status(400).json({ error: 'Bu email adresi zaten kullanılıyor' });
  }
  
  const newCustomer = {
    id: Date.now().toString(),
    name,
    email,
    password, // Gerçek uygulamada hash'lenmeli
    phone,
    address,
    createdAt: new Date().toISOString(),
    status: 'active'
  };
  
  customers.push(newCustomer);
  saveCustomers();
  
  console.log(`Yeni müşteri kaydı: ${name} (${email})`);
  res.json({ customer: newCustomer });
});

// Müşteri durumunu güncelle
app.put('/api/customers/:customerId/status', (req, res) => {
  const { customerId } = req.params;
  const { status } = req.body;
  
  if (!status) {
    return res.status(400).json({ error: 'status gereklidir' });
  }
  
  const validStatuses = ['active', 'inactive', 'blocked'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ error: 'Geçersiz müşteri durumu' });
  }
  
  const customerIndex = customers.findIndex(c => c.id === customerId);
  if (customerIndex === -1) {
    return res.status(404).json({ error: 'Müşteri bulunamadı' });
  }
  
  customers[customerIndex].status = status;
  saveCustomers();
  
  console.log(`Müşteri durumu güncellendi: ${customerId} -> ${status}`);
  res.json(customers[customerIndex]);
});

// Müşteri arama
app.get('/api/customers/search', (req, res) => {
  const { q } = req.query;
  
  if (!q) {
    return res.json({ customers: [] });
  }
  
  const searchResults = customers.filter(customer => 
    customer.name.toLowerCase().includes(q.toLowerCase()) ||
    customer.email.toLowerCase().includes(q.toLowerCase()) ||
    (customer.phone && customer.phone.includes(q))
  );
  
  res.json({ customers: searchResults });
});

app.listen(port, () => {
  console.log(`🚀 WebSale API running on http://localhost:${port}`);
  console.log(`📊 Products loaded: ${products.length}`);
  console.log(`👥 Customers loaded: ${customers.length}`);
  console.log(`📁 Data file: ${dataFile}`);
});