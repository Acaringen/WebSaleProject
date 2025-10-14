FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
WORKDIR /app
EXPOSE 8080
EXPOSE 8081

FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
ARG BUILD_CONFIGURATION=Release
WORKDIR /src
COPY ["services/Payments/Payments.Api/Payments.Api.csproj", "services/Payments/Payments.Api/"]
COPY ["services/Payments/Payments.Domain/Payments.Domain.csproj", "services/Payments/Payments.Domain/"]
COPY ["shared/abstractions/WebSale.Shared.Abstractions.csproj", "shared/abstractions/"]
RUN dotnet restore "./services/Payments/Payments.Api/Payments.Api.csproj"
COPY . .
WORKDIR "/src/services/Payments/Payments.Api"
RUN dotnet build "./Payments.Api.csproj" -c $BUILD_CONFIGURATION -o /app/build

FROM build AS publish
ARG BUILD_CONFIGURATION=Release
RUN dotnet publish "./Payments.Api.csproj" -c $BUILD_CONFIGURATION -o /app/publish /p:UseAppHost=false

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "Payments.Api.dll"]
