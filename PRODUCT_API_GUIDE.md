# Product API - Eksiksiz Rehber

## 📦 Genel Bakış

Product API, **Catalog Service** içinde bulunur ve tüm ürün yönetimi işlemlerini gerçekleştirir.

- **Servis**: Catalog Service (Port: 5001)
- **API Gateway**: Port 5000
- **Database**: PostgreSQL (catalog database)
- **Cache**: Redis
- **Messaging**: Kafka

---

## 🛠️ Kurulum ve Çalıştırma

### Docker ile Çalıştırma

```bash
# Tüm servisleri çalıştır
docker compose up -d --build

# Sadece Catalog Service'i çalıştır
docker compose up -d --build catalog-service

# Logları görüntüle
docker logs catalog-service --tail=100 -f
```

### Servis Sağlık Kontrolü

```bash
# Doğrudan servis
curl http://localhost:5001/health

# API Gateway üzerinden
curl http://localhost:5000/api/catalog/health
```

---

## 🌐 API Endpoints

### Base URLs

- **Doğrudan Erişim**: `http://localhost:5001`
- **API Gateway**: `http://localhost:5000`

### 1. Ürün Oluşturma (Create Product)

**POST** `/api/products`

```bash
# Doğrudan
curl -X POST http://localhost:5001/api/products \
  -H "Content-Type: application/json" \
  -d '{
    "name": "iPhone 15 Pro",
    "description": "En yeni iPhone modeli",
    "price": 49999.99,
    "sku": "IPH15PRO-256-BLK",
    "category": "Elektronik",
    "brand": "Apple",
    "images": [
      "https://example.com/iphone-1.jpg",
      "https://example.com/iphone-2.jpg"
    ],
    "attributes": {
      "color": "Siyah",
      "storage": "256GB",
      "warranty": "2 Yıl"
    }
  }'

# API Gateway üzerinden
curl -X POST http://localhost:5000/api/products \
  -H "Content-Type: application/json" \
  -d '{...}'
```

**Response:**
```json
{
  "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "name": "iPhone 15 Pro",
  "description": "En yeni iPhone modeli",
  "price": 49999.99,
  "sku": "IPH15PRO-256-BLK",
  "category": "Elektronik",
  "brand": "Apple",
  "images": ["..."],
  "attributes": {"..."},
  "isActive": true,
  "createdAt": "2025-10-15T10:00:00Z",
  "updatedAt": null
}
```

---

### 2. Tüm Ürünleri Listeleme (Get Products)

**GET** `/api/products?page=1&pageSize=20&category=Elektronik&searchTerm=iPhone&isActive=true`

```bash
# Tüm ürünler
curl http://localhost:5001/api/products

# API Gateway üzerinden
curl http://localhost:5000/api/products

# Filtreleme ile
curl "http://localhost:5001/api/products?category=Elektronik&page=1&pageSize=10"

# Arama ile
curl "http://localhost:5001/api/products?searchTerm=iPhone&isActive=true"
```

**Query Parameters:**
- `page` (int, default: 1) - Sayfa numarası
- `pageSize` (int, default: 20) - Sayfa başına ürün sayısı
- `category` (string, optional) - Kategori filtresi
- `searchTerm` (string, optional) - Arama terimi
- `isActive` (bool, optional) - Aktif/pasif filtresi

**Response:**
```json
{
  "products": [
    {
      "id": "...",
      "name": "iPhone 15 Pro",
      "price": 49999.99,
      "..."
    }
  ],
  "totalCount": 150,
  "page": 1,
  "pageSize": 20,
  "totalPages": 8
}
```

---

### 3. Tek Ürün Detayı (Get Product)

**GET** `/api/products/{id}`

```bash
# Doğrudan
curl http://localhost:5001/api/products/3fa85f64-5717-4562-b3fc-2c963f66afa6

# API Gateway üzerinden
curl http://localhost:5000/api/products/3fa85f64-5717-4562-b3fc-2c963f66afa6
```

