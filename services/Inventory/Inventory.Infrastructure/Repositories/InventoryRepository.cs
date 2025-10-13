using Inventory.Domain.Entities;
using Inventory.Domain.Repositories;
using Inventory.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Inventory.Infrastructure.Repositories;

public class InventoryRepository : IInventoryRepository
{
    private readonly InventoryDbContext _context;

    public InventoryRepository(InventoryDbContext context)
    {
        _context = context;
    }

    public async Task<InventoryItem?> GetByIdAsync(Guid id)
    {
        return await _context.InventoryItems
            .FirstOrDefaultAsync(x => x.Id == id);
    }

    public async Task<InventoryItem?> GetByProductIdAsync(Guid productId)
    {
        return await _context.InventoryItems
            .FirstOrDefaultAsync(x => x.ProductId == productId);
    }

    public async Task<InventoryItem?> GetBySkuAsync(string sku)
    {
        return await _context.InventoryItems
            .FirstOrDefaultAsync(x => x.Sku == sku);
    }

    public async Task<IEnumerable<InventoryItem>> GetAllAsync()
    {
        return await _context.InventoryItems
            .Where(x => x.IsActive)
            .ToListAsync();
    }

    public async Task<IEnumerable<InventoryItem>> GetByLocationAsync(string location)
    {
        return await _context.InventoryItems
            .Where(x => x.Location == location && x.IsActive)
            .ToListAsync();
    }

    public async Task<IEnumerable<InventoryItem>> GetLowStockItemsAsync()
    {
        return await _context.InventoryItems
            .Where(x => x.IsActive && x.Quantity - x.ReservedQuantity <= x.MinimumStock)
            .ToListAsync();
    }

    public async Task<IEnumerable<InventoryItem>> GetByProductIdsAsync(IEnumerable<Guid> productIds)
    {
        return await _context.InventoryItems
            .Where(x => productIds.Contains(x.ProductId) && x.IsActive)
            .ToListAsync();
    }

    public async Task AddAsync(InventoryItem item)
    {
        await _context.InventoryItems.AddAsync(item);
        await _context.SaveChangesAsync();
    }

    public async Task UpdateAsync(InventoryItem item)
    {
        _context.InventoryItems.Update(item);
        await _context.SaveChangesAsync();
    }

    public async Task DeleteAsync(Guid id)
    {
        var item = await GetByIdAsync(id);
        if (item != null)
        {
            _context.InventoryItems.Remove(item);
            await _context.SaveChangesAsync();
        }
    }

    public async Task<bool> ExistsAsync(Guid productId)
    {
        return await _context.InventoryItems
            .AnyAsync(x => x.ProductId == productId);
    }
}
