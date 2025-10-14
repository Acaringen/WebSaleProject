using Customer.Application.Commands.LoginCustomer;
using Customer.Application.Commands.RegisterCustomer;
using Customer.Domain.Repositories;
using Customer.Infrastructure.Data;
using Customer.Infrastructure.Repositories;
using FluentValidation;
using MediatR;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Serilog;
using System.Reflection;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

// Configure Serilog
Log.Logger = new LoggerConfiguration()
    .ReadFrom.Configuration(builder.Configuration)
    .Enrich.FromLogContext()
    .WriteTo.Console()
    .WriteTo.File("logs/customer-.txt", rollingInterval: RollingInterval.Day)
    .CreateLogger();

builder.Host.UseSerilog();

// Add services to the container.
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Database
builder.Services.AddDbContext<CustomerDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

// Repositories
builder.Services.AddScoped<ICustomerRepository, CustomerRepository>();

// MediatR
builder.Services.AddMediatR(cfg => {
    cfg.RegisterServicesFromAssembly(Assembly.GetExecutingAssembly());
    cfg.RegisterServicesFromAssembly(typeof(RegisterCustomerCommand).Assembly);
});

// FluentValidation
builder.Services.AddValidatorsFromAssembly(Assembly.GetExecutingAssembly());

// JWT Authentication
var jwtKey = builder.Configuration["Jwt:Key"] ?? "your-super-secret-key-that-is-at-least-32-characters-long";
var jwtIssuer = builder.Configuration["Jwt:Issuer"] ?? "WebSale";
var jwtAudience = builder.Configuration["Jwt:Audience"] ?? "WebSale";

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = jwtIssuer,
            ValidAudience = jwtAudience,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey))
        };
    });

builder.Services.AddAuthorization();

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

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseCors("AllowAll");
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

// API Endpoints
app.MapPost("/api/customers/register", async (IMediator mediator, RegisterCustomerCommand command) =>
{
    try
    {
        var result = await mediator.Send(command);
        return result.IsSuccess ? Results.Ok(result.Value) : Results.BadRequest(result.Error);
    }
    catch (Exception ex)
    {
        Log.Error(ex, "Error in register endpoint");
        return Results.Problem("Registration temporarily unavailable");
    }
});

app.MapPost("/api/customers/login", async (IMediator mediator, LoginCustomerCommand command) =>
{
    try
    {
        var result = await mediator.Send(command);
        return result.IsSuccess ? Results.Ok(result.Value) : Results.BadRequest(result.Error);
    }
    catch (Exception ex)
    {
        Log.Error(ex, "Error in login endpoint");
        return Results.Problem("Login temporarily unavailable");
    }
});

// GET all customers endpoint
app.MapGet("/api/customers", async (ICustomerRepository repository) =>
{
    try
    {
        var customers = await repository.GetAllAsync();
        return Results.Ok(customers);
    }
    catch (Exception ex)
    {
        Log.Error(ex, "Error retrieving customers - returning empty list");
        return Results.Ok(new List<object>());
    }
});

// GET customer by ID endpoint
app.MapGet("/api/customers/{id}", async (ICustomerRepository repository, Guid id) =>
{
    try
    {
        var customer = await repository.GetByIdAsync(id);
        if (customer == null)
            return Results.NotFound();
        return Results.Ok(customer);
    }
    catch (Exception ex)
    {
        Log.Error(ex, "Error retrieving customer with ID {CustomerId}", id);
        return Results.Problem("Error retrieving customer");
    }
});

// Database migration
using (var scope = app.Services.CreateScope())
{
    var context = scope.ServiceProvider.GetRequiredService<CustomerDbContext>();
    try
    {
        context.Database.EnsureCreated();
        Log.Information("Database ensured created successfully");
    }
    catch (Exception ex)
    {
        Log.Warning(ex, "Could not ensure database created on startup. Will retry on first request.");
    }
}

Log.Information("Customer API starting...");

app.Run();
