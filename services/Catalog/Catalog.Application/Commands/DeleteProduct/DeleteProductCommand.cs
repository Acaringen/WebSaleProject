using MediatR;
using WebSale.Shared.Abstractions.Commands;
using WebSale.Shared.Abstractions.Common;

namespace Catalog.Application.Commands.DeleteProduct;

public record DeleteProductCommand(Guid Id) : ICommand<bool>;

