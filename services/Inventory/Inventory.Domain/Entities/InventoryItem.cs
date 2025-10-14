using WebSale.Shared.Abstractions.Common;
using WebSale.Shared.Abstractions.Events;

namespace Inventory.Domain.Entities;

public class InventoryItem : Entity
{
    public Guid ProductId { get; private set; }
    public string Sku { get; private set; }
    public int Quantity { get; private set; }
    public int ReservedQuantity { get; private set; }
    public int AvailableQuantity => Quantity - ReservedQuantity;
    public decimal Cost { get; private set; }
    public string Location { get; private set; }
    public int MinimumStock { get; private set; }
    public int MaximumStock { get; private set; }
    public bool IsActive { get; private set; }

    private readonly List<IDomainEvent> _domainEvents = new();
    public IReadOnlyCollection<IDomainEvent> DomainEvents => _domainEvents.AsReadOnly();

    private InventoryItem() : base()
    {
        Sku = string.Empty;
        Location = string.Empty;
    }

    public InventoryItem(Guid productId, string sku, int quantity, decimal cost, string location, int minimumStock = 0, int maximumStock = 1000) : base()
    {
        ProductId = productId;
        Sku = sku;
        Quantity = quantity;
        Cost = cost;
        Location = location;
        MinimumStock = minimumStock;
        MaximumStock = maximumStock;
        ReservedQuantity = 0;
        IsActive = true;
    }

    public void AdjustQuantity(int quantity, string reason)
    {
        var oldQuantity = Quantity;
        Quantity = Math.Max(0, Quantity + quantity);
        MarkAsUpdated();

        // Domain event for inventory adjustment
        _domainEvents.Add(new InventoryAdjustedEvent(Id, ProductId, Sku, oldQuantity, Quantity, reason));
    }

    public bool ReserveQuantity(int quantity, Guid orderId)
    {
        if (AvailableQuantity >= quantity)
        {
            ReservedQuantity += quantity;
            MarkAsUpdated();
            
            _domainEvents.Add(new InventoryReservedEvent(Id, ProductId, Sku, quantity, orderId));
            return true;
        }
        return false;
    }

    public void ReleaseReservation(int quantity, Guid orderId)
    {
        ReservedQuantity = Math.Max(0, ReservedQuantity - quantity);
        MarkAsUpdated();
        
        _domainEvents.Add(new InventoryReleasedEvent(Id, ProductId, Sku, quantity, orderId));
    }

    public void CommitReservation(int quantity, Guid orderId)
    {
        if (ReservedQuantity >= quantity)
        {
            ReservedQuantity -= quantity;
            Quantity -= quantity;
            MarkAsUpdated();
            
            _domainEvents.Add(new InventoryCommittedEvent(Id, ProductId, Sku, quantity, orderId));
        }
    }

    public void UpdateCost(decimal newCost)
    {
        Cost = newCost;
        MarkAsUpdated();
    }

    public void UpdateLocation(string newLocation)
    {
        Location = newLocation;
        MarkAsUpdated();
    }

    public void UpdateStockLimits(int minimumStock, int maximumStock)
    {
        MinimumStock = minimumStock;
        MaximumStock = maximumStock;
        MarkAsUpdated();
    }

    public void Activate()
    {
        IsActive = true;
        MarkAsUpdated();
    }

    public void Deactivate()
    {
        IsActive = false;
        MarkAsUpdated();
    }

    public bool IsLowStock() => AvailableQuantity <= MinimumStock;
    public bool IsOverStock() => Quantity >= MaximumStock;

    public void ClearDomainEvents()
    {
        _domainEvents.Clear();
    }
}

// Domain Events
public record InventoryAdjustedEvent(Guid InventoryId, Guid ProductId, string Sku, int OldQuantity, int NewQuantity, string Reason) : IDomainEvent
{
    public Guid Id { get; } = Guid.NewGuid();
    public DateTime OccurredOn { get; } = DateTime.UtcNow;
    public string EventType { get; } = nameof(InventoryAdjustedEvent);
}

public record InventoryReservedEvent(Guid InventoryId, Guid ProductId, string Sku, int Quantity, Guid OrderId) : IDomainEvent
{
    public Guid Id { get; } = Guid.NewGuid();
    public DateTime OccurredOn { get; } = DateTime.UtcNow;
    public string EventType { get; } = nameof(InventoryReservedEvent);
}

public record InventoryReleasedEvent(Guid InventoryId, Guid ProductId, string Sku, int Quantity, Guid OrderId) : IDomainEvent
{
    public Guid Id { get; } = Guid.NewGuid();
    public DateTime OccurredOn { get; } = DateTime.UtcNow;
    public string EventType { get; } = nameof(InventoryReleasedEvent);
}

public record InventoryCommittedEvent(Guid InventoryId, Guid ProductId, string Sku, int Quantity, Guid OrderId) : IDomainEvent
{
    public Guid Id { get; } = Guid.NewGuid();
    public DateTime OccurredOn { get; } = DateTime.UtcNow;
    public string EventType { get; } = nameof(InventoryCommittedEvent);
}
