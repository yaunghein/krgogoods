import {type LoaderFunctionArgs} from '@shopify/remix-oxygen';
import {Await, useLoaderData, Link, type MetaFunction} from '@remix-run/react';
import {Suspense} from 'react';
import {Image, Money} from '@shopify/hydrogen';
import type {
  FeaturedCollectionFragment,
  RecommendedProductsQuery,
} from 'storefrontapi.generated';
import {useNavigate, useLocation} from '@remix-run/react';

export const meta: MetaFunction = () => {
  return [{title: 'Krgogoods | FAQ'}];
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

type AccordionProps = {
  header: React.ReactNode;
  body: React.ReactNode;
  initialOpen?: boolean;
};

function Accordion({header, body, initialOpen}: AccordionProps) {
  const [isOpen, setIsOpen] = useState(initialOpen || false);

  return (
    <div className="grid gap-6">
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center relative w-full cursor-pointer"
      >
        <div className="text-xs uppercase">{header}</div>
        <div
          className={cn(
            'ml-auto sm:absolute left-[18.25rem] size-2 sm:size-3 rounded-full border sm:border-2 border-neutral-300 dark:border-[#2D2D2D] transition duration-300 transition',
            isOpen ? 'bg-black' : 'bg-white',
          )}
        ></div>
      </div>
      {isOpen && body}
    </div>
  );
}

import SizeFitShirt from '~/assets/size-fit-shirt.jpg';
import SizeFitChart from '~/assets/size-fit-chart.jpg';
import {useState} from 'react';
import {cn} from '~/utils/cn';
function SizeFit() {
  const [type, setType] = useState('inches');
  return (
    <div className="flex flex-col sm:flex-row gap-5">
      <div className="shrink-0 w-[8rem] sm:w-[11.56rem] aspect-[1/0.82]">
        <img src={SizeFitShirt} alt="" className="w-full h-full" />
      </div>
      <div className="grid gap-3">
        <div className="flex gap-1">
          <button
            onClick={() => setType('cm')}
            className={cn(
              type === 'cm' ? 'opacity-100' : 'opacity-20',
              'transition uppercase text-xs cursor-pointer',
            )}
          >
            CM
          </button>
          <button
            onClick={() => setType('inches')}
            className={cn(
              type === 'inches' ? 'opacity-100' : 'opacity-20',
              'transition uppercase text-xs cursor-pointer',
            )}
          >
            Inches
          </button>
        </div>
        {type === 'cm' && (
          <div className="flex-1 aspect-[1/0.33] rotate-180">
            <img src={SizeFitChart} alt="" />
          </div>
        )}
        {type === 'inches' && (
          <div className="flex-1 aspect-[1/0.33]">
            <img src={SizeFitChart} alt="" />
          </div>
        )}
      </div>
    </div>
  );
}

function Left() {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div className="p-4 sm:p-7 h-full flex flex-col justify-between">
      <div className="grid gap-4">
        <Accordion
          header={<div className="font-bold">SHIPPING AND DELIVERY</div>}
          body={<SizeFit />}
        />
        <Accordion
          header={<div className="font-bold">RETURNS AND EXCHANGES</div>}
          body={<SizeFit />}
        />
        <Accordion
          header={<div className="font-bold">ORDER AND TRACKING</div>}
          body={<SizeFit />}
        />
        <Accordion
          header={<div className="font-bold">SIZE AND FIT</div>}
          body={<SizeFit />}
        />
      </div>

      <button
        onClick={() => {
          const currentPath = location.pathname;
          const newUrl = `${currentPath}?select-store=true`;
          navigate(newUrl, {replace: true});
        }}
        className="mt-7 sm:mt-0 block text-xs cursor-pointer bg-black text-white uppercase font-bold py-3 text-center sm:w-1/2 relative border sm:border-2 border-neutral-300 dark:border-[#2D2D2D] transition duration-300"
      >
        MYanmar (Select Store)
        {/* dots */}
        <div className="absolute size-2 top-0 left-0 transform -translate-x-3/5 -translate-y-3/5 bg-black border sm:border-2 border-neutral-300 dark:border-[#2D2D2D] transition duration-300 rounded-full"></div>
        <div className="absolute size-2 top-0 right-0 transform translate-x-3/5 -translate-y-3/5 bg-black border sm:border-2 border-neutral-300 dark:border-[#2D2D2D] transition duration-300 rounded-full"></div>
        <div className="absolute size-2 bottom-0 left-0 transform -translate-x-3/5 translate-y-3/5 bg-black border sm:border-2 border-neutral-300 dark:border-[#2D2D2D] transition duration-300 rounded-full"></div>
        <div className="absolute size-2 bottom-0 right-0 transform translate-x-3/5 translate-y-3/5 bg-black border sm:border-2 border-neutral-300 dark:border-[#2D2D2D] transition duration-300 rounded-full"></div>
      </button>
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
