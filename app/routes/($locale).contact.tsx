import {type LoaderFunctionArgs} from '@shopify/remix-oxygen';
import {Await, useLoaderData, Link, type MetaFunction} from '@remix-run/react';
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

  return <TwoColumnLayout left={<Left />} right={<Right />} />;
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
            'absolute left-[18.25rem] size-3 rounded-full  border-2 border-neutral-300 transition',
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
    <div className="flex gap-5">
      <div className="shrink-0 w-[11.56rem] aspect-[1/0.82]">
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
  return (
    <div className="p-7 h-full flex flex-col justify-between">
      <div className="grid gap-7">
        <div className="grid gap-2">
          <div className="font-bold text-sm uppercase">Contact us</div>
          <div className="text-sm max-w-[21rem]">
            Contact our client services advisors to receive personalised support
            on product related inquiries, tailored recommendations and styling
            advice, suggestions on gifts, account management and more.
          </div>
        </div>
        <div className="grid gap-2">
          <div className="font-bold text-sm uppercase">CALL</div>
          <div className="text-sm max-w-[21rem]">+95 12 123 12 31</div>
        </div>
        <div className="grid gap-2">
          <div className="font-bold text-sm uppercase">EMAIL</div>
          <div className="text-sm max-w-[21rem]">
            clientservices@krgogoods.com
          </div>
        </div>
      </div>

      <div className="grid gap-2">
        <p className="text-[0.65rem]">
          For opening times or to contact one of our stores directly
        </p>
        <button className="block text-xs cursor-pointer bg-black text-white uppercase font-bold py-3 text-center w-1/2 relative border-2 border-neutral-300">
          Locate stores
          {/* dots */}
          <div className="absolute size-2 top-0 left-0 transform -translate-x-3/5 -translate-y-3/5 bg-black border-2 border-neutral-300 rounded-full"></div>
          <div className="absolute size-2 top-0 right-0 transform translate-x-3/5 -translate-y-3/5 bg-black border-2 border-neutral-300 rounded-full"></div>
          <div className="absolute size-2 bottom-0 left-0 transform -translate-x-3/5 translate-y-3/5 bg-black border-2 border-neutral-300 rounded-full"></div>
          <div className="absolute size-2 bottom-0 right-0 transform translate-x-3/5 translate-y-3/5 bg-black border-2 border-neutral-300 rounded-full"></div>
        </button>
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
