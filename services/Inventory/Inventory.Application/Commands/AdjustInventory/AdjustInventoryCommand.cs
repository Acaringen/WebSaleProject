using MediatR;
using WebSale.Shared.Abstractions.Common;

namespace Inventory.Application.Commands.AdjustInventory;

public record AdjustInventoryCommand(
    Guid ProductId,
    int Quantity,
    string Reason
) : IRequest<Result<bool>>;
