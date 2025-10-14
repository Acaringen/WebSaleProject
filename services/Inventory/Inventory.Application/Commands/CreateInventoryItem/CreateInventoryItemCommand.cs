using MediatR;
using WebSale.Shared.Abstractions.Common;
using WebSale.Shared.Abstractions.DTOs.Inventory;

namespace Inventory.Application.Commands.CreateInventoryItem;

public record CreateInventoryItemCommand(
    Guid ProductId,
    string Sku,
    int Quantity,
    decimal Cost,
    string Location,
    int MinimumStock = 0,
    int MaximumStock = 1000
) : IRequest<Result<InventoryItemDto>>;
