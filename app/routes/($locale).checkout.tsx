import {type MetaFunction, useLoaderData, Form} from '@remix-run/react';
import type {CartQueryDataReturn, CartReturn} from '@shopify/hydrogen';
import {CartForm, Money} from '@shopify/hydrogen';
import {
  data,
  type LoaderFunctionArgs,
  type ActionFunctionArgs,
  type HeadersFunction,
  redirect,
} from '@shopify/remix-oxygen';
import {useAside} from '~/components/Aside';

import {useOptimisticCart} from '@shopify/hydrogen';
import {Link} from '@remix-run/react';
import type {CartApiQueryFragment} from 'storefrontapi.generated';
import {CartLineItem} from '~/components/CartLineItemCheckout';
import {CartSummary} from '~/components/CartSummary';
import {cn} from '~/utils/cn';
import {TwoColumnLayout} from '~/components/TwoColumnLayout';

export type CartLayout = 'page' | 'aside';

export type CartMainProps = {
  cart: CartApiQueryFragment | null;
  layout: CartLayout;
};

export const meta: MetaFunction = () => {
  return [{title: `Krgogoods | Checkout`}];
};

export const headers: HeadersFunction = ({actionHeaders}) => actionHeaders;

import {Resend} from 'resend';
const resend = new Resend('re_uauU2oYt_Gq3Pt9KhkSnsrLmpREDXM2fe');

export async function action({request, context}: ActionFunctionArgs) {
  const {cart} = context;
  const formData = Object.fromEntries(await request.formData());

  // Parse form data
  const customerData = JSON.parse(formData.customerData as string) as any;
  const cartLines = JSON.parse(formData.lines as string) as any;

  // Extract Screenshot Data (if exists)
  let attachments = [];
  if (customerData.screenshot?.content) {
    attachments.push({
      content: customerData.screenshot.content.split(',')[1], // Remove data:image/jpeg;base64,
      filename: customerData.screenshot.filename || 'screenshot.jpg',
    });
  }

  // 🛒 **Format Order Details for Email**
  const orderDetailsHtml = `
    <h2>New Order from ${customerData.name}</h2>
    <p><strong>Email:</strong> ${customerData.email}</p>
    <p><strong>Phone:</strong> ${customerData.phone}</p>
    <p><strong>Address:</strong> ${customerData.address}, ${
    customerData.township
  }, ${customerData.province}</p>
    <p><strong>Payment Method:</strong> ${customerData.paymentMethod}</p>

    <h3>Order Summary</h3>
    <ul>
      ${cartLines
        .map(
          (line: any) => `
        <li>
          <img src="${line.merchandise.image.url}" width="80" height="80" />
          <strong>${
            line.merchandise.product.title
          }</strong> - ${line.merchandise.selectedOptions
            .map((o: any) => o.value)
            .join(' / ')} - ${line.quantity} x ${
            line.merchandise.price.amount
          } ${line.merchandise.price.currencyCode}
        </li>
      `,
        )
        .join('')}
    </ul>

    <h3>Total: ${cartLines.reduce(
      (total: number, line: any) =>
        total + parseFloat(line.cost.totalAmount.amount),
      0,
    )} MMK</h3>
  `;

  // 📩 **Send Email via Resend**
  const {data, error} = await resend.emails.send({
    from: 'Krgogoods <order@mail.krgogoods.com>',
    to: ['hello.krgogoods@gmail.com'],
    subject: `New Order from ${customerData.name}`,
    html: orderDetailsHtml,
    attachments,
  });

  if (error) {
    console.error('Failed to send email:', error);
    // return json({ success: false, message: "Email failed to send" });
  }

  console.log('Email sent successfully:', data);

  // 🛒 **Clear the Shopify Cart**
  if (cart) {
    try {
      await cart.removeLines(cartLines.map((line: any) => line.id)); // Clear cart if available in context
      console.log('Shopify Cart Cleared');
    } catch (err) {
      console.error('Error clearing cart:', err);
    }
  }

  // ✅ **Redirect to Success Page**
  return redirect(
    `/order-success?name=${encodeURIComponent(
      customerData.name,
    )}&email=${encodeURIComponent(
      customerData.email,
    )}&phone=${encodeURIComponent(
      customerData.phone,
    )}&address=${encodeURIComponent(
      customerData.address,
    )}&township=${encodeURIComponent(
      customerData.township,
    )}&province=${encodeURIComponent(customerData.province)}`,
  );
}

