using Cart.Domain.Repositories;
using MediatR;
using WebSale.Shared.Abstractions.Common;
using WebSale.Shared.Abstractions.DTOs.Cart;
using CartEntity = Cart.Domain.Entities.Cart;

namespace Cart.Application.Commands.AddItemToCart;

public class AddItemToCartCommandHandler : IRequestHandler<AddItemToCartCommand, Result<CartDto>>
{
    private readonly ICartRepository _cartRepository;

    public AddItemToCartCommandHandler(ICartRepository cartRepository)
    {
        _cartRepository = cartRepository;
    }

    public async Task<Result<CartDto>> Handle(AddItemToCartCommand request, CancellationToken cancellationToken)
    {
        // Müşterinin sepetini bul veya oluştur
        var cart = await _cartRepository.GetByCustomerIdAsync(request.CustomerId, cancellationToken);
        
        if (cart == null)
        {
            cart = new CartEntity(request.CustomerId);
            cart = await _cartRepository.CreateAsync(cart, cancellationToken);
        }

        // Ürünü sepete ekle
        cart.AddItem(request.ProductId, request.ProductName, request.Price, request.Quantity);
        
        // Sepeti güncelle
        await _cartRepository.UpdateAsync(cart, cancellationToken);

        // DTO'ya dönüştür
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
