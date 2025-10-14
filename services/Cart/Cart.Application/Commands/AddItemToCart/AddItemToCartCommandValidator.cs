using FluentValidation;

namespace Cart.Application.Commands.AddItemToCart;

public class AddItemToCartCommandValidator : AbstractValidator<AddItemToCartCommand>
{
    public AddItemToCartCommandValidator()
    {
        RuleFor(x => x.CustomerId)
            .NotEmpty().WithMessage("Müşteri ID gereklidir.");

        RuleFor(x => x.ProductId)
            .NotEmpty().WithMessage("Ürün ID gereklidir.");

        RuleFor(x => x.ProductName)
            .NotEmpty().WithMessage("Ürün adı gereklidir.")
            .MaximumLength(200).WithMessage("Ürün adı en fazla 200 karakter olabilir.");

        RuleFor(x => x.Price)
            .GreaterThan(0).WithMessage("Fiyat 0'dan büyük olmalıdır.");

        RuleFor(x => x.Quantity)
            .GreaterThan(0).WithMessage("Miktar 0'dan büyük olmalıdır.");
    }
}