export async function loader({context}: LoaderFunctionArgs) {
  const {cart} = context;
  return await cart.get();
}
import {useState, useEffect} from 'react';
export default function Cart() {
  const cart = useLoaderData<typeof loader>();
  if (!cart) return null;

  const defauleState = {
    email: '',
    phone: '',
    name: '',
    address: '',
    township: '',
    province: '',
    paymentMethod: '',
    screenshot: {
      content: '',
      filename: '',
    },
  };

  const [formData, setFormData] = useState(defauleState);

  useEffect(() => {
    console.log(formData);
  }, [formData]);

  useEffect(() => {
    if (formData.province !== 'Yangon') {
      setFormData((data: any) => ({
        ...data,
        paymentMethod: '',
      }));
    }
  }, [formData.province]);

  useEffect(() => {
    if (formData.paymentMethod === 'cod') {
      setFormData((data: any) => ({
        ...data,
        screenshot: {content: '', filename: ''},
      }));
    }
  }, [formData.paymentMethod]);

  return (
    // <Form method="post">
    <TwoColumnLayout
      left={<Left cart={cart} formData={formData} setFormData={setFormData} />}
      right={<Right cart={cart} formData={formData} />}
    />
    // </Form>
  );
}

import QrKpay from '~/assets/qr-kpay.png';
import QrAya from '~/assets/qr-aya.png';
import QrWave from '~/assets/qr-wave.png';

const Qrs: Record<string, string> = {
  kpay: QrKpay,
  aya: QrAya,
  wave: QrWave,
};

const Labels: Record<string, string> = {
  kpay: 'KBZPay',
  aya: 'AYA Pay',
  wave: 'WavePay',
};

