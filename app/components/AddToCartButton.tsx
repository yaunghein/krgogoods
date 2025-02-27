import {type FetcherWithComponents} from '@remix-run/react';
import {CartForm, type OptimisticCartLineInput} from '@shopify/hydrogen';

export function AddToCartButton({
  analytics,
  children,
  disabled,
  lines,
  onClick,
}: {
  analytics?: unknown;
  children: React.ReactNode;
  disabled?: boolean;
  lines: Array<OptimisticCartLineInput>;
  onClick?: () => void;
}) {
  return (
    <CartForm route="/cart" inputs={{lines}} action={CartForm.ACTIONS.LinesAdd}>
      {(fetcher: FetcherWithComponents<any>) => (
        <>
          <input
            name="analytics"
            type="hidden"
            value={JSON.stringify(analytics)}
          />
          <button
            type="submit"
            onClick={onClick}
            disabled={disabled ?? fetcher.state !== 'idle'}
            className="block text-xs cursor-pointer bg-black text-white uppercase font-bold py-3 text-center w-1/2 relative border-2 border-neutral-300"
          >
            {children}
            {/* dots */}
            <div className="absolute size-2 top-0 left-0 transform -translate-x-3/5 -translate-y-3/5 bg-black border-2 border-neutral-300 rounded-full"></div>
            <div className="absolute size-2 top-0 right-0 transform translate-x-3/5 -translate-y-3/5 bg-black border-2 border-neutral-300 rounded-full"></div>
            <div className="absolute size-2 bottom-0 left-0 transform -translate-x-3/5 translate-y-3/5 bg-black border-2 border-neutral-300 rounded-full"></div>
            <div className="absolute size-2 bottom-0 right-0 transform translate-x-3/5 translate-y-3/5 bg-black border-2 border-neutral-300 rounded-full"></div>
          </button>
        </>
      )}
    </CartForm>
  );
}
