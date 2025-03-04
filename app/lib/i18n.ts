import type {I18nBase} from '@shopify/hydrogen';
import {localizationCookie} from '~/cookie.server';

export interface I18nLocale extends I18nBase {
  pathPrefix: string;
}

// acctually getting from cookie
export async function getLocaleFromRequest(
  request: Request,
): Promise<I18nLocale> {
  // const url = new URL(request.url);
  // const firstPathPart = url.pathname.split('/')[1]?.toUpperCase() ?? '';

  // type I18nFromUrl = [I18nLocale['language'], I18nLocale['country']];

  // let pathPrefix = '';
  // let [language, country]: I18nFromUrl = ['EN', 'US'];

  // if (/^[A-Z]{2}-[A-Z]{2}$/i.test(firstPathPart)) {
  //   pathPrefix = '/' + firstPathPart;
  //   [language, country] = firstPathPart.split('-') as I18nFromUrl;
  // }

  const cookieHeader = request.headers.get('Cookie');
  const country = await localizationCookie.parse(cookieHeader);

  return {language: 'EN', country, pathPrefix: ''};
  // return {language, country, pathPrefix};
}