function Left({
  cart: originalCart,
  formData,
  setFormData,
}: {
  cart: CartReturn;
  formData: any;
  setFormData: any;
}) {
  const cart = useOptimisticCart(originalCart);
  const [screenshot, setScreenshot] = useState({content: '', filename: ''});
  // const [preview, setPreview] = useState('');

  const handleFileUpload = (event: any) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (r) => {
        setScreenshot({
          content: r.target!.result!.toString(),
          filename: file.name,
        });
        // const blobUrl = URL.createObjectURL(file);
        // setPreview(blobUrl);
      };
      reader.onerror = (error) => {
        console.error('Error converting file to Base64:', error);
      };
    }
  };

  useEffect(() => {
    setFormData((data: any) => ({
      ...data,
      screenshot,
    }));
  }, [screenshot]);

  return (
    <div className="p-4 sm:p-10">
      <div className="font-[HelveticaNeueBold] text-xs leading-none translate-y-[0.1rem] sm:text-base mb-2 sm:mb-4 ml-2 sm:ml-4 uppercase">
        Contact
      </div>
      <input
        type="email"
        name="email"
        className="border leading-none sm:border-2 border-neutral-300 dark:border-[#2D2D2D] transition duration-300 focus:border-neutral-300 focus:outline-0 w-full text-sm sm:text-base px-3 pt-[0.8rem] pb-3 sm:pt-[1.15rem] sm:pb-4 sm:px-4 placeholder:opacity-20 placeholder:text-black dark:placeholder:text-white dark:focus:border-[#2D2D2D]"
        placeholder="user@email.com"
        onChange={(e) =>
          setFormData((data: any) => ({
            ...data,
            [e.target.name]: e.target.value,
          }))
        }
      />
      <input
        type="phone"
        name="phone"
        className="border leading-none sm:border-2 border-t-0 sm:border-t-0 border-neutral-300 dark:border-[#2D2D2D] transition duration-300 focus:border-neutral-300 focus:outline-0 w-full text-sm sm:text-base px-3 pt-[0.8rem] pb-3 sm:pt-[1.15rem] sm:pb-4 sm:px-4 placeholder:opacity-20 placeholder:text-black dark:placeholder:text-white dark:focus:border-[#2D2D2D]"
        placeholder="Mobile Phone Number"
        onChange={(e) =>
          setFormData((data: any) => ({
            ...data,
            [e.target.name]: e.target.value,
          }))
        }
      />
      <div className="font-[HelveticaNeueBold] text-xs leading-none translate-y-[0.1rem] sm:text-base mb-2 sm:mb-4 mt-4 ml-2 sm:ml-4 uppercase">
        Delivery
      </div>
      <input
        type="text"
        name="name"
        className="border leading-none sm:border-2 border-neutral-300 dark:border-[#2D2D2D] transition duration-300 focus:border-neutral-300 focus:outline-0 w-full text-sm sm:text-base px-3 pt-[0.8rem] pb-3 sm:pt-[1.15rem] sm:pb-4 sm:px-4 placeholder:opacity-20 placeholder:text-black dark:placeholder:text-white dark:focus:border-[#2D2D2D]"
        placeholder="Name"
        onChange={(e) =>
          setFormData((data: any) => ({
            ...data,
            [e.target.name]: e.target.value,
          }))
        }
      />
      <input
        type="text"
        name="address"
        className="border leading-none sm:border-2 border-t-0 sm:border-t-0 border-neutral-300 dark:border-[#2D2D2D] transition duration-300 focus:border-neutral-300 focus:outline-0 w-full text-sm sm:text-base px-3 pt-[0.8rem] pb-3 sm:pt-[1.15rem] sm:pb-4 sm:px-4 placeholder:opacity-20 placeholder:text-black dark:placeholder:text-white dark:focus:border-[#2D2D2D]"
        placeholder="Address"
        onChange={(e) =>
          setFormData((data: any) => ({
            ...data,
            [e.target.name]: e.target.value,
          }))
        }
      />
      <div className="w-full grid sm:grid-cols-2">
        <input
          name="township"
          placeholder="Township"
          className="border leading-none sm:border-2 border-t-0 sm:border-t-0 border-neutral-300 dark:border-[#2D2D2D] transition duration-300 focus:border-neutral-300 focus:outline-0 w-full text-sm sm:text-base px-3 pt-[0.8rem] pb-3 sm:pt-[1.15rem] sm:pb-4 sm:px-4 placeholder:opacity-20 placeholder:text-black dark:placeholder:text-white dark:focus:border-[#2D2D2D]"
          onChange={(e) =>
            setFormData((data: any) => ({
              ...data,
              [e.target.name]: e.target.value,
            }))
          }
        />
        <div className="relative">
          <select
            name="province"
            value={formData.province}
            className="appearance-none border leading-none sm:border-2 border-t-0 sm:border-t-0 sm:border-l-0 border-neutral-300 dark:border-[#2D2D2D] transition duration-300 focus:border-neutral-300 focus:outline-0 w-full text-sm sm:text-base px-3 pt-[0.8rem] pb-3 sm:pt-[1.15rem] sm:pb-4 sm:px-4 placeholder:opacity-20 placeholder:text-black dark:placeholder:text-white dark:focus:border-[#2D2D2D]"
            onChange={(e) =>
              setFormData((data: any) => ({
                ...data,
                [e.target.name]: e.target.value,
              }))
            }
          >
            <option value="">Province</option>
            {/* States */}
            <option value="Kachin">Kachin</option>
            <option value="Kayah">Kayah</option>
            <option value="Kayin">Kayin</option>
            <option value="Chin">Chin</option>
            <option value="Mon">Mon</option>
            <option value="Rakhine">Rakhine</option>
            <option value="Shan">Shan</option>
            {/* Regions */}
            <option value="Sagaing">Sagaing</option>
            <option value="Tanintharyi">Tanintharyi</option>
            <option value="Bago">Bago</option>
            <option value="Magway">Magway</option>
            <option value="Mandalay">Mandalay</option>
            <option value="Yangon">Yangon</option>
            <option value="Ayeyarwady">Ayeyarwady</option>
            <option value="Naypyidaw">Naypyidaw</option> {/* Union Territory */}
          </select>

          <div className="pointer-events-none absolute top-1/2 -translate-y-1/2 right-5 w-3 h-2">
            <svg
              width="100%"
              height="100%"
              viewBox="0 0 12 8"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M1 1L6 6L11 1" stroke="#C2C2C2" strokeWidth="2" />
            </svg>
          </div>
        </div>
      </div>
      <div className="font-[HelveticaNeueBold] text-xs leading-none translate-y-[0.1rem] sm:text-base mb-2 sm:mb-4 mt-4 ml-2 sm:ml-4 uppercase">
        Payment
      </div>
      <div
        className={cn(
          'w-full text-sm sm:text-base border leading-none sm:border-2 border-neutral-300 dark:border-[#2D2D2D] transition duration-300',
        )}
      >
        <div
          className={cn(
            'flex flex-col sm:flex-row',
            formData.paymentMethod &&
              formData.paymentMethod !== 'cod' &&
              'border-b sm:border-b-2 border-neutral-300 dark:border-[#2D2D2D] transition duration-300',
          )}
        >
          <button
            type="button"
            className={cn(
              'flex-1 text-xs leading-none sm:text-sm font-[HelveticaNeueBold] py-3 sm:py-4 uppercase border-b sm:border-b-0 sm:border-r-2 border-neutral-300 dark:border-[#2D2D2D] transition duration-300 cursor-pointer',
              formData.paymentMethod === 'kpay'
                ? 'text-white bg-black dark:text-black dark:bg-white'
                : 'text-black bg-white dark:text-white dark:bg-black',
            )}
            onClick={() => {
              setFormData((data: any) => ({
                ...data,
                paymentMethod: 'kpay',
              }));
            }}
          >
            <div className="translate-y-[0.1rem]">KPAY</div>
          </button>
          <button
            type="button"
            className={cn(
              'flex-1 text-xs leading-none sm:text-sm font-[HelveticaNeueBold] py-3 sm:py-4 uppercase border-b sm:border-b-0 sm:border-r-2 border-neutral-300 dark:border-[#2D2D2D] transition duration-300 cursor-pointer',
              formData.paymentMethod === 'aya'
                ? 'text-white bg-black dark:text-black dark:bg-white'
                : 'text-black bg-white dark:text-white dark:bg-black',
            )}
            onClick={() => {
              setFormData((data: any) => ({
                ...data,
                paymentMethod: 'aya',
              }));
            }}
          >
            <div className="translate-y-[0.1rem]">AYA</div>
          </button>
          <button
            type="button"
            className={cn(
              'flex-1 text-xs leading-none sm:text-sm font-[HelveticaNeueBold] py-3 sm:py-4 uppercase cursor-pointer',
              formData.paymentMethod === 'wave'
                ? 'text-white bg-black dark:text-black dark:bg-white'
                : 'text-black bg-white dark:text-white dark:bg-black',
            )}
            onClick={() => {
              setFormData((data: any) => ({
                ...data,
                paymentMethod: 'wave',
              }));
            }}
          >
            <div className="translate-y-[0.1rem]">Wave</div>
          </button>
          {formData.province === 'Yangon' && (
            <button
              type="button"
              className={cn(
                'flex-1 font-[HelveticaNeueBold] leading-none font-xs sm:text-base py-3 sm:py-4 px-4 whitespace-nowrap cursor-pointer border-t sm:border-t-0 sm:border-l-2 border-neutral-300 dark:border-[#2D2D2D] transition duration-300',
                formData.paymentMethod === 'cod'
                  ? 'text-white bg-black dark:text-black dark:bg-white'
                  : 'text-black bg-white dark:text-white dark:bg-black',
              )}
              onClick={() => {
                setFormData((data: any) => ({
                  ...data,
                  paymentMethod: 'cod',
                }));
              }}
            >
              <div className="translate-y-[0.1rem] font-[HelveticaNeueBold]">
                Cash On Delivery
              </div>
            </button>
          )}
        </div>
        {formData.paymentMethod && formData.paymentMethod !== 'cod' && (
          <div className="relative py-3 flex flex-col-reverse items-center justify-center">
            <div className="w-[10.63rem] aspect-square">
              <img
                src={Qrs[formData.paymentMethod]}
                alt="Payment QR"
                className="w-full h-full transitin duration-300"
              />
            </div>

            <div className="sm:absolute top-1/2 sm:-translate-y-1/2 left-14 leading-none grid gap-3 sm:gap-5 text-center sm:text-left my-3 sm:my-0">
              <div className="font-[HelveticaNeueBold] text-xs leading-none translate-y-[0.1rem] sm:text-base max-w-[7.2rem] uppercase">
                USE {Labels[formData.paymentMethod]} Scan to Pay
              </div>
              <div className="font-[HelveticaNeueBold] text-xs leading-none translate-y-[0.1rem] sm:text-base max-w-[7rem] uppercase">
                {cart.cost?.subtotalAmount?.amount ? (
                  <Money data={cart.cost?.subtotalAmount} />
                ) : (
                  '-'
                )}
              </div>
            </div>
          </div>
        )}

        {formData.paymentMethod && formData.paymentMethod !== 'cod' && (
          <label
            htmlFor="screenshot"
            className={cn(
              'block text-center flex-1 text-xs leading-none sm:text-sm font-[HelveticaNeueBold] px-4 py-3 sm:py-4 uppercase border-t sm:border-t-2 border-neutral-300 dark:border-[#2D2D2D] transition duration-300 cursor-pointer w-full text-white bg-black ',
            )}
          >
            {!formData.screenshot.content
              ? 'upload payment screenshot'
              : `Screenshot uploaded: ${formData.screenshot.filename}`}
            <input
              id="screenshot"
              type="file"
              name="screenshot"
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>
        )}

        {/* {preview && (
          <div className="border-t sm:border-t-2 border-neutral-300 dark:border-[#2D2D2D] transition duration-300 p-4">
            <div className="font-[HelveticaNeueBold] mb-4 my-4 ml-4 uppercase">
              Screenshot Preview
            </div>
            <div className="w-full h-auto mt-4">
              <img
                src={preview}
                alt="Preview"
                // className="mt-2 w-32 h-32"
              />
            </div>
          </div>
        )} */}
      </div>
    </div>
  );
}

