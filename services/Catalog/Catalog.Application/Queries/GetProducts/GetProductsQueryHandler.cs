using Catalog.Domain.Repositories;
using MediatR;
using WebSale.Shared.Abstractions.DTOs.Catalog;
using WebSale.Shared.Abstractions.Common;

namespace Catalog.Application.Queries.GetProducts;

public class GetProductsQueryHandler : IRequestHandler<GetProductsQuery, Result<GetProductsResult>>
{
    private readonly IProductRepository _productRepository;

    public GetProductsQueryHandler(IProductRepository productRepository)
    {
        _productRepository = productRepository;
    }

    public async Task<Result<GetProductsResult>> Handle(GetProductsQuery request, CancellationToken cancellationToken)
    {
        IEnumerable<Catalog.Domain.Entities.Product> products;

        if (!string.IsNullOrEmpty(request.Category))
        {
            products = await _productRepository.GetByCategoryAsync(request.Category, cancellationToken);
        }
        else if (!string.IsNullOrEmpty(request.SearchTerm))
        {
            products = await _productRepository.SearchAsync(request.SearchTerm, cancellationToken);
        }
        else if (request.IsActive.HasValue && request.IsActive.Value)
        {
            products = await _productRepository.GetActiveProductsAsync(cancellationToken);
        }
        else
        {
            // For simplicity, we'll get all active products when no filter is specified
            products = await _productRepository.GetActiveProductsAsync(cancellationToken);
        }

        // Apply additional filters
        if (request.IsActive.HasValue)
        {
            products = products.Where(p => p.IsActive == request.IsActive.Value);
        }

        var totalCount = products.Count();
        var pagedProducts = products
            .Skip((request.Page - 1) * request.PageSize)
            .Take(request.PageSize)
            .ToList();

        var productDtos = pagedProducts.Select(p => new ProductDto
        {
            Id = p.Id,
            Name = p.Name,
            Description = p.Description,
            Price = p.Price,
            Sku = p.Sku,
            Category = p.Category,
            Brand = p.Brand,
            Images = p.Images.ToList(),
            Attributes = p.Attributes.ToDictionary(kvp => kvp.Key, kvp => kvp.Value),
            IsActive = p.IsActive,
            CreatedAt = p.CreatedAt,
            UpdatedAt = p.UpdatedAt
        }).ToList();

        var result = new GetProductsResult
        {
            Products = productDtos,
            TotalCount = totalCount,
            Page = request.Page,
            PageSize = request.PageSize
        };

        return Result<GetProductsResult>.Success(result);
    }
}
