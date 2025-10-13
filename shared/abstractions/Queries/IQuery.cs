using MediatR;
using WebSale.Shared.Abstractions.Common;

namespace WebSale.Shared.Abstractions.Queries;

public interface IQuery<TResponse> : IRequest<Result<TResponse>>
{
}
