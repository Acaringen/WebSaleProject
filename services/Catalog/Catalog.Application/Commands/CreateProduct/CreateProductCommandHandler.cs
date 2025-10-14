using Catalog.Domain.Entities;
using Catalog.Domain.Repositories;
using MediatR;
using WebSale.Shared.Abstractions.DTOs.Catalog;
using WebSale.Shared.Abstractions.Common;

namespace Catalog.Application.Commands.CreateProduct;

public class CreateProductCommandHandler : IRequestHandler<CreateProductCommand, Result<ProductDto>>
{
    private readonly IProductRepository _productRepository;

    public CreateProductCommandHandler(IProductRepository productRepository)
    {
        _productRepository = productRepository;
    }

    public async Task<Result<ProductDto>> Handle(CreateProductCommand request, CancellationToken cancellationToken)
    {
        // Check if SKU already exists
        if (await _productRepository.SkuExistsAsync(request.Sku, cancellationToken))
        {
            return Result<ProductDto>.Failure($"Product with SKU '{request.Sku}' already exists.");
        }

        // Create product
        var product = new Product(
            request.Name,
            request.Description,
            request.Price,
            request.Sku,
            request.Category,
            request.Brand
        );

        // Add images
        foreach (var image in request.Images)
        {
            product.AddImage(image);
        }

        // Add attributes
        foreach (var attribute in request.Attributes)
        {
            product.SetAttribute(attribute.Key, attribute.Value);
        }

        // Save product
        await _productRepository.AddAsync(product, cancellationToken);

        // Return DTO
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
