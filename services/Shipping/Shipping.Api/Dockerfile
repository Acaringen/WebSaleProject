FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
WORKDIR /app
EXPOSE 80

FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copy project files for restore
COPY ["services/Shipping/Shipping.Api/Shipping.Api.csproj", "services/Shipping/Shipping.Api/"]
COPY ["services/Shipping/Shipping.Domain/Shipping.Domain.csproj", "services/Shipping/Shipping.Domain/"]
COPY ["shared/abstractions/WebSale.Shared.Abstractions.csproj", "shared/abstractions/"]

# Restore dependencies
RUN dotnet restore "services/Shipping/Shipping.Api/Shipping.Api.csproj"

# Copy all source code
COPY . .

# Publish
WORKDIR /src/services/Shipping/Shipping.Api
RUN dotnet publish "Shipping.Api.csproj" -c Release -o /app/publish /p:UseAppHost=false

FROM base AS runtime
WORKDIR /app
COPY --from=build /app/publish .
ENTRYPOINT ["dotnet", "Shipping.Api.dll"]
