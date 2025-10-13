using FluentValidation;

namespace Catalog.Application.Commands.CreateProduct;

public class CreateProductCommandValidator : AbstractValidator<CreateProductCommand>
{
    public CreateProductCommandValidator()
    {
        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("Product name is required")
            .MaximumLength(200).WithMessage("Product name cannot exceed 200 characters");

        RuleFor(x => x.Description)
            .NotEmpty().WithMessage("Product description is required")
            .MaximumLength(2000).WithMessage("Product description cannot exceed 2000 characters");

        RuleFor(x => x.Price)
            .GreaterThan(0).WithMessage("Price must be greater than 0");

        RuleFor(x => x.Sku)
            .NotEmpty().WithMessage("SKU is required")
            .MaximumLength(50).WithMessage("SKU cannot exceed 50 characters")
            .Matches("^[A-Z0-9-_]+$").WithMessage("SKU must contain only uppercase letters, numbers, hyphens, and underscores");

        RuleFor(x => x.Category)
            .NotEmpty().WithMessage("Category is required")
            .MaximumLength(100).WithMessage("Category cannot exceed 100 characters");

        RuleFor(x => x.Brand)
            .NotEmpty().WithMessage("Brand is required")
            .MaximumLength(100).WithMessage("Brand cannot exceed 100 characters");

        RuleFor(x => x.Images)
            .NotNull().WithMessage("Images list cannot be null");

        RuleForEach(x => x.Images)
            .NotEmpty().WithMessage("Image URL cannot be empty")
            .Must(BeValidUrl).WithMessage("Image URL must be a valid URL");

        RuleFor(x => x.Attributes)
            .NotNull().WithMessage("Attributes dictionary cannot be null");
    }

    private static bool BeValidUrl(string url)
    {
        return Uri.TryCreate(url, UriKind.Absolute, out var result) &&
               (result.Scheme == Uri.UriSchemeHttp || result.Scheme == Uri.UriSchemeHttps);
    }
}
