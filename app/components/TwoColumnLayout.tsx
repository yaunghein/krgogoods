import {cn} from '~/utils/cn';

type TwoColumnLayoutProps = {
  left: React.ReactNode;
  right?: React.ReactNode;
};

export function TwoColumnLayout({left, right}: TwoColumnLayoutProps) {
  return (
    <div className="px-8 sm:px-10 border-y sm:border-y-2 border-neutral-300 dark:border-[#2D2D2D] transition duration-300 w-full">
      <div className="relative grid sm:grid-cols-2 border-x sm:border-x-2 border-neutral-300 dark:border-[#2D2D2D] transition duration-300">
        <div
          className={cn(
            'w-full sm:aspect-square border-r-0 sm:border-r-2 border-neutral-300 dark:border-[#2D2D2D] transition duration-300 overflow-scroll hide-scrollbar',
            right && 'border-b sm:border-b-0',
          )}
        >
          {left}
        </div>
        {right && (
          <div className="w-full sm:aspect-square sm:overflow-scroll hide-scrollbar">
            {right}
          </div>
        )}

        {/* dots */}
        <div className="absolute size-2 top-0 left-0 transform -translate-x-3/5 -translate-y-3/5 bg-white dark:bg-black border sm:border-2 border-neutral-300 dark:border-[#2D2D2D] transition duration-300 rounded-full"></div>
        <div className="absolute size-2 top-0 right-0 transform translate-x-3/5 -translate-y-3/5 bg-white dark:bg-black border sm:border-2 border-neutral-300 dark:border-[#2D2D2D] transition duration-300 rounded-full"></div>
        <div className="absolute size-2 bottom-0 left-0 transform -translate-x-3/5 translate-y-3/5 bg-white dark:bg-black border sm:border-2 border-neutral-300 dark:border-[#2D2D2D] transition duration-300 rounded-full"></div>
        <div className="absolute size-2 bottom-0 right-0 transform translate-x-3/5 translate-y-3/5 bg-white dark:bg-black border sm:border-2 border-neutral-300 dark:border-[#2D2D2D] transition duration-300 rounded-full"></div>
        <div className="hidden sm:block absolute size-2 top-0 left-1/2 transform -translate-x-3/5 -translate-y-3/5 bg-white dark:bg-black border sm:border-2 border-neutral-300 dark:border-[#2D2D2D] transition duration-300 rounded-full"></div>
        <div className="hidden sm:block absolute size-2 bottom-0 left-1/2 transform -translate-x-3/5 translate-y-3/5 bg-white dark:bg-black border sm:border-2 border-neutral-300 dark:border-[#2D2D2D] transition duration-300 rounded-full"></div>
      </div>
    </div>
  );
}
