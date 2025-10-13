using Microsoft.EntityFrameworkCore;
using Orders.Domain.Entities;

namespace Orders.Infrastructure.Data;

public class OrdersDbContext : DbContext
{
    public OrdersDbContext(DbContextOptions<OrdersDbContext> options) : base(options)
    {
    }

    public DbSet<Order> Orders { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<Order>(entity =>
        {
            entity.HasKey(e => e.Id);
            
            entity.Property(e => e.Id)
                .ValueGeneratedNever();

            entity.Property(e => e.OrderNumber)
                .IsRequired()
                .HasMaxLength(50);

            entity.Property(e => e.CustomerId)
                .IsRequired();

            entity.Property(e => e.Status)
                .IsRequired();

            entity.Property(e => e.SubTotal)
                .HasPrecision(18, 2);

            entity.Property(e => e.TaxAmount)
                .HasPrecision(18, 2);

            entity.Property(e => e.ShippingAmount)
                .HasPrecision(18, 2);

            entity.Property(e => e.TotalAmount)
                .HasPrecision(18, 2);

            // Configure Address as owned entities
            entity.OwnsOne(e => e.ShippingAddress, sa =>
            {
                sa.Property(a => a.FirstName).HasMaxLength(100);
                sa.Property(a => a.LastName).HasMaxLength(100);
                sa.Property(a => a.Street).HasMaxLength(200);
                sa.Property(a => a.City).HasMaxLength(100);
                sa.Property(a => a.State).HasMaxLength(100);
                sa.Property(a => a.ZipCode).HasMaxLength(20);
                sa.Property(a => a.Country).HasMaxLength(100);
                sa.Property(a => a.Phone).HasMaxLength(20);
            });

            entity.OwnsOne(e => e.BillingAddress, ba =>
            {
                ba.Property(a => a.FirstName).HasMaxLength(100);
                ba.Property(a => a.LastName).HasMaxLength(100);
                ba.Property(a => a.Street).HasMaxLength(200);
                ba.Property(a => a.City).HasMaxLength(100);
                ba.Property(a => a.State).HasMaxLength(100);
                ba.Property(a => a.ZipCode).HasMaxLength(20);
                ba.Property(a => a.Country).HasMaxLength(100);
                ba.Property(a => a.Phone).HasMaxLength(20);
            });

            // Indexes
            entity.HasIndex(e => e.OrderNumber)
                .IsUnique();

            entity.HasIndex(e => e.CustomerId);
            entity.HasIndex(e => e.Status);

            // Ignore domain events
            entity.Ignore(e => e.DomainEvents);
        });

        modelBuilder.Entity<OrderItem>(entity =>
        {
            entity.HasKey(e => e.Id);
            
            entity.Property(e => e.Id)
                .ValueGeneratedNever();

            entity.Property(e => e.ProductName)
                .IsRequired()
                .HasMaxLength(200);

            entity.Property(e => e.Sku)
                .IsRequired()
                .HasMaxLength(50);

            entity.Property(e => e.UnitPrice)
                .HasPrecision(18, 2);

            entity.Property(e => e.Quantity)
                .IsRequired();
        });
    }
}
