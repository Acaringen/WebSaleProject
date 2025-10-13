using FluentValidation;

namespace Inventory.Application.Commands.CreateInventoryItem;

public class CreateInventoryItemCommandValidator : AbstractValidator<CreateInventoryItemCommand>
{
    public CreateInventoryItemCommandValidator()
    {
        RuleFor(x => x.ProductId)
            .NotEmpty()
            .WithMessage("Product ID is required");

        RuleFor(x => x.Sku)
            .NotEmpty()
            .WithMessage("SKU is required")
            .MaximumLength(50)
            .WithMessage("SKU must not exceed 50 characters");

        RuleFor(x => x.Quantity)
            .GreaterThanOrEqualTo(0)
            .WithMessage("Quantity must be greater than or equal to 0");

        RuleFor(x => x.Cost)
            .GreaterThanOrEqualTo(0)
            .WithMessage("Cost must be greater than or equal to 0");

        RuleFor(x => x.Location)
            .NotEmpty()
            .WithMessage("Location is required")
            .MaximumLength(100)
            .WithMessage("Location must not exceed 100 characters");

        RuleFor(x => x.MinimumStock)
            .GreaterThanOrEqualTo(0)
            .WithMessage("Minimum stock must be greater than or equal to 0");

        RuleFor(x => x.MaximumStock)
            .GreaterThan(0)
            .WithMessage("Maximum stock must be greater than 0")
            .GreaterThanOrEqualTo(x => x.MinimumStock)
            .WithMessage("Maximum stock must be greater than or equal to minimum stock");
    }
}
