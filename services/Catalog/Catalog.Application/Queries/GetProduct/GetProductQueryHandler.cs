using Catalog.Domain.Repositories;
using MediatR;
using WebSale.Shared.Abstractions.DTOs.Catalog;
using WebSale.Shared.Abstractions.Common;

namespace Catalog.Application.Queries.GetProduct;

public class GetProductQueryHandler : IRequestHandler<GetProductQuery, Result<ProductDto>>
{
    private readonly IProductRepository _productRepository;

    public GetProductQueryHandler(IProductRepository productRepository)
    {
        _productRepository = productRepository;
    }

    public async Task<Result<ProductDto>> Handle(GetProductQuery request, CancellationToken cancellationToken)
    {
        var product = await _productRepository.GetByIdAsync(request.Id, cancellationToken);

        if (product == null)
        {
            return Result<ProductDto>.Failure($"Product with ID '{request.Id}' not found.");
        }

        var productDto = new ProductDto
        {
            Id = product.Id,
            Name = product.Name,
            Description = product.Description,
            Price = product.Price,
            Sku = product.Sku,
            Category = product.Category,
            Brand = product.Brand,
            Images = product.Images.ToList(),
            Attributes = product.Attributes.ToDictionary(kvp => kvp.Key, kvp => kvp.Value),
            IsActive = product.IsActive,
            CreatedAt = product.CreatedAt,
            UpdatedAt = product.UpdatedAt
        };

        return Result<ProductDto>.Success(productDto);
    }
}
