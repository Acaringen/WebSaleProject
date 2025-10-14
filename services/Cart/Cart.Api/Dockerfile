FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
WORKDIR /app
EXPOSE 80
EXPOSE 443

FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src
COPY ["services/Cart/Cart.Api/Cart.Api.csproj", "services/Cart/Cart.Api/"]
COPY ["services/Cart/Cart.Application/Cart.Application.csproj", "services/Cart/Cart.Application/"]
COPY ["services/Cart/Cart.Infrastructure/Cart.Infrastructure.csproj", "services/Cart/Cart.Infrastructure/"]
COPY ["services/Cart/Cart.Domain/Cart.Domain.csproj", "services/Cart/Cart.Domain/"]
COPY ["shared/abstractions/WebSale.Shared.Abstractions.csproj", "shared/abstractions/"]
RUN dotnet restore "services/Cart/Cart.Api/Cart.Api.csproj"
COPY . .
WORKDIR "/src/services/Cart/Cart.Api"
RUN dotnet build "Cart.Api.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "Cart.Api.csproj" -c Release -o /app/publish /p:UseAppHost=false

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "Cart.Api.dll"]
