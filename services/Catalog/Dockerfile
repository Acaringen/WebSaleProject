FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
WORKDIR /app
EXPOSE 80

FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copy shared abstractions
COPY ["shared/abstractions/WebSale.Shared.Abstractions.csproj", "shared/abstractions/"]

# Copy project files
COPY ["services/Catalog/Catalog.Api/Catalog.Api.csproj", "services/Catalog/Catalog.Api/"]
COPY ["services/Catalog/Catalog.Application/Catalog.Application.csproj", "services/Catalog/Catalog.Application/"]
COPY ["services/Catalog/Catalog.Domain/Catalog.Domain.csproj", "services/Catalog/Catalog.Domain/"]
COPY ["services/Catalog/Catalog.Infrastructure/Catalog.Infrastructure.csproj", "services/Catalog/Catalog.Infrastructure/"]

# Restore dependencies
RUN dotnet restore "services/Catalog/Catalog.Api/Catalog.Api.csproj"

# Copy everything else
COPY . .

# Build
WORKDIR "/src/services/Catalog/Catalog.Api"
RUN dotnet build "Catalog.Api.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "Catalog.Api.csproj" -c Release -o /app/publish

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "Catalog.Api.dll"]
