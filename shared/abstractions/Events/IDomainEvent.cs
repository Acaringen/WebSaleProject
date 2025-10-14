using MediatR;

namespace WebSale.Shared.Abstractions.Events;

public interface IDomainEvent : INotification
{
    Guid Id { get; }
    DateTime OccurredOn { get; }
    string EventType { get; }
}
