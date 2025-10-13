using MediatR;
using WebSale.Shared.Abstractions.Common;

namespace WebSale.Shared.Abstractions.Commands;

public interface ICommand : IRequest<Result>
{
}

public interface ICommand<TResponse> : IRequest<Result<TResponse>>
{
}
