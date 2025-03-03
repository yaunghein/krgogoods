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

  return <CartMain layout="page" cart={cart} />;
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
    <div className="flex flex-col items-center">
      <div className="w-full flex justify-center px-8 sm:px-10 sm:border-t-2 border-neutral-300">
        <div className="relative sm:border-x-2 border-b-0 w-full border-neutral-300 pt-5 sm:pt-3 pb-7 sm:pb-3 flex justify-center">
          <div className="flex items-center gap-3 -translate-x-[0.05rem]">
            <div className="relative shrink-0">
              <div className="size-8 sm:size-9 bg-white border sm:border-2 border-neutral-300 rounded-full relative">
                <div className="text-sm absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-black">
                  C
                </div>
              </div>
              <div className="absolute z-10 size-2 top-1/2 right-0 transform translate-x-2/5 -translate-y-1/2 bg-white border sm:border-2 border-neutral-300 rounded-full"></div>
              <div className="h-[1px] sm:h-[2px] bg-neutral-300 w-3 absolute top-1/2 -translate-y-1/2 -right-3"></div>
            </div>
            <div className="relative shrink-0">
              <div className="absolute z-10 size-2 top-1/2 left-0 transform -translate-x-2/5 -translate-y-1/2 bg-white border sm:border-2 border-neutral-300 rounded-full"></div>
              <div className="size-8 sm:size-9 bg-white border sm:border-2 border-neutral-300 rounded-full relative">
                <div className="text-sm absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-black">
                  A
                </div>
              </div>
              <div className="absolute z-10 size-2 top-1/2 right-0 transform translate-x-2/5 -translate-y-1/2 bg-white border sm:border-2 border-neutral-300 rounded-full"></div>
              <div className="h-[1px] sm:h-[2px] bg-neutral-300 w-3 absolute top-1/2 -translate-y-1/2 -right-3"></div>
            </div>
            <div className="relative shrink-0">
              <div className="absolute z-10 size-2 top-1/2 left-0 transform -translate-x-2/5 -translate-y-1/2 bg-white border sm:border-2 border-neutral-300 rounded-full"></div>
              <div className="size-8 sm:size-9 bg-white border sm:border-2 border-neutral-300 rounded-full relative">
                <div className="text-sm absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-black">
                  R
                </div>
              </div>
              <div className="absolute z-10 size-2 top-1/2 right-0 transform translate-x-2/5 -translate-y-1/2 bg-white border sm:border-2 border-neutral-300 rounded-full"></div>
              <div className="h-[1px] sm:h-[2px] bg-neutral-300 w-3 absolute top-1/2 -translate-y-1/2 -right-3"></div>
              <div className="hidden sm:block h-3 bg-neutral-300 w-[2px] absolute -top-3 left-1/2 -translate-x-1/2"></div>
              <div className="hidden sm:block h-3 bg-neutral-300 w-[2px] absolute -bottom-3 left-1/2 -translate-x-1/2"></div>
            </div>
            <div className="relative shrink-0">
              <div className="absolute z-10 size-2 top-1/2 left-0 transform -translate-x-2/5 -translate-y-1/2 bg-white border sm:border-2 border-neutral-300 rounded-full"></div>
              <div className="size-8 sm:size-9 bg-white border sm:border-2 border-neutral-300 rounded-full relative">
                <div className="text-sm absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-black">
                  T
                </div>
              </div>
              <div className="absolute z-10 size-2 top-1/2 right-0 transform translate-x-2/5 -translate-y-1/2 bg-white border sm:border-2 border-neutral-300 rounded-full"></div>
            </div>
            <div className="relative shrink-0">
              <div className="absolute z-10 size-2 top-1/2 left-0 transform -translate-x-2/5 -translate-y-1/2 bg-white border sm:border-2 border-neutral-300 rounded-full"></div>
              <div className="size-8 sm:size-9 bg-white border sm:border-2 border-neutral-300 rounded-full relative">
                <div className="text-sm absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-black flex">
                  <span className="inline-block -translate-y-[0.1rem]">(</span>
                  {cart?.lines?.nodes.length || 0}
                  <span className="inline-block -translate-y-[0.1rem]">)</span>
                </div>
              </div>
              <div className="h-[1px] sm:h-[2px] bg-neutral-300 w-3 absolute top-1/2 -translate-y-1/2 -left-3"></div>
              <div className="absolute z-10 size-2 top-1/2 right-0 transform translate-x-2/5 -translate-y-1/2 bg-white border sm:border-2 border-neutral-300 rounded-full"></div>
            </div>
          </div>

          {/* dots */}
          <div className="hidden sm:block absolute size-2 top-0 left-0 transform -translate-x-3/5 -translate-y-3/5 bg-white border sm:border-2 border-neutral-300 rounded-full"></div>
          <div className="hidden sm:block absolute size-2 top-0 right-0 transform translate-x-3/5 -translate-y-3/5 bg-white border sm:border-2 border-neutral-300 rounded-full"></div>
          <div className="hidden sm:block absolute size-2 top-0 left-1/2 transform -translate-x-3/5 -translate-y-3/5 bg-white border sm:border-2 border-neutral-300 rounded-full"></div>
        </div>
      </div>
      <TwoColumnLayout
        left={
          <ul>
            <CartEmpty hidden={linesCount} layout={layout} />
            {(cart?.lines?.nodes ?? []).map((line) => (
              <CartLineItem key={line.id} line={line} layout={layout} />
            ))}
          </ul>
        }
        right={
          cartHasItems ? (
            <div className="h-full flex flex-col justify-end">
              <CartSummary cart={cart} layout={layout} />
            </div>
          ) : null
        }
      />
    </div>
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
    <div hidden={hidden} className="p-7 grid gap-7 sm:p-10">
      <p className="max-w-[22rem] uppercase text-sm">
        Looks like you haven&rsquo;t added anything yet, let&rsquo;s get you
        started!
      </p>

      <Link
        to="/"
        onClick={close}
        prefetch="viewport"
        className="block text-xs cursor-pointer bg-black text-white uppercase font-bold py-3 text-center sm:w-1/2 relative border sm:border-2 border-neutral-300"
      >
        Continue shopping
        {/* dots */}
        <div className="absolute size-2 top-0 left-0 transform -translate-x-3/5 -translate-y-3/5 bg-black border sm:border-2 border-neutral-300 rounded-full"></div>
        <div className="absolute size-2 top-0 right-0 transform translate-x-3/5 -translate-y-3/5 bg-black border sm:border-2 border-neutral-300 rounded-full"></div>
        <div className="absolute size-2 bottom-0 left-0 transform -translate-x-3/5 translate-y-3/5 bg-black border sm:border-2 border-neutral-300 rounded-full"></div>
        <div className="absolute size-2 bottom-0 right-0 transform translate-x-3/5 translate-y-3/5 bg-black border sm:border-2 border-neutral-300 rounded-full"></div>
      </Link>
    </div>
  );
}