import MMPayments from '~/assets/mm-payments.svg';

function Right({
  cart: originalCart,
  formData,
}: {
  cart: CartReturn;
  formData: any;
}) {
  const cart = useOptimisticCart(originalCart);
  const [isSending, setIsSending] = useState(false);

  return (
    <div className="h-full flex flex-col justify-between">
      <div className="p-4 sm:p-0">
        {(cart?.lines?.nodes ?? []).map((line) => (
          <CartLineItem key={line.id} line={line} layout="page" />
        ))}
      </div>
      <div className="sm:mt-10 p-4 sm:p-7">
        <div className="mb-3 sm:bm-4">
          <div className="flex items-center justify-between w-fill sm:w-1/2">
            <div className="font-[HelveticaNeueBold] uppercase text-sm">
              TOTAL inc. taxes
            </div>
            <div className="max-w-[7rem] text-sm uppercase">
              {cart.cost?.subtotalAmount?.amount ? (
                <Money data={cart.cost?.subtotalAmount} />
              ) : (
                '-'
              )}
            </div>
          </div>
        </div>
        <Form
          method="post"
          className="flex flex-col sm:flex-row items-center gap-4 sm:gap-7"
        >
          <input
            type="hidden"
            name="customerData"
            value={JSON.stringify(formData)}
          />
          <input
            type="hidden"
            name="lines"
            value={JSON.stringify(cart?.lines?.nodes)}
          />
          <button
            type="submit"
            disabled={
              !formData.email ||
              !formData.name ||
              !formData.address ||
              (!formData.screenshot.content && formData.paymentMethod !== 'cod')
            }
            onClick={() => setIsSending(true)}
            className="disabled:opacity-50 disabled:pointer-events-none cursor-pointer block z-10 group text-xs sm:w-1/2 bg-white text-black hover:bg-black hover:text-white dark:bg-black dark:text-white dark:hover:bg-white dark:hover:text-black uppercase font-[HelveticaNeueBold] py-3 text-center w-full relative border sm:border-2 border-neutral-300 dark:border-[#2D2D2D] transition duration-300"
          >
            <div className="translate-y-[0.1rem]">
              {isSending ? '  submitting order...' : '  submit order'}
            </div>
            {/* dots */}
            <div className="absolute size-2 top-0 left-0 transform -translate-x-3/5 -translate-y-3/5 bg-white dark:bg-black group-hover:bg-black dark:group-hover:bg-white border sm:border-2 border-neutral-300 dark:border-[#2D2D2D] transition duration-300 rounded-full"></div>
            <div className="absolute size-2 top-0 right-0 transform translate-x-3/5 -translate-y-3/5 bg-white dark:bg-black group-hover:bg-black dark:group-hover:bg-white border sm:border-2 border-neutral-300 dark:border-[#2D2D2D] transition duration-300 rounded-full"></div>
            <div className="absolute size-2 bottom-0 left-0 transform -translate-x-3/5 translate-y-3/5 bg-white dark:bg-black group-hover:bg-black dark:group-hover:bg-white border sm:border-2 border-neutral-300 dark:border-[#2D2D2D] transition duration-300 rounded-full"></div>
            <div className="absolute size-2 bottom-0 right-0 transform translate-x-3/5 translate-y-3/5 bg-white dark:bg-black group-hover:bg-black dark:group-hover:bg-white border sm:border-2 border-neutral-300 dark:border-[#2D2D2D] transition duration-300 rounded-full"></div>
          </button>

          <img
            src={MMPayments}
            alt=""
            className="w-[7.44rem] aspect-[1/0.29] dark:invert transition duration-300"
          />
        </Form>
        <p className="text-sm mt-5 sm:max-w-[13rem] font-[HelveticaNeueLight] text-center sm:text-left">
          Order Confirmation will be send to your email within 24 hours after
          submission.
        </p>
      </div>
    </div>
  );
}

