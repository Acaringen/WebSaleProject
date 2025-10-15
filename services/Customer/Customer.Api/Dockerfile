FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
WORKDIR /app
EXPOSE 80

FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copy project files for restore
COPY ["services/Customer/Customer.Api/Customer.Api.csproj", "services/Customer/Customer.Api/"]
COPY ["services/Customer/Customer.Application/Customer.Application.csproj", "services/Customer/Customer.Application/"]
COPY ["services/Customer/Customer.Domain/Customer.Domain.csproj", "services/Customer/Customer.Domain/"]
COPY ["services/Customer/Customer.Infrastructure/Customer.Infrastructure.csproj", "services/Customer/Customer.Infrastructure/"]
COPY ["shared/abstractions/WebSale.Shared.Abstractions.csproj", "shared/abstractions/"]

# Restore dependencies
RUN dotnet restore "services/Customer/Customer.Api/Customer.Api.csproj"

# Copy all source code
COPY . .

# Publish
WORKDIR /src/services/Customer/Customer.Api
RUN dotnet publish "Customer.Api.csproj" -c Release -o /app/publish /p:UseAppHost=false

FROM base AS runtime
WORKDIR /app
COPY --from=build /app/publish .
ENTRYPOINT ["dotnet", "Customer.Api.dll"]
