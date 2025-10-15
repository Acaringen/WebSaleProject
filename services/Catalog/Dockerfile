FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
WORKDIR /app
EXPOSE 80

FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copy project files for restore
COPY ["services/Catalog/Catalog.Api/Catalog.Api.csproj", "services/Catalog/Catalog.Api/"]
COPY ["services/Catalog/Catalog.Application/Catalog.Application.csproj", "services/Catalog/Catalog.Application/"]
COPY ["services/Catalog/Catalog.Domain/Catalog.Domain.csproj", "services/Catalog/Catalog.Domain/"]
COPY ["services/Catalog/Catalog.Infrastructure/Catalog.Infrastructure.csproj", "services/Catalog/Catalog.Infrastructure/"]
COPY ["shared/abstractions/WebSale.Shared.Abstractions.csproj", "shared/abstractions/"]

# Restore dependencies
RUN dotnet restore "services/Catalog/Catalog.Api/Catalog.Api.csproj"

# Copy all source code
COPY . .

# Publish
WORKDIR /src/services/Catalog/Catalog.Api
RUN dotnet publish "Catalog.Api.csproj" -c Release -o /app/publish /p:UseAppHost=false

FROM base AS runtime
WORKDIR /app
COPY --from=build /app/publish .
ENTRYPOINT ["dotnet", "Catalog.Api.dll"]
