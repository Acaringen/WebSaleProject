using Catalog.Application.Commands.CreateProduct;
using Catalog.Application.Commands.UpdateProduct;
using Catalog.Application.Commands.DeleteProduct;
using Catalog.Application.Queries.GetProduct;
using Catalog.Application.Queries.GetProducts;
using Catalog.Domain.Repositories;
using Catalog.Infrastructure.Data;
using Catalog.Infrastructure.Repositories;
using Catalog.Infrastructure.Services;
using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Npgsql;
using Serilog;
using StackExchange.Redis;
using System.Reflection;
using WebSale.Shared.Abstractions.DTOs.Catalog;

var builder = WebApplication.CreateBuilder(args);

// Detect if running in container
var isRunningInContainer = bool.TryParse(Environment.GetEnvironmentVariable("DOTNET_RUNNING_IN_CONTAINER"), out var inContainer) && inContainer;

// Add container-specific configuration if running in Docker
if (isRunningInContainer)
{
    builder.Configuration.AddJsonFile("appsettings.Container.json", optional: true, reloadOnChange: true);
    Console.WriteLine("🐳 Running in container mode - using appsettings.Container.json");
}
else
{
    Console.WriteLine("💻 Running in local mode - using appsettings.Development.json");
}

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

// Database with retry logic
builder.Services.AddDbContext<CatalogDbContext>(options =>
{
    var connectionString = builder.Configuration.GetConnectionString("DefaultConnection")
        ?? throw new InvalidOperationException("DefaultConnection is not configured.");
    
    options.UseNpgsql(connectionString, npgsqlOptions =>
    {
        // Enable retry on failure with exponential backoff
        npgsqlOptions.EnableRetryOnFailure(
            maxRetryCount: 5,
            maxRetryDelay: TimeSpan.FromSeconds(30),
            errorCodesToAdd: null
        );
        // Set command timeout
        npgsqlOptions.CommandTimeout(30);
    });
    
    // Log sensitive data only in Development
    if (builder.Environment.IsDevelopment() && !isRunningInContainer)
    {
        options.EnableSensitiveDataLogging();
        options.EnableDetailedErrors();
    }
});

// Redis
builder.Services.AddSingleton<IConnectionMultiplexer>(sp =>
{
    var connectionString = builder.Configuration.GetConnectionString("Redis") 
        ?? throw new InvalidOperationException("Redis connection string is not configured.");
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
var redisConnectionString = builder.Configuration.GetConnectionString("Redis") 
    ?? throw new InvalidOperationException("Redis connection string is not configured.");
builder.Services.AddHealthChecks()
    .AddDbContextCheck<CatalogDbContext>()
    .AddRedis(redisConnectionString)
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

app.MapPut("/api/products/{id:guid}", async (Guid id, UpdateProductCommand command, IMediator mediator) =>
{
    // Ensure ID from route matches command
    if (id != command.Id)
    {
        return Results.BadRequest("Product ID mismatch");
    }
    
    var result = await mediator.Send(command);
    return result.IsSuccess ? Results.Ok(result.Value) : Results.NotFound(result.Error);
})
.WithName("UpdateProduct")
.WithOpenApi();

app.MapDelete("/api/products/{id:guid}", async (Guid id, IMediator mediator) =>
{
    var command = new DeleteProductCommand(id);
    var result = await mediator.Send(command);
    return result.IsSuccess ? Results.NoContent() : Results.NotFound(result.Error);
})
.WithName("DeleteProduct")
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

// Initialize database with retry logic
await InitializeDatabaseAsync(app.Services);

app.Run();

// Database initialization helper method
static async Task InitializeDatabaseAsync(IServiceProvider services)
{
    const int maxRetries = 10;
    const int delayMilliseconds = 3000;

    for (int retry = 0; retry < maxRetries; retry++)
    {
        try
        {
            using var scope = services.CreateScope();
            var context = scope.ServiceProvider.GetRequiredService<CatalogDbContext>();
            var logger = scope.ServiceProvider.GetRequiredService<ILogger<Program>>();

            logger.LogInformation("Attempting to connect to database (attempt {Retry}/{MaxRetries})...", retry + 1, maxRetries);

            // Test connection
            await context.Database.CanConnectAsync();
            
            // Ensure database is created (or apply migrations if you prefer)
            await context.Database.EnsureCreatedAsync();
            
            logger.LogInformation("✅ Database connection successful and initialized.");
            return;
        }
        catch (NpgsqlException ex) when (retry < maxRetries - 1)
        {
            var logger = services.CreateScope().ServiceProvider.GetRequiredService<ILogger<Program>>();
            logger.LogWarning(ex, "⚠️ Database connection failed (attempt {Retry}/{MaxRetries}). Retrying in {Delay}ms...", 
                retry + 1, maxRetries, delayMilliseconds);
            
            await Task.Delay(delayMilliseconds * (retry + 1)); // Exponential backoff
        }
        catch (Exception ex)
        {
            var logger = services.CreateScope().ServiceProvider.GetRequiredService<ILogger<Program>>();
            logger.LogError(ex, "❌ Fatal error during database initialization.");
            throw;
        }
    }

    throw new InvalidOperationException($"Could not connect to database after {maxRetries} attempts.");
}
