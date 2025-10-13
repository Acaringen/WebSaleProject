using MediatR;
using WebSale.Shared.Abstractions.Common;
using WebSale.Shared.Abstractions.DTOs.Cart;

namespace Cart.Application.Commands.AddItemToCart;

public record AddItemToCartCommand(
    Guid CustomerId,
    Guid ProductId,
    string ProductName,
    decimal Price,
    int Quantity
) : IRequest<Result<CartDto>>;
