FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
WORKDIR /app
EXPOSE 80
EXPOSE 443

FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src
COPY ["services/Customer/Customer.Api/Customer.Api.csproj", "services/Customer/Customer.Api/"]
COPY ["services/Customer/Customer.Application/Customer.Application.csproj", "services/Customer/Customer.Application/"]
COPY ["services/Customer/Customer.Infrastructure/Customer.Infrastructure.csproj", "services/Customer/Customer.Infrastructure/"]
COPY ["services/Customer/Customer.Domain/Customer.Domain.csproj", "services/Customer/Customer.Domain/"]
COPY ["shared/abstractions/WebSale.Shared.Abstractions.csproj", "shared/abstractions/"]
RUN dotnet restore "services/Customer/Customer.Api/Customer.Api.csproj"
COPY . .
WORKDIR "/src/services/Customer/Customer.Api"
RUN dotnet build "Customer.Api.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "Customer.Api.csproj" -c Release -o /app/publish /p:UseAppHost=false

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "Customer.Api.dll"]
