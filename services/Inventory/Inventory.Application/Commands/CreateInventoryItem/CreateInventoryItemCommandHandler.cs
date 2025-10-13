using Inventory.Domain.Entities;
using Inventory.Domain.Repositories;
using MediatR;
using WebSale.Shared.Abstractions.Common;
using WebSale.Shared.Abstractions.DTOs.Inventory;

namespace Inventory.Application.Commands.CreateInventoryItem;

public class CreateInventoryItemCommandHandler : IRequestHandler<CreateInventoryItemCommand, Result<InventoryItemDto>>
{
    private readonly IInventoryRepository _inventoryRepository;

    public CreateInventoryItemCommandHandler(IInventoryRepository inventoryRepository)
    {
        _inventoryRepository = inventoryRepository;
    }

    public async Task<Result<InventoryItemDto>> Handle(CreateInventoryItemCommand request, CancellationToken cancellationToken)
    {
        // Check if inventory item already exists for this product
        var existingItem = await _inventoryRepository.GetByProductIdAsync(request.ProductId);
        if (existingItem != null)
        {
            return Result<InventoryItemDto>.Failure($"Inventory item already exists for product {request.ProductId}");
        }

        // Create new inventory item
        var inventoryItem = new InventoryItem(
            request.ProductId,
            request.Sku,
            request.Quantity,
            request.Cost,
            request.Location,
            request.MinimumStock,
            request.MaximumStock
        );

        await _inventoryRepository.AddAsync(inventoryItem);

        // Map to DTO
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

        return Result<InventoryItemDto>.Success(dto);
    }
}
