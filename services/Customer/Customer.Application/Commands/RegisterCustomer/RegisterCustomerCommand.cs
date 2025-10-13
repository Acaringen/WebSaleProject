using MediatR;
using WebSale.Shared.Abstractions.Common;
using WebSale.Shared.Abstractions.DTOs.Customers;

namespace Customer.Application.Commands.RegisterCustomer;

public record RegisterCustomerCommand(
    string Email,
    string FirstName,
    string LastName,
    string Password,
    string PhoneNumber
) : IRequest<Result<CustomerDto>>;
