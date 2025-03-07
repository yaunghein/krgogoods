import {type LoaderFunctionArgs} from '@shopify/remix-oxygen';
import {Await, useLoaderData, Link, type MetaFunction} from '@remix-run/react';
import {Suspense} from 'react';
import {Image, Money} from '@shopify/hydrogen';
import type {
  FeaturedCollectionFragment,
  RecommendedProductsQuery,
} from 'storefrontapi.generated';

export const meta: MetaFunction = () => {
  return [{title: 'Krgogoods | T&C and Policies'}];
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
    <div className="p-4 sm:p-7 h-full text-black dark:text-white transition duration-300">
      <div className="grid gap-3 max-w-[26rem] sm:pb-7">
        <div className="text-sm uppercase font-[HelveticaNeueBold]">
          Terms & Conditions
        </div>
        <div className="grid gap-2">
          <div className="text-sm uppercase font-[HelveticaNeueBold]">
            Terms of Use
          </div>
          <div className="text-sm leading-normal">
            By using KRGOGOODS.COM, you agree to our Terms of Use. These Terms
            may change or updated at any time so please check back regularly. If
            you do not agree with these terms and conditions then you are not
            authorised to use this website.
          </div>
          <div className="text-sm leading-normal">
            Krgo Goods is not liable for any losses or damages caused by this
            website or any website linked to or from this website.
          </div>
          <div className="text-sm leading-normal">
            We do not represent or warrant that the information on our website
            is accurate and we reserve the right to correct any errors or
            omissions, and to change or update any information without prior
            notice.
          </div>
          <div className="text-sm leading-normal">
            We reserve the right to refuse any order without giving reason. Upon
            cancellation of an order, we will make all reasonable attempts to
            contact you using the details provided. All received monies will be
            refunded using the method received. Once your refund is actioned by
            us, please allow 3-5 business days for the funds to be available
            again in your account.
          </div>
          <div className="text-sm leading-normal">
            Whilst all care is taken when inputting data, pricing and product
            availability on the website, in the event a product is listed at an
            incorrect price or with incorrect information due to typing or data
            error, Krgo Goods shall have the right to refuse or cancel any
            orders placed for product listed at the incorrect price.
          </div>
          <div className="text-sm leading-normal">
            In the unlikely event that the goods are no longer available, or
            that we have made a pricing mistake, we will advise you of this. And
            await your response to proceed, change or cancel your order.
          </div>
        </div>
        <div className="grid gap-2">
          <div className="text-sm uppercase font-[HelveticaNeueBold]">
            Product Availability
          </div>
          <div className="text-sm leading-normal">
            Krgo Goods will endeavour to ensure that the website does not have
            any problems and that goods displayed are available. However, it
            cannot guarantee the availability of the website or that any goods
            on the site are in stock or available. In the event that your
            ordered items are out of stock, we will notify you as soon as we
            can.
          </div>
        </div>
        <div className="grid gap-2">
          <div className="text-sm uppercase font-[HelveticaNeueBold]">
            Warranty
          </div>
          <div className="text-sm leading-normal">
            Warranty will be dealt with on a case by case basis. As a general
            rule, all products are covered with a 30 day warranty for any
            manufacturing faults, which covers any component or structure of the
            item being faulty, or not as described. Pictures will be required
            prior to any Return Authorization can be issued.
          </div>
          <div className="text-sm leading-normal">
            Krgo Goods will not be responsible for any faults or damage caused
            by misuse or failure to follow care instructions.
          </div>
        </div>
        <div className="grid gap-2">
          <div className="text-sm uppercase font-[HelveticaNeueBold]">
            Cancellations
          </div>
          <div className="text-sm leading-normal">
            If you wish to cancel an order, please contact us immediately on
            +959774234928 during business hours or hello.krgogoods@gmail.com,
            orders can only be canceled if Krgo Goods is contacted prior to
            shipping. There after, customers must follow the Returns policy.
          </div>
        </div>
        <div className="grid gap-2">
          <div className="text-sm uppercase font-[HelveticaNeueBold]">
            Domestic (Myanmar) Shipping Policy
          </div>
          <div className="text-sm leading-normal">
            Domestic (Myanmar) addresses ship with Royal Express or Wepozt
            Express with tracking numbers, which can be checked on their
            respective websites or applications. P.O. Box addresses ship with
            USPS tracking.
          </div>
          <div className="text-sm leading-normal">
            All orders will be shipped within 3-5 business days. If the orders
            are not delivered to the intended destinations in a timely manner,
            please contact the customer service at hello.krgogoods@gmail.com or
            call +959774234928 .
          </div>
        </div>
        <div className="grid gap-2">
          <div className="text-sm uppercase font-[HelveticaNeueBold]">
            Return
          </div>
          <div className="text-sm leading-normal">
            All sales are final. No returns or exchanges. In case of damaged or
            missing product, we are able to offer either a full refund or
            exchange for the item in question within one week of customer
            receipt date and depending upon availability.
          </div>
          <div className="text-sm leading-normal">
            We cannot guarantee that purchased items will remain in stock. To
            acquire a refund or exchange, we require a receipt and visual proof
            of damage. For all requests, please contact customer service at
            hello.krgogoods@gmail.com with your order number.
          </div>
        </div>
        <div className="grid gap-2">
          <div className="text-sm uppercase font-[HelveticaNeueBold]">
            Product Images
          </div>
          <div className="text-sm leading-normal">
            Please note that colours on our website will vary slightly depending
            how your monitor is calibrated. We do our very best to make sure all
            our images are true to the actual product you are purchasing but we
            can’t guarantee a perfect match every time due to almost limitless
            variations in home monitor set-ups.
          </div>
        </div>
      </div>
    </div>
  );
}

function Right() {
  return (
    <div className="p-7 h-full">
      <div className="font-[HelveticaNeueBold] text-sm uppercase">
        privacy policy
      </div>
      <p className="text-sm mt-3">
        Welcome to KRGOGOODS ("we," "our," or "us"). Your privacy is important
        to us. This Privacy Policy explains how we collect, use, disclose, and
        safeguard your information when you visit our website KRGOGOODS.com. By
        using our services, you agree to the terms of this policy.
      </p>

      <div className="mt-3">
        <div className="text-sm">1. Information We Collect</div>
        <div className="text-sm">
          We collect the following types of information:
        </div>
        <ul className="list-disc pl-5">
          <li className="text-sm">
            Personal Information: Name, email address, phone number, billing and
            shipping address, and payment details.
          </li>
          <li className="text-sm">
            Non-Personal Information: IP address, browser type, device
            information, and browsing behavior.
          </li>
          <li className="text-sm">
            Cookies and Tracking Technologies: To improve user experience and
            analyze website traffic.
          </li>
        </ul>
      </div>
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
