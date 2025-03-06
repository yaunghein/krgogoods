import {useFetcher} from '@remix-run/react';

export function ThemeSwitcher() {
  const fetcher = useFetcher();
  return (
    <fetcher.Form method="post" action="/theme" className="flex">
      <button
        type="submit"
        className="relative z-10 cursor-pointer dark:rotate-180 transition duration-300"
      >
        <div className="absolute size-2 top-1/2 left-0 transform -translate-x-2/5 -translate-y-1/2 bg-black dark:bg-white border sm:border-2 border-neutral-300 rounded-full transition duration-300"></div>
        <div className="size-8 sm:size-9 bg-black dark:bg-white border sm:border-2 border-neutral-300 rounded-full transition duration-300"></div>
        <div className="absolute size-2 top-1/2 right-0 transform translate-x-2/5 -translate-y-1/2 bg-black dark:bg-white border sm:border-2 border-neutral-300 rounded-full transition duration-300"></div>
      </button>
    </fetcher.Form>
  );
}
