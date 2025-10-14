using WebSale.Shared.Abstractions.Common;
using WebSale.Shared.Abstractions.Events;
using WebSale.Shared.Abstractions.Events.Orders;

namespace Orders.Domain.Entities;

public class Order : Entity
{
    public Guid CustomerId { get; private set; }
    public string OrderNumber { get; private set; }
    public OrderStatus Status { get; private set; }
    public decimal SubTotal { get; private set; }
    public decimal TaxAmount { get; private set; }
    public decimal ShippingAmount { get; private set; }
    public decimal TotalAmount { get; private set; }
    public Address ShippingAddress { get; private set; }
    public Address BillingAddress { get; private set; }
    public DateTime? ShippedAt { get; private set; }
    public DateTime? DeliveredAt { get; private set; }

    private readonly List<OrderItem> _items = new();
    public IReadOnlyCollection<OrderItem> Items => _items.AsReadOnly();

    private readonly List<IDomainEvent> _domainEvents = new();
    public IReadOnlyCollection<IDomainEvent> DomainEvents => _domainEvents.AsReadOnly();

    private Order() : base()
    {
        OrderNumber = string.Empty;
        ShippingAddress = new Address();
        BillingAddress = new Address();
    }

    public Order(Guid customerId, Address shippingAddress, Address billingAddress) : base()
    {
        CustomerId = customerId;
        OrderNumber = GenerateOrderNumber();
        Status = OrderStatus.Pending;
        ShippingAddress = shippingAddress;
        BillingAddress = billingAddress;
        SubTotal = 0;
        TaxAmount = 0;
        ShippingAmount = 0;
        TotalAmount = 0;

        _domainEvents.Add(new OrderCreatedEvent(Id, CustomerId, OrderNumber, 0, new List<OrderItemEvent>()));
    }

    public void AddItem(Guid productId, string productName, string sku, decimal unitPrice, int quantity)
    {
        var existingItem = _items.FirstOrDefault(x => x.ProductId == productId);
        if (existingItem != null)
        {
            existingItem.UpdateQuantity(existingItem.Quantity + quantity);
        }
        else
        {
            var orderItem = new OrderItem(productId, productName, sku, unitPrice, quantity);
            _items.Add(orderItem);
        }

        RecalculateAmounts();
        MarkAsUpdated();
    }

    public void RemoveItem(Guid productId)
    {
        var item = _items.FirstOrDefault(x => x.ProductId == productId);
        if (item != null)
        {
            _items.Remove(item);
            RecalculateAmounts();
            MarkAsUpdated();
        }
    }

    public void UpdateItemQuantity(Guid productId, int quantity)
    {
        var item = _items.FirstOrDefault(x => x.ProductId == productId);
        if (item != null)
        {
            if (quantity <= 0)
            {
                RemoveItem(productId);
            }
            else
            {
                item.UpdateQuantity(quantity);
                RecalculateAmounts();
                MarkAsUpdated();
            }
        }
    }

    public void Confirm()
    {
        if (Status != OrderStatus.Pending)
            throw new InvalidOperationException("Only pending orders can be confirmed");

        Status = OrderStatus.Confirmed;
        MarkAsUpdated();
        _domainEvents.Add(new OrderConfirmedEvent(Id, OrderNumber));
    }

    public void StartProcessing()
    {
        if (Status != OrderStatus.Confirmed)
            throw new InvalidOperationException("Only confirmed orders can be processed");

        Status = OrderStatus.Processing;
        MarkAsUpdated();
    }

    public void Ship(DateTime shippedAt)
    {
        if (Status != OrderStatus.Processing)
            throw new InvalidOperationException("Only processing orders can be shipped");

        Status = OrderStatus.Shipped;
        ShippedAt = shippedAt;
        MarkAsUpdated();
        _domainEvents.Add(new OrderShippedEvent(Id, CustomerId, OrderNumber, shippedAt));
    }

    public void Deliver(DateTime deliveredAt)
    {
        if (Status != OrderStatus.Shipped)
            throw new InvalidOperationException("Only shipped orders can be delivered");

        Status = OrderStatus.Delivered;
        DeliveredAt = deliveredAt;
        MarkAsUpdated();
        _domainEvents.Add(new OrderDeliveredEvent(Id, CustomerId, OrderNumber, deliveredAt));
    }

    public void Cancel(string reason)
    {
        if (Status == OrderStatus.Delivered || Status == OrderStatus.Cancelled)
            throw new InvalidOperationException("Delivered or already cancelled orders cannot be cancelled");

        Status = OrderStatus.Cancelled;
        MarkAsUpdated();
        _domainEvents.Add(new OrderCancelledEvent(Id, OrderNumber, reason));
    }

    public void Return(string reason)
    {
        if (Status != OrderStatus.Delivered)
            throw new InvalidOperationException("Only delivered orders can be returned");

        Status = OrderStatus.Returned;
        MarkAsUpdated();
        _domainEvents.Add(new OrderReturnedEvent(Id, CustomerId, OrderNumber, reason));
    }

    private void RecalculateAmounts()
    {
        SubTotal = _items.Sum(x => x.TotalPrice);
        TaxAmount = SubTotal * 0.18m; // %18 KDV
        ShippingAmount = SubTotal > 100 ? 0 : 15; // 100 TL üzeri kargo bedava
        TotalAmount = SubTotal + TaxAmount + ShippingAmount;
    }

    private static string GenerateOrderNumber()
    {
        return $"ORD-{DateTime.Now:yyyyMMdd}-{Random.Shared.Next(1000, 9999)}";
    }

    public void ClearDomainEvents()
    {
        _domainEvents.Clear();
    }
}

public class OrderItem : Entity
{
    public Guid ProductId { get; private set; }
    public string ProductName { get; private set; }
    public string Sku { get; private set; }
    public decimal UnitPrice { get; private set; }
    public int Quantity { get; private set; }
    public decimal TotalPrice => UnitPrice * Quantity;

    private OrderItem() : base()
    {
        ProductName = string.Empty;
        Sku = string.Empty;
    }

    public OrderItem(Guid productId, string productName, string sku, decimal unitPrice, int quantity) : base()
    {
        ProductId = productId;
        ProductName = productName;
        Sku = sku;
        UnitPrice = unitPrice;
        Quantity = quantity;
    }

    public void UpdateQuantity(int quantity)
    {
        if (quantity <= 0)
            throw new ArgumentException("Quantity must be greater than 0");

        Quantity = quantity;
        MarkAsUpdated();
    }
}

public class Address
{
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string Street { get; set; } = string.Empty;
    public string City { get; set; } = string.Empty;
    public string State { get; set; } = string.Empty;
    public string ZipCode { get; set; } = string.Empty;
    public string Country { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
}

public enum OrderStatus
{
    Pending = 0,
    Confirmed = 1,
    Processing = 2,
    Shipped = 3,
    Delivered = 4,
    Cancelled = 5,
    Returned = 6
}
