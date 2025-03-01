import {type MetaFunction, useLoaderData} from '@remix-run/react';
import type {CartQueryDataReturn} from '@shopify/hydrogen';
import {CartForm} from '@shopify/hydrogen';
import {
  data,
  type LoaderFunctionArgs,
  type ActionFunctionArgs,
  type HeadersFunction,
} from '@shopify/remix-oxygen';
import {useAside} from '~/components/Aside';

import {useOptimisticCart} from '@shopify/hydrogen';
import {Link} from '@remix-run/react';
import type {CartApiQueryFragment} from 'storefrontapi.generated';
import {CartLineItem} from '~/components/CartLineItem';
import {CartSummary} from '~/components/CartSummary';
import {cn} from '~/utils/cn';
import {TwoColumnLayout} from '~/components/TwoColumnLayout';

export type CartLayout = 'page' | 'aside';

export type CartMainProps = {
  cart: CartApiQueryFragment | null;
  layout: CartLayout;
};

export const meta: MetaFunction = () => {
  return [{title: `Hydrogen | Cart`}];
};

export const headers: HeadersFunction = ({actionHeaders}) => actionHeaders;

export async function action({request, context}: ActionFunctionArgs) {
  const {cart} = context;

  const formData = await request.formData();

  const {action, inputs} = CartForm.getFormInput(formData);

  if (!action) {
    throw new Error('No action provided');
  }

  let status = 200;
  let result: CartQueryDataReturn;

  switch (action) {
    case CartForm.ACTIONS.LinesAdd:
      result = await cart.addLines(inputs.lines);
      break;
    case CartForm.ACTIONS.LinesUpdate:
      result = await cart.updateLines(inputs.lines);
      break;
    case CartForm.ACTIONS.LinesRemove:
      result = await cart.removeLines(inputs.lineIds);
      break;
    case CartForm.ACTIONS.DiscountCodesUpdate: {
      const formDiscountCode = inputs.discountCode;

      // User inputted discount code
      const discountCodes = (
        formDiscountCode ? [formDiscountCode] : []
      ) as string[];

      // Combine discount codes already applied on cart
      discountCodes.push(...inputs.discountCodes);

      result = await cart.updateDiscountCodes(discountCodes);
      break;
    }
    case CartForm.ACTIONS.GiftCardCodesUpdate: {
      const formGiftCardCode = inputs.giftCardCode;

      // User inputted gift card code
      const giftCardCodes = (
        formGiftCardCode ? [formGiftCardCode] : []
      ) as string[];

      // Combine gift card codes already applied on cart
      giftCardCodes.push(...inputs.giftCardCodes);

      result = await cart.updateGiftCardCodes(giftCardCodes);
      break;
    }
    case CartForm.ACTIONS.BuyerIdentityUpdate: {
      result = await cart.updateBuyerIdentity({
        ...inputs.buyerIdentity,
      });
      break;
    }
    default:
      throw new Error(`${action} cart action is not defined`);
  }

  const cartId = result?.cart?.id;
  const headers = cartId ? cart.setCartId(result.cart.id) : new Headers();
  const {cart: cartResult, errors, warnings} = result;

  const redirectTo = formData.get('redirectTo') ?? null;
  if (typeof redirectTo === 'string') {
    status = 303;
    headers.set('Location', redirectTo);
  }

  return data(
    {
      cart: cartResult,
      errors,
      warnings,
      analytics: {
        cartId,
      },
    },
    {status, headers},
  );
}

export async function loader({context}: LoaderFunctionArgs) {
  const {cart} = context;
  return await cart.get();
}

export default function Cart() {
  const cart = useLoaderData<typeof loader>();

  return (
    <div className="cart">
      <CartMain layout="page" cart={cart} />
    </div>
  );
}

/**
 * The main cart component that displays the cart items and summary.
 * It is used by both the /cart route and the cart aside dialog.
 */
function CartMain({layout, cart: originalCart}: CartMainProps) {
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
    <TwoColumnLayout
      left={
        <ul>
          {(cart?.lines?.nodes ?? []).map((line) => (
            <CartLineItem key={line.id} line={line} layout={layout} />
          ))}
        </ul>
      }
      right={
        cartHasItems && (
          <div className="h-full flex flex-col justify-end">
            <CartSummary cart={cart} layout={layout} />
          </div>
        )
      }
    />
    // <div className="pl-8 pr-10 -my-[0.3rem] relative">
    //   <div className="absolute inset-0 top-[3px] bottom-auto w-full h-[2px] bg-neutral-300"></div>
    //   <div className="absolute inset-0 top-auto w-full h-[2px] bg-neutral-300"></div>
    //   <CartEmpty hidden={linesCount} layout={layout} />
    //   <div className="flex">
    //     <div className="flex-1 cart-details relative">
    //       <div aria-labelledby="cart-lines">
    //         <ul className="block h-[40rem] overflow-x-hidden overflow-y-scroll !p-[0.3rem]">
    //           {(cart?.lines?.nodes ?? []).map((line) => (
    //             <CartLineItem key={line.id} line={line} layout={layout} />
    //           ))}
    //         </ul>
    //       </div>
    //       {/* dots */}
    //       {/* <div className="absolute size-2 top-0 left-0 transform -translate-x-2/5 -translate-y-2/5 bg-white border-2 border-neutral-300 rounded-full"></div>
    //       <div className="absolute size-2 top-0 right-0 transform translate-x-2/5 -translate-y-2/5 bg-white border-2 border-neutral-300 rounded-full"></div>
    //       <div className="absolute size-2 bottom-0 left-0 transform -translate-x-2/5 translate-y-2/5 bg-white border-2 border-neutral-300 rounded-full"></div>
    //       <div className="absolute size-2 bottom-0 right-0 transform translate-x-2/5 translate-y-2/5 bg-white border-2 border-neutral-300 rounded-full"></div> */}
    //     </div>
    //     {cartHasItems && (
    //       <div className="flex-1 self-end">
    //         <CartSummary cart={cart} layout={layout} />
    //       </div>
    //     )}
    //   </div>
    // </div>
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
