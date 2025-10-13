using MediatR;
using WebSale.Shared.Abstractions.Queries;
using WebSale.Shared.Abstractions.DTOs.Catalog;

namespace Catalog.Application.Queries.GetProducts;

public record GetProductsQuery(
    string? Category = null,
    string? SearchTerm = null,
    bool? IsActive = null,
    int Page = 1,
    int PageSize = 20
) : IQuery<GetProductsResult>;

public class GetProductsResult
{
    public List<ProductDto> Products { get; set; } = new();
    public int TotalCount { get; set; }
    public int Page { get; set; }
    public int PageSize { get; set; }
    public int TotalPages => (int)Math.Ceiling((double)TotalCount / PageSize);
}
