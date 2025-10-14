using WebSale.Shared.Abstractions.Events;

namespace WebSale.Shared.Abstractions.Events.Payments;

public class PaymentProcessedEvent : DomainEvent
{
    public Guid PaymentId { get; }
    public Guid OrderId { get; }
    public decimal Amount { get; }
    public string Status { get; }
    public string TransactionId { get; }

    public PaymentProcessedEvent(Guid paymentId, Guid orderId, decimal amount, string status, string transactionId)
    {
        PaymentId = paymentId;
        OrderId = orderId;
        Amount = amount;
        Status = status;
        TransactionId = transactionId;
    }
}

public class PaymentFailedEvent : DomainEvent
{
    public Guid PaymentId { get; }
    public Guid OrderId { get; }
    public decimal Amount { get; }
    public string Reason { get; }

    public PaymentFailedEvent(Guid paymentId, Guid orderId, decimal amount, string reason)
    {
        PaymentId = paymentId;
        OrderId = orderId;
        Amount = amount;
        Reason = reason;
    }
}
