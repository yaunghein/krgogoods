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
import {useState} from 'react';

export const meta: MetaFunction<typeof loader> = ({data}) => {
  return [
    {title: `Hydrogen | ${data?.product.title ?? ''}`},
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

  const [{product}] = await Promise.all([
    storefront.query(PRODUCT_QUERY, {
      variables: {handle, selectedOptions: getSelectedProductOptions(request)},
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
  return (
    <div className="">
      <ProductImage image={selectedVariant?.image} />
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
    <div className="grid gap-6">
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center relative w-full cursor-pointer"
      >
        <div className="text-xs uppercase">{header}</div>
        <div
          className={cn(
            'absolute left-56 size-3 rounded-full  border-2 border-neutral-300 transition',
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

import Sleeve from '~/assets/sleeve.jpg';
function Right({title, descriptionHtml, selectedVariant, productOptions}: any) {
  const navigate = useNavigate();
  return (
    <div className="p-10 pb-0 flex flex-col h-full">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-base font-bold uppercase">{title}</h1>
          <ProductPrice
            price={selectedVariant?.price}
            compareAtPrice={selectedVariant?.compareAtPrice}
          />
          <div
            dangerouslySetInnerHTML={{__html: descriptionHtml}}
            className="text-xs mt-6 max-w-[16rem]"
          />
          <div>
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
                      console.log('swatch', option);
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
                                  'size-5 rounded-full border-2  cursor-pointer',
                                  selected
                                    ? 'border-black'
                                    : 'border-neutral-300',
                                  'transition',
                                )}
                              ></div>
                              {i !== option.optionValues.length - 1 && (
                                <div className="h-[2px] bg-neutral-300 w-3 absolute top-1/2 -translate-y-1/2 -right-3"></div>
                              )}
                            </div>
                          </button>
                        );
                      }
                    })}
                  </div>
                  <br />
                </div>
              );
            })}
          </div>
        </div>
        <div className="w-[16rem] aspect-[1/0.32] -translate-y-[0.4rem]">
          <img src={Sleeve} alt="" className="w-full h-full" />
        </div>
      </div>
      <div className="mb-auto mt-16 grid gap-5">
        <Accordion header={<div>size & fit</div>} body={<SizeFit />} />
        <Accordion
          header={<div>composition, care & origin</div>}
          body={<SizeFit />}
        />
        <Accordion header={<div>shipping & returns</div>} body={<SizeFit />} />
      </div>
      <div className="mt-8 pb-10">
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
