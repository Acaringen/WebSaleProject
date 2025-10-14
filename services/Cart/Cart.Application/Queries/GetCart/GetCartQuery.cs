using MediatR;
using WebSale.Shared.Abstractions.Common;
using WebSale.Shared.Abstractions.DTOs.Cart;

namespace Cart.Application.Queries.GetCart;

public record GetCartQuery(Guid CustomerId) : IRequest<Result<CartDto>>;
