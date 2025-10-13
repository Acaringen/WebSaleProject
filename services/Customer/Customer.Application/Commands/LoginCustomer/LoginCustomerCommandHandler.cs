using Customer.Domain.Repositories;
using MediatR;
using WebSale.Shared.Abstractions.Common;
using BCrypt.Net;
using System.IdentityModel.Tokens.Jwt;
using Microsoft.IdentityModel.Tokens;
using System.Security.Claims;
using System.Text;
using Microsoft.Extensions.Configuration;

namespace Customer.Application.Commands.LoginCustomer;

public class LoginCustomerCommandHandler : IRequestHandler<LoginCustomerCommand, Result<LoginResult>>
{
    private readonly ICustomerRepository _customerRepository;
    private readonly IConfiguration _configuration;

    public LoginCustomerCommandHandler(ICustomerRepository customerRepository, IConfiguration configuration)
    {
        _customerRepository = customerRepository;
        _configuration = configuration;
    }

    public async Task<Result<LoginResult>> Handle(LoginCustomerCommand request, CancellationToken cancellationToken)
    {
        // Müşteriyi email ile bul
        var customer = await _customerRepository.GetByEmailAsync(request.Email, cancellationToken);
        
        if (customer == null || !customer.IsActive)
        {
            return Result<LoginResult>.Failure("Geçersiz email veya şifre.");
        }

        // Şifre kontrolü
        if (!BCrypt.Net.BCrypt.Verify(request.Password, customer.PasswordHash))
        {
            return Result<LoginResult>.Failure("Geçersiz email veya şifre.");
        }

        // Login kaydı
        customer.RecordLogin();
        await _customerRepository.UpdateAsync(customer, cancellationToken);

        // JWT token oluştur
        var token = GenerateJwtToken(customer);

        // Sonuç döndür
        var customerDto = new CustomerDto(
            customer.Id,
            customer.Email,
            customer.FirstName,
            customer.LastName,
            customer.PhoneNumber,
            customer.CreatedAt,
            customer.IsActive
        );

        var loginResult = new LoginResult(token, customerDto);
        return Result<LoginResult>.Success(loginResult);
    }

    private string GenerateJwtToken(Customer.Domain.Entities.Customer customer)
    {
        var jwtKey = _configuration["Jwt:Key"] ?? "your-super-secret-key-that-is-at-least-32-characters-long";
        var jwtIssuer = _configuration["Jwt:Issuer"] ?? "WebSale";
        var jwtAudience = _configuration["Jwt:Audience"] ?? "WebSale";

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey));
        var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, customer.Id.ToString()),
            new Claim(ClaimTypes.Email, customer.Email),
            new Claim(ClaimTypes.Name, $"{customer.FirstName} {customer.LastName}"),
            new Claim("customer_id", customer.Id.ToString())
        };

        var token = new JwtSecurityToken(
            issuer: jwtIssuer,
            audience: jwtAudience,
            claims: claims,
            expires: DateTime.UtcNow.AddHours(24),
            signingCredentials: credentials
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}
