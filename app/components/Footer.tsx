import {Suspense} from 'react';
import {Await, NavLink} from '@remix-run/react';
import type {FooterQuery, HeaderQuery} from 'storefrontapi.generated';
import {useNavigate, useLocation} from '@remix-run/react';

interface FooterProps {
  footer: Promise<FooterQuery | null>;
  header: HeaderQuery;
  publicStoreDomain: string;
}

export function Footer({
  footer: footerPromise,
  header,
  publicStoreDomain,
}: FooterProps) {
  const navigate = useNavigate();

  return (
    <footer className="mt-auto">
      <div className="px-8 sm:px-10 pt-8 sm:pt-20 pb-8 sm:pb-9 grid sm:grid-cols-5 gap-8 items-start">
        <div className="grid gap-2 sm:gap-2">
          <NavLink
            prefetch="intent"
            to="/contact"
            end
            className="inline-block uppercase text-xs text-black dark:text-white opacity-50 hover:opacity-100 duration-300 transition"
          >
            Contact
          </NavLink>
          <NavLink
            prefetch="intent"
            to="/faq"
            end
            className="inline-block uppercase text-xs text-black dark:text-white opacity-50 hover:opacity-100 duration-300 transition pointer-events-none line-through"
          >
            FAQ
          </NavLink>
          <NavLink
            prefetch="intent"
            to="/product-care"
            end
            className="inline-block uppercase text-xs text-black dark:text-white opacity-50 hover:opacity-100 duration-300 transition pointer-events-none line-through"
          >
            Product care
          </NavLink>
          <NavLink
            prefetch="intent"
            to="/size-guides"
            end
            className="inline-block uppercase text-xs text-black dark:text-white opacity-50 hover:opacity-100 duration-300 transition pointer-events-none line-through"
          >
            Size guides
          </NavLink>
        </div>

        <div className="grid gap-2 sm:gap-2">
          <NavLink
            prefetch="intent"
            to="/locate-stores"
            end
            className="inline-block uppercase text-xs text-black dark:text-white opacity-50 hover:opacity-100 duration-300 transition"
          >
            locate stores
          </NavLink>
          <NavLink
            prefetch="intent"
            to="/"
            end
            className="inline-block uppercase text-xs text-black dark:text-white opacity-50 hover:opacity-100 duration-300 transition pointer-events-none line-through"
          >
            archive
          </NavLink>
        </div>

        <div className="grid gap-2 sm:gap-2">
          <a
            href="https://www.facebook.com/cargosupply"
            target="_blank"
            className="inline-block uppercase text-xs text-black dark:text-white opacity-50 hover:opacity-100 duration-300 transition"
          >
            facebook
          </a>
          <a
            href="https://www.instagram.com/krgogoods/"
            target="_blank"
            className="inline-block uppercase text-xs text-black dark:text-white opacity-50 hover:opacity-100 duration-300 transition"
          >
            instagram
          </a>
        </div>

        <div className="grid gap-2 sm:gap-2">
          <NavLink
            prefetch="intent"
            to="/"
            end
            className="inline-block uppercase text-xs text-black dark:text-white opacity-50 hover:opacity-100 duration-300 transition"
          >
            privacy policy
          </NavLink>
          <NavLink
            prefetch="intent"
            to="/"
            end
            className="inline-block uppercase text-xs text-black dark:text-white opacity-50 hover:opacity-100 duration-300 transition"
          >
            terms & conditions
          </NavLink>
        </div>

        <div className="grid gap-2 sm:gap-2">
          <button
            onClick={() => {
              const currentPath = location.pathname;
              const newUrl = `${currentPath}?select-store=true`;
              navigate(newUrl, {replace: true});
            }}
            className="text-left cursor-pointer inline-block uppercase text-xs text-black dark:text-white opacity-50 hover:opacity-100 duration-300 transition"
          >
            SELECT STORE
          </button>
          <div className="inline-block uppercase text-xs text-neutral-400 ">
            © {new Date().getFullYear()} KRGOGOODS
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterMenu({
  menu,
  primaryDomainUrl,
  publicStoreDomain,
}: {
  menu: FooterQuery['menu'];
  primaryDomainUrl: FooterProps['header']['shop']['primaryDomain']['url'];
  publicStoreDomain: string;
}) {
  return (
    <nav className="footer-menu" role="navigation">
      {(menu || FALLBACK_FOOTER_MENU).items.map((item) => {
        if (!item.url) return null;
        // if the url is internal, we strip the domain
        const url =
          item.url.includes('myshopify.com') ||
          item.url.includes(publicStoreDomain) ||
          item.url.includes(primaryDomainUrl)
            ? new URL(item.url).pathname
            : item.url;
        const isExternal = !url.startsWith('/');
        return isExternal ? (
          <a href={url} key={item.id} rel="noopener noreferrer" target="_blank">
            {item.title}
          </a>
        ) : (
          <NavLink
            end
            key={item.id}
            prefetch="intent"
            style={activeLinkStyle}
            to={url}
          >
            {item.title}
          </NavLink>
        );
      })}
    </nav>
  );
}

const FALLBACK_FOOTER_MENU = {
  id: 'gid://shopify/Menu/199655620664',
  items: [
    {
      id: 'gid://shopify/MenuItem/461633060920',
      resourceId: 'gid://shopify/ShopPolicy/23358046264',
      tags: [],
      title: 'Privacy Policy',
      type: 'SHOP_POLICY',
      url: '/policies/privacy-policy',
      items: [],
    },
    {
      id: 'gid://shopify/MenuItem/461633093688',
      resourceId: 'gid://shopify/ShopPolicy/23358013496',
      tags: [],
      title: 'Refund Policy',
      type: 'SHOP_POLICY',
      url: '/policies/refund-policy',
      items: [],
    },
    {
      id: 'gid://shopify/MenuItem/461633126456',
      resourceId: 'gid://shopify/ShopPolicy/23358111800',
      tags: [],
      title: 'Shipping Policy',
      type: 'SHOP_POLICY',
      url: '/policies/shipping-policy',
      items: [],
    },
    {
      id: 'gid://shopify/MenuItem/461633159224',
      resourceId: 'gid://shopify/ShopPolicy/23358079032',
      tags: [],
      title: 'Terms of Service',
      type: 'SHOP_POLICY',
      url: '/policies/terms-of-service',
      items: [],
    },
  ],
};

function activeLinkStyle({
  isActive,
  isPending,
}: {
  isActive: boolean;
  isPending: boolean;
}) {
  return {
    fontWeight: isActive ? 'bold' : undefined,
    color: isPending ? 'grey' : 'white',
  };
}
