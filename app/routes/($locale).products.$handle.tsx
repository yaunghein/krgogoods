import {type LoaderFunctionArgs} from '@shopify/remix-oxygen';
import {Link, useNavigate} from '@remix-run/react';
import {useLoaderData, type MetaFunction} from '@remix-run/react';
import {
  getSelectedProductOptions,
  Analytics,
  useOptimisticVariant,
  getProductOptions,
  getAdjacentAndFirstAvailableVariants,
  useSelectedOptionInUrlParam,
} from '@shopify/hydrogen';
import {ProductPrice} from '~/components/ProductPrice';
import {ProductImage} from '~/components/ProductImage';
import {ProductForm, ProductOptionSwatch} from '~/components/ProductForm';
import {TwoColumnLayout} from '~/components/TwoColumnLayout';
import {cn} from '~/utils/cn';
import {useEffect, useState} from 'react';

export const meta: MetaFunction<typeof loader> = ({data}) => {
  return [
    {title: `Krgogoods | ${data?.product.title ?? ''}`},
    {
      rel: 'canonical',
      href: `/products/${data?.product.handle}`,
    },
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
async function loadCriticalData({
  context,
  params,
  request,
}: LoaderFunctionArgs) {
  const {handle} = params;
  const {storefront} = context;

  if (!handle) {
    throw new Error('Expected product handle to be defined');
  }

  const cookieHeader = request.headers.get('Cookie');
  const country = await localizationCookie.parse(cookieHeader);

  const [{product}] = await Promise.all([
    storefront.query(PRODUCT_QUERY, {
      variables: {
        handle,
        country: country || 'MM',
        selectedOptions: getSelectedProductOptions(request),
      },
    }),
    // Add other queries here, so that they are loaded in parallel
  ]);

  if (!product?.id) {
    throw new Response(null, {status: 404});
  }

  return {
    product,
  };
}

/**
 * Load data for rendering content below the fold. This data is deferred and will be
 * fetched after the initial page load. If it's unavailable, the page should still 200.
 * Make sure to not throw any errors here, as it will cause the page to 500.
 */
function loadDeferredData({context, params}: LoaderFunctionArgs) {
  // Put any API calls that is not critical to be available on first page render
  // For example: product reviews, product recommendations, social feeds.

  return {};
}

export default function Product() {
  const {product} = useLoaderData<typeof loader>();

  // Optimistically selects a variant with given available variant information
  const selectedVariant = useOptimisticVariant(
    product.selectedOrFirstAvailableVariant,
    getAdjacentAndFirstAvailableVariants(product),
  );

  // Sets the search param to the selected variant without navigation
  // only when no search params are set in the url
  useSelectedOptionInUrlParam(selectedVariant.selectedOptions);

  // Get the product options array
  const productOptions = getProductOptions({
    ...product,
    selectedOrFirstAvailableVariant: selectedVariant,
  });

  const {title, descriptionHtml} = product;

  return (
    <div>
      <TwoColumnLayout
        left={<Left selectedVariant={selectedVariant} />}
        right={
          <Right
            title={title}
            descriptionHtml={descriptionHtml}
            selectedVariant={selectedVariant}
            productOptions={productOptions}
            product={product}
          />
        }
      />
      <Analytics.ProductView
        data={{
          products: [
            {
              id: product.id,
              title: product.title,
              price: selectedVariant?.price.amount || '0',
              vendor: product.vendor,
              variantId: selectedVariant?.id || '',
              variantTitle: selectedVariant?.title || '',
              quantity: 1,
            },
          ],
        }}
      />
    </div>
  );
}

// TODO: type
function Left({selectedVariant}: {selectedVariant: any}) {
  const otherImages =
    selectedVariant.otherImages?.references.edges.map(
      (edge: any) => edge.node.image,
    ) || [];
  const allImages = [selectedVariant.image, ...otherImages];
  const [selectedImage, setSelectedImage] = useState(allImages[0]);

  useEffect(() => {
    setSelectedImage(allImages[0]);
  }, [selectedVariant]);

  return (
    <div className="h-full flex flex-col-reverse sm:flex-row gap-0 sm:gap-6 items-center p-3 sm:p-6">
      <div className="shrink-0 flex sm:flex-col w-full sm:w-20 justify-center">
        {allImages.map((image: any) => (
          <button
            key={image.url}
            onClick={() => setSelectedImage(image)}
            className="w-14 sm:w-full aspect-square cursor-pointer"
          >
            <img
              src={image.url}
              alt={image.altText}
              className="w-full h-full object-cover"
            />
          </button>
        ))}
      </div>

      <div className="w-full aspect-square">
        <img
          src={selectedImage.url}
          alt={selectedImage.altText}
          className="w-full h-full object-cover"
        />
      </div>
    </div>
  );
}

type AccordionProps = {
  header: React.ReactNode;
  body: React.ReactNode;
  initialOpen?: boolean;
};

function Accordion({header, body, initialOpen}: AccordionProps) {
  const [isOpen, setIsOpen] = useState(initialOpen || false);
  return (
    <div className="grid gap-3">
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center relative w-full cursor-pointer"
      >
        <div className="text-xs uppercase">{header}</div>
        <div
          className={cn(
            'ml-auto sm:absolute left-56 size-3 rounded-full border sm:border-2 border-neutral-300 dark:border-[#2D2D2D] duration-300 transition',
            isOpen ? 'bg-black dark:bg-white' : 'bg-white dark:bg-black',
          )}
        ></div>
      </div>
      {isOpen && body}
    </div>
  );
}

import SizeFitShirt from '~/assets/size-fit-shirt.jpg';
import SizeFitChart from '~/assets/size-fit-chart.jpg';
function SizeFit({product}: {product?: any}) {
  const [type, setType] = useState('inches');
  return (
    <div className="flex flex-col sm:flex-row gap-5">
      <div className="shrink-0 w-[8rem] sm:w-[11.56rem] aspect-[1/0.82] dark:invert transition duration-300">
        <img
          src={product.sizeFitImages?.references.edges[0]?.node.image.url}
          alt=""
          className="w-full h-full"
        />
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
          <div className="flex-1 aspect-[1/0.33] dark:invert transition duration-300">
            <img
              src={product.sizeFitImages?.references?.edges[1]?.node.image.url}
              alt=""
            />
          </div>
        )}
        {type === 'inches' && (
          <div className="flex-1 aspect-[1/0.33] dark:invert transition duration-300">
            <img
              src={product.sizeFitImages?.references?.edges[2]?.node.image.url}
              alt=""
            />
          </div>
        )}
      </div>
    </div>
  );
}

