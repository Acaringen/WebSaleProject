using WebSale.Shared.Abstractions.Common;

namespace Cart.Domain.Entities;

public class CartItem : Entity
{
    public Guid ProductId { get; private set; }
    public string ProductName { get; private set; } = string.Empty;
    public decimal Price { get; private set; }
    public int Quantity { get; private set; }

    private CartItem() { } // EF Core için

    public CartItem(Guid productId, string productName, decimal price, int quantity)
    {
        ProductId = productId;
        ProductName = productName;
        Price = price;
        Quantity = quantity;
    }

    public void UpdateQuantity(int quantity)
    {
        if (quantity <= 0)
            throw new ArgumentException("Quantity must be greater than zero");
        
        Quantity = quantity;
    }

    public void UpdatePrice(decimal price)
    {
        if (price < 0)
            throw new ArgumentException("Price cannot be negative");
        
        Price = price;
    }

    public decimal TotalPrice => Price * Quantity;
}
