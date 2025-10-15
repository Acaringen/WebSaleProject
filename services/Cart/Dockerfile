FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
WORKDIR /app
EXPOSE 80

FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copy project files for restore
COPY ["services/Cart/Cart.Api/Cart.Api.csproj", "services/Cart/Cart.Api/"]
COPY ["services/Cart/Cart.Application/Cart.Application.csproj", "services/Cart/Cart.Application/"]
COPY ["services/Cart/Cart.Domain/Cart.Domain.csproj", "services/Cart/Cart.Domain/"]
COPY ["services/Cart/Cart.Infrastructure/Cart.Infrastructure.csproj", "services/Cart/Cart.Infrastructure/"]
COPY ["shared/abstractions/WebSale.Shared.Abstractions.csproj", "shared/abstractions/"]

# Restore dependencies
RUN dotnet restore "services/Cart/Cart.Api/Cart.Api.csproj"

# Copy all source code
COPY . .

# Publish
WORKDIR /src/services/Cart/Cart.Api
RUN dotnet publish "Cart.Api.csproj" -c Release -o /app/publish /p:UseAppHost=false

FROM base AS runtime
WORKDIR /app
COPY --from=build /app/publish .
ENTRYPOINT ["dotnet", "Cart.Api.dll"]
