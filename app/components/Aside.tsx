import {NavLink} from '@remix-run/react';
import {
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useState,
} from 'react';
import Logo from '~/assets/logo.jpg';
import {ThemeSwitcher} from '~/components/ThemeSwitcher';

type AsideType = 'search' | 'cart' | 'mobile' | 'closed';
type AsideContextValue = {
  type: AsideType;
  open: (mode: AsideType) => void;
  close: () => void;
};

/**
 * A side bar component with Overlay
 * @example
 * ```jsx
 * <Aside type="search" heading="SEARCH">
 *  <input type="search" />
 *  ...
 * </Aside>
 * ```
 */
export function Aside({
  children,
  heading,
  type,
}: {
  children?: React.ReactNode;
  type: AsideType;
  heading: React.ReactNode;
}) {
  const {type: activeType, close} = useAside();
  const expanded = type === activeType;

  useEffect(() => {
    const abortController = new AbortController();

    if (expanded) {
      document.addEventListener(
        'keydown',
        function handler(event: KeyboardEvent) {
          if (event.key === 'Escape') {
            close();
          }
        },
        {signal: abortController.signal},
      );
    }
    return () => abortController.abort();
  }, [close, expanded]);

  return (
    <div
      aria-modal
      className={`overlay ${expanded ? 'expanded' : ''} !w-full`}
      role="dialog"
    >
      <button className="close-outside" onClick={close} />
      <aside className="flex flex-col min-h-[100dvh]">
        {/* <header>
          <h3>{heading}</h3>
          <button className="close reset" onClick={close} aria-label="Close">
            &times;
          </button>
        </header> */}
        <header>
          <div className="w-full h-24 p-5 flex items-center justify-between relative">
            <ThemeSwitcher />
            <button
              onClick={close}
              className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 cursor-pointer"
            >
              <img
                src={Logo}
                alt="Krgogoods Logo"
                className="w-[16.06rem] h-[3.44rem]"
              />
            </button>
            <button className="close reset" onClick={close} aria-label="Close">
              &times;
            </button>
          </div>
        </header>
        <main>{children}</main>
        {/* footer duplicate */}
        <div>
          <div className="p-10 grid grid-cols-5 gap-5 items-start">
            <div className="grid gap-2">
              <NavLink
                prefetch="intent"
                to="/"
                end
                className="inline-block uppercase text-xs text-neutral-400 hover:text-black transition"
              >
                Contact
              </NavLink>
              <NavLink
                prefetch="intent"
                to="/"
                end
                className="inline-block uppercase text-xs text-neutral-400 hover:text-black transition"
              >
                FAQ
              </NavLink>
              <NavLink
                prefetch="intent"
                to="/"
                end
                className="inline-block uppercase text-xs text-neutral-400 hover:text-black transition"
              >
                Product care
              </NavLink>
              <NavLink
                prefetch="intent"
                to="/"
                end
                className="inline-block uppercase text-xs text-neutral-400 hover:text-black transition"
              >
                Size guides
              </NavLink>
            </div>

            <div className="grid gap-2">
              <NavLink
                prefetch="intent"
                to="/"
                end
                className="inline-block uppercase text-xs text-neutral-400 hover:text-black transition"
              >
                locate stores
              </NavLink>
              <NavLink
                prefetch="intent"
                to="/"
                end
                className="inline-block uppercase text-xs text-neutral-400 hover:text-black transition"
              >
                archive
              </NavLink>
            </div>

            <div className="grid gap-2">
              <NavLink
                prefetch="intent"
                to="/"
                end
                className="inline-block uppercase text-xs text-neutral-400 hover:text-black transition"
              >
                facebook
              </NavLink>
              <NavLink
                prefetch="intent"
                to="/"
                end
                className="inline-block uppercase text-xs text-neutral-400 hover:text-black transition"
              >
                instagram
              </NavLink>
            </div>

            <div className="grid gap-2">
              <NavLink
                prefetch="intent"
                to="/"
                end
                className="inline-block uppercase text-xs text-neutral-400 hover:text-black transition"
              >
                privacy policy
              </NavLink>
              <NavLink
                prefetch="intent"
                to="/"
                end
                className="inline-block uppercase text-xs text-neutral-400 hover:text-black transition"
              >
                terms & conditions
              </NavLink>
            </div>

            <div className="grid gap-2">
              <NavLink
                prefetch="intent"
                to="/"
                end
                className="inline-block uppercase text-xs text-neutral-400 hover:text-black transition"
              >
                SELECT STORE
              </NavLink>
              <div className="inline-block uppercase text-xs text-neutral-400 ">
                © 2025 KRGOGOODS
              </div>
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
}

const AsideContext = createContext<AsideContextValue | null>(null);

Aside.Provider = function AsideProvider({children}: {children: ReactNode}) {
  const [type, setType] = useState<AsideType>('closed');

  return (
    <AsideContext.Provider
      value={{
        type,
        open: setType,
        close: () => setType('closed'),
      }}
    >
      {children}
    </AsideContext.Provider>
  );
};

export function useAside() {
  const aside = useContext(AsideContext);
  if (!aside) {
    throw new Error('useAside must be used within an AsideProvider');
  }
  return aside;
}
