import {Suspense, useRef} from 'react';
import {Await, NavLink, useAsyncValue} from '@remix-run/react';
import {
  type CartViewPayload,
  useAnalytics,
  useOptimisticCart,
} from '@shopify/hydrogen';
import type {HeaderQuery, CartApiQueryFragment} from 'storefrontapi.generated';
import {useAside} from '~/components/Aside';
import Logo from '~/assets/logo.jpg';
import {ThemeSwitcher} from '~/components/ThemeSwitcher';
import {useLocation, useNavigate} from '@remix-run/react';

interface HeaderProps {
  header: HeaderQuery;
  cart: Promise<CartApiQueryFragment | null>;
  isLoggedIn: Promise<boolean>;
  publicStoreDomain: string;
}

type Viewport = 'desktop' | 'mobile';

export function Header({cart}: HeaderProps) {
  const location = useLocation();
  const isPathNotShowCloseButton =
    ['/'].includes(location.pathname) ||
    location.pathname.startsWith('/products');
  const navigate = useNavigate();

  return (
    <header>
      <div className="h-[5.5rem] sm:h-24 p-5 flex items-center justify-end sm:justify-between relative gap-3">
        <ThemeSwitcher />
        <NavLink
          prefetch="intent"
          to="/"
          style={activeLinkStyle}
          end
          className="absolute top-1/2 left-8 sm:left-1/2 transform sm:-translate-x-1/2 -translate-y-1/2"
        >
          <img
            src={Logo}
            alt="Krgogoods Logo"
            className="w-[8.13rem] sm:w-[16.06rem] h-[2.19rem] sm:h-[3.44rem]"
          />
        </NavLink>

        {isPathNotShowCloseButton && <CartToggle cart={cart} />}

        {!isPathNotShowCloseButton && (
          <button
            className="relative shrink-0 cursor-pointer"
            onClick={() => {
              document.referrer ? window.history.back() : navigate('/');
            }}
          >
            <div className="absolute z-10 size-2 top-1/2 left-0 transform -translate-x-2/5 -translate-y-1/2 bg-white border sm:border-2 border-neutral-300 rounded-full"></div>
            <div className="size-8 sm:size-9 bg-white border sm:border-2 border-neutral-300 rounded-full relative">
              <div className="size-3 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-black flex">
                <svg
                  width="100%"
                  height="100%"
                  viewBox="0 0 16 16"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M7.94548 6.49768L13.4949 0.948308L15.2258 2.6793L9.67647 8.22868L15.2513 13.8035L13.5203 15.5345L7.94548 9.95968L2.3961 15.5091L0.665105 13.7781L6.21448 8.22868L0.639648 2.65385L2.37065 0.922852L7.94548 6.49768Z"
                    fill="#1E1E1E"
                  />
                </svg>
              </div>
            </div>
            <div className="sm:hidden h-[1px] sm:h-[2px] bg-neutral-300 w-3 absolute top-1/2 -translate-y-1/2 -left-3"></div>
            <div className="absolute z-10 size-2 top-1/2 right-0 transform translate-x-2/5 -translate-y-1/2 bg-white border sm:border-2 border-neutral-300 rounded-full"></div>
          </button>
        )}
      </div>
    </header>
  );
}