import Sleeve from '~/assets/sleeve.jpg';
import {localizationCookie} from '~/cookie.server';
function Right({
  title,
  descriptionHtml,
  selectedVariant,
  productOptions,
  product,
}: any) {
  const navigate = useNavigate();
  return (
    <div className="dark:text-white transition duration-300 sm:p-10 sm:pb-0 flex flex-col h-full">
      <div className="flex flex-col-reverse sm:flex-row items-start justify-between">
        <div className="px-4 pb-0 sm:pb-6 sm:px-0 py-6 sm:py-0">
          <h1 className="text-xs sm:text-base font-[HelveticaNeueBold] uppercase">
            {title}
          </h1>
          <ProductPrice
            price={selectedVariant?.price}
            compareAtPrice={selectedVariant?.compareAtPrice}
          />
          <div
            dangerouslySetInnerHTML={{__html: descriptionHtml}}
            className="text-xs mt-6 max-w-[16rem] prose leading-relaxed"
          />
          <div className="mt-7">
            {productOptions.map((option: any) => {
              if (option.optionValues.length === 1) return null;
              return (
                <div className="" key={option.name}>
                  <div className="flex gap-2">
                    {option.optionValues.map((value: any, i: number) => {
                      const {
                        name,
                        handle,
                        variantUriQuery,
                        selected,
                        available,
                        exists,
                        isDifferentProduct,
                        swatch,
                      } = value;
                      if (option.name === 'Color') {
                        return (
                          <button
                            type="button"
                            key={option.name + name}
                            disabled={!exists}
                            onClick={() => {
                              if (!selected) {
                                navigate(`?${variantUriQuery}`, {
                                  replace: true,
                                  preventScrollReset: true,
                                });
                              }
                            }}
                          >
                            <div className="relative">
                              <div
                                style={{backgroundColor: swatch?.color}}
                                className={cn(
                                  'size-5 rounded-full border sm:border-2 cursor-pointer',
                                  selected
                                    ? 'border-black dark:border-white'
                                    : 'border-neutral-300 dark:border-[#2D2D2D] transition duration-300',
                                  'transition',
                                )}
                              ></div>
                              {i !== option.optionValues.length - 1 && (
                                <div className="h-[1px] sm:h-[2px] bg-neutral-300 dark:bg-[#2D2D2D] w-3 absolute top-1/2 -translate-y-1/2 -right-3"></div>
                              )}
                            </div>
                          </button>
                        );
                      } else {
                        return null;
                      }
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        <div
          style={{
            aspectRatio: `1/${
              product.topRightImage?.reference?.image.height /
              product.topRightImage?.reference?.image.width
            }`,
          }}
          className="max-w-full sm:max-w-[16rem] mt-6 sm:mt-0 -translate-y-[0.4rem] dark:invert transition duration-300"
        >
          <img
            src={product.topRightImage?.reference?.image.url}
            alt=""
            className="w-full h-full"
          />
        </div>
      </div>
      <div className="mb-auto mt-7 sm:mt-auto grid gap-4 sm:gap-5 px-4 sm:px-0">
        <Accordion
          header={<div>size & fit</div>}
          body={<SizeFit product={product} />}
        />
        <Accordion
          header={<div>composition, care & origin</div>}
          body={
            <div
              style={{
                aspectRatio: `1/${
                  product.compositionCareOriginImage?.reference?.image.height /
                  product.compositionCareOriginImage?.reference?.image.width
                }`,
              }}
              className="w-full dark:invert transition duration-300"
            >
              <img
                src={product.compositionCareOriginImage?.reference?.image.url}
                alt=""
              />
            </div>
          }
        />
        <Accordion
          header={<div>shipping & returns</div>}
          body={
            <div className="grid gap-3 max-w-[27rem]">
              <div className="grid gap-2">
                <div className="text-xs uppercase font-[HelveticaNeueBold]">
                  Domestic (Myanmar) Shipping policy:
                </div>
                <div className="text-xs leading-normal">
                  Domestic (Myanmar) addresses ship with Royal Express or Wepozt
                  Express with tracking numbers, which can be checked on their
                  respective websites or applications. P.O. Box addresses ship
                  with USPS tracking.
                </div>
                <div className="text-xs leading-normal">
                  All orders will be shipped within 3-5 business days. If the
                  orders are not delivered to the intended destinations in a
                  timely manner, please contact the customer service at{' '}
                  <a
                    href="mailto:hello.krgogoods@gmail.com"
                    className="underline"
                  >
                    hello.krgogoods@gmail.com
                  </a>{' '}
                  or call{' '}
                  <a href="tel:+959774234928" className="underline">
                    +959774234928
                  </a>
                  .
                </div>
              </div>
              <div className="grid gap-2">
                <div className="text-xs uppercase font-[HelveticaNeueBold]">
                  International (Non Myanmar) Shipping policy:
                </div>
                <div className="text-xs leading-normal">
                  International orders ship via SingPost. Currently, the
                  applicable duties and import taxes are not calculated at the
                  checkout for now and you will likely be subject to pay upon
                  importing into your country.
                </div>
                <div className="text-xs leading-normal">
                  All orders will be shipped within 3-5 days. Delivery time may
                  alter due to the respective postal systems of the countries.
                  If the orders are not delivered to the intended destinations
                  in a timely manner, please contact the customer service at{' '}
                  <a
                    href="mailto:hello.krgogoods@gmail.com"
                    className="underline"
                  >
                    hello.krgogoods@gmail.com
                  </a>{' '}
                  or call{' '}
                  <a href="tel:+959774234928" className="underline">
                    +959774234928
                  </a>
                  .
                </div>
              </div>
              <div className="grid gap-2">
                <div className="text-xs uppercase font-[HelveticaNeueBold]">
                  Return
                </div>
                <div className="text-xs leading-normal">
                  All sales are final. No returns or exchanges. In case of
                  damaged or missing product, we are able to offer either a full
                  refund or exchange for the item in question within one week of
                  customer receipt date and depending upon availability.
                </div>
                <div className="text-xs leading-normal">
                  We cannot guarantee that purchased items will remain in stock.
                  To acquire a refund or exchange, we require a receipt and
                  visual proof of damage. For all requests, please contact
                  customer service at{' '}
                  <a
                    href="mailto:hello.krgogoods@gmail.com"
                    className="underline"
                  >
                    hello.krgogoods@gmail.com
                  </a>{' '}
                  with your order number.
                </div>
              </div>
            </div>
          }
        />
      </div>
      <div className="sm:mt-8 sm:pb-10">
        <ProductForm
          productOptions={productOptions}
          selectedVariant={selectedVariant}
        />
      </div>
    </div>
  );
}

const PRODUCT_VARIANT_FRAGMENT = `#graphql
  fragment ProductVariant on ProductVariant {
    availableForSale
    compareAtPrice {
      amount
      currencyCode
    }
    id
    image {
      __typename
      id
      url
      altText
      width
      height
    }
    otherImages: metafield(namespace: "custom", key: "variant_images") {
      references(first: 10) {
        edges {
          node {
            ... on MediaImage {
              image {
                id
                url
                altText
                width
                height
              }
            }
          }
        }
      }
    }
    price {
      amount
      currencyCode
    }
    product {
      title
      handle
    }
    selectedOptions {
      name
      value
    }
    sku
    title
    unitPrice {
      amount
      currencyCode
    }
  }
` as const;

const PRODUCT_FRAGMENT = `#graphql
  fragment Product on Product {
    id
    title
    vendor
    handle
    descriptionHtml
    description
    encodedVariantExistence
    encodedVariantAvailability
    options {
      name
      optionValues {
        name
        firstSelectableVariant {
          ...ProductVariant
        }
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
    selectedOrFirstAvailableVariant(selectedOptions: $selectedOptions, ignoreUnknownOptions: true, caseInsensitiveMatch: true) {
      ...ProductVariant
    }
    adjacentVariants (selectedOptions: $selectedOptions) {
      ...ProductVariant
    }
    seo {
      description
      title
    }
    category: metafield(namespace: "custom", key: "category") {
      value
    }
    topRightImage: metafield(namespace: "custom", key: "top_right_image") {
      reference {
        ... on MediaImage {
          image {
            __typename
            id
            url
            altText
            width
            height
          }
        }
      }
    }
    sizeFitImages: metafield(namespace: "custom", key: "size_fit_images") {
      references(first: 10) {
        edges {
          node {
            ... on MediaImage {
              image {
                id
                url
                altText
                width
                height
              }
            }
          }
        }
      }
    }
    compositionCareOriginImage: metafield(namespace: "custom", key: "composition_care_origin_image") {
      reference {
        ... on MediaImage {
          image {
            __typename
            id
            url
            altText
            width
            height
          }
        }
      }
    }
  }
  ${PRODUCT_VARIANT_FRAGMENT}
` as const;

const PRODUCT_QUERY = `#graphql
  query Product(
    $country: CountryCode
    $handle: String!
    $language: LanguageCode
    $selectedOptions: [SelectedOptionInput!]!
  ) @inContext(country: $country, language: $language) {
    product(handle: $handle) {
      ...Product
    }
  }
  ${PRODUCT_FRAGMENT}
` as const;
