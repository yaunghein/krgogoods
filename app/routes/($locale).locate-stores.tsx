import {type LoaderFunctionArgs} from '@shopify/remix-oxygen';
import {Await, useLoaderData, Link, type MetaFunction} from '@remix-run/react';
import {Suspense} from 'react';
import {Image, Money} from '@shopify/hydrogen';
import type {
  FeaturedCollectionFragment,
  RecommendedProductsQuery,
} from 'storefrontapi.generated';

export const meta: MetaFunction = () => {
  return [{title: 'Krgogoods | Locate Stores'}];
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

const locations = [
  {
    country: 'Myanmar',
    info: [
      '56A Mahabandoola Road, Lanmadaw Township',
      'Yangon, Myanmar 11131',
      'Phone: +95 9 4567 1234',
    ],
  },
  {
    country: 'Singapore',
    info: [
      '12 Orchard Boulevard, Level 5',
      'Singapore 238875',
      'Phone: +65 6789 1234',
    ],
  },
  {
    country: 'Thailand',
    info: [
      '88 Sukhumvit Soi 22, Khlong Toei',
      'Bangkok 10110, Thailand',
      'Phone: +66 2-345-6789',
    ],
  },
  {
    country: 'Japan',
    info: [
      '3-14-5 Shibuya, Shibuya-ku',
      'Tokyo 150-0002, Japan',
      'Phone: +81 3-9876-5432',
    ],
  },
];

function Left() {
  return (
    <div className="p-7">
      <div className="font-bold text-sm uppercase">Stores</div>
      <div className="mt-7 grid gap-7">
        {locations.map((location) => (
          <div key={location.country} className="grid gap-3 ">
            <div className="font-bold text-sm uppercase">
              {location.country}
            </div>
            <div>
              {location.info.map((info) => (
                <div key={info} className="text-sm">
                  {info}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Right() {
  return <></>;
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
