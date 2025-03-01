import {type LoaderFunctionArgs} from '@shopify/remix-oxygen';
import {Await, useLoaderData, Link, type MetaFunction} from '@remix-run/react';
import {Suspense} from 'react';
import {getPaginationVariables, Image, Money} from '@shopify/hydrogen';
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
async function loadCriticalData({context, request}: LoaderFunctionArgs) {
  const {storefront} = context;
  const paginationVariables = getPaginationVariables(request, {
    pageBy: 8,
  });

  const [{collection}] = await Promise.all([
    storefront.query(COLLECTION_QUERY, {
      variables: {handle: 'featured', ...paginationVariables},
      // Add other queries here, so that they are loaded in parallel
    }),
  ]);

  if (!collection) {
    throw new Response(`Collection "featured" not found`, {
      status: 404,
    });
  }

  return {
    collection,
  };
}

/**
 * Load data for rendering content below the fold. This data is deferred and will be
 * fetched after the initial page load. If it's unavailable, the page should still 200.
 * Make sure to not throw any errors here, as it will cause the page to 500.
 */
function loadDeferredData({context}: LoaderFunctionArgs) {
  return {};
}

export default function Homepage() {
  const {collection} = useLoaderData<typeof loader>();
  console.log(collection.products);

  return (
    <>
      <div className="overflow-hidden py-[0.3rem] -my-[0.3rem]">
        <PaginatedResourceSection
          connection={collection.products}
          resourcesClassName="px-10 grid grid-cols-4 translate-x-[1px] translate-y-[1px]"
        >
          {/* {data.map((_, index) => (
            <Product key={index} listLength={data.length} index={index} />
          ))} */}
          {({node: product, index}) => (
            <Product
              key={index}
              listLength={(collection.products as any).length}
              index={index}
              product={product}
            />
          )}
        </PaginatedResourceSection>
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
import {PaginatedResourceSection} from '~/components/PaginatedResourceSection';
import {useVariantUrl} from '~/lib/variants';

type ProductProps = {
  listLength: number;
  index: number;
  product: any;
};

function Product({listLength, index, product}: ProductProps) {
  console.log(product.title, index);
  const shouldHideRightLines = (index + 1) % 4 !== 0;
  const variantUrl = useVariantUrl(product.handle);

  return (
    <Link
      key={product.id}
      prefetch="intent"
      to={variantUrl}
      className="relative -ml-[2px] -mt-[2px] hover:z-10 group cursor-pointer"
    >
      <div className="relative border-2 border-neutral-300">
        {product.featuredImage && (
          <Image
            alt={product.featuredImage.altText || product.title}
            aspectRatio="1/1"
            data={product.featuredImage}
            loading="lazy"
            sizes="(min-width: 45em) 400px, 100vw"
          />
        )}

        {/* lines  */}
        <div className="h-[2px] bg-neutral-300 w-10 absolute -bottom-[2px] -left-10"></div>
        {!shouldHideRightLines && (
          <div className="h-[2px] bg-neutral-300 w-10 absolute -bottom-[2px] -right-10"></div>
        )}

        {/* dots */}
        <div className="absolute size-2 bottom-0 left-0 transform -translate-x-3/5 translate-y-3/5 bg-white border-2 border-neutral-300 rounded-full transition duration-300 group-hover:bg-black"></div>
        <div className="absolute size-2 bottom-0 right-0 transform translate-x-3/5 translate-y-3/5 bg-white border-2 border-neutral-300 rounded-full transition duration-300 group-hover:bg-black"></div>
      </div>
      <div className="px-[1.13rem] py-[0.88rem] border-2 border-neutral-300 flex items-center justify-between -mt-[2px] transition duration-300 group-hover:bg-black group-hover:text-white">
        <div className="font-bold">{product.title}</div>
        <div className="">
          <Money data={product.priceRange.minVariantPrice} />
        </div>
      </div>

      {/* colors */}
      {/* <div className="absolute top-3 left-3 flex flex-col items-center">
        <div className="size-[1.13rem] bg-[#294031] border-2 border-neutral-300 rounded-full"></div>
        <div className="w-[2px] h-2 bg-neutral-300 -my-[1px]"></div>
        <div className="size-[1.13rem] bg-white border-2 border-neutral-300 rounded-full"></div>
        <div className="w-[2px] h-2 bg-neutral-300 -my-[1px]"></div>
        <div className="size-[1.13rem] bg-black border-2 border-neutral-300 rounded-full"></div>
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
      <div className="absolute size-2 top-0 left-0 transform -translate-x-2/5 -translate-y-2/5 bg-white border-2 border-neutral-300 rounded-full transition duration-300 group-hover:bg-black"></div>
      <div className="absolute size-2 top-0 right-0 transform translate-x-2/5 -translate-y-2/5 bg-white border-2 border-neutral-300 rounded-full transition duration-300 group-hover:bg-black"></div>
      <div className="absolute size-2 bottom-0 left-0 transform -translate-x-2/5 translate-y-2/5 bg-white border-2 border-neutral-300 rounded-full transition duration-300 group-hover:bg-black"></div>
      <div className="absolute size-2 bottom-0 right-0 transform translate-x-2/5 translate-y-2/5 bg-white border-2 border-neutral-300 rounded-full transition duration-300 group-hover:bg-black"></div>
    </Link>
  );
}

const PRODUCT_ITEM_FRAGMENT = `#graphql
  fragment MoneyProductItem on MoneyV2 {
    amount
    currencyCode
  }
  fragment ProductItem on Product {
    id
    handle
    title
    featuredImage {
      id
      altText
      url
      width
      height
    }
    priceRange {
      minVariantPrice {
        ...MoneyProductItem
      }
      maxVariantPrice {
        ...MoneyProductItem
      }
    }
  }
` as const;

// NOTE: https://shopify.dev/docs/api/storefront/2022-04/objects/collection
const COLLECTION_QUERY = `#graphql
  ${PRODUCT_ITEM_FRAGMENT}
  query Collection(
    $handle: String!
    $country: CountryCode
    $language: LanguageCode
    $first: Int
    $last: Int
    $startCursor: String
    $endCursor: String
  ) @inContext(country: $country, language: $language) {
    collection(handle: $handle) {
      id
      handle
      title
      description
      products(
        first: $first,
        last: $last,
        before: $startCursor,
        after: $endCursor
      ) {
        nodes {
          ...ProductItem
        }
        pageInfo {
          hasPreviousPage
          hasNextPage
          endCursor
          startCursor
        }
      }
    }
  }
` as const;
