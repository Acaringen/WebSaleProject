using Inventory.Domain.Repositories;
using MediatR;
using WebSale.Shared.Abstractions.Common;

namespace Inventory.Application.Commands.ReserveInventory;

public class ReserveInventoryCommandHandler : IRequestHandler<ReserveInventoryCommand, Result<bool>>
{
    private readonly IInventoryRepository _inventoryRepository;

    public ReserveInventoryCommandHandler(IInventoryRepository inventoryRepository)
    {
        _inventoryRepository = inventoryRepository;
    }

    public async Task<Result<bool>> Handle(ReserveInventoryCommand request, CancellationToken cancellationToken)
    {
        var inventoryItem = await _inventoryRepository.GetByProductIdAsync(request.ProductId);
        if (inventoryItem == null)
        {
            return Result<bool>.Failure($"Inventory item not found for product {request.ProductId}");
        }

        var reserved = inventoryItem.ReserveQuantity(request.Quantity, request.OrderId);
        if (!reserved)
        {
            return Result<bool>.Failure($"Insufficient stock. Available: {inventoryItem.AvailableQuantity}, Requested: {request.Quantity}");
        }

        await _inventoryRepository.UpdateAsync(inventoryItem);
        return Result<bool>.Success(true);
    }
}
