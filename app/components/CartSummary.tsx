import type {CartApiQueryFragment} from 'storefrontapi.generated';
import type {CartLayout} from '~/components/CartMain';
import {CartForm, Money, type OptimisticCart} from '@shopify/hydrogen';
import {useRef} from 'react';
import {FetcherWithComponents} from '@remix-run/react';

type CartSummaryProps = {
  cart: OptimisticCart<CartApiQueryFragment | null>;
  layout: CartLayout;
};

import Payments from '~/assets/payments.jpg';
import MMPayments from '~/assets/mm-payments.svg';

export function CartSummary({cart, layout}: CartSummaryProps) {
  const className =
    layout === 'page' ? 'cart-summary-page' : 'cart-summary-aside';

  return (
    <div className="sm:mt-10 p-4 sm:p-7">
      <div className="mb-5">
        <div className="flex items-center justify-between w-fill sm:w-1/2">
          <div className="font-[HelveticaNeueBold] uppercase text-sm">
            TOTAL inc. taxes
          </div>
          <div className="max-w-[7rem] text-sm uppercase">
            {cart.cost?.subtotalAmount?.amount ? (
              <Money data={cart.cost?.subtotalAmount} />
            ) : (
              '-'
            )}
          </div>
        </div>
      </div>
      <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-7">
        <div className="w-full sm:w-1/2">
          <CartCheckoutActions checkoutUrl={cart.checkoutUrl} />
        </div>
        <img
          src={MMPayments}
          alt=""
          className="w-[7.44rem] dark:invert transition duration-300 aspect-[1/0.29]"
        />
      </div>
    </div>
  );
}

function CartCheckoutActions({checkoutUrl}: {checkoutUrl?: string}) {
  if (!checkoutUrl) return null;

  return (
    <a
      href="/checkout"
      target="_self"
      className="block text-xs bg-black text-white uppercase font-[HelveticaNeueBold] py-3 text-center w-full relative border sm:border-2 border-neutral-300 dark:border-[#2D2D2D] transition duration-300"
    >
      {/* <a
      href={checkoutUrl}
      target="_self"
      className="block text-xs bg-black text-white uppercase font-[HelveticaNeueBold] py-3 text-center w-full relative border sm:border-2 border-neutral-300 dark:border-[#2D2D2D] transition duration-300"
    > */}
      <div className="translate-y-[0.1rem]">Checkout</div>
      {/* <p>Continue to Checkout &rarr;</p> */}
      {/* dots */}
      <div className="absolute size-2 top-0 left-0 transform -translate-x-3/5 -translate-y-3/5 bg-black border sm:border-2 border-neutral-300 dark:border-[#2D2D2D] transition duration-300 rounded-full"></div>
      <div className="absolute size-2 top-0 right-0 transform translate-x-3/5 -translate-y-3/5 bg-black border sm:border-2 border-neutral-300 dark:border-[#2D2D2D] transition duration-300 rounded-full"></div>
      <div className="absolute size-2 bottom-0 left-0 transform -translate-x-3/5 translate-y-3/5 bg-black border sm:border-2 border-neutral-300 dark:border-[#2D2D2D] transition duration-300 rounded-full"></div>
      <div className="absolute size-2 bottom-0 right-0 transform translate-x-3/5 translate-y-3/5 bg-black border sm:border-2 border-neutral-300 dark:border-[#2D2D2D] transition duration-300 rounded-full"></div>
    </a>
  );
}

function CartDiscounts({
  discountCodes,
}: {
  discountCodes?: CartApiQueryFragment['discountCodes'];
}) {
  const codes: string[] =
    discountCodes
      ?.filter((discount) => discount.applicable)
      ?.map(({code}) => code) || [];

  return (
    <div>
      {/* Have existing discount, display it with a remove option */}
      <dl hidden={!codes.length}>
        <div>
          <dt>Discount(s)</dt>
          <UpdateDiscountForm>
            <div className="cart-discount">
              <code>{codes?.join(', ')}</code>
              &nbsp;
              <button>Remove</button>
            </div>
          </UpdateDiscountForm>
        </div>
      </dl>

      {/* Show an input to apply a discount */}
      <UpdateDiscountForm discountCodes={codes}>
        <div>
          <input type="text" name="discountCode" placeholder="Discount code" />
          &nbsp;
          <button type="submit">Apply</button>
        </div>
      </UpdateDiscountForm>
    </div>
  );
}

function UpdateDiscountForm({
  discountCodes,
  children,
}: {
  discountCodes?: string[];
  children: React.ReactNode;
}) {
  return (
    <CartForm
      route="/cart"
      action={CartForm.ACTIONS.DiscountCodesUpdate}
      inputs={{
        discountCodes: discountCodes || [],
      }}
    >
      {children}
    </CartForm>
  );
}

function CartGiftCard({
  giftCardCodes,
}: {
  giftCardCodes: CartApiQueryFragment['appliedGiftCards'] | undefined;
}) {
  const appliedGiftCardCodes = useRef<string[]>([]);
  const giftCardCodeInput = useRef<HTMLInputElement>(null);
  const codes: string[] =
    giftCardCodes?.map(({lastCharacters}) => `***${lastCharacters}`) || [];

  function saveAppliedCode(code: string) {
    const formattedCode = code.replace(/\s/g, ''); // Remove spaces
    if (!appliedGiftCardCodes.current.includes(formattedCode)) {
      appliedGiftCardCodes.current.push(formattedCode);
    }
    giftCardCodeInput.current!.value = '';
  }

  function removeAppliedCode() {
    appliedGiftCardCodes.current = [];
  }

  return (
    <div>
      {/* Have existing gift card applied, display it with a remove option */}
      <dl hidden={!codes.length}>
        <div>
          <dt>Applied Gift Card(s)</dt>
          <UpdateGiftCardForm>
            <div className="cart-discount">
              <code>{codes?.join(', ')}</code>
              &nbsp;
              <button onSubmit={() => removeAppliedCode}>Remove</button>
            </div>
          </UpdateGiftCardForm>
        </div>
      </dl>

      {/* Show an input to apply a discount */}
      <UpdateGiftCardForm
        giftCardCodes={appliedGiftCardCodes.current}
        saveAppliedCode={saveAppliedCode}
      >
        <div>
          <input
            type="text"
            name="giftCardCode"
            placeholder="Gift card code"
            ref={giftCardCodeInput}
          />
          &nbsp;
          <button type="submit">Apply</button>
        </div>
      </UpdateGiftCardForm>
    </div>
  );
}

function UpdateGiftCardForm({
  giftCardCodes,
  saveAppliedCode,
  children,
}: {
  giftCardCodes?: string[];
  saveAppliedCode?: (code: string) => void;
  removeAppliedCode?: () => void;
  children: React.ReactNode;
}) {
  return (
    <CartForm
      route="/cart"
      action={CartForm.ACTIONS.GiftCardCodesUpdate}
      inputs={{
        giftCardCodes: giftCardCodes || [],
      }}
    >
      {(fetcher: FetcherWithComponents<any>) => {
        const code = fetcher.formData?.get('giftCardCode');
        if (code && saveAppliedCode) {
          saveAppliedCode(code as string);
        }
        return children;
      }}
    </CartForm>
  );
}
