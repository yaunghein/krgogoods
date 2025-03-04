import {
  type LoaderFunctionArgs,
  type ActionFunctionArgs,
} from '@shopify/remix-oxygen';
import {
  redirect,
  type AppLoadContext,
  type ActionFunction,
} from '@shopify/remix-oxygen';
import {localizationCookie} from '~/cookie.server';
import invariant from 'tiny-invariant';
import type {
  CountryCode,
  LanguageCode,
  CartBuyerIdentityInput,
  Cart,
} from '@shopify/hydrogen/storefront-api-types';

export async function loader({params, context}: LoaderFunctionArgs) {
  const {language, country} = context.storefront.i18n;

  if (
    params.locale &&
    params.locale.toLowerCase() !== `${language}-${country}`.toLowerCase()
  ) {
    // If the locale URL param is defined, yet we still are still at the default locale
    // then the the locale param must be invalid, send to the 404 page
    throw new Response(null, {status: 404});
  }

  return null;
}

export async function action({request, context}: ActionFunctionArgs) {
  const formData = await request.formData();
  const country = formData.get('country');
  const {cart} = context;
  const cartId = cart.getCartId();

  if (cartId) {
    await updateCartBuyerIdentity(context, {
      cartId,
      buyerIdentity: {
        countryCode: country as CountryCode,
      },
    });
  }

  const url =
    process.env.NODE_ENV === 'development'
      ? 'http://localhost:3000'
      : 'https://www.krgogoods.com/';

  return redirect(url, {
    headers: {
      'Set-Cookie': await localizationCookie.serialize(country),
    },
  });
}

async function updateCartBuyerIdentity(
  {storefront}: AppLoadContext,
  {
    cartId,
    buyerIdentity,
  }: {
    cartId: string;
    buyerIdentity: CartBuyerIdentityInput;
  },
) {
  const data = await storefront.mutate<{
    cartBuyerIdentityUpdate: {cart: Cart};
  }>(UPDATE_CART_BUYER_COUNTRY, {
    variables: {
      cartId,
      buyerIdentity,
    },
  });

  invariant(data, 'No data returned from Shopify API');

  return data.cartBuyerIdentityUpdate.cart;
}

const UPDATE_CART_BUYER_COUNTRY = `#graphql
  mutation CartBuyerIdentityUpdate(
    $cartId: ID!
    $buyerIdentity: CartBuyerIdentityInput!
  ) {
    cartBuyerIdentityUpdate(cartId: $cartId, buyerIdentity: $buyerIdentity) {
      cart {
        id
      }
    }
  }
`;
