import type {CartLineUpdateInput} from '@shopify/hydrogen/storefront-api-types';
import type {CartLayout} from '~/components/CartMain';
import {CartForm, Image, type OptimisticCartLine} from '@shopify/hydrogen';
import {useVariantUrl} from '~/lib/variants';
import {Link} from '@remix-run/react';
import {ProductPrice} from './ProductPrice';
import {useAside} from './Aside';
import type {CartApiQueryFragment} from 'storefrontapi.generated';

type CartLine = OptimisticCartLine<CartApiQueryFragment>;

/**
 * A single line item in the cart. It displays the product image, title, price.
 * It also provides controls to update the quantity or remove the line item.
 */
export function CartLineItem({
  layout,
  line,
}: {
  layout: CartLayout;
  line: CartLine;
}) {
  const {id, merchandise} = line;
  const {product, title, image, selectedOptions} = merchandise;
  const lineItemUrl = useVariantUrl(product.handle, selectedOptions);
  const selectedVariants = selectedOptions.map((o) => o.value).join(' / ');
  const {close} = useAside();

  return (
    // <li key={id} className="cart-line">
    <li
      key={id}
      className="dark:text-white flex flex-col sm:flex-row border-y sm:border-y-2 border-b-0 border-neutral-300 dark:border-[#2D2D2D] transition duration-300 -mt-[2px] relative"
    >
      {image && (
        <div className="aspect-square w-full sm:w-[17.19rem]">
          <img
            src={image.url}
            alt={title}
            loading="lazy"
            className="w-full h-full object-cover !rounded-none sm:border-r-2 border-neutral-300 dark:border-[#2D2D2D] transition duration-300"
          />
        </div>
      )}

      <div className="p-5 pt-0 sm:pt-5 w-full flex flex-col justify-between">
        <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between w-full mb-8 sm:mb-0">
          <div className="grid gap-1">
            <Link
              prefetch="intent"
              to={lineItemUrl}
              onClick={() => {
                if (layout === 'aside') {
                  close();
                }
              }}
            >
              <strong className="uppercase text-xs sm:text-base">
                {product.title}
              </strong>
            </Link>
            {selectedVariants !== 'Default Title' && (
              <div className="text-xs sm:text-base uppercase">
                {selectedVariants}
              </div>
            )}
          </div>
          <ProductPrice price={line?.cost?.totalAmount} />
        </div>
        <div className="flex items-center justify-center sm:justify-start w-full">
          <CartLineQuantity line={line} />
        </div>
      </div>

      {/* dots */}
      {/* <div className="absolute size-2 top-0 left-0 transform -translate-x-3/5 -translate-y-3/5 bg-white border-2 border-neutral-300 dark:border-[#2D2D2D] transition duration-300 rounded-full"></div>
      <div className="absolute size-2 top-0 right-0 transform translate-x-3/5 -translate-y-3/5 bg-white border-2 border-neutral-300 dark:border-[#2D2D2D] transition duration-300 rounded-full"></div>
      <div className="absolute size-2 bottom-0 left-0 transform -translate-x-3/5 translate-y-3/5 bg-white border-2 border-neutral-300 dark:border-[#2D2D2D] transition duration-300 rounded-full"></div>
      <div className="absolute size-2 bottom-0 right-0 transform translate-x-3/5 translate-y-3/5 bg-white border-2 border-neutral-300 dark:border-[#2D2D2D] transition duration-300 rounded-full"></div> */}
    </li>
  );
}

/**
 * Provides the controls to update the quantity of a line item in the cart.
 * These controls are disabled when the line item is new, and the server
 * hasn't yet responded that it was successfully added to the cart.
 */
function CartLineQuantity({line}: {line: CartLine}) {
  if (!line || typeof line?.quantity === 'undefined') return null;
  const {id: lineId, quantity, isOptimistic} = line;
  const prevQuantity = Number(Math.max(0, quantity - 1).toFixed(0));
  const nextQuantity = Number((quantity + 1).toFixed(0));

  return (
    <div className="flex items-center justify-center gap-8 w-full">
      <CartLineUpdateButton lines={[{id: lineId, quantity: prevQuantity}]}>
        <button
          aria-label="Decrease quantity"
          disabled={quantity <= 1 || !!isOptimistic}
          name="decrease-quantity"
          value={prevQuantity}
          className="cursor-pointer"
        >
          <span className="">&#8722;</span>
        </button>
      </CartLineUpdateButton>
      <div className="font-[HelveticaNeueBold]">{quantity}</div>
      <CartLineUpdateButton lines={[{id: lineId, quantity: nextQuantity}]}>
        <button
          aria-label="Increase quantity"
          name="increase-quantity"
          value={nextQuantity}
          disabled={!!isOptimistic}
          className="cursor-pointer"
        >
          <span className="">&#43;</span>
        </button>
      </CartLineUpdateButton>
      <div className="ml-auto absolute top-4 right-4 sm:static">
        <CartLineRemoveButton lineIds={[lineId]} disabled={!!isOptimistic} />
      </div>
    </div>
  );
}

/**
 * A button that removes a line item from the cart. It is disabled
 * when the line item is new, and the server hasn't yet responded
 * that it was successfully added to the cart.
 */
function CartLineRemoveButton({
  lineIds,
  disabled,
}: {
  lineIds: string[];
  disabled: boolean;
}) {
  return (
    <CartForm
      route="/cart"
      action={CartForm.ACTIONS.LinesRemove}
      inputs={{lineIds}}
    >
      <button
        disabled={disabled}
        type="submit"
        className="size-5 flex cursor-pointer text-white dark:text-black transition duration-300"
      >
        <svg
          width="100%"
          height="100%"
          viewBox="0 0 23 23"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle
            cx="11.2681"
            cy="11.2679"
            r="8.60063"
            transform="rotate(45 11.2681 11.2679)"
            fill="currentColor"
            stroke="#FF7777"
            strokeWidth="1.26604"
          />
          <path
            d="M12.4087 11.2466L15.308 14.146L14.4036 15.0503L11.5043 12.151L8.59164 15.0636L7.68726 14.1593L10.5999 11.2466L7.70056 8.34729L8.60494 7.44291L11.5043 10.3422L14.4169 7.42961L15.3213 8.33399L12.4087 11.2466Z"
            fill="#FF7777"
          />
        </svg>
      </button>
    </CartForm>
  );
}

function CartLineUpdateButton({
  children,
  lines,
}: {
  children: React.ReactNode;
  lines: CartLineUpdateInput[];
}) {
  return (
    <CartForm
      route="/cart"
      action={CartForm.ACTIONS.LinesUpdate}
      inputs={{lines}}
    >
      {children}
    </CartForm>
  );
}
