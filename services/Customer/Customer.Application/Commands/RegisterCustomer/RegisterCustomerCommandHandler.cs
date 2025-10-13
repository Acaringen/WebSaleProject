using Customer.Domain.Entities;
using Customer.Domain.Repositories;
using MediatR;
using WebSale.Shared.Abstractions.Common;
using WebSale.Shared.Abstractions.DTOs.Customers;
using BCrypt.Net;

namespace Customer.Application.Commands.RegisterCustomer;

public class RegisterCustomerCommandHandler : IRequestHandler<RegisterCustomerCommand, Result<CustomerDto>>
{
    private readonly ICustomerRepository _customerRepository;

    public RegisterCustomerCommandHandler(ICustomerRepository customerRepository)
    {
        _customerRepository = customerRepository;
    }

    public async Task<Result<CustomerDto>> Handle(RegisterCustomerCommand request, CancellationToken cancellationToken)
    {
        // Email kontrolü
        if (await _customerRepository.ExistsByEmailAsync(request.Email, cancellationToken))
        {
            return Result<CustomerDto>.Failure("Bu email adresi zaten kullanılıyor.");
        }

        // Şifre hash'leme
        var passwordHash = BCrypt.Net.BCrypt.HashPassword(request.Password);

        // Müşteri oluşturma
        var customer = new Customer(
            request.Email,
            request.FirstName,
            request.LastName,
            passwordHash,
            request.PhoneNumber
        );

        // Veritabanına kaydetme
        var savedCustomer = await _customerRepository.AddAsync(customer, cancellationToken);

        // DTO'ya dönüştürme
        var customerDto = new CustomerDto
        {
            Id = savedCustomer.Id,
            Email = savedCustomer.Email,
            FirstName = savedCustomer.FirstName,
            LastName = savedCustomer.LastName,
            PhoneNumber = savedCustomer.PhoneNumber,
            CreatedAt = savedCustomer.CreatedAt,
            IsActive = savedCustomer.IsActive
        };

        return Result<CustomerDto>.Success(customerDto);
    }
}
