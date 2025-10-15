FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
WORKDIR /app
EXPOSE 80

FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copy project files for restore
COPY ["services/Inventory/Inventory.Api/Inventory.Api.csproj", "services/Inventory/Inventory.Api/"]
COPY ["services/Inventory/Inventory.Application/Inventory.Application.csproj", "services/Inventory/Inventory.Application/"]
COPY ["services/Inventory/Inventory.Domain/Inventory.Domain.csproj", "services/Inventory/Inventory.Domain/"]
COPY ["services/Inventory/Inventory.Infrastructure/Inventory.Infrastructure.csproj", "services/Inventory/Inventory.Infrastructure/"]
COPY ["shared/abstractions/WebSale.Shared.Abstractions.csproj", "shared/abstractions/"]

# Restore dependencies
RUN dotnet restore "services/Inventory/Inventory.Api/Inventory.Api.csproj"

# Copy all source code
COPY . .

# Publish
WORKDIR /src/services/Inventory/Inventory.Api
RUN dotnet publish "Inventory.Api.csproj" -c Release -o /app/publish /p:UseAppHost=false

FROM base AS runtime
WORKDIR /app
COPY --from=build /app/publish .
ENTRYPOINT ["dotnet", "Inventory.Api.dll"]
