# WebSale Development Guide

## Architecture Overview

This project implements a comprehensive e-commerce solution using microservices architecture with the following components:

### Monorepo Structure
```
/apps/admin          - React/Next.js admin dashboard
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
- Kubernetes (production)
- GitHub Actions
- Grafana & Prometheus

## Getting Started

### Prerequisites
- .NET 8 SDK
- Node.js 18+
- Docker & Docker Compose
- Visual Studio 2022 or VS Code

### Local Development Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd WebSaleProject
   ```

2. **Start infrastructure services**
   ```bash
   docker-compose up -d postgres redis kafka zookeeper
   ```

3. **Build and run services**
   ```bash
   # Build the solution
   dotnet build

   # Run individual services
   dotnet run --project services/Catalog/Catalog.Api
   dotnet run --project services/ApiGateway
   ```

4. **Start frontend applications**
   ```bash
   # Admin dashboard (port 3000)
   cd apps/admin
   npm install
   npm run dev

   # Storefront (port 3001)
   cd apps/storefront
   npm install
   npm run dev
   ```

### API Endpoints

#### API Gateway (Port 5000)
- `/api/catalog/*` → Catalog Service
- `/api/inventory/*` → Inventory Service
- `/api/cart/*` → Cart Service
- `/api/orders/*` → Orders Service
- `/api/payments/*` → Payments Service
- `/api/shipping/*` → Shipping Service
- `/api/customers/*` → Customers Service

#### Direct Service Access
- Catalog Service: `http://localhost:5001`
- Inventory Service: `http://localhost:5002`
- Cart Service: `http://localhost:5003`
- Orders Service: `http://localhost:5004`
- Payments Service: `http://localhost:5005`
- Shipping Service: `http://localhost:5006`
- Customers Service: `http://localhost:5007`

### Health Checks
- API Gateway: `http://localhost:5000/health`
- Services: `http://localhost:500X/health`

## Development Workflow

### Adding a New Service

1. **Create service structure**
   ```
   services/NewService/
   ├── NewService.Domain/
   ├── NewService.Application/
   ├── NewService.Infrastructure/
   └── NewService.Api/
   ```

2. **Implement layers**
   - Domain: Entities, Repositories, Domain Events
   - Application: Commands, Queries, Handlers, Validators
   - Infrastructure: Data Access, External Services
   - API: Controllers, Configuration

3. **Update API Gateway**
   - Add route configuration in `ocelot.json`
   - Update Docker Compose

4. **Add to solution**
   - Update `WebSale.sln`

### CQRS Pattern

Each service follows CQRS (Command Query Responsibility Segregation):

- **Commands**: Write operations (Create, Update, Delete)
- **Queries**: Read operations (Get, List, Search)
- **Handlers**: Business logic implementation
- **Validators**: Input validation using FluentValidation

### Event-Driven Communication

Services communicate through domain events:

1. **Publish Events**: Services publish domain events to Kafka
2. **Event Handlers**: Services subscribe to relevant events
3. **Outbox Pattern**: Ensures reliable event publishing
4. **Idempotency**: Events are processed idempotently

### Database Design

Each service has its own database:
- **Catalog**: Products, Categories, Brands
- **Inventory**: Stock levels, Reservations
- **Cart**: Shopping cart items
- **Orders**: Order details, Order items
- **Payments**: Payment transactions
- **Shipping**: Shipping details, Tracking
- **Customers**: Customer profiles, Addresses

## Testing

### Unit Tests
```bash
dotnet test
```

### Integration Tests
```bash
dotnet test --filter Category=Integration
```

### Load Testing
Use tools like Apache JMeter or Artillery.io to test API performance.

## Deployment

### Docker Compose (Local)
```bash
docker-compose up -d
```

### Kubernetes (Production)
```bash
kubectl apply -f k8s/
```

### CI/CD Pipeline
The project includes GitHub Actions workflows for:
- Automated testing
- Docker image building
- Deployment to staging/production

## Monitoring & Observability

### Logging
- **Serilog**: Structured logging
- **Log Levels**: Debug, Information, Warning, Error
- **Log Aggregation**: Centralized logging with ELK stack

### Metrics
- **Prometheus**: Metrics collection
- **Grafana**: Metrics visualization
- **Health Checks**: Service health monitoring

### Tracing
- **OpenTelemetry**: Distributed tracing
- **Jaeger**: Trace visualization

## Security

### Authentication & Authorization
- JWT tokens for API authentication
- Role-based access control (RBAC)
- API key management

### Data Protection
- HTTPS/TLS encryption
- Database encryption at rest
- PII data masking

## Performance Optimization

### Caching Strategy
- **Redis**: Distributed caching
- **Cache Keys**: `{service}:{model}:{id}`
- **Cache Invalidation**: Event-driven cache invalidation

### Database Optimization
- Indexing strategy
- Query optimization
- Connection pooling

### API Optimization
- Response compression
- Pagination
- Rate limiting

## Troubleshooting

### Common Issues

1. **Service not starting**
   - Check database connection
   - Verify environment variables
   - Check port availability

2. **Event processing issues**
   - Verify Kafka connectivity
   - Check event serialization
   - Review event handler logs

3. **Performance issues**
   - Monitor database queries
   - Check cache hit rates
   - Review service metrics

### Debugging

1. **Enable debug logging**
   ```json
   {
     "Serilog": {
       "MinimumLevel": "Debug"
     }
   }
   ```

2. **Use health checks**
   - Check service health endpoints
   - Monitor dependency health

3. **Review metrics**
   - Use Grafana dashboards
   - Monitor Prometheus metrics

## Contributing

1. Fork the repository
2. Create a feature branch
3. Implement changes with tests
4. Submit a pull request

### Code Standards
- Follow C# coding conventions
- Use meaningful variable names
- Add XML documentation
- Write unit tests for new features

## License

This project is licensed under the MIT License.
