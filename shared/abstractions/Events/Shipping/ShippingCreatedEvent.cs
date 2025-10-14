using WebSale.Shared.Abstractions.Events;

namespace WebSale.Shared.Abstractions.Events.Shipping;

public class ShippingCreatedEvent : DomainEvent
{
    public Guid ShippingId { get; }
    public Guid OrderId { get; }
    public string TrackingNumber { get; }
    public string Carrier { get; }

    public ShippingCreatedEvent(Guid shippingId, Guid orderId, string trackingNumber, string carrier)
    {
        ShippingId = shippingId;
        OrderId = orderId;
        TrackingNumber = trackingNumber;
        Carrier = carrier;
    }
}

public class ShippingStatusUpdatedEvent : DomainEvent
{
    public Guid ShippingId { get; }
    public Guid OrderId { get; }
    public string TrackingNumber { get; }
    public string Status { get; }

    public ShippingStatusUpdatedEvent(Guid shippingId, Guid orderId, string trackingNumber, string status)
    {
        ShippingId = shippingId;
        OrderId = orderId;
        TrackingNumber = trackingNumber;
        Status = status;
    }
}
