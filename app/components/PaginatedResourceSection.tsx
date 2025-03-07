import * as React from 'react';
import {Pagination} from '@shopify/hydrogen';

/**
 * <PaginatedResourceSection > is a component that encapsulate how the previous and next behaviors throughout your application.
 */
export function PaginatedResourceSection<NodesType>({
  connection,
  children,
  resourcesClassName,
}: {
  connection: React.ComponentProps<typeof Pagination<NodesType>>['connection'];
  children: React.FunctionComponent<{node: NodesType; index: number}>;
  resourcesClassName?: string;
}) {
  const [key, setKey] = React.useState(Date.now());

  React.useEffect(() => {
    setKey(Date.now()); // Forces component to re-render on refresh
  }, []);

  return (
    <Pagination key={key} connection={connection}>
      {({nodes, isLoading, PreviousLink, NextLink}) => {
        const resourcesMarkup = nodes.map((node, index) =>
          children({node, index}),
        );

        return (
          <div>
            <PreviousLink className="flex justify-center my-8 sm:my-10 px-8">
              <div className="group block text-xs cursor-pointer bg-white text-black uppercase font-[HelveticaNeueBold] py-3 text-center w-full sm:w-96 relative border sm:border-2 border-neutral-300 dark:border-[#2D2D2D] transition duration-300 transition duration-300 hover:bg-black hover:text-white">
                {isLoading ? 'Loading...' : <span>Load previous</span>}
                {/* dots */}
                <div className="absolute size-2 top-0 left-0 transform -translate-x-3/5 -translate-y-3/5 bg-white border sm:border-2 border-neutral-300 dark:border-[#2D2D2D] transition duration-300 rounded-full transition duration-300 group-hover:bg-black"></div>
                <div className="absolute size-2 top-0 right-0 transform translate-x-3/5 -translate-y-3/5 bg-white border sm:border-2 border-neutral-300 dark:border-[#2D2D2D] transition duration-300 rounded-full transition duration-300 group-hover:bg-black"></div>
                <div className="absolute size-2 bottom-0 left-0 transform -translate-x-3/5 translate-y-3/5 bg-white border sm:border-2 border-neutral-300 dark:border-[#2D2D2D] transition duration-300 rounded-full transition duration-300 group-hover:bg-black"></div>
                <div className="absolute size-2 bottom-0 right-0 transform translate-x-3/5 translate-y-3/5 bg-white border sm:border-2 border-neutral-300 dark:border-[#2D2D2D] transition duration-300 rounded-full transition duration-300 group-hover:bg-black"></div>
              </div>
            </PreviousLink>
            {resourcesClassName ? (
              <div className={resourcesClassName}>{resourcesMarkup}</div>
            ) : (
              resourcesMarkup
            )}

            <NextLink className="flex justify-center mt-8 sm:mt-10 px-8">
              <div className="group block text-xs cursor-pointer bg-white text-black uppercase font-[HelveticaNeueBold] py-3 text-center w-full sm:w-96 relative border sm:border-2 border-neutral-300 dark:border-[#2D2D2D] transition duration-300 transition duration-300 hover:bg-black hover:text-white">
                {isLoading ? 'Loading...' : <span>Load more</span>}
                {/* dots */}
                <div className="absolute size-2 top-0 left-0 transform -translate-x-3/5 -translate-y-3/5 bg-white border sm:border-2 border-neutral-300 dark:border-[#2D2D2D] transition duration-300 rounded-full transition duration-300 group-hover:bg-black"></div>
                <div className="absolute size-2 top-0 right-0 transform translate-x-3/5 -translate-y-3/5 bg-white border sm:border-2 border-neutral-300 dark:border-[#2D2D2D] transition duration-300 rounded-full transition duration-300 group-hover:bg-black"></div>
                <div className="absolute size-2 bottom-0 left-0 transform -translate-x-3/5 translate-y-3/5 bg-white border sm:border-2 border-neutral-300 dark:border-[#2D2D2D] transition duration-300 rounded-full transition duration-300 group-hover:bg-black"></div>
                <div className="absolute size-2 bottom-0 right-0 transform translate-x-3/5 translate-y-3/5 bg-white border sm:border-2 border-neutral-300 dark:border-[#2D2D2D] transition duration-300 rounded-full transition duration-300 group-hover:bg-black"></div>
              </div>
            </NextLink>
          </div>
        );
      }}
    </Pagination>
  );
}
