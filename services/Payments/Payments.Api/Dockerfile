FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
WORKDIR /app
EXPOSE 80

FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copy project files for restore
COPY ["services/Payments/Payments.Api/Payments.Api.csproj", "services/Payments/Payments.Api/"]
COPY ["services/Payments/Payments.Domain/Payments.Domain.csproj", "services/Payments/Payments.Domain/"]
COPY ["shared/abstractions/WebSale.Shared.Abstractions.csproj", "shared/abstractions/"]

# Restore dependencies
RUN dotnet restore "services/Payments/Payments.Api/Payments.Api.csproj"

# Copy all source code
COPY . .

# Publish
WORKDIR /src/services/Payments/Payments.Api
RUN dotnet publish "Payments.Api.csproj" -c Release -o /app/publish /p:UseAppHost=false

FROM base AS runtime
WORKDIR /app
COPY --from=build /app/publish .
ENTRYPOINT ["dotnet", "Payments.Api.dll"]
