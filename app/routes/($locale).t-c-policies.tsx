import {type LoaderFunctionArgs} from '@shopify/remix-oxygen';
import {Await, useLoaderData, Link, type MetaFunction} from '@remix-run/react';
import {Suspense} from 'react';
import {Image, Money} from '@shopify/hydrogen';
import type {
  FeaturedCollectionFragment,
  RecommendedProductsQuery,
} from 'storefrontapi.generated';

export const meta: MetaFunction = () => {
  return [{title: 'Krgogoods | T&C and Policies'}];
};

export async function loader(args: LoaderFunctionArgs) {
  // Start fetching non-critical data without blocking time to first byte
  const deferredData = loadDeferredData(args);

  // Await the critical data required to render initial state of the page
  const criticalData = await loadCriticalData(args);

  return {...deferredData, ...criticalData};
}

/**
 * Load data necessary for rendering content above the fold. This is the critical data
 * needed to render the page. If it's unavailable, the whole page should 400 or 500 error.
 */
async function loadCriticalData({context}: LoaderFunctionArgs) {
  const [{collections}] = await Promise.all([
    context.storefront.query(FEATURED_COLLECTION_QUERY),
    // Add other queries here, so that they are loaded in parallel
  ]);

  return {
    featuredCollection: collections.nodes[0],
  };
}

/**
 * Load data for rendering content below the fold. This data is deferred and will be
 * fetched after the initial page load. If it's unavailable, the page should still 200.
 * Make sure to not throw any errors here, as it will cause the page to 500.
 */
function loadDeferredData({context}: LoaderFunctionArgs) {
  const recommendedProducts = context.storefront
    .query(RECOMMENDED_PRODUCTS_QUERY)
    .catch((error) => {
      // Log query errors, but don't throw them so the page can still render
      console.error(error);
      return null;
    });

  return {
    recommendedProducts,
  };
}

import {TwoColumnLayout} from '~/components/TwoColumnLayout';

export default function Homepage() {
  // const data = useLoaderData<typeof loader>();

  return <TwoColumnLayout left={<Left />} right={<Right />} />;
}

function Left() {
  return (
    <div className="p-7 h-full">
      <div className="font-bold text-sm uppercase">privacy policy</div>
      <p className="text-sm mt-3">
        Welcome to KRGOGOODS ("we," "our," or "us"). Your privacy is important
        to us. This Privacy Policy explains how we collect, use, disclose, and
        safeguard your information when you visit our website KRGOGOODS.com. By
        using our services, you agree to the terms of this policy.
      </p>

      <div className="mt-3">
        <div className="text-sm">1. Information We Collect</div>
        <div className="text-sm">
          We collect the following types of information:
        </div>
        <ul className="list-disc pl-5">
          <li className="text-sm">
            Personal Information: Name, email address, phone number, billing and
            shipping address, and payment details.
          </li>
          <li className="text-sm">
            Non-Personal Information: IP address, browser type, device
            information, and browsing behavior.
          </li>
          <li className="text-sm">
            Cookies and Tracking Technologies: To improve user experience and
            analyze website traffic.
          </li>
        </ul>
      </div>
    </div>
  );
}

function Right() {
  return (
    <div className="p-7 h-full">
      <div className="font-bold text-sm uppercase">privacy policy</div>
      <p className="text-sm mt-3">
        Welcome to KRGOGOODS ("we," "our," or "us"). Your privacy is important
        to us. This Privacy Policy explains how we collect, use, disclose, and
        safeguard your information when you visit our website KRGOGOODS.com. By
        using our services, you agree to the terms of this policy.
      </p>

      <div className="mt-3">
        <div className="text-sm">1. Information We Collect</div>
        <div className="text-sm">
          We collect the following types of information:
        </div>
        <ul className="list-disc pl-5">
          <li className="text-sm">
            Personal Information: Name, email address, phone number, billing and
            shipping address, and payment details.
          </li>
          <li className="text-sm">
            Non-Personal Information: IP address, browser type, device
            information, and browsing behavior.
          </li>
          <li className="text-sm">
            Cookies and Tracking Technologies: To improve user experience and
            analyze website traffic.
          </li>
        </ul>
      </div>
    </div>
  );
}

const FEATURED_COLLECTION_QUERY = `#graphql
  fragment FeaturedCollection on Collection {
    id
    title
    image {
      id
      url
      altText
      width
      height
    }
    handle
  }
  query FeaturedCollection($country: CountryCode, $language: LanguageCode)
    @inContext(country: $country, language: $language) {
    collections(first: 1, sortKey: UPDATED_AT, reverse: true) {
      nodes {
        ...FeaturedCollection
      }
    }
  }
` as const;

const RECOMMENDED_PRODUCTS_QUERY = `#graphql
  fragment RecommendedProduct on Product {
    id
    title
    handle
    priceRange {
      minVariantPrice {
        amount
        currencyCode
      }
    }
    images(first: 1) {
      nodes {
        id
        url
        altText
        width
        height
      }
    }
  }
  query RecommendedProducts ($country: CountryCode, $language: LanguageCode)
    @inContext(country: $country, language: $language) {
    products(first: 4, sortKey: UPDATED_AT, reverse: true) {
      nodes {
        ...RecommendedProduct
      }
    }
  }
` as const;
