using FluentValidation;
using Inventory.Application.Commands.AdjustInventory;
using Inventory.Application.Commands.CreateInventoryItem;
using Inventory.Application.Commands.ReserveInventory;
using Inventory.Application.Queries.GetInventoryItem;
using Inventory.Application.Queries.GetLowStockItems;
using Inventory.Domain.Repositories;
using Inventory.Infrastructure.Data;
using Inventory.Infrastructure.Repositories;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Serilog;
using System.Reflection;

var builder = WebApplication.CreateBuilder(args);

// Configure Serilog
Log.Logger = new LoggerConfiguration()
    .ReadFrom.Configuration(builder.Configuration)
    .Enrich.FromLogContext()
    .WriteTo.Console()
    .WriteTo.File("logs/inventory-.txt", rollingInterval: RollingInterval.Day)
    .CreateLogger();

builder.Host.UseSerilog();

// Add services to the container
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Database
builder.Services.AddDbContext<InventoryDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

// Application Services
builder.Services.AddScoped<IInventoryRepository, InventoryRepository>();

// MediatR
builder.Services.AddMediatR(cfg => {
    cfg.RegisterServicesFromAssembly(typeof(CreateInventoryItemCommand).Assembly);
});

// FluentValidation
builder.Services.AddValidatorsFromAssembly(typeof(CreateInventoryItemCommandValidator).Assembly);

// Health Checks
builder.Services.AddHealthChecks()
    .AddDbContextCheck<InventoryDbContext>()
    .AddCheck("inventory", () => Microsoft.Extensions.Diagnostics.HealthChecks.HealthCheckResult.Healthy("Inventory service is healthy"));

var app = builder.Build();

// Configure the HTTP request pipeline
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
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
app.MapPost("/api/inventory", async (CreateInventoryItemCommand command, IMediator mediator) =>
{
    var result = await mediator.Send(command);
    return result.IsSuccess ? Results.Ok(result.Value) : Results.BadRequest(result.Error);
})
.WithName("CreateInventoryItem")
.WithOpenApi();

app.MapGet("/api/inventory/{productId:guid}", async (Guid productId, IMediator mediator) =>
{
    var query = new GetInventoryItemQuery(productId);
    var result = await mediator.Send(query);
    return result.IsSuccess ? Results.Ok(result.Value) : Results.NotFound();
})
.WithName("GetInventoryItem")
.WithOpenApi();

app.MapGet("/api/inventory/low-stock", async (IMediator mediator) =>
{
    var query = new GetLowStockItemsQuery();
    var result = await mediator.Send(query);
    return result.IsSuccess ? Results.Ok(result.Value) : Results.BadRequest(result.Error);
})
.WithName("GetLowStockItems")
.WithOpenApi();

app.MapPost("/api/inventory/adjust", async (AdjustInventoryCommand command, IMediator mediator) =>
{
    var result = await mediator.Send(command);
    return result.IsSuccess ? Results.Ok(result.Value) : Results.BadRequest(result.Error);
})
.WithName("AdjustInventory")
.WithOpenApi();

app.MapPost("/api/inventory/reserve", async (ReserveInventoryCommand command, IMediator mediator) =>
{
    var result = await mediator.Send(command);
    return result.IsSuccess ? Results.Ok(result.Value) : Results.BadRequest(result.Error);
})
.WithName("ReserveInventory")
.WithOpenApi();

// Ensure database is created
using (var scope = app.Services.CreateScope())
{
    var context = scope.ServiceProvider.GetRequiredService<InventoryDbContext>();
    await context.Database.EnsureCreatedAsync();
}

app.Run();
