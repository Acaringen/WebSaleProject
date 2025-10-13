using WebSale.Shared.Abstractions.Events;

namespace WebSale.Shared.Abstractions.Events.Catalog;

public class ProductCreatedEvent : DomainEvent
{
    public Guid ProductId { get; }
    public string Name { get; }
    public string Sku { get; }
    public decimal Price { get; }
    public string Category { get; }

    public ProductCreatedEvent(Guid productId, string name, string sku, decimal price, string category)
    {
        ProductId = productId;
        Name = name;
        Sku = sku;
        Price = price;
        Category = category;
    }
}

public class ProductUpdatedEvent : DomainEvent
{
    public Guid ProductId { get; }
    public string Name { get; }
    public string Sku { get; }
    public decimal Price { get; }
    public string Category { get; }

    public ProductUpdatedEvent(Guid productId, string name, string sku, decimal price, string category)
    {
        ProductId = productId;
        Name = name;
        Sku = sku;
        Price = price;
        Category = category;
    }
}

public class ProductDeletedEvent : DomainEvent
{
    public Guid ProductId { get; }
    public string Sku { get; }

    public ProductDeletedEvent(Guid productId, string sku)
    {
        ProductId = productId;
        Sku = sku;
    }
}
