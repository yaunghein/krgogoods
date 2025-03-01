import {Link, useNavigate} from '@remix-run/react';
import {type MappedProductOptions} from '@shopify/hydrogen';
import type {
  Maybe,
  ProductOptionValueSwatch,
} from '@shopify/hydrogen/storefront-api-types';
import {AddToCartButton} from './AddToCartButton';
import {useAside} from './Aside';
import type {ProductFragment} from 'storefrontapi.generated';
import {cn} from '~/utils/cn';

export function ProductForm({
  productOptions,
  selectedVariant,
}: {
  productOptions: MappedProductOptions[];
  selectedVariant: ProductFragment['selectedOrFirstAvailableVariant'];
}) {
  const navigate = useNavigate();
  const {open} = useAside();
  return (
    <div className="mt-6 sm:mt-0 -mb-[1px] sm:mb-0 -mx-[1px] sm:-mx-0">
      {productOptions.some((o) => o.name === 'Size') && (
        <div className="block text-xs cursor-pointer bg-white text-black uppercase font-bold py-[0.7rem] sm:py-[0.6rem] text-center sm:w-1/2 relative border sm:border-2 border-b-0 sm:border-b-0 border-neutral-300">
          {productOptions.map((option) => {
            if (option.optionValues.length === 1) return null;
            if (option.name === 'Size') {
              return (
                <div key={option.name}>
                  <div className="flex items-center justify-evenly">
                    {option.optionValues.map((value) => {
                      const {
                        name,
                        handle,
                        variantUriQuery,
                        selected,
                        available,
                        exists,
                        isDifferentProduct,
                        swatch,
                      } = value;
                      return (
                        <button
                          type="button"
                          key={option.name + name}
                          disabled={!exists}
                          onClick={() => {
                            if (!selected) {
                              navigate(`?${variantUriQuery}`, {
                                replace: true,
                                preventScrollReset: true,
                              });
                            }
                          }}
                          className={cn(
                            'transition cursor-pointer uppercase',
                            selected ? 'opacity-80' : 'opacity-25',
                          )}
                        >
                          <ProductOptionSwatch swatch={swatch} name={name} />
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            }
          })}

          {/* lines */}
          <div className="h-[1px] sm:h-[2px] bg-neutral-300 w-8 absolute -top-[1px] -left-8 sm:hidden"></div>
          <div className="h-[1px] sm:h-[2px] bg-neutral-300 w-8 absolute -top-[1px] -right-8 sm:hidden"></div>
          <div className="h-[1px] sm:h-[2px] bg-neutral-300 w-8 absolute -bottom-[1px] -left-8 sm:hidden"></div>
          <div className="h-[1px] sm:h-[2px] bg-neutral-300 w-8 absolute -bottom-[1px] -right-8 sm:hidden"></div>

          {/* dots */}
          <div className="absolute size-2 top-0 left-0 transform -translate-x-3/5 -translate-y-3/5 bg-white border sm:border-2 border-neutral-300 rounded-full"></div>
          <div className="absolute size-2 top-0 right-0 transform translate-x-3/5 -translate-y-3/5 bg-white border sm:border-2 border-neutral-300 rounded-full"></div>
        </div>
      )}
      <AddToCartButton
        disabled={!selectedVariant || !selectedVariant.availableForSale}
        onClick={() => {
          // open('cart');
          navigate('/cart');
        }}
        lines={
          selectedVariant
            ? [
                {
                  merchandiseId: selectedVariant.id,
                  quantity: 1,
                  selectedVariant,
                },
              ]
            : []
        }
      >
        {selectedVariant?.availableForSale ? 'Add to cart' : 'Sold out'}
      </AddToCartButton>
    </div>
  );
}

export function ProductOptionSwatch({
  swatch,
  name,
}: {
  swatch?: Maybe<ProductOptionValueSwatch> | undefined;
  name: string;
}) {
  const image = swatch?.image?.previewImage?.url;
  const color = swatch?.color;

  if (!image && !color) return name;

  return (
    <div
      aria-label={name}
      className="product-option-label-swatch"
      style={{
        backgroundColor: color || 'transparent',
      }}
    >
      {!!image && <img src={image} alt={name} />}
    </div>
  );
}