export function HeaderMenu({
  menu,
  primaryDomainUrl,
  viewport,
  publicStoreDomain,
}: {
  menu: HeaderProps['header']['menu'];
  primaryDomainUrl: HeaderProps['header']['shop']['primaryDomain']['url'];
  viewport: Viewport;
  publicStoreDomain: HeaderProps['publicStoreDomain'];
}) {
  const className = `header-menu-${viewport}`;
  const {close} = useAside();

  return (
    <nav className={className} role="navigation">
      {viewport === 'mobile' && (
        <NavLink
          end
          onClick={close}
          prefetch="intent"
          style={activeLinkStyle}
          to="/"
        >
          Home
        </NavLink>
      )}
      {(menu || FALLBACK_HEADER_MENU).items.map((item) => {
        if (!item.url) return null;

        // if the url is internal, we strip the domain
        const url =
          item.url.includes('myshopify.com') ||
          item.url.includes(publicStoreDomain) ||
          item.url.includes(primaryDomainUrl)
            ? new URL(item.url).pathname
            : item.url;
        return (
          <NavLink
            className="header-menu-item"
            end
            key={item.id}
            onClick={close}
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

function HeaderCtas({
  isLoggedIn,
  cart,
}: Pick<HeaderProps, 'isLoggedIn' | 'cart'>) {
  return (
    <nav className="header-ctas" role="navigation">
      <HeaderMenuMobileToggle />
      <NavLink prefetch="intent" to="/account" style={activeLinkStyle}>
        <Suspense fallback="Sign in">
          <Await resolve={isLoggedIn} errorElement="Sign in">
            {(isLoggedIn) => (isLoggedIn ? 'Account' : 'Sign in')}
          </Await>
        </Suspense>
      </NavLink>
      <SearchToggle />
      <CartToggle cart={cart} />
    </nav>
  );
}

function HeaderMenuMobileToggle() {
  const {open} = useAside();
  return (
    <button
      className="header-menu-mobile-toggle reset"
      onClick={() => open('mobile')}
    >
      <h3>☰</h3>
    </button>
  );
}

function SearchToggle() {
  const {open} = useAside();
  return (
    <button className="reset" onClick={() => open('search')}>
      Search
    </button>
  );
}

function CartBadge({count}: {count: number | null}) {
  const {open} = useAside();
  // open('cart'); // remove this
  const {publish, shop, cart, prevCart} = useAnalytics();

  return (
    <a
      href="/cart"
      onClick={(e) => {
        // e.preventDefault();
        // open('cart');
        publish('cart_viewed', {
          cart,
          prevCart,
          shop,
          url: window.location.href || '',
        } as CartViewPayload);
      }}
    >
      <div className="flex items-center gap-3">
        <div className="relative shrink-0 hidden sm:block">
          <div className="size-8 sm:size-9 bg-white border sm:border-2 border-neutral-300 rounded-full relative">
            <div className="text-sm absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-black">
              C
            </div>
          </div>
          <div className="absolute z-10 size-2 top-1/2 right-0 transform translate-x-2/5 -translate-y-1/2 bg-white border sm:border-2 border-neutral-300 rounded-full"></div>
          <div className="h-[1px] sm:h-[2px] bg-neutral-300 w-3 absolute top-1/2 -translate-y-1/2 -right-3"></div>
        </div>
        <div className="relative shrink-0 hidden sm:block">
          <div className="absolute z-10 size-2 top-1/2 left-0 transform -translate-x-2/5 -translate-y-1/2 bg-white border sm:border-2 border-neutral-300 rounded-full"></div>
          <div className="size-8 sm:size-9 bg-white border sm:border-2 border-neutral-300 rounded-full relative">
            <div className="text-sm absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-black">
              A
            </div>
          </div>
          <div className="absolute z-10 size-2 top-1/2 right-0 transform translate-x-2/5 -translate-y-1/2 bg-white border sm:border-2 border-neutral-300 rounded-full"></div>
          <div className="h-[1px] sm:h-[2px] bg-neutral-300 w-3 absolute top-1/2 -translate-y-1/2 -right-3"></div>
        </div>
        <div className="relative shrink-0 hidden sm:block">
          <div className="absolute z-10 size-2 top-1/2 left-0 transform -translate-x-2/5 -translate-y-1/2 bg-white border sm:border-2 border-neutral-300 rounded-full"></div>
          <div className="size-8 sm:size-9 bg-white border sm:border-2 border-neutral-300 rounded-full relative">
            <div className="text-sm absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-black">
              R
            </div>
          </div>
          <div className="absolute z-10 size-2 top-1/2 right-0 transform translate-x-2/5 -translate-y-1/2 bg-white border sm:border-2 border-neutral-300 rounded-full"></div>
          <div className="h-[1px] sm:h-[2px] bg-neutral-300 w-3 absolute top-1/2 -translate-y-1/2 -right-3"></div>
        </div>
        <div className="relative shrink-0 hidden sm:block">
          <div className="absolute z-10 size-2 top-1/2 left-0 transform -translate-x-2/5 -translate-y-1/2 bg-white border sm:border-2 border-neutral-300 rounded-full"></div>
          <div className="size-8 sm:size-9 bg-white border sm:border-2 border-neutral-300 rounded-full relative">
            <div className="text-sm absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-black">
              T
            </div>
          </div>
          <div className="absolute z-10 size-2 top-1/2 right-0 transform translate-x-2/5 -translate-y-1/2 bg-white border sm:border-2 border-neutral-300 rounded-full"></div>
        </div>
        <div className="relative shrink-0">
          <div className="absolute z-10 size-2 top-1/2 left-0 transform -translate-x-2/5 -translate-y-1/2 bg-white border sm:border-2 border-neutral-300 rounded-full"></div>
          <div className="size-8 sm:size-9 bg-white border sm:border-2 border-neutral-300 rounded-full relative">
            <div className="text-sm absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-black flex">
              <span className="inline-block -translate-y-[0.1rem]">(</span>
              {count === null ? <span>&nbsp;</span> : count}
              <span className="inline-block -translate-y-[0.1rem]">)</span>
            </div>
          </div>
          <div className="h-[1px] sm:h-[2px] bg-neutral-300 w-3 absolute top-1/2 -translate-y-1/2 -left-3"></div>
          <div className="absolute z-10 size-2 top-1/2 right-0 transform translate-x-2/5 -translate-y-1/2 bg-white border sm:border-2 border-neutral-300 rounded-full"></div>
        </div>
      </div>
    </a>
  );
}

function CartToggle({cart}: Pick<HeaderProps, 'cart'>) {
  return (
    <Suspense fallback={<CartBadge count={null} />}>
      <Await resolve={cart}>
        <CartBanner />
      </Await>
    </Suspense>
  );
}

function CartBanner() {
  const originalCart = useAsyncValue() as CartApiQueryFragment | null;
  const cart = useOptimisticCart(originalCart);
  return <CartBadge count={cart?.totalQuantity ?? 0} />;
}

const FALLBACK_HEADER_MENU = {
  id: 'gid://shopify/Menu/199655587896',
  items: [
    {
      id: 'gid://shopify/MenuItem/461609500728',
      resourceId: null,
      tags: [],
      title: 'Collections',
      type: 'HTTP',
      url: '/collections',
      items: [],
    },
    {
      id: 'gid://shopify/MenuItem/461609533496',
      resourceId: null,
      tags: [],
      title: 'Blog',
      type: 'HTTP',
      url: '/blogs/journal',
      items: [],
    },
    {
      id: 'gid://shopify/MenuItem/461609566264',
      resourceId: null,
      tags: [],
      title: 'Policies',
      type: 'HTTP',
      url: '/policies',
      items: [],
    },
    {
      id: 'gid://shopify/MenuItem/461609599032',
      resourceId: 'gid://shopify/Page/92591030328',
      tags: [],
      title: 'About',
      type: 'PAGE',
      url: '/pages/about',
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
    color: isPending ? 'grey' : 'black',
  };
}
