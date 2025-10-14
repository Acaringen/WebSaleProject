using MediatR;
using WebSale.Shared.Abstractions.Common;

namespace Inventory.Application.Commands.ReserveInventory;

public record ReserveInventoryCommand(
    Guid ProductId,
    int Quantity,
    Guid OrderId
) : IRequest<Result<bool>>;
