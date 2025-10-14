namespace WebSale.Shared.Abstractions.DTOs.Shipping;

public class ShippingDto
{
    public Guid Id { get; set; }
    public Guid OrderId { get; set; }
    public string TrackingNumber { get; set; } = string.Empty;
    public ShippingStatus Status { get; set; }
    public string Carrier { get; set; } = string.Empty;
    public string Service { get; set; } = string.Empty;
    public decimal Cost { get; set; }
    public AddressDto FromAddress { get; set; } = new();
    public AddressDto ToAddress { get; set; } = new();
    public DateTime CreatedAt { get; set; }
    public DateTime? ShippedAt { get; set; }
    public DateTime? DeliveredAt { get; set; }
}

public class AddressDto
{
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string Company { get; set; } = string.Empty;
    public string Street { get; set; } = string.Empty;
    public string City { get; set; } = string.Empty;
    public string State { get; set; } = string.Empty;
    public string ZipCode { get; set; } = string.Empty;
    public string Country { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
}

public class CreateShippingDto
{
    public Guid OrderId { get; set; }
    public string Carrier { get; set; } = string.Empty;
    public string Service { get; set; } = string.Empty;
    public AddressDto FromAddress { get; set; } = new();
    public AddressDto ToAddress { get; set; } = new();
}

public enum ShippingStatus
{
    Pending = 0,
    LabelCreated = 1,
    InTransit = 2,
    OutForDelivery = 3,
    Delivered = 4,
    Exception = 5,
    Returned = 6
}
