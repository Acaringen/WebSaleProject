using MediatR;
using WebSale.Shared.Abstractions.Common;
using WebSale.Shared.Abstractions.DTOs.Orders;

namespace Orders.Application.Commands.CreateOrder;

public record CreateOrderCommand(CreateOrderDto OrderData) : IRequest<Result<OrderDto>>;
