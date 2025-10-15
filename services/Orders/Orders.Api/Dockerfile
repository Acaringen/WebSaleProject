FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
WORKDIR /app
EXPOSE 80

FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copy project files for restore
COPY ["services/Orders/Orders.Api/Orders.Api.csproj", "services/Orders/Orders.Api/"]
COPY ["services/Orders/Orders.Application/Orders.Application.csproj", "services/Orders/Orders.Application/"]
COPY ["services/Orders/Orders.Domain/Orders.Domain.csproj", "services/Orders/Orders.Domain/"]
COPY ["services/Orders/Orders.Infrastructure/Orders.Infrastructure.csproj", "services/Orders/Orders.Infrastructure/"]
COPY ["shared/abstractions/WebSale.Shared.Abstractions.csproj", "shared/abstractions/"]

# Restore dependencies
RUN dotnet restore "services/Orders/Orders.Api/Orders.Api.csproj"

# Copy all source code
COPY . .

# Publish
WORKDIR /src/services/Orders/Orders.Api
RUN dotnet publish "Orders.Api.csproj" -c Release -o /app/publish /p:UseAppHost=false

FROM base AS runtime
WORKDIR /app
COPY --from=build /app/publish .
ENTRYPOINT ["dotnet", "Orders.Api.dll"]
