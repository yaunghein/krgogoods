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

  return <TwoColumnLayout left={<Left />} />;
}

function Left() {
  return (
    <div className="p-4 sm:p-7 text-black dark:text-white transition duration-300">
      <div className="font-[HelveticaNeueBold] text-sm uppercase">Stores</div>
      <div className="mt-7 grid gap-7">
        <div className="grid gap-3">
          <div className="font-[HelveticaNeueBold] text-sm uppercase">
            Myanmar
          </div>
          <div className="grid gap-4">
            <div className="max-w-[25rem] flex flex-col gap-1">
              <div className="text-sm -mb-[0.15rem]">HiGround</div>
              <a
                href="mailto:oakkamin.bee@gmail.com"
                className="text-sm underline"
              >
                oakkamin.bee@gmail.com
              </a>
              <div className="text-sm">
                No. 276 D-1, Corner of Moe Kaung Road & Pyi Thar Yar Street
                (Between City Expressand G&G), Yangon, 11082
              </div>
            </div>
            <div className="max-w-[25rem] flex flex-col gap-1">
              <div className="text-sm -mb-[0.15rem]">Beetage Streetwear</div>
              <a href="tel:+959777975678" className="text-sm underline">
                +959777975678
              </a>
              <div className="text-sm">
                Room No. D(8), Talamon Station (Near The Death Railway Museum),
                Thanbyuzayat, 12092
              </div>
            </div>
            <div className="max-w-[25rem] flex flex-col gap-1">
              <div className="text-sm -mb-[0.15rem]">
                Your Design T-Shirt Collection
              </div>
              <a href="tel:+959770385558" className="text-sm underline">
                +959770385558
              </a>
              <div className="text-sm">
                No. (4/B), Myo Shaung Road, Taung Shan Su, Hlaing Quater,
                Mawlamyine, 12016
              </div>
            </div>
          </div>
        </div>
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
