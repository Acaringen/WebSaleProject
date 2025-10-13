using Cart.Domain.Entities;

namespace Cart.Domain.Repositories;

public interface ICartRepository
{
    Task<Entities.Cart?> GetByCustomerIdAsync(Guid customerId, CancellationToken cancellationToken = default);
    Task<Entities.Cart> CreateAsync(Entities.Cart cart, CancellationToken cancellationToken = default);
    Task UpdateAsync(Entities.Cart cart, CancellationToken cancellationToken = default);
    Task DeleteAsync(Guid cartId, CancellationToken cancellationToken = default);
}
