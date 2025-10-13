using MediatR;
using WebSale.Shared.Abstractions.Common;
using WebSale.Shared.Abstractions.DTOs.Inventory;

namespace Inventory.Application.Queries.GetLowStockItems;

public record GetLowStockItemsQuery() : IRequest<Result<IEnumerable<InventoryItemDto>>>;
