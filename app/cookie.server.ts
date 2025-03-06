import {createCookie} from '@shopify/remix-oxygen';

export const localizationCookie = createCookie('localization', {
  path: '/',
  httpOnly: true,
  secure: true,
});

export const themeCookie = createCookie('theme', {
  path: '/',
  httpOnly: true,
  secure: true,
});
