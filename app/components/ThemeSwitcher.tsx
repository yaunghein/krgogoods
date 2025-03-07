import {useFetcher} from '@remix-run/react';

export function ThemeSwitcher({setTheme}: {setTheme: any}) {
  const fetcher = useFetcher();
  return (
    <fetcher.Form method="post" action="/theme" className="flex">
      <button
        type="submit"
        className="group relative z-10 cursor-pointer dark:rotate-180 transition duration-300"
        onClick={() =>
          setTheme((prev: any) => (prev === 'dark' ? 'light' : 'dark'))
        }
      >
        {/* <div className="absolute z-10 size-2 top-1/2 left-0 transform -translate-x-2/5 -translate-y-1/2 bg-white dark:bg-black group-hover:bg-black dark:group-hover:bg-white border sm:border-2 border-neutral-300 rounded-full transition duration-300"></div> */}
        <div className="relative size-8 sm:size-9 border-0 sm:border-0 border-neutral-300 rounded-full transition duration-300">
          <div className="size-6 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 group-hover:scale-110 text-black dark:text-white transition duration-300">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="100%"
              height="100%"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              className="lucide lucide-sun-medium"
            >
              <circle cx={12} cy={12} r={4} />
              <path d="M12 3v1" />
              <path d="M12 20v1" />
              <path d="M3 12h1" />
              <path d="M20 12h1" />
              <path d="m18.364 5.636-.707.707" />
              <path d="m6.343 17.657-.707.707" />
              <path d="m5.636 5.636.707.707" />
              <path d="m17.657 17.657.707.707" />
            </svg>
          </div>
        </div>
        {/* <div className="absolute size-2 top-1/2 right-0 transform translate-x-2/5 -translate-y-1/2 bg-white dark:bg-black group-hover:bg-black dark:group-hover:bg-white  border sm:border-2 border-neutral-300 rounded-full transition duration-300"></div> */}
      </button>
    </fetcher.Form>
  );
}