**Response:**
```json
{
  "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "name": "iPhone 15 Pro",
  "description": "En yeni iPhone modeli",
  "price": 49999.99,
  "sku": "IPH15PRO-256-BLK",
  "category": "Elektronik",
  "brand": "Apple",
  "images": ["..."],
  "attributes": {"..."},
  "isActive": true,
  "createdAt": "2025-10-15T10:00:00Z",
  "updatedAt": null
}
```

---

### 4. Ürün Güncelleme (Update Product)

**PUT** `/api/products/{id}`

```bash
curl -X PUT http://localhost:5001/api/products/3fa85f64-5717-4562-b3fc-2c963f66afa6 \
  -H "Content-Type: application/json" \
  -d '{
    "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "name": "iPhone 15 Pro Max",
    "description": "Güncellenmiş açıklama",
    "price": 54999.99,
    "category": "Elektronik",
    "brand": "Apple",
    "images": [
      "https://example.com/new-image.jpg"
    ],
    "attributes": {
      "color": "Beyaz",
      "storage": "512GB"
    },
    "isActive": true
  }'
```

**Response:**
```json
{
  "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "name": "iPhone 15 Pro Max",
  "price": 54999.99,
  "updatedAt": "2025-10-15T11:00:00Z",
  "..."
}
```

---

### 5. Ürün Silme (Delete Product)

**DELETE** `/api/products/{id}`

```bash
# Doğrudan
curl -X DELETE http://localhost:5001/api/products/3fa85f64-5717-4562-b3fc-2c963f66afa6

# API Gateway üzerinden
curl -X DELETE http://localhost:5000/api/products/3fa85f64-5717-4562-b3fc-2c963f66afa6
```

**Response:** `204 No Content`

---

## 🔧 API Gateway Routing

### Ocelot Yapılandırması

Product API'ye iki şekilde erişilebilir:

1. **Doğrudan Product Rotası**: `/api/products/*`
   - `GET /api/products` - Tüm ürünler
   - `POST /api/products` - Yeni ürün
   - `GET /api/products/{id}` - Tek ürün
   - `PUT /api/products/{id}` - Ürün güncelle
   - `DELETE /api/products/{id}` - Ürün sil

2. **Catalog Rotası**: `/api/catalog/*`
   - Tüm catalog servisi endpoint'leri

---

## 📊 Dashboard Stats Endpoint

**GET** `/api/dashboard/stats`

```bash
curl http://localhost:5001/api/dashboard/stats
```

**Response:**
```json
{
  "totalProducts": 150,
  "totalOrders": 0,
  "totalCustomers": 0,
  "totalRevenue": 0,
  "ordersGrowth": 0,
  "customersGrowth": 0,
  "revenueGrowth": 0
}
```

---

## 🏗️ Mimari Yapı

### Catalog Service (Product API)

```
services/Catalog/
├── Catalog.Api/
│   ├── Program.cs                    # API endpoints
│   ├── Dockerfile                    # Docker yapılandırması
│   └── appsettings.json
├── Catalog.Application/
│   ├── Commands/
│   │   ├── CreateProduct/            # Ürün oluşturma
│   │   ├── UpdateProduct/            # Ürün güncelleme (YENİ!)
│   │   └── DeleteProduct/            # Ürün silme (YENİ!)
│   └── Queries/
│       ├── GetProduct/               # Tek ürün getirme
│       └── GetProducts/              # Ürün listesi
├── Catalog.Domain/
│   ├── Entities/
│   │   └── Product.cs                # Product entity
│   └── Repositories/
│       └── IProductRepository.cs
└── Catalog.Infrastructure/
    ├── Data/
    │   └── CatalogDbContext.cs       # EF Core context
    ├── Repositories/
    │   └── ProductRepository.cs
    └── Services/
        ├── CacheService.cs           # Redis cache
        └── EventPublisher.cs         # Kafka events
```

---

## 🔍 Domain Events

Ürün işlemleri sırasında aşağıdaki domain event'leri tetiklenir:

- **ProductCreatedEvent**: Yeni ürün oluşturulduğunda
- **ProductUpdatedEvent**: Ürün güncellendiğinde
- **ProductDeletedEvent**: Ürün silindiğinde

Bu event'ler Kafka üzerinden diğer servislere yayınlanır.

