using WebSale.Shared.Abstractions.Common;
using WebSale.Shared.Abstractions.Events;
using WebSale.Shared.Abstractions.Events.Catalog;

namespace Catalog.Domain.Entities;

public class Product : Entity
{
    public string Name { get; private set; }
    public string Description { get; private set; }
    public decimal Price { get; private set; }
    public string Sku { get; private set; }
    public string Category { get; private set; }
    public string Brand { get; private set; }
    public List<string> Images { get; private set; }
    public Dictionary<string, string> Attributes { get; private set; }
    public bool IsActive { get; private set; }

    private readonly List<IDomainEvent> _domainEvents = new();
    public IReadOnlyCollection<IDomainEvent> DomainEvents => _domainEvents.AsReadOnly();

    private Product() : base()
    {
        Name = string.Empty;
        Description = string.Empty;
        Sku = string.Empty;
        Category = string.Empty;
        Brand = string.Empty;
        Images = new List<string>();
        Attributes = new Dictionary<string, string>();
    }

    public Product(string name, string description, decimal price, string sku, string category, string brand) : base()
    {
        Name = name;
        Description = description;
        Price = price;
        Sku = sku;
        Category = category;
        Brand = brand;
        Images = new List<string>();
        Attributes = new Dictionary<string, string>();
        IsActive = true;

        _domainEvents.Add(new ProductCreatedEvent(Id, name, sku, price, category));
    }

    public void Update(string name, string description, decimal price, string category, string brand)
    {
        Name = name;
        Description = description;
        Price = price;
        Category = category;
        Brand = brand;
        MarkAsUpdated();

        _domainEvents.Add(new ProductUpdatedEvent(Id, name, Sku, price, category));
    }

    public void AddImage(string imageUrl)
    {
        if (!Images.Contains(imageUrl))
        {
            Images.Add(imageUrl);
            MarkAsUpdated();
        }
    }

    public void RemoveImage(string imageUrl)
    {
        Images.Remove(imageUrl);
        MarkAsUpdated();
    }

    public void SetAttribute(string key, string value)
    {
        Attributes[key] = value;
        MarkAsUpdated();
    }

    public void RemoveAttribute(string key)
    {
        Attributes.Remove(key);
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

    public void Delete()
    {
        _domainEvents.Add(new ProductDeletedEvent(Id, Sku));
    }

    public void ClearDomainEvents()
    {
        _domainEvents.Clear();
    }
}
