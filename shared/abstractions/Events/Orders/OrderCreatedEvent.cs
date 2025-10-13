using WebSale.Shared.Abstractions.Events;

namespace WebSale.Shared.Abstractions.Events.Orders;

public class OrderCreatedEvent : DomainEvent
{
    public Guid OrderId { get; }
    public Guid CustomerId { get; }
    public string OrderNumber { get; }
    public decimal TotalAmount { get; }
    public List<OrderItemEvent> Items { get; }

    public OrderCreatedEvent(Guid orderId, Guid customerId, string orderNumber, decimal totalAmount, List<OrderItemEvent> items)
    {
        OrderId = orderId;
        CustomerId = customerId;
        OrderNumber = orderNumber;
        TotalAmount = totalAmount;
        Items = items;
    }
}

public class OrderItemEvent
{
    public Guid ProductId { get; }
    public int Quantity { get; }
    public decimal UnitPrice { get; }

    public OrderItemEvent(Guid productId, int quantity, decimal unitPrice)
    {
        ProductId = productId;
        Quantity = quantity;
        UnitPrice = unitPrice;
    }
}

public class OrderConfirmedEvent : DomainEvent
{
    public Guid OrderId { get; }
    public string OrderNumber { get; }

    public OrderConfirmedEvent(Guid orderId, string orderNumber)
    {
        OrderId = orderId;
        OrderNumber = orderNumber;
    }
}

public class OrderCancelledEvent : DomainEvent
{
    public Guid OrderId { get; }
    public string OrderNumber { get; }
    public string Reason { get; }

    public OrderCancelledEvent(Guid orderId, string orderNumber, string reason)
    {
        OrderId = orderId;
        OrderNumber = orderNumber;
        Reason = reason;
    }
}

public class OrderShippedEvent : DomainEvent
{
    public Guid OrderId { get; }
    public Guid CustomerId { get; }
    public string OrderNumber { get; }
    public DateTime ShippedAt { get; }

    public OrderShippedEvent(Guid orderId, Guid customerId, string orderNumber, DateTime shippedAt)
    {
        OrderId = orderId;
        CustomerId = customerId;
        OrderNumber = orderNumber;
        ShippedAt = shippedAt;
    }
}

public class OrderDeliveredEvent : DomainEvent
{
    public Guid OrderId { get; }
    public Guid CustomerId { get; }
    public string OrderNumber { get; }
    public DateTime DeliveredAt { get; }

    public OrderDeliveredEvent(Guid orderId, Guid customerId, string orderNumber, DateTime deliveredAt)
    {
        OrderId = orderId;
        CustomerId = customerId;
        OrderNumber = orderNumber;
        DeliveredAt = deliveredAt;
    }
}

public class OrderReturnedEvent : DomainEvent
{
    public Guid OrderId { get; }
    public Guid CustomerId { get; }
    public string OrderNumber { get; }
    public string Reason { get; }

    public OrderReturnedEvent(Guid orderId, Guid customerId, string orderNumber, string reason)
    {
        OrderId = orderId;
        CustomerId = customerId;
        OrderNumber = orderNumber;
        Reason = reason;
    }
}