---

## 🧪 Test Senaryoları

### 1. Ürün Oluşturma ve Listeleme

```bash
# 1. Ürün oluştur
curl -X POST http://localhost:5000/api/products \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Ürün",
    "description": "Test açıklaması",
    "price": 100.00,
    "sku": "TEST-001",
    "category": "Test",
    "brand": "Test Brand",
    "images": [],
    "attributes": {}
  }'

# 2. Tüm ürünleri listele
curl http://localhost:5000/api/products

# 3. Kategoriye göre filtrele
curl "http://localhost:5000/api/products?category=Test"
```

### 2. Ürün Güncelleme ve Silme

```bash
# 1. Ürünü güncelle (ID'yi önceki response'dan al)
PRODUCT_ID="..." # Response'dan gelen ID
curl -X PUT http://localhost:5000/api/products/$PRODUCT_ID \
  -H "Content-Type: application/json" \
  -d '{
    "id": "'$PRODUCT_ID'",
    "name": "Güncellenmiş Ürün",
    "description": "Güncellenmiş açıklama",
    "price": 150.00,
    "category": "Test",
    "brand": "Test Brand",
    "isActive": false
  }'

# 2. Ürünü sil
curl -X DELETE http://localhost:5000/api/products/$PRODUCT_ID
```

---

## 🚀 Frontend Entegrasyonu

Admin ve Storefront uygulamalarınız zaten Product API'yi kullanıyor:

```typescript
// apps/admin/src/services/productService.ts
// apps/storefront/src/services/productService.ts

const API_BASE_URL = 'http://localhost:5001' // veya 5000 (Gateway)

// Ürünleri getir
const products = await productService.getProducts(page, pageSize, category)

// Tek ürün getir
const product = await productService.getProduct(id)
```

---

## 📋 Docker Compose Yapılandırması

```yaml
catalog-service:
  build:
    context: .
    dockerfile: services/Catalog/Dockerfile
  ports:
    - "5001:80"
  environment:
    - ASPNETCORE_ENVIRONMENT=Development
    - ConnectionStrings__DefaultConnection=Host=postgres;Database=catalog;Username=websale;Password=websale123
    - Redis__ConnectionString=redis:6379
    - Kafka__BootstrapServers=kafka:9092
  depends_on:
    - postgres
    - redis
    - kafka
  networks:
    - websale-network
```

---

## 🔐 Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `ASPNETCORE_ENVIRONMENT` | Ortam | Development/Production |
| `ConnectionStrings__DefaultConnection` | PostgreSQL bağlantı | Host=postgres;Database=catalog;... |
| `Redis__ConnectionString` | Redis bağlantı | redis:6379 |
| `Kafka__BootstrapServers` | Kafka sunucuları | kafka:9092 |

---

## 📝 Swagger Documentation

Catalog Service Swagger UI:
```
http://localhost:5001/swagger
```

Burada tüm endpoint'leri test edebilirsiniz.

---

## ✅ Başarılı Build Kontrolü

```bash
# Build kontrol
docker compose build catalog-service

# Servis çalıştır
docker compose up -d catalog-service

# Sağlık kontrolü
curl http://localhost:5001/health

# Ürünleri listele
curl http://localhost:5001/api/products
```

---

## 🎯 Sonuç

Product API'niz artık **tam CRUD** operasyonlarıyla hazır:

✅ **Create** - POST /api/products  
✅ **Read** - GET /api/products, GET /api/products/{id}  
✅ **Update** - PUT /api/products/{id}  
✅ **Delete** - DELETE /api/products/{id}  
✅ **Filter** - Query parameters ile filtreleme  
✅ **Search** - searchTerm ile arama  
✅ **Pagination** - Sayfalama desteği  
✅ **API Gateway** - Ocelot routing yapılandırması  
✅ **Docker** - Container desteği  
✅ **Events** - Domain event'leri  
✅ **Cache** - Redis cache  
✅ **Health Checks** - Sağlık kontrolleri  

**Port Bilgileri:**
- Direct: http://localhost:5001
- Gateway: http://localhost:5000
- Swagger: http://localhost:5001/swagger

