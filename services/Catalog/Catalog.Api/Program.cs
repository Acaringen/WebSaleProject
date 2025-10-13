using Catalog.Application.Commands.CreateProduct;
using Catalog.Application.Queries.GetProduct;
using Catalog.Application.Queries.GetProducts;
using Catalog.Domain.Repositories;
using Catalog.Infrastructure.Data;
using Catalog.Infrastructure.Repositories;
using Catalog.Infrastructure.Services;
using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Serilog;
using StackExchange.Redis;
using System.Reflection;
using WebSale.Shared.Abstractions.DTOs.Catalog;

var builder = WebApplication.CreateBuilder(args);

// Configure Serilog
Log.Logger = new LoggerConfiguration()
    .ReadFrom.Configuration(builder.Configuration)
    .Enrich.FromLogContext()
    .WriteTo.Console()
    .WriteTo.File("logs/catalog-.txt", rollingInterval: RollingInterval.Day)
    .CreateLogger();

builder.Host.UseSerilog();

// Add services to the container
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Database
builder.Services.AddDbContext<CatalogDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

// Redis
builder.Services.AddSingleton<IConnectionMultiplexer>(sp =>
{
    var connectionString = builder.Configuration.GetConnectionString("Redis");
    return ConnectionMultiplexer.Connect(connectionString);
});

// Application Services
builder.Services.AddScoped<IProductRepository, ProductRepository>();
builder.Services.AddScoped<ICacheService, CacheService>();
builder.Services.AddScoped<IEventPublisher, EventPublisher>();

// MediatR
builder.Services.AddMediatR(cfg => {
    cfg.RegisterServicesFromAssembly(typeof(CreateProductCommand).Assembly);
});

// FluentValidation
builder.Services.AddValidatorsFromAssembly(typeof(CreateProductCommandValidator).Assembly);

// CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

// Health Checks
builder.Services.AddHealthChecks()
    .AddDbContextCheck<CatalogDbContext>()
    .AddRedis(builder.Configuration.GetConnectionString("Redis"))
    .AddCheck("kafka", () => Microsoft.Extensions.Diagnostics.HealthChecks.HealthCheckResult.Healthy("Kafka connection check"));

var app = builder.Build();

// Configure the HTTP request pipeline
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseCors("AllowAll");
app.UseAuthorization();
app.MapControllers();

// Health check endpoints
app.MapHealthChecks("/health");
app.MapHealthChecks("/health/ready", new Microsoft.AspNetCore.Diagnostics.HealthChecks.HealthCheckOptions
{
    Predicate = check => check.Tags.Contains("ready")
});
app.MapHealthChecks("/health/live", new Microsoft.AspNetCore.Diagnostics.HealthChecks.HealthCheckOptions
{
    Predicate = _ => false
});

// Minimal API endpoints
app.MapPost("/api/products", async (CreateProductCommand command, IMediator mediator) =>
{
    var result = await mediator.Send(command);
    return result.IsSuccess ? Results.Ok(result.Value) : Results.BadRequest(result.Error);
})
.WithName("CreateProduct")
.WithOpenApi();

app.MapGet("/api/products/{id:guid}", async (Guid id, IMediator mediator) =>
{
    var query = new GetProductQuery(id);
    var result = await mediator.Send(query);
    return result.IsSuccess ? Results.Ok(result.Value) : Results.NotFound(result.Error);
})
.WithName("GetProduct")
.WithOpenApi();

app.MapGet("/api/products", async (IMediator mediator, string? category, string? searchTerm, bool? isActive, int page = 1, int pageSize = 20) =>
{
    var query = new GetProductsQuery(category, searchTerm, isActive, page, pageSize);
    var result = await mediator.Send(query);
    return result.IsSuccess ? Results.Ok(result.Value) : Results.BadRequest(result.Error);
})
.WithName("GetProducts")
.WithOpenApi();

// Dashboard statistics endpoint
app.MapGet("/api/dashboard/stats", async (CatalogDbContext context) =>
{
    try
    {
        var totalProducts = await context.Products.CountAsync();
        
        // Diğer servislerden veri çekmek için HTTP client kullanılabilir
        // Şimdilik sadece ürün sayısını döndürüyoruz
        var stats = new
        {
            totalProducts = totalProducts,
            totalOrders = 0, // Orders servisinden gelecek
            totalCustomers = 0, // Customer servisinden gelecek
            totalRevenue = 0, // Orders servisinden gelecek
            ordersGrowth = 0,
            customersGrowth = 0,
            revenueGrowth = 0
        };
        
        return Results.Ok(stats);
    }
    catch (Exception ex)
    {
        Log.Error(ex, "Error getting dashboard stats");
        return Results.Problem("Error retrieving dashboard statistics");
    }
})
.WithName("GetDashboardStats")
.WithOpenApi();

// Ensure database is created
using (var scope = app.Services.CreateScope())
{
    var context = scope.ServiceProvider.GetRequiredService<CatalogDbContext>();
    await context.Database.EnsureCreatedAsync();
}

app.Run();
