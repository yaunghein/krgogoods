import {type ActionFunctionArgs} from '@shopify/remix-oxygen';
import {themeCookie} from '~/cookie.server';

export async function action({request}: ActionFunctionArgs) {
  const cookieHeader = request.headers.get('Cookie');
  const theme = await themeCookie.parse(cookieHeader);

  return new Response(null, {
    status: 204,
    headers: {
      'Set-Cookie': await themeCookie.serialize(
        theme === 'dark' ? 'light' : 'dark',
      ),
    },
  });
}
