# WebSale Project Makefile

.PHONY: help build run test clean docker-up docker-down docker-build

# Default target
help:
	@echo "WebSale Project Commands:"
	@echo "  build         - Build all .NET projects"
	@echo "  run           - Run all services locally"
	@echo "  test          - Run all tests"
	@echo "  clean         - Clean build artifacts"
	@echo "  docker-up     - Start all services with Docker Compose"
	@echo "  docker-down   - Stop all Docker services"
	@echo "  docker-build  - Build all Docker images"
	@echo "  dev-setup     - Setup development environment"

# Build all .NET projects
build:
	dotnet build WebSale.sln

# Run all services (requires infrastructure to be running)
run:
	@echo "Starting all services..."
	@echo "Make sure to run 'make docker-up' first to start infrastructure services"

# Run all tests
test:
	dotnet test

# Clean build artifacts
clean:
	dotnet clean
	dotnet restore

# Start infrastructure services with Docker Compose
docker-up:
	docker-compose up -d postgres redis kafka zookeeper prometheus grafana

# Start all services with Docker Compose
docker-up-all:
	docker-compose up -d

# Stop all Docker services
docker-down:
	docker-compose down

# Build all Docker images
docker-build:
	docker-compose build

# Setup development environment
dev-setup:
	@echo "Setting up development environment..."
	@echo "1. Installing .NET dependencies..."
	dotnet restore
	@echo "2. Starting infrastructure services..."
	docker-compose up -d postgres redis kafka zookeeper
	@echo "3. Waiting for services to be ready..."
	sleep 10
	@echo "4. Running database migrations..."
	@echo "   (Database migrations will be handled by each service on startup)"
	@echo "Setup complete! You can now run individual services or use 'make docker-up-all'"

# Install frontend dependencies
install-frontend:
	@echo "Installing admin app dependencies..."
	cd apps/admin && npm install
	@echo "Installing storefront app dependencies..."
	cd apps/storefront && npm install

# Run frontend applications
run-frontend:
	@echo "Starting frontend applications..."
	@echo "Admin dashboard will be available at http://localhost:3000"
	@echo "Storefront will be available at http://localhost:3001"
	cd apps/admin && npm run dev &
	cd apps/storefront && npm run dev

# Health check all services
health-check:
	@echo "Checking service health..."
	@curl -f http://localhost:5000/health || echo "API Gateway: DOWN"
	@curl -f http://localhost:5001/health || echo "Catalog Service: DOWN"
	@curl -f http://localhost:5002/health || echo "Inventory Service: DOWN"
	@curl -f http://localhost:5003/health || echo "Cart Service: DOWN"
	@curl -f http://localhost:5004/health || echo "Orders Service: DOWN"
	@curl -f http://localhost:5005/health || echo "Payments Service: DOWN"
	@curl -f http://localhost:5006/health || echo "Shipping Service: DOWN"
	@curl -f http://localhost:5007/health || echo "Customers Service: DOWN"

# View logs
logs:
	docker-compose logs -f

# Database operations
db-reset:
	@echo "Resetting databases..."
	docker-compose down
	docker volume rm websaleproject_postgres_data || true
	docker-compose up -d postgres redis kafka zookeeper
	sleep 10
	@echo "Databases reset complete"

# Production deployment
deploy-prod:
	@echo "Deploying to production..."
	@echo "This would typically involve:"
	@echo "1. Building production images"
	@echo "2. Pushing to container registry"
	@echo "3. Deploying to Kubernetes"
	@echo "4. Running health checks"
	@echo "Production deployment not implemented in this example"
