FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
WORKDIR /app
EXPOSE 8080
EXPOSE 8081

FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
ARG BUILD_CONFIGURATION=Release
WORKDIR /src
COPY ["services/Shipping/Shipping.Api/Shipping.Api.csproj", "services/Shipping/Shipping.Api/"]
COPY ["services/Shipping/Shipping.Domain/Shipping.Domain.csproj", "services/Shipping/Shipping.Domain/"]
COPY ["shared/abstractions/WebSale.Shared.Abstractions.csproj", "shared/abstractions/"]
RUN dotnet restore "./services/Shipping/Shipping.Api/Shipping.Api.csproj"
COPY . .
WORKDIR "/src/services/Shipping/Shipping.Api"
RUN dotnet build "./Shipping.Api.csproj" -c $BUILD_CONFIGURATION -o /app/build

FROM build AS publish
ARG BUILD_CONFIGURATION=Release
RUN dotnet publish "./Shipping.Api.csproj" -c $BUILD_CONFIGURATION -o /app/publish /p:UseAppHost=false

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "Shipping.Api.dll"]
