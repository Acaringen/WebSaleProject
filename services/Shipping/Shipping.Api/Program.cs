using Serilog;

var builder = WebApplication.CreateBuilder(args);

// Configure Serilog
Log.Logger = new LoggerConfiguration()
    .ReadFrom.Configuration(builder.Configuration)
    .Enrich.FromLogContext()
    .WriteTo.Console()
    .WriteTo.File("logs/shipping-.txt", rollingInterval: RollingInterval.Day)
    .CreateLogger();

builder.Host.UseSerilog();

// Add services to the container
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Health Checks
builder.Services.AddHealthChecks()
    .AddCheck("shipping", () => Microsoft.Extensions.Diagnostics.HealthChecks.HealthCheckResult.Healthy("Shipping service is healthy"));

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
app.MapPost("/api/shipping/create", async (object shippingData) =>
{
    // Shipping creation logic will be implemented here
    return Results.Ok(new { Status = "Created", ShippingId = Guid.NewGuid() });
})
.WithName("CreateShipping")
.WithOpenApi();

app.MapGet("/api/shipping/{shippingId:guid}/track", async (Guid shippingId) =>
{
    // Shipping tracking logic will be implemented here
    return Results.Ok(new { ShippingId = shippingId, Status = "In Transit", TrackingNumber = "TR123456789" });
})
.WithName("TrackShipping")
.WithOpenApi();

app.Run();
