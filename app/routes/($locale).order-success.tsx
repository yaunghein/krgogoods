import {type LoaderFunctionArgs} from '@shopify/remix-oxygen';
import {useLoaderData, type MetaFunction} from '@remix-run/react';
import {useNavigate, useLocation} from '@remix-run/react';

export const meta: MetaFunction = () => {
  return [{title: 'Krgogoods | Order Success'}];
};

export async function loader(args: LoaderFunctionArgs) {
  const url = new URL(args.request.url);
  const name = url.searchParams.get('name');
  const email = url.searchParams.get('email');
  const phone = url.searchParams.get('phone');
  const address = url.searchParams.get('address');
  const township = url.searchParams.get('township');
  const province = url.searchParams.get('province');

  return {
    name,
    email,
    phone,
    address,
    township,
    province,
  };
}

import {TwoColumnLayout} from '~/components/TwoColumnLayout';

export default function Homepage() {
  const data = useLoaderData<typeof loader>();

  return <TwoColumnLayout left={<Left data={data} />} />;
}

function Left({data}: {data: any}) {
  return (
    <div className="p-4 sm:p-7 h-full flex flex-col justify-between">
      <div className="grid gap-4 max-w-[28rem]">
        <div className="font-[HelveticaNeueBold] uppercase leading-none">
          THANK YOU FOR YOUR PURCHASE!
        </div>
        <div>
          Hi{' '}
          <span className="font-[HelveticaNeueBold]">
            <span className="uppercase">{data.name}</span>, your order has been
            submitted!
          </span>
        </div>
        <div className="leading-tight">
          <span className="font-[HelveticaNeueBold] uppercase">
            Order Confirmation
          </span>{' '}
          will be send to your email within 24 hours.
        </div>
        <div className="leading-tight">
          Please note that delivery fees may vary on your location and to be
          paid upon delivery.
        </div>

        <div className="font-[HelveticaNeueBold]">Delivery Information</div>
        <div>
          <div>{data.name}</div>
          <div>{data.email}</div>
          <div>{data.phone}</div>
        </div>
        <div>
          <div>{data.address}</div>
          <div>
            {data.township}
            {data.province && '/'}
            {data.province}
          </div>
        </div>
      </div>
    </div>
  );
}
