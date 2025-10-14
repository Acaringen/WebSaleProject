using MediatR;
using WebSale.Shared.Abstractions.Queries;
using WebSale.Shared.Abstractions.DTOs.Catalog;

namespace Catalog.Application.Queries.GetProduct;

public record GetProductQuery(Guid Id) : IQuery<ProductDto>;
