using MediatR;
using WebSale.Shared.Abstractions.Commands;
using WebSale.Shared.Abstractions.DTOs.Catalog;

namespace Catalog.Application.Commands.UpdateProduct;

public record UpdateProductCommand(
    Guid Id,
    string Name,
    string Description,
    decimal Price,
    string Category,
    string Brand,
    List<string>? Images,
    Dictionary<string, string>? Attributes,
    bool? IsActive
) : ICommand<ProductDto>;

