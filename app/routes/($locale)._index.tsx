import {type LoaderFunctionArgs} from '@shopify/remix-oxygen';
import {Await, useLoaderData, Link, type MetaFunction} from '@remix-run/react';
import {Suspense} from 'react';
import {
  getPaginationVariables,
  Image,
  Money,
  getProductOptions,
} from '@shopify/hydrogen';
import type {
  FeaturedCollectionFragment,
  RecommendedProductsQuery,
} from 'storefrontapi.generated';
import OgImage from '~/assets/og-image.jpg';

// export const meta: MetaFunction = () => {
//   return [{title: 'Krgogoods | Products'}];
// };

export const meta: MetaFunction = () => {
  const title = 'Krgogoods | Quality Products';
  const description =
    "Explore Krgogoods' exclusive collection of high-quality streetwear, including T-shirts, hoodies, and accessories. Elevate your style with our unique designs.";
  const url = 'https://www.krgogoods.com/';
  const image = OgImage;

  return [
    {title},
    {name: 'description', content: description},
    {property: 'og:title', content: title},
    {property: 'og:description', content: description},
    {property: 'og:type', content: 'website'},
    {property: 'og:url', content: url},
    {property: 'og:image', content: image},
    {name: 'twitter:card', content: 'summary_large_image'},
    {name: 'twitter:title', content: title},
    {name: 'twitter:description', content: description},
    {name: 'twitter:image', content: image},
    {
      name: 'keywords',
      content: 'Krgogoods, streetwear, fashion, T-shirts, hoodies, accessories',
    },
    {name: 'robots', content: 'index, follow'},
    {charset: 'utf-8'},
    {name: 'viewport', content: 'width=device-width, initial-scale=1'},
  ];
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
import {localizationCookie} from '../cookie.server';

async function loadCriticalData({context, request}: LoaderFunctionArgs) {
  const {storefront} = context;
  const paginationVariables = getPaginationVariables(request, {
    pageBy: 250,
  });

  const cookieHeader = request.headers.get('Cookie');
  const country = await localizationCookie.parse(cookieHeader);

  const [{collection}] = await Promise.all([
    storefront.query(COLLECTION_QUERY, {
      variables: {
        handle: 'all',
        country: country || 'MM',
        ...paginationVariables,
      },
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

  return (
    <>
      <div className="overflow-hidden py-[0.3rem] -my-[0.3rem]">
        <PaginatedResourceSection
          connection={collection.products}
          resourcesClassName="px-8 sm:px-10 grid sm:grid-cols-4 translate-x-[1px] translate-y-[1px]"
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
import {cn} from '~/utils/cn';

type ProductProps = {
  listLength: number;
  index: number;
  product: any;
};

function Product({index, product}: ProductProps) {
  const shouldHideRightLines = (index + 1) % 4 !== 0;
  const variantUrl = useVariantUrl(product.handle);

  const availableColors = product.options
    ?.find((o: any) => o.name === 'Color')
    ?.optionValues?.map((v: any) => v.swatch?.color);

  return (
    <Link
      key={product.id}
      prefetch="intent"
      to={variantUrl}
      className="group relative sm:-ml-[2px] -ml-[1px] -mt-[1px] sm:-mt-[2px] cursor-pointer"
    >
      <div className="relative border sm:border-2 border-neutral-300 dark:border-[#2D2D2D] transition duration-300">
        {!product.media.edges.length && product.featuredImage && (
          <Image
            alt={product.featuredImage.altText || product.title}
            aspectRatio="1/1"
            data={product.featuredImage}
            loading="lazy"
            sizes="(min-width: 45em) 400px, 100vw"
          />
        )}

        <div className="w-full aspect-square relative">
          <div
            className={cn(
              'w-full h-full absolute inset-0',
              product.media.edges[1] &&
                'group-hover:opacity-0 transition duration-300',
            )}
          >
            <img
              src={product.media.edges[0]?.node?.image?.url}
              alt={product.media.edges[0]?.node?.image?.altText}
              className="w-full h-full object-cover"
            />
          </div>
          {product.media.edges[1] && (
            <div className="font-another w-full h-full absolute inset-0 opacity-0 group-hover:opacity-100 transition duration-300">
              <img
                src={product.media.edges[1]?.node?.image?.url}
                alt={product.media.edges[1]?.node?.image?.altText}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* {availableColors && (
            <div className="flex flex-col gap-2 absolute top-3 left-3">
              {availableColors.map((color: string, i: number) => (
                <div key={color}>
                  <div className="relative">
                    <div
                      style={{backgroundColor: color}}
                      className={cn(
                        'size-4 rounded-full border sm:border-2 cursor-pointer border-neutral-300 dark:border-[#2D2D2D]',
                      )}
                    ></div>
                    {i !== availableColors.length - 1 && (
                      <div className="w-[1px] sm:w-[2px] bg-neutral-300 dark:bg-[#2D2D2D] h-3 absolute -bottom-3 left-1/2 -translate-x-1/2"></div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )} */}
        </div>

        {/* lines  */}
        <div className="h-[1px] sm:h-[2px] bg-neutral-300 dark:bg-[#2D2D2D] transition duration-300 w-10 absolute -bottom-[2px] -left-10"></div>
        <div
          className={cn(
            'h-[1px] sm:h-[2px] bg-neutral-300 dark:bg-[#2D2D2D] transition duration-300 w-10 absolute -bottom-[2px] -right-10',
            shouldHideRightLines && 'sm:hidden',
          )}
        ></div>

        {/* dots */}
        <div className="absolute size-2 bottom-0 left-0 transform -translate-x-3/5 translate-y-3/5 bg-white dark:bg-black border sm:border-2 border-neutral-300 dark:border-[#2D2D2D] rounded-full transition duration-300"></div>
        <div className="absolute size-2 bottom-0 right-0 transform translate-x-3/5 translate-y-3/5 bg-white dark:bg-black border sm:border-2 border-neutral-300 dark:border-[#2D2D2D] rounded-full transition duration-300"></div>
      </div>
      <div className="dark:text-white px-[1.13rem] py-[0.88rem] border sm:border-2 border-neutral-300 dark:border-[#2D2D2D] flex gap-1 flex-col sm:flex-row items-center justify-between -mt-[1px] sm:-mt-[2px] transition duration-300">
        <div className="font-[HelveticaNeueBold] uppercase text-xs sm:text-sm text-black dark:text-white transition duration-300">
          {product.title}
        </div>
        <div className="text-xs sm:text-sm uppercase text-black dark:text-white transition duration-300">
          <Money data={product.priceRange.minVariantPrice} />
        </div>
      </div>

      {/* colors */}
      {/* <div className="absolute top-3 left-3 flex flex-col items-center">
        <div className="size-[1.13rem] bg-[#294031] border sm:border-2 border-neutral-300 dark:border-[#2D2D2D] transition duration-300 rounded-full"></div>
        <div className="w-[2px] h-2 bg-neutral-300 dark:bg-[#2D2D2D] transition duration-300 -my-[1px]"></div>
        <div className="size-[1.13rem] bg-white dark:bg-black border sm:border-2 border-neutral-300 dark:border-[#2D2D2D] transition duration-300 rounded-full"></div>
        <div className="w-[2px] h-2 bg-neutral-300 dark:bg-[#2D2D2D] transition duration-300 -my-[1px]"></div>
        <div className="size-[1.13rem] bg-black border sm:border-2 border-neutral-300 dark:border-[#2D2D2D] transition duration-300 rounded-full"></div>
      </div> */}

      {/* lines */}
      <div className="h-[1px] sm:h-[2px] bg-neutral-300 dark:bg-[#2D2D2D] transition duration-300 w-10 absolute top-0 -left-10"></div>
      <div
        className={cn(
          'h-[1px] sm:h-[2px] bg-neutral-300 dark:bg-[#2D2D2D] transition duration-300 w-10 absolute top-0 -right-10',
          shouldHideRightLines && 'sm:hidden',
        )}
      ></div>
      <div className="h-[1px] sm:h-[2px] bg-neutral-300 dark:bg-[#2D2D2D] transition duration-300 w-10 absolute bottom-0 -left-10"></div>
      <div
        className={cn(
          'h-[1px] sm:h-[2px] bg-neutral-300 dark:bg-[#2D2D2D] transition duration-300 w-10 absolute bottom-0 -right-10',
          shouldHideRightLines && 'sm:hidden',
        )}
      ></div>

      {/* dots */}
      <div className="absolute size-2 top-0 left-0 transform -translate-x-2/5 -translate-y-2/5 bg-white dark:bg-black border sm:border-2 border-neutral-300 dark:border-[#2D2D2D] rounded-full transition duration-300"></div>
      <div className="absolute size-2 top-0 right-0 transform translate-x-2/5 -translate-y-2/5 bg-white dark:bg-black border sm:border-2 border-neutral-300 dark:border-[#2D2D2D] rounded-full transition duration-300"></div>
      <div className="absolute size-2 bottom-0 left-0 transform -translate-x-2/5 translate-y-2/5 bg-white dark:bg-black border sm:border-2 border-neutral-300 dark:border-[#2D2D2D] rounded-full transition duration-300"></div>
      <div className="absolute size-2 bottom-0 right-0 transform translate-x-2/5 translate-y-2/5 bg-white dark:bg-black border sm:border-2 border-neutral-300 dark:border-[#2D2D2D] rounded-full transition duration-300"></div>
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
    media(first: 2) {
      edges {
        node {
          ... on MediaImage {
            image {
              id
              altText
              url
              width
              height
            }
          }
        }
      }
    }
    options {
      name
      optionValues {
        name
        swatch {
          color
          image {
            previewImage {
              url
            }
          }
        }
      }
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
