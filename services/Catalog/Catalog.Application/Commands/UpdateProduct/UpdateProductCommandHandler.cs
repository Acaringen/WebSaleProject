using Catalog.Domain.Repositories;
using MediatR;
using WebSale.Shared.Abstractions.Common;
using WebSale.Shared.Abstractions.DTOs.Catalog;

namespace Catalog.Application.Commands.UpdateProduct;

public class UpdateProductCommandHandler : IRequestHandler<UpdateProductCommand, Result<ProductDto>>
{
    private readonly IProductRepository _productRepository;

    public UpdateProductCommandHandler(IProductRepository productRepository)
    {
        _productRepository = productRepository;
    }

    public async Task<Result<ProductDto>> Handle(UpdateProductCommand request, CancellationToken cancellationToken)
    {
        // Get existing product
        var product = await _productRepository.GetByIdAsync(request.Id, cancellationToken);
        if (product == null)
        {
            return Result<ProductDto>.Failure($"Product with ID '{request.Id}' not found.");
        }

        // Update product
        product.Update(
            request.Name,
            request.Description,
            request.Price,
            request.Category,
            request.Brand
        );

        // Update images if provided
        if (request.Images != null)
        {
            // Clear existing images and add new ones
            foreach (var image in product.Images.ToList())
            {
                product.RemoveImage(image);
            }
            foreach (var image in request.Images)
            {
                product.AddImage(image);
            }
        }

        // Update attributes if provided
        if (request.Attributes != null)
        {
            // Clear existing attributes and add new ones
            foreach (var key in product.Attributes.Keys.ToList())
            {
                product.RemoveAttribute(key);
            }
            foreach (var attribute in request.Attributes)
            {
                product.SetAttribute(attribute.Key, attribute.Value);
            }
        }

        // Update active status if provided
        if (request.IsActive.HasValue)
        {
            if (request.IsActive.Value)
                product.Activate();
            else
                product.Deactivate();
        }

        // Save changes
        await _productRepository.UpdateAsync(product, cancellationToken);

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

