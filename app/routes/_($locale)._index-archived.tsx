import {type LoaderFunctionArgs} from '@shopify/remix-oxygen';
import {Await, useLoaderData, Link, type MetaFunction} from '@remix-run/react';
import {Suspense} from 'react';
import {Image, Money} from '@shopify/hydrogen';
import type {
  FeaturedCollectionFragment,
  RecommendedProductsQuery,
} from 'storefrontapi.generated';

export const meta: MetaFunction = () => {
  return [{title: 'Krgogoods | Home'}];
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

export default function Homepage() {
  // const data = useLoaderData<typeof loader>();
  const data = [...Array(7)];
  return (
    <>
      <div className="overflow-hidden py-[0.3rem] -my-[0.3rem]">
        <div className="px-10 grid grid-cols-4 translate-x-[1px] translate-y-[1px]">
          {data.map((_, index) => (
            <Product key={index} listLength={data.length} index={index} />
          ))}
        </div>
      </div>
    </>
    // <div>
    //   <FeaturedCollection collection={data.featuredCollection} />
    //   <RecommendedProducts products={data.recommendedProducts} />
    // </div>
  );
}

import Shirt from '~/assets/shirt.png';
import Shirt2 from '~/assets/shirt-2.png';

type ProductProps = {
  listLength: number;
  index: number;
};

function Product({listLength, index}: ProductProps) {
  const isLast = index === listLength - 1;
  const shouldHideRightLines = isLast && (index + 1) % 4 !== 0;

  return (
    <a
      href="/products/hoodie-old?Size=Small&Color=Green"
      className="relative -ml-[2px] -mt-[2px] hover:z-10"
    >
      <div className="relative border-2 border-neutral-300 dark:border-[#2D2D2D] transition duration-300">
        <img
          src={(index + 1) % 2 === 0 ? Shirt : Shirt2}
          alt="Shirt"
          className="p-8 w-full aspect-[1/0.9]"
        />

        {/* lines  */}
        <div className="h-[2px] bg-neutral-300 w-10 absolute -bottom-[2px] -left-10"></div>
        {!shouldHideRightLines && (
          <div className="h-[2px] bg-neutral-300 w-10 absolute -bottom-[2px] -right-10"></div>
        )}

        {/* dots */}
        <div className="absolute size-2 bottom-0 left-0 transform -translate-x-3/5 translate-y-3/5 bg-white border-2 border-neutral-300 dark:border-[#2D2D2D] transition duration-300 rounded-full"></div>
        <div className="absolute size-2 bottom-0 right-0 transform translate-x-3/5 translate-y-3/5 bg-white border-2 border-neutral-300 dark:border-[#2D2D2D] transition duration-300 rounded-full"></div>
      </div>
      <div className="px-[1.13rem] py-[0.88rem] border-2 border-neutral-300 dark:border-[#2D2D2D] transition duration-300 flex items-center justify-between -mt-[2px]">
        <div className="font-bold">T-shirt short sleeve</div>
        <div className="">MMK 42,000</div>
      </div>

      {/* colors */}
      {/* <div className="absolute top-3 left-3 flex flex-col items-center">
        <div className="size-[1.13rem] bg-[#294031] border-2 border-neutral-300 dark:border-[#2D2D2D] transition duration-300 rounded-full"></div>
        <div className="w-[2px] h-2 bg-neutral-300 -my-[1px]"></div>
        <div className="size-[1.13rem] bg-white border-2 border-neutral-300 dark:border-[#2D2D2D] transition duration-300 rounded-full"></div>
        <div className="w-[2px] h-2 bg-neutral-300 -my-[1px]"></div>
        <div className="size-[1.13rem] bg-black border-2 border-neutral-300 dark:border-[#2D2D2D] transition duration-300 rounded-full"></div>
      </div> */}

      {/* lines */}
      <div className="h-[2px] bg-neutral-300 w-10 absolute top-0 -left-10"></div>
      {!shouldHideRightLines && (
        <div className="h-[2px] bg-neutral-300 w-10 absolute top-0 -right-10 right-line"></div>
      )}
      <div className="h-[2px] bg-neutral-300 w-10 absolute bottom-0 -left-10"></div>
      {!shouldHideRightLines && (
        <div className="h-[2px] bg-neutral-300 w-10 absolute bottom-0 -right-10 right-line"></div>
      )}

      {/* dots */}
      <div className="absolute size-2 top-0 left-0 transform -translate-x-2/5 -translate-y-2/5 bg-white border-2 border-neutral-300 dark:border-[#2D2D2D] transition duration-300 rounded-full"></div>
      <div className="absolute size-2 top-0 right-0 transform translate-x-2/5 -translate-y-2/5 bg-white border-2 border-neutral-300 dark:border-[#2D2D2D] transition duration-300 rounded-full"></div>
      <div className="absolute size-2 bottom-0 left-0 transform -translate-x-2/5 translate-y-2/5 bg-white border-2 border-neutral-300 dark:border-[#2D2D2D] transition duration-300 rounded-full"></div>
      <div className="absolute size-2 bottom-0 right-0 transform translate-x-2/5 translate-y-2/5 bg-white border-2 border-neutral-300 dark:border-[#2D2D2D] transition duration-300 rounded-full"></div>
    </a>
  );
}

function FeaturedCollection({
  collection,
}: {
  collection: FeaturedCollectionFragment;
}) {
  if (!collection) return null;
  const image = collection?.image;
  return (
    <Link
      className="featured-collection"
      to={`/collections/${collection.handle}`}
    >
      {image && (
        <div className="featured-collection-image">
          <Image data={image} sizes="100vw" />
        </div>
      )}
      <h1>{collection.title}</h1>
    </Link>
  );
}

function RecommendedProducts({
  products,
}: {
  products: Promise<RecommendedProductsQuery | null>;
}) {
  return (
    <div className="recommended-products">
      <h2>Recommended Products</h2>
      <Suspense fallback={<div>Loading...</div>}>
        <Await resolve={products}>
          {(response) => (
            <div className="recommended-products-grid">
              {response
                ? response.products.nodes.map((product) => (
                    <Link
                      key={product.id}
                      className="recommended-product"
                      to={`/products/${product.handle}`}
                    >
                      <Image
                        data={product.images.nodes[0]}
                        aspectRatio="1/1"
                        sizes="(min-width: 45em) 20vw, 50vw"
                      />
                      <h4>{product.title}</h4>
                      <small>
                        <Money data={product.priceRange.minVariantPrice} />
                      </small>
                    </Link>
                  ))
                : null}
            </div>
          )}
        </Await>
      </Suspense>
      <br />
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
