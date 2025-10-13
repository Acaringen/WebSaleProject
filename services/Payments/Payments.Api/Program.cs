using Serilog;

var builder = WebApplication.CreateBuilder(args);

// Configure Serilog
Log.Logger = new LoggerConfiguration()
    .ReadFrom.Configuration(builder.Configuration)
    .Enrich.FromLogContext()
    .WriteTo.Console()
    .WriteTo.File("logs/payments-.txt", rollingInterval: RollingInterval.Day)
    .CreateLogger();

builder.Host.UseSerilog();

// Add services to the container
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Health Checks
builder.Services.AddHealthChecks()
    .AddCheck("payments", () => Microsoft.Extensions.Diagnostics.HealthChecks.HealthCheckResult.Healthy("Payments service is healthy"));

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
app.MapPost("/api/payments/process", async (object paymentData) =>
{
    // Payment processing logic will be implemented here
    return Results.Ok(new { Status = "Processing", PaymentId = Guid.NewGuid() });
})
.WithName("ProcessPayment")
.WithOpenApi();

app.MapGet("/api/payments/{paymentId:guid}", async (Guid paymentId) =>
{
    // Payment status check logic will be implemented here
    return Results.Ok(new { PaymentId = paymentId, Status = "Completed" });
})
.WithName("GetPaymentStatus")
.WithOpenApi();

app.Run();
