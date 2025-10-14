using WebSale.Shared.Abstractions.Common;

namespace Cart.Domain.Entities;

public class Cart : Entity
{
    public Guid CustomerId { get; private set; }
    public List<CartItem> Items { get; private set; } = new();

    private Cart() { } // EF Core için

    public Cart(Guid customerId)
    {
        CustomerId = customerId;
        base.CreatedAt = DateTime.UtcNow;
        base.UpdatedAt = DateTime.UtcNow;
    }

    public void AddItem(Guid productId, string productName, decimal price, int quantity)
    {
        var existingItem = Items.FirstOrDefault(x => x.ProductId == productId);
        
        if (existingItem != null)
        {
            existingItem.UpdateQuantity(existingItem.Quantity + quantity);
        }
        else
        {
            var newItem = new CartItem(productId, productName, price, quantity);
            Items.Add(newItem);
        }
        
        base.UpdatedAt = DateTime.UtcNow;
    }

    public void UpdateItemQuantity(Guid productId, int quantity)
    {
        var item = Items.FirstOrDefault(x => x.ProductId == productId);
        if (item != null)
        {
            if (quantity <= 0)
            {
                RemoveItem(productId);
            }
            else
            {
                item.UpdateQuantity(quantity);
                base.UpdatedAt = DateTime.UtcNow;
            }
        }
    }

    public void RemoveItem(Guid productId)
    {
        var item = Items.FirstOrDefault(x => x.ProductId == productId);
        if (item != null)
        {
            Items.Remove(item);
            base.UpdatedAt = DateTime.UtcNow;
        }
    }

    public void Clear()
    {
        Items.Clear();
        base.UpdatedAt = DateTime.UtcNow;
    }

    public decimal GetTotalAmount()
    {
        return Items.Sum(x => x.TotalPrice);
    }

    public int GetTotalItems()
    {
        return Items.Sum(x => x.Quantity);
    }
}
