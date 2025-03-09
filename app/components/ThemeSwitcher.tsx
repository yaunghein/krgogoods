import {useFetcher} from '@remix-run/react';
import {cn} from '~/utils/cn';

export function ThemeSwitcher({theme, setTheme}: {theme: any; setTheme: any}) {
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
        <div className="absolute z-10 size-2 top-1/2 left-0 transform -translate-x-2/5 -translate-y-1/2 bg-white dark:bg-black group-hover:bg-black dark:group-hover:bg-white border sm:border-2 border-neutral-300 rounded-full transition duration-300"></div>
        <div className="relative size-8 sm:size-9 border sm:border-2 border-neutral-300 rounded-full bg-white group-hover:bg-black dark:bg-black dark:group-hover:bg-white transition duration-300">
          <div
            className={cn(
              'size-6 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-black group-hover:text-white dark:text-white dark:group-hover:text-black transition duration-300',
              theme === 'light' ? 'scale-110' : 'scale-x-[1.5]',
            )}
          >
            {theme === 'light' ? '+' : '-'}
          </div>
        </div>
        <div className="absolute size-2 top-1/2 right-0 transform translate-x-[35%] -translate-y-1/2 bg-white dark:bg-black group-hover:bg-black dark:group-hover:bg-white  border sm:border-2 border-neutral-300 rounded-full transition duration-300"></div>
      </button>
    </fetcher.Form>
  );
}
