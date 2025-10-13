using Inventory.Domain.Repositories;
using MediatR;
using WebSale.Shared.Abstractions.Common;
using WebSale.Shared.Abstractions.DTOs.Inventory;

namespace Inventory.Application.Queries.GetInventoryItem;

public class GetInventoryItemQueryHandler : IRequestHandler<GetInventoryItemQuery, Result<InventoryItemDto?>>
{
    private readonly IInventoryRepository _inventoryRepository;

    public GetInventoryItemQueryHandler(IInventoryRepository inventoryRepository)
    {
        _inventoryRepository = inventoryRepository;
    }

    public async Task<Result<InventoryItemDto?>> Handle(GetInventoryItemQuery request, CancellationToken cancellationToken)
    {
        var inventoryItem = await _inventoryRepository.GetByProductIdAsync(request.ProductId);
        if (inventoryItem == null)
        {
            return Result<InventoryItemDto?>.Success(null);
        }

        var dto = new InventoryItemDto
        {
            Id = inventoryItem.Id,
            ProductId = inventoryItem.ProductId,
            Sku = inventoryItem.Sku,
            Quantity = inventoryItem.Quantity,
            ReservedQuantity = inventoryItem.ReservedQuantity,
            Cost = inventoryItem.Cost,
            Location = inventoryItem.Location,
            LastUpdated = inventoryItem.UpdatedAt ?? inventoryItem.CreatedAt
        };

        return Result<InventoryItemDto?>.Success(dto);
    }
}
