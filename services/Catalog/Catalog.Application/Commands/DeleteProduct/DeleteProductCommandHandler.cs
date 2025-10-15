using Catalog.Domain.Repositories;
using MediatR;
using WebSale.Shared.Abstractions.Common;

namespace Catalog.Application.Commands.DeleteProduct;

public class DeleteProductCommandHandler : IRequestHandler<DeleteProductCommand, Result<bool>>
{
    private readonly IProductRepository _productRepository;

    public DeleteProductCommandHandler(IProductRepository productRepository)
    {
        _productRepository = productRepository;
    }

    public async Task<Result<bool>> Handle(DeleteProductCommand request, CancellationToken cancellationToken)
    {
        // Get product
        var product = await _productRepository.GetByIdAsync(request.Id, cancellationToken);
        if (product == null)
        {
            return Result<bool>.Failure($"Product with ID '{request.Id}' not found.");
        }

        // Trigger domain event
        product.Delete();

        // Delete product - Pass entity instead of ID
        await _productRepository.DeleteAsync(product, cancellationToken);

        return Result<bool>.Success(true);
    }
}

