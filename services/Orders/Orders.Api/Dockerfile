FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
WORKDIR /app
EXPOSE 8080
EXPOSE 8081

FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
ARG BUILD_CONFIGURATION=Release
WORKDIR /src
COPY ["services/Orders/Orders.Api/Orders.Api.csproj", "services/Orders/Orders.Api/"]
COPY ["services/Orders/Orders.Application/Orders.Application.csproj", "services/Orders/Orders.Application/"]
COPY ["services/Orders/Orders.Domain/Orders.Domain.csproj", "services/Orders/Orders.Domain/"]
COPY ["services/Orders/Orders.Infrastructure/Orders.Infrastructure.csproj", "services/Orders/Orders.Infrastructure/"]
COPY ["shared/abstractions/WebSale.Shared.Abstractions.csproj", "shared/abstractions/"]
RUN dotnet restore "./services/Orders/Orders.Api/Orders.Api.csproj"
COPY . .
WORKDIR "/src/services/Orders/Orders.Api"
RUN dotnet build "./Orders.Api.csproj" -c $BUILD_CONFIGURATION -o /app/build

FROM build AS publish
ARG BUILD_CONFIGURATION=Release
RUN dotnet publish "./Orders.Api.csproj" -c $BUILD_CONFIGURATION -o /app/publish /p:UseAppHost=false

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "Orders.Api.dll"]
