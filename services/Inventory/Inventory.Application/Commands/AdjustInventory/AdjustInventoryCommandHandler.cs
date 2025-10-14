using Inventory.Domain.Repositories;
using MediatR;
using WebSale.Shared.Abstractions.Common;

namespace Inventory.Application.Commands.AdjustInventory;

public class AdjustInventoryCommandHandler : IRequestHandler<AdjustInventoryCommand, Result<bool>>
{
    private readonly IInventoryRepository _inventoryRepository;

    public AdjustInventoryCommandHandler(IInventoryRepository inventoryRepository)
    {
        _inventoryRepository = inventoryRepository;
    }

    public async Task<Result<bool>> Handle(AdjustInventoryCommand request, CancellationToken cancellationToken)
    {
        var inventoryItem = await _inventoryRepository.GetByProductIdAsync(request.ProductId);
        if (inventoryItem == null)
        {
            return Result<bool>.Failure($"Inventory item not found for product {request.ProductId}");
        }

        inventoryItem.AdjustQuantity(request.Quantity, request.Reason);
        await _inventoryRepository.UpdateAsync(inventoryItem);

        return Result<bool>.Success(true);
    }
}