// export async function action({request, context}: ActionFunctionArgs) {
//   const {cart} = context;
//   const formData = await request.formData();

//   const {action, inputs} = CartForm.getFormInput(formData);

//   if (!action) {
//     throw new Error('No action provided');
//   }

//   let status = 200;
//   let result: CartQueryDataReturn;

//   switch (action) {
//     case CartForm.ACTIONS.LinesAdd:
//       result = await cart.addLines(inputs.lines);
//       break;
//     case CartForm.ACTIONS.LinesUpdate:
//       result = await cart.updateLines(inputs.lines);
//       break;
//     case CartForm.ACTIONS.LinesRemove:
//       result = await cart.removeLines(inputs.lineIds);
//       break;
//     case CartForm.ACTIONS.DiscountCodesUpdate: {
//       const formDiscountCode = inputs.discountCode;

//       // User inputted discount code
//       const discountCodes = (
//         formDiscountCode ? [formDiscountCode] : []
//       ) as string[];

//       // Combine discount codes already applied on cart
//       discountCodes.push(...inputs.discountCodes);

//       result = await cart.updateDiscountCodes(discountCodes);
//       break;
//     }
//     case CartForm.ACTIONS.GiftCardCodesUpdate: {
//       const formGiftCardCode = inputs.giftCardCode;

//       // User inputted gift card code
//       const giftCardCodes = (
//         formGiftCardCode ? [formGiftCardCode] : []
//       ) as string[];

//       // Combine gift card codes already applied on cart
//       giftCardCodes.push(...inputs.giftCardCodes);

//       result = await cart.updateGiftCardCodes(giftCardCodes);
//       break;
//     }
//     case CartForm.ACTIONS.BuyerIdentityUpdate: {
//       result = await cart.updateBuyerIdentity({
//         ...inputs.buyerIdentity,
//       });
//       break;
//     }
//     default:
//       throw new Error(`${action} cart action is not defined`);
//   }

//   const cartId = result?.cart?.id;
//   const headers = cartId ? cart.setCartId(result.cart.id) : new Headers();
//   const {cart: cartResult, errors, warnings} = result;

//   const redirectTo = formData.get('redirectTo') ?? null;
//   if (typeof redirectTo === 'string') {
//     status = 303;
//     headers.set('Location', redirectTo);
//   }

//   return data(
//     {
//       cart: cartResult,
//       errors,
//       warnings,
//       analytics: {
//         cartId,
//       },
//     },
//     {status, headers},
//   );
// }
