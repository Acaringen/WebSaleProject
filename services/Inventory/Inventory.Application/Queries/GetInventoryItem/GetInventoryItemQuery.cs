using MediatR;
using WebSale.Shared.Abstractions.Common;
using WebSale.Shared.Abstractions.DTOs.Inventory;

namespace Inventory.Application.Queries.GetInventoryItem;

public record GetInventoryItemQuery(Guid ProductId) : IRequest<Result<InventoryItemDto?>>;
