using Cart.Domain.Repositories;
using MediatR;
using WebSale.Shared.Abstractions.Common;
using WebSale.Shared.Abstractions.DTOs.Cart;

namespace Cart.Application.Queries.GetCart;

public class GetCartQueryHandler : IRequestHandler<GetCartQuery, Result<CartDto>>
{
    private readonly ICartRepository _cartRepository;

    public GetCartQueryHandler(ICartRepository cartRepository)
    {
        _cartRepository = cartRepository;
    }

    public async Task<Result<CartDto>> Handle(GetCartQuery request, CancellationToken cancellationToken)
    {
        var cart = await _cartRepository.GetByCustomerIdAsync(request.CustomerId, cancellationToken);
        
        if (cart == null)
        {
            // Boş sepet döndür
            return Result<CartDto>.Success(new CartDto
            {
                CustomerId = request.CustomerId,
                Items = new List<CartItemDto>(),
                TotalAmount = 0,
                TotalItems = 0,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            });
        }

        var cartDto = new CartDto
        {
            Id = cart.Id,
            CustomerId = cart.CustomerId,
            Items = cart.Items.Select(item => new CartItemDto
            {
                Id = item.Id,
                ProductId = item.ProductId,
                ProductName = item.ProductName,
                Price = item.Price,
                Quantity = item.Quantity,
                TotalPrice = item.TotalPrice
            }).ToList(),
            TotalAmount = cart.GetTotalAmount(),
            TotalItems = cart.GetTotalItems(),
            CreatedAt = cart.CreatedAt,
            UpdatedAt = cart.UpdatedAt ?? DateTime.UtcNow
        };

        return Result<CartDto>.Success(cartDto);
    }
}
