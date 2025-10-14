using Inventory.Domain.Entities;

namespace Inventory.Domain.Repositories;

public interface IInventoryRepository
{
    Task<InventoryItem?> GetByIdAsync(Guid id);
    Task<InventoryItem?> GetByProductIdAsync(Guid productId);
    Task<InventoryItem?> GetBySkuAsync(string sku);
    Task<IEnumerable<InventoryItem>> GetAllAsync();
    Task<IEnumerable<InventoryItem>> GetByLocationAsync(string location);
    Task<IEnumerable<InventoryItem>> GetLowStockItemsAsync();
    Task<IEnumerable<InventoryItem>> GetByProductIdsAsync(IEnumerable<Guid> productIds);
    Task AddAsync(InventoryItem item);
    Task UpdateAsync(InventoryItem item);
    Task DeleteAsync(Guid id);
    Task<bool> ExistsAsync(Guid productId);
}
