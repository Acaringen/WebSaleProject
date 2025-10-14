using MediatR;
using WebSale.Shared.Abstractions.Commands;
using WebSale.Shared.Abstractions.DTOs.Catalog;

namespace Catalog.Application.Commands.CreateProduct;

public record CreateProductCommand(
    string Name,
    string Description,
    decimal Price,
    string Sku,
    string Category,
    string Brand,
    List<string> Images,
    Dictionary<string, string> Attributes
) : ICommand<ProductDto>;
