FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
WORKDIR /app
EXPOSE 80

FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copy project files
COPY ["Cart.Api/Cart.Api.csproj", "Cart.Api/"]
COPY ["Cart.Application/Cart.Application.csproj", "Cart.Application/"]
COPY ["Cart.Domain/Cart.Domain.csproj", "Cart.Domain/"]
COPY ["Cart.Infrastructure/Cart.Infrastructure.csproj", "Cart.Infrastructure/"]

# Restore dependencies
RUN dotnet restore "Cart.Api/Cart.Api.csproj"

# Copy everything else
COPY . .

# Build
WORKDIR "/src/Cart.Api"
RUN dotnet build "Cart.Api.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "Cart.Api.csproj" -c Release -o /app/publish

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "Cart.Api.dll"]
