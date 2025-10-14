# WebSale Project - E-commerce Monorepo

A comprehensive e-commerce solution built with microservices architecture, featuring:

## Architecture Overview

### Monorepo Structure
```
/apps/admin          - React/Next.js admin application
/apps/storefront     - React/Next.js customer-facing storefront
/services/*          - Independent microservices
/shared/abstractions - Public contracts (DTOs/Events)
```

### Microservices
- **Catalog Service** - Product catalog management
- **Inventory Service** - Stock management
- **Cart Service** - Shopping cart operations
- **Orders Service** - Order processing
- **Payments Service** - Payment processing
- **Shipping Service** - Shipping and logistics
- **Customers Service** - Customer management

### Key Features
- **Layered Architecture** - Application, Domain, Infrastructure, API layers
- **CQRS Pattern** - Command/Query separation with MediatR
- **Event-Driven Communication** - Kafka pub/sub with Outbox/Inbox patterns
- **API Gateway** - Ocelot for routing and load balancing
- **Observability** - Serilog, OpenTelemetry, HealthChecks
- **Containerization** - Docker Compose for local, Kubernetes for production

## Getting Started

### Prerequisites
- .NET 8 SDK
- Node.js 18+
- Docker & Docker Compose
- Kafka (via Docker)
- PostgreSQL
- Redis

### Local Development
```bash
# Start infrastructure services
docker-compose up -d

# Start all services
dotnet run --project services/Catalog/Catalog.Api
dotnet run --project services/Inventory/Inventory.Api
# ... other services

# Start frontend applications
cd apps/admin && npm run dev
cd apps/storefront && npm run dev
```

## Technology Stack

### Backend
- .NET 8
- ASP.NET Core Web API
- MediatR (CQRS)
- Entity Framework Core
- PostgreSQL
- Redis
- Kafka
- Ocelot API Gateway

### Frontend
- React 18
- Next.js 14
- TypeScript
- Tailwind CSS
- React Query

### Infrastructure
- Docker & Docker Compose
- Kubernetes
- GitHub Actions
- Grafana & Prometheus
