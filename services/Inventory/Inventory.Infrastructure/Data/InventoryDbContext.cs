using Inventory.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace Inventory.Infrastructure.Data;

public class InventoryDbContext : DbContext
{
    public InventoryDbContext(DbContextOptions<InventoryDbContext> options) : base(options)
    {
    }

    public DbSet<InventoryItem> InventoryItems { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<InventoryItem>(entity =>
        {
            entity.HasKey(e => e.Id);
            
            entity.Property(e => e.Id)
                .ValueGeneratedNever();

            entity.Property(e => e.ProductId)
                .IsRequired();

            entity.Property(e => e.Sku)
                .IsRequired()
                .HasMaxLength(50);

            entity.Property(e => e.Location)
                .IsRequired()
                .HasMaxLength(100);

            entity.Property(e => e.Cost)
                .HasPrecision(18, 2);

            entity.Property(e => e.CreatedAt)
                .IsRequired();

            entity.Property(e => e.UpdatedAt);

            // Indexes
            entity.HasIndex(e => e.ProductId)
                .IsUnique();

            entity.HasIndex(e => e.Sku)
                .IsUnique();

            entity.HasIndex(e => e.Location);

            // Ignore domain events
            entity.Ignore(e => e.DomainEvents);
        });
    }
}
