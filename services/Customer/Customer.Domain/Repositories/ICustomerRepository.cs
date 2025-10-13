using Customer.Domain.Entities;

namespace Customer.Domain.Repositories;

public interface ICustomerRepository
{
    Task<Entities.Customer?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<Entities.Customer?> GetByEmailAsync(string email, CancellationToken cancellationToken = default);
    Task<IEnumerable<Entities.Customer>> GetAllAsync(int page = 1, int pageSize = 20, CancellationToken cancellationToken = default);
    Task<Entities.Customer> AddAsync(Entities.Customer customer, CancellationToken cancellationToken = default);
    Task UpdateAsync(Entities.Customer customer, CancellationToken cancellationToken = default);
    Task DeleteAsync(Guid id, CancellationToken cancellationToken = default);
    Task<bool> ExistsByEmailAsync(string email, CancellationToken cancellationToken = default);
}
