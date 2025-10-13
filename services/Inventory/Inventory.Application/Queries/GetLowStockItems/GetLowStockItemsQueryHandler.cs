using Inventory.Domain.Repositories;
using MediatR;
using WebSale.Shared.Abstractions.Common;
using WebSale.Shared.Abstractions.DTOs.Inventory;

namespace Inventory.Application.Queries.GetLowStockItems;

public class GetLowStockItemsQueryHandler : IRequestHandler<GetLowStockItemsQuery, Result<IEnumerable<InventoryItemDto>>>
{
    private readonly IInventoryRepository _inventoryRepository;

    public GetLowStockItemsQueryHandler(IInventoryRepository inventoryRepository)
    {
        _inventoryRepository = inventoryRepository;
    }

    public async Task<Result<IEnumerable<InventoryItemDto>>> Handle(GetLowStockItemsQuery request, CancellationToken cancellationToken)
    {
        var lowStockItems = await _inventoryRepository.GetLowStockItemsAsync();

        var dtos = lowStockItems.Select(item => new InventoryItemDto
        {
            Id = item.Id,
            ProductId = item.ProductId,
            Sku = item.Sku,
            Quantity = item.Quantity,
            ReservedQuantity = item.ReservedQuantity,
            Cost = item.Cost,
            Location = item.Location,
            LastUpdated = item.UpdatedAt ?? item.CreatedAt
        });

        return Result<IEnumerable<InventoryItemDto>>.Success(dtos);
    }
}
