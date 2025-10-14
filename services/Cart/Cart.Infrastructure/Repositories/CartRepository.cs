using Cart.Domain.Repositories;
using Cart.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using CartEntity = Cart.Domain.Entities.Cart;

namespace Cart.Infrastructure.Repositories;

public class CartRepository : ICartRepository
{
    private readonly CartDbContext _context;

    public CartRepository(CartDbContext context)
    {
        _context = context;
    }

    public async Task<CartEntity?> GetByCustomerIdAsync(Guid customerId, CancellationToken cancellationToken = default)
    {
        return await _context.Carts
            .Include(c => c.Items)
            .FirstOrDefaultAsync(c => c.CustomerId == customerId, cancellationToken);
    }

    public async Task<CartEntity> CreateAsync(CartEntity cart, CancellationToken cancellationToken = default)
    {
        _context.Carts.Add(cart);
        await _context.SaveChangesAsync(cancellationToken);
        return cart;
    }

    public async Task UpdateAsync(CartEntity cart, CancellationToken cancellationToken = default)
    {
        _context.Carts.Update(cart);
        await _context.SaveChangesAsync(cancellationToken);
    }

    public async Task DeleteAsync(Guid cartId, CancellationToken cancellationToken = default)
    {
        var cart = await _context.Carts.FindAsync(cartId);
        if (cart != null)
        {
            _context.Carts.Remove(cart);
            await _context.SaveChangesAsync(cancellationToken);
        }
    }
}
