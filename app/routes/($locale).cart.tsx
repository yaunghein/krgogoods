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
  return [{title: `Krgogoods | Cart`}];
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
      <div className="w-full flex justify-center pl-[1.975rem] pr-[1.9rem] sm:pl-[2.42rem] sm:pr-[2.45rem] sm:border-t-2 border-neutral-300 dark:border-[#2D2D2D] transition duration-300">
        <div className="relative border-x sm:border-x-2 border-b-0 w-full border-neutral-300 dark:border-[#2D2D2D] transition duration-300 py-5 sm:py-3 sm:-translate-y-[0.05rem] flex justify-center">
          <div className="flex items-center gap-3">
            <div className="relative shrink-0">
              <div className="size-8 sm:size-9 bg-white dark:bg-black border sm:border-2 border-neutral-300 dark:border-[#2D2D2D] transition duration-300 rounded-full relative">
                <div className="text-sm absolute leading-none top-1/2 left-1/2 -translate-x-1/2 -translate-y-[39%] text-black dark:text-white transition duration-300">
                  C
                </div>
              </div>
              <div className="absolute z-10 size-2 top-1/2 right-0 transform translate-x-2/5 -translate-y-1/2 bg-white dark:bg-black border sm:border-2 border-neutral-300 dark:border-[#2D2D2D] transition duration-300 rounded-full"></div>
              <div className="h-[1px] sm:h-[2px] bg-neutral-300 w-3 dark:bg-[#2D2D2D] transition duration-300 absolute top-1/2 -translate-y-1/2 -right-3"></div>
            </div>
            <div className="relative shrink-0">
              <div className="absolute z-10 size-2 top-1/2 left-0 transform -translate-x-2/5 -translate-y-1/2 bg-white dark:bg-black border sm:border-2 border-neutral-300 dark:border-[#2D2D2D] transition duration-300 rounded-full"></div>
              <div className="size-8 sm:size-9 bg-white dark:bg-black border sm:border-2 border-neutral-300 dark:border-[#2D2D2D] transition duration-300 rounded-full relative">
                <div className="text-sm absolute leading-none top-1/2 left-1/2 -translate-x-1/2 -translate-y-[39%] text-black dark:text-white transition duration-300">
                  A
                </div>
              </div>
              <div className="absolute z-10 size-2 top-1/2 right-0 transform translate-x-2/5 -translate-y-1/2 bg-white dark:bg-black border sm:border-2 border-neutral-300 dark:border-[#2D2D2D] transition duration-300 rounded-full"></div>
              <div className="h-[1px] sm:h-[2px] bg-neutral-300 w-3 dark:bg-[#2D2D2D] transition duration-300 absolute top-1/2 -translate-y-1/2 -right-3"></div>
            </div>
            <div className="relative shrink-0">
              <div className="absolute z-10 size-2 top-1/2 left-0 transform -translate-x-2/5 -translate-y-1/2 bg-white dark:bg-black border sm:border-2 border-neutral-300 dark:border-[#2D2D2D] transition duration-300 rounded-full"></div>
              <div className="size-8 sm:size-9 bg-white dark:bg-black border sm:border-2 border-neutral-300 dark:border-[#2D2D2D] transition duration-300 rounded-full relative">
                <div className="text-sm absolute leading-none top-1/2 left-1/2 -translate-x-1/2 -translate-y-[39%] text-black dark:text-white transition duration-300">
                  R
                </div>
              </div>
              <div className="absolute z-10 size-2 top-1/2 right-0 transform translate-x-2/5 -translate-y-1/2 bg-white dark:bg-black border sm:border-2 border-neutral-300 dark:border-[#2D2D2D] transition duration-300 rounded-full"></div>
              <div className="absolute z-10 size-2 top-0 left-1/2 transform -translate-x-1/2 -translate-y-[35%] bg-white dark:bg-black border sm:border-2 border-neutral-300 dark:border-[#2D2D2D] transition duration-300 rounded-full"></div>
              <div className="absolute z-10 size-2 bottom-0 left-1/2 transform -translate-x-1/2 translate-y-[35%] bg-white dark:bg-black border sm:border-2 border-neutral-300 dark:border-[#2D2D2D] transition duration-300 rounded-full"></div>
              <div className="h-[1px] sm:h-[2px] bg-neutral-300 dark:bg-[#2D2D2D] transition duration-300 w-3 absolute top-1/2 -translate-y-1/2 -right-3"></div>
              <div className="h-5 sm:h-3 bg-neutral-300 dark:bg-[#2D2D2D] transition duration-300 w-[1px] sm:w-[2px] absolute -top-5 sm:-top-3 left-1/2 -translate-x-1/2"></div>
              <div className="h-5 sm:h-3 bg-neutral-300 dark:bg-[#2D2D2D] transition duration-300 w-[1px] sm:w-[2px] absolute -bottom-5 sm:-bottom-3 left-1/2 -translate-x-1/2"></div>
            </div>
            <div className="relative shrink-0">
              <div className="absolute z-10 size-2 top-1/2 left-0 transform -translate-x-2/5 -translate-y-1/2 bg-white dark:bg-black border sm:border-2 border-neutral-300 dark:border-[#2D2D2D] transition duration-300 rounded-full"></div>
              <div className="size-8 sm:size-9 bg-white dark:bg-black border sm:border-2 border-neutral-300 dark:border-[#2D2D2D] transition duration-300 rounded-full relative">
                <div className="text-sm absolute leading-none top-1/2 left-1/2 -translate-x-1/2 -translate-y-[39%] text-black dark:text-white transition duration-300">
                  T
                </div>
              </div>
              <div className="absolute z-10 size-2 top-1/2 right-0 transform translate-x-2/5 -translate-y-1/2 bg-white dark:bg-black border sm:border-2 border-neutral-300 dark:border-[#2D2D2D] transition duration-300 rounded-full"></div>
            </div>
            <div className="relative shrink-0">
              <div className="absolute z-10 size-2 top-1/2 left-0 transform -translate-x-2/5 -translate-y-1/2 bg-white dark:bg-black border sm:border-2 border-neutral-300 dark:border-[#2D2D2D] transition duration-300 rounded-full"></div>
              <div className="size-8 sm:size-9 bg-white dark:bg-black border sm:border-2 border-neutral-300 dark:border-[#2D2D2D] transition duration-300 rounded-full relative">
                <div className="text-sm absolute leading-none top-1/2 left-1/2 -translate-x-1/2 -translate-y-[39%] text-black dark:text-white transition duration-300 flex">
                  <span className="inline-block -translate-y-[0.05rem]">(</span>
                  {cart?.totalQuantity || 0}
                  <span className="inline-block -translate-y-[0.05rem]">)</span>
                </div>
              </div>
              <div className="h-[1px] sm:h-[2px] bg-neutral-300 w-3 dark:bg-[#2D2D2D] transition duration-300 absolute top-1/2 -translate-y-1/2 -left-3"></div>
              <div className="absolute z-10 size-2 top-1/2 right-0 transform translate-x-2/5 -translate-y-1/2 bg-white dark:bg-black border sm:border-2 border-neutral-300 dark:border-[#2D2D2D] transition duration-300 rounded-full"></div>
            </div>
          </div>
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
            <div className="h-full flex flex-col justify-end text-black dark:text-white transition duration-300">
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
    //       {/* <div className="absolute size-2 top-0 left-0 transform -translate-x-2/5 -translate-y-2/5 bg-white border-2 border-neutral-300 dark:border-[#2D2D2D] transition duration-300 rounded-full"></div>
    //       <div className="absolute size-2 top-0 right-0 transform translate-x-2/5 -translate-y-2/5 bg-white border-2 border-neutral-300 dark:border-[#2D2D2D] transition duration-300 rounded-full"></div>
    //       <div className="absolute size-2 bottom-0 left-0 transform -translate-x-2/5 translate-y-2/5 bg-white border-2 border-neutral-300 dark:border-[#2D2D2D] transition duration-300 rounded-full"></div>
    //       <div className="absolute size-2 bottom-0 right-0 transform translate-x-2/5 translate-y-2/5 bg-white border-2 border-neutral-300 dark:border-[#2D2D2D] transition duration-300 rounded-full"></div> */}
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
      <p className="max-w-[22rem] uppercase text-sm text-black dark:text-white transition duration-300">
        Looks like you haven&rsquo;t added anything yet, let&rsquo;s get you
        started!
      </p>

      <Link
        to="/"
        onClick={close}
        prefetch="viewport"
        className="group cursor-pointer block text-xs bg-white sm:w-1/2 text-black hover:bg-black hover:text-white dark:bg-black dark:text-white dark:hover:bg-white dark:hover:text-black uppercase font-[HelveticaNeueBold] py-3 text-center w-full relative border sm:border-2 border-neutral-300 dark:border-[#2D2D2D] transition duration-300"
      >
        Continue shopping
        {/* dots */}
        <div className="absolute size-2 top-0 left-0 transform -translate-x-3/5 -translate-y-3/5 bg-white dark:bg-black group-hover:bg-black dark:group-hover:bg-white border sm:border-2 border-neutral-300 dark:border-[#2D2D2D] transition duration-300 rounded-full"></div>
        <div className="absolute size-2 top-0 right-0 transform translate-x-3/5 -translate-y-3/5 bg-white dark:bg-black group-hover:bg-black dark:group-hover:bg-white border sm:border-2 border-neutral-300 dark:border-[#2D2D2D] transition duration-300 rounded-full"></div>
        <div className="absolute size-2 bottom-0 left-0 transform -translate-x-3/5 translate-y-3/5 bg-white dark:bg-black group-hover:bg-black dark:group-hover:bg-white border sm:border-2 border-neutral-300 dark:border-[#2D2D2D] transition duration-300 rounded-full"></div>
        <div className="absolute size-2 bottom-0 right-0 transform translate-x-3/5 translate-y-3/5 bg-white dark:bg-black group-hover:bg-black dark:group-hover:bg-white border sm:border-2 border-neutral-300 dark:border-[#2D2D2D] transition duration-300 rounded-full"></div>
      </Link>
    </div>
  );
}
