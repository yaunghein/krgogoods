import {useOptimisticCart} from '@shopify/hydrogen';
import {Link} from '@remix-run/react';
import type {CartApiQueryFragment} from 'storefrontapi.generated';
import {useAside} from '~/components/Aside';
import {CartLineItem} from '~/components/CartLineItem';
import {CartSummary} from './CartSummary';
import {cn} from '~/utils/cn';

export type CartLayout = 'page' | 'aside';

export type CartMainProps = {
  cart: CartApiQueryFragment | null;
  layout: CartLayout;
};

/**
 * The main cart component that displays the cart items and summary.
 * It is used by both the /cart route and the cart aside dialog.
 */
export function CartMain({layout, cart: originalCart}: CartMainProps) {
  // The useOptimisticCart hook applies pending actions to the cart
  // so the user immediately sees feedback when they modify the cart.
  const cart = useOptimisticCart(originalCart);

  const linesCount = Boolean(cart?.lines?.nodes?.length || 0);
  const withDiscount =
    cart &&
    Boolean(cart?.discountCodes?.filter((code) => code.applicable)?.length);
  const className = `cart-main ${withDiscount ? 'with-discount' : ''}`;
  const cartHasItems = cart?.totalQuantity && cart?.totalQuantity > 0;

  return (
    <div className="pl-8 pr-10 -my-[0.3rem] relative">
      <div className="absolute inset-0 top-[3px] bottom-auto w-full h-[2px] bg-neutral-300"></div>
      <div className="absolute inset-0 top-auto w-full h-[2px] bg-neutral-300"></div>
      <CartEmpty hidden={linesCount} layout={layout} />
      <div className="flex">
        <div className="flex-1 cart-details relative">
          <div aria-labelledby="cart-lines">
            <ul className="block h-[40rem] overflow-x-hidden overflow-y-scroll !p-[0.3rem]">
              {(cart?.lines?.nodes ?? []).map((line) => (
                <CartLineItem key={line.id} line={line} layout={layout} />
              ))}
            </ul>
          </div>
          {/* dots */}
          {/* <div className="absolute size-2 top-0 left-0 transform -translate-x-2/5 -translate-y-2/5 bg-white border-2 border-neutral-300 dark:border-[#2D2D2D] transition duration-300 rounded-full"></div>
          <div className="absolute size-2 top-0 right-0 transform translate-x-2/5 -translate-y-2/5 bg-white border-2 border-neutral-300 dark:border-[#2D2D2D] transition duration-300 rounded-full"></div>
          <div className="absolute size-2 bottom-0 left-0 transform -translate-x-2/5 translate-y-2/5 bg-white border-2 border-neutral-300 dark:border-[#2D2D2D] transition duration-300 rounded-full"></div>
          <div className="absolute size-2 bottom-0 right-0 transform translate-x-2/5 translate-y-2/5 bg-white border-2 border-neutral-300 dark:border-[#2D2D2D] transition duration-300 rounded-full"></div> */}
        </div>
        {cartHasItems && (
          <div className="flex-1 self-end">
            <CartSummary cart={cart} layout={layout} />
          </div>
        )}
      </div>
    </div>
  );
}

function CartEmpty({
  hidden = false,
}: {
  hidden: boolean;
  layout?: CartMainProps['layout'];
}) {
  const {close} = useAside();
  return (
    <div hidden={hidden}>
      <br />
      <p>
        Looks like you haven&rsquo;t added anything yet, let&rsquo;s get you
        started!
      </p>
      <br />
      <Link to="/collections" onClick={close} prefetch="viewport">
        Continue shopping →
      </Link>
    </div>
  );
}
