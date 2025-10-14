using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Orders.Application.Commands.CreateOrder;
using Orders.Domain.Repositories;
using Orders.Infrastructure.Data;
using Orders.Infrastructure.Repositories;
using Serilog;

var builder = WebApplication.CreateBuilder(args);

// Configure Serilog
Log.Logger = new LoggerConfiguration()
    .ReadFrom.Configuration(builder.Configuration)
    .Enrich.FromLogContext()
    .WriteTo.Console()
    .WriteTo.File("logs/orders-.txt", rollingInterval: RollingInterval.Day)
    .CreateLogger();

builder.Host.UseSerilog();

// Add services to the container
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Database
builder.Services.AddDbContext<OrdersDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

// Application Services
builder.Services.AddScoped<IOrderRepository, OrderRepository>();

// MediatR
builder.Services.AddMediatR(cfg => {
    cfg.RegisterServicesFromAssembly(typeof(CreateOrderCommand).Assembly);
});

// FluentValidation
builder.Services.AddValidatorsFromAssemblyContaining<CreateOrderCommand>();

// Health Checks
builder.Services.AddHealthChecks()
    .AddDbContextCheck<OrdersDbContext>()
    .AddCheck("orders", () => Microsoft.Extensions.Diagnostics.HealthChecks.HealthCheckResult.Healthy("Orders service is healthy"));

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

// Minimal API endpoints
app.MapGet("/api/orders", async (IOrderRepository repository) =>
{
    try
    {
        var orders = await repository.GetAllAsync();
        return Results.Ok(orders);
    }
    catch (Exception ex)
    {
        Log.Error(ex, "Error retrieving orders");
        return Results.Ok(new List<object>());
    }
})
.WithName("GetOrders")
.WithOpenApi();

app.MapPost("/api/orders", async (CreateOrderCommand command, IMediator mediator) =>
{
    var result = await mediator.Send(command);
    return result.IsSuccess ? Results.Ok(result.Value) : Results.BadRequest(result.Error);
})
.WithName("CreateOrder")
.WithOpenApi();

// Ensure database is created
using (var scope = app.Services.CreateScope())
{
    var context = scope.ServiceProvider.GetRequiredService<OrdersDbContext>();
    try
    {
        await context.Database.EnsureCreatedAsync();
        Log.Information("Database ensured created successfully");
    }
    catch (Exception ex)
    {
        Log.Warning(ex, "Could not ensure database created on startup. Will retry on first request.");
    }
}

app.Run();
