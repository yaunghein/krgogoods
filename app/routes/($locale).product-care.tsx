import {type LoaderFunctionArgs} from '@shopify/remix-oxygen';
import {Await, useLoaderData, Link, type MetaFunction} from '@remix-run/react';
import {Suspense} from 'react';
import {Image, Money} from '@shopify/hydrogen';
import type {
  FeaturedCollectionFragment,
  RecommendedProductsQuery,
} from 'storefrontapi.generated';

export const meta: MetaFunction = () => {
  return [{title: 'Krgogoods | Product Care'}];
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
import {useState} from 'react';
export default function Homepage() {
  // const data = useLoaderData<typeof loader>();
  const [type, setType] = useState<'cm' | 'inches'>('inches');
  return <TwoColumnLayout left={<Left type={type} setType={setType} />} />;
}

import SizeFitShirt from '~/assets/size-fit-shirt.jpg';
import SizeFitChart from '~/assets/size-fit-chart.jpg';
import {cn} from '~/utils/cn';

function Left({
  type,
  setType,
}: {
  type: 'cm' | 'inches';
  setType: (type: 'cm' | 'inches') => void;
}) {
  return (
    <div className="p-4 sm:p-7">
      <div className="flex items-center gap-6">
        <div className="font-[HelveticaNeueBold] text-sm uppercase">
          Product Care
        </div>
      </div>

      <div className="grid gap-6 mt-10">
        {[...Array(3)].map((i) => (
          <div key={i}>
            <div className="!text-xs uppercase">Man Tops</div>
            <div className="flex flex-col sm:flex-row gap-5">
              <div className="shrink-0 w-[8rem] sm:w-[11rem] aspect-[1/0.82]">
                <img src={SizeFitShirt} alt="" className="w-full h-full" />
              </div>
              <div className="grid gap-3">
                {type === 'cm' && (
                  <div className="w-full sm:w-[27rem] aspect-[1/0.33] rotate-180">
                    <img src={SizeFitChart} alt="" />
                  </div>
                )}
                {type === 'inches' && (
                  <div className="w-full sm:w-[27rem] aspect-[1/0.33]">
                    <img src={SizeFitChart} alt="" />
                  </div>
                )}
              </div>
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
