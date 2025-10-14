using MediatR;
using WebSale.Shared.Abstractions.Common;

namespace Customer.Application.Commands.LoginCustomer;

public record LoginCustomerCommand(
    string Email,
    string Password
) : IRequest<Result<LoginResult>>;

public record LoginResult(
    string Token,
    CustomerDto Customer
);

public record CustomerDto(
    Guid Id,
    string Email,
    string FirstName,
    string LastName,
    string PhoneNumber,
    DateTime CreatedAt,
    bool IsActive
);
