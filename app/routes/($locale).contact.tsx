import {type LoaderFunctionArgs} from '@shopify/remix-oxygen';
import {
  Await,
  useLoaderData,
  Link,
  type MetaFunction,
  NavLink,
} from '@remix-run/react';
import {Suspense} from 'react';
import {Image, Money} from '@shopify/hydrogen';
import type {
  FeaturedCollectionFragment,
  RecommendedProductsQuery,
} from 'storefrontapi.generated';

export const meta: MetaFunction = () => {
  return [{title: 'Krgogoods | Contact'}];
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
    <div className="p-4 sm:p-7 min-h-full flex flex-col justify-between text-black dark:text-white transition duration-300">
      <div className="h-full">
        <div className="grid gap-4 max-w-[26rem] sm:pb-7">
          <div className="grid gap-1">
            <div className="text-sm uppercase font-[HelveticaNeueBold]">
              Contact Us
            </div>
            <div className="text-sm leading-normal">
              Contact our advisors assigned for client services to learn more
              about the tracking, shipping and return of your orders and sizing
              suggestions and more.
            </div>
          </div>
          <div className="grid gap-1">
            <div className="text-sm uppercase font-[HelveticaNeueBold]">
              Tracking
            </div>
            <div className="text-sm leading-normal">
              Unfortunately, since the tracking section is not currently
              available on our website, we advise you to contact directly to{' '}
              <a href="tel:+959774234928" className="underline">
                +959774234928
              </a>{' '}
              for faster updates on orders tracking.
            </div>
          </div>
          <div className="grid gap-1">
            <div className="text-sm uppercase font-[HelveticaNeueBold]">
              Call
            </div>
            <div className="text-sm leading-normal">
              <a href="tel:+95 9774234928" className="underline">
                +95 9774234928
              </a>{' '}
              /{' '}
              <a href="tel:+95 9977374053" className="underline">
                +95 9977374053
              </a>
            </div>
          </div>
          <div className="grid gap-1">
            <div className="text-sm uppercase font-[HelveticaNeueBold]">
              Email
            </div>
            <a
              href="mailto:hello.krgogoods@gmail.com"
              className="text-sm leading-normal underline"
            >
              hello.krgogoods@gmail.com
            </a>
          </div>
        </div>
      </div>

      <div className="grid gap-2 mt-7 sm:mt-auto">
        <p className="text-sm sm:text-xs">
          For opening times or to contact one of our stores directly
        </p>
        <NavLink
          prefetch="intent"
          to="/locate-stores"
          end
          className="group cursor-pointer block z-10 group text-sm sm:w-1/2 bg-white text-black hover:bg-black hover:text-white dark:bg-black dark:text-white dark:hover:bg-white dark:hover:text-black uppercase font-[HelveticaNeueBold] py-3 text-center w-full relative border sm:border-2 border-neutral-300 dark:border-[#2D2D2D] transition duration-300"
        >
          <div className="translate-y-[0.1rem]">Locate stores</div>
          {/* dots */}
          <div className="absolute size-2 top-0 left-0 transform -translate-x-3/5 -translate-y-3/5 bg-white dark:bg-black group-hover:bg-black dark:group-hover:bg-white border sm:border-2 border-neutral-300 dark:border-[#2D2D2D] transition duration-300 rounded-full"></div>
          <div className="absolute size-2 top-0 right-0 transform translate-x-3/5 -translate-y-3/5 bg-white dark:bg-black group-hover:bg-black dark:group-hover:bg-white border sm:border-2 border-neutral-300 dark:border-[#2D2D2D] transition duration-300 rounded-full"></div>
          <div className="absolute size-2 bottom-0 left-0 transform -translate-x-3/5 translate-y-3/5 bg-white dark:bg-black group-hover:bg-black dark:group-hover:bg-white border sm:border-2 border-neutral-300 dark:border-[#2D2D2D] transition duration-300 rounded-full"></div>
          <div className="absolute size-2 bottom-0 right-0 transform translate-x-3/5 translate-y-3/5 bg-white dark:bg-black group-hover:bg-black dark:group-hover:bg-white border sm:border-2 border-neutral-300 dark:border-[#2D2D2D] transition duration-300 rounded-full"></div>
        </NavLink>
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
