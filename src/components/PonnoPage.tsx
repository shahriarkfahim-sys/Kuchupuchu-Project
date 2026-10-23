import React, { useMemo, useState } from 'react';
import {
  ArrowRight,
  Check,
  ChevronDown,
  Minus,
  Plus,
  Search,
  ShieldCheck,
  ShoppingBag,
  ShoppingCart,
  X,
} from 'lucide-react';
import { Language } from '../types';
import { formatLocalizedNumber } from '../i18n/translations';

type Category = 'all' | 'feeding' | 'diapering' | 'bath' | 'care';

interface Product {
  id: string;
  brandBn: string;
  brandEn: string;
  nameBn: string;
  nameEn: string;
  category: Exclude<Category, 'all'>;
  price: number;
  oldPrice?: number;
  sizeBn: string;
  sizeEn: string;
  emoji: string;
  color: string;
  promoted?: boolean;
}

const products: Product[] = [
  { id: 'bashundhara-diaper', brandBn: 'বসুন্ধরা', brandEn: 'Bashundhara', nameBn: 'বেবি ডায়াপার প্যান্ট', nameEn: 'Baby Diaper Pants', category: 'diapering', price: 699, oldPrice: 780, sizeBn: 'এম • ৩২ পিস', sizeEn: 'M • 32 pcs', emoji: '👶', color: 'bg-[#E4F1FF]', promoted: true },
  { id: 'lactogen-formula', brandBn: 'ল্যাকটোজেন', brandEn: 'Lactogen', nameBn: 'ইনফ্যান্ট ফর্মুলা', nameEn: 'Infant Formula', category: 'feeding', price: 845, sizeBn: '১ নম্বর • ৩৫০ গ্রাম', sizeEn: 'Stage 1 • 350 g', emoji: '🍼', color: 'bg-[#FFF0D8]' },
  { id: 'fresh-wipes', brandBn: 'ফ্রেশ', brandEn: 'Fresh', nameBn: 'বেবি ওয়েট ওয়াইপস', nameEn: 'Baby Wet Wipes', category: 'diapering', price: 145, sizeBn: '৮০টি', sizeEn: '80 wipes', emoji: '🧻', color: 'bg-[#E7F4EB]', promoted: true },
  { id: 'meril-lotion', brandBn: 'মেরিল', brandEn: 'Meril', nameBn: 'বেবি লোশন', nameEn: 'Baby Lotion', category: 'care', price: 260, sizeBn: '২০০ মিলি', sizeEn: '200 ml', emoji: '🧴', color: 'bg-[#FCE8E5]' },
  { id: 'kodomo-shampoo', brandBn: 'কোডোমো', brandEn: 'Kodomo', nameBn: 'জেন্টল বেবি শ্যাম্পু', nameEn: 'Gentle Baby Shampoo', category: 'bath', price: 310, sizeBn: '২০০ মিলি', sizeEn: '200 ml', emoji: '🫧', color: 'bg-[#E7F2FB]' },
  { id: 'savlon-soap', brandBn: 'স্যাভলন', brandEn: 'Savlon', nameBn: 'বেবি সোপ', nameEn: 'Baby Soap', category: 'bath', price: 95, sizeBn: '৭৫ গ্রাম', sizeEn: '75 g', emoji: '🧼', color: 'bg-[#F2EAFE]' },
  { id: 'cerelac-cereal', brandBn: 'সেরেলাক', brandEn: 'Cerelac', nameBn: 'রাইস ও ভেজিটেবল সিরিয়াল', nameEn: 'Rice & Vegetable Cereal', category: 'feeding', price: 430, sizeBn: '৬ মাস+ • ৩০০ গ্রাম', sizeEn: '6+ months • 300 g', emoji: '🥣', color: 'bg-[#FFF2D5]' },
  { id: 'supermom-diaper', brandBn: 'সুপারমম', brandEn: 'Supermom', nameBn: 'বেবি ডায়াপার', nameEn: 'Baby Diaper', category: 'diapering', price: 525, sizeBn: 'এল • ৩০ পিস', sizeEn: 'L • 30 pcs', emoji: '🧷', color: 'bg-[#FBE8F0]' },
  { id: 'dano-milk', brandBn: 'ডানো', brandEn: 'Dano', nameBn: 'গ্রোয়িং-আপ মিল্ক', nameEn: 'Growing-up Milk', category: 'feeding', price: 780, sizeBn: '১+ বছর • ৪০০ গ্রাম', sizeEn: '1+ years • 400 g', emoji: '🥛', color: 'bg-[#E5F3F0]' },
  { id: 'jui-oil', brandBn: 'জুঁই', brandEn: 'Jui', nameBn: 'বেবি ম্যাসাজ অয়েল', nameEn: 'Baby Massage Oil', category: 'care', price: 190, sizeBn: '২০০ মিলি', sizeEn: '200 ml', emoji: '🌼', color: 'bg-[#FFF3DA]' },
];

const categories: { id: Category; bn: string; en: string }[] = [
  { id: 'all', bn: 'সব পণ্য', en: 'All items' },
  { id: 'diapering', bn: 'ডায়াপার ও ওয়াইপস', en: 'Diapers & wipes' },
  { id: 'feeding', bn: 'খাবার ও ফিডিং', en: 'Food & feeding' },
  { id: 'bath', bn: 'গোসল ও পরিচর্যা', en: 'Bath & body' },
  { id: 'care', bn: 'দৈনন্দিন যত্ন', en: 'Daily care' },
];

interface PonnoPageProps {
  currentLang: Language;
}

interface PaymentResponse {
  paymentUrl: string;
}

function isPaymentResponse(value: unknown): value is PaymentResponse {
  if (typeof value !== 'object' || value === null || !('paymentUrl' in value)) return false;
  const paymentUrl = value.paymentUrl;
  if (typeof paymentUrl !== 'string') return false;
  try {
    return new URL(paymentUrl).protocol === 'https:';
  } catch {
    return false;
  }
}

export const PonnoPage: React.FC<PonnoPageProps> = ({ currentLang }) => {
  const isBn = currentLang === 'bn';
  const [activeCategory, setActiveCategory] = useState<Category>('all');
  const [search, setSearch] = useState('');
  const [cart, setCart] = useState<Record<string, number>>({});
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [phone, setPhone] = useState('');
  const [promoInput, setPromoInput] = useState('');
  const [discountPercent, setDiscountPercent] = useState(0);
  const [appliedPromoCode, setAppliedPromoCode] = useState('');
  const [promoMessage, setPromoMessage] = useState('');
  const [checkoutMessage, setCheckoutMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const visibleProducts = useMemo(() => {
    const query = search.trim().toLocaleLowerCase();
    return products.filter((product) => {
      const categoryMatches = activeCategory === 'all' || product.category === activeCategory;
      const searchMatches = !query || [
        product.brandBn,
        product.brandEn,
        product.nameBn,
        product.nameEn,
      ].some((value) => value.toLocaleLowerCase().includes(query));
      return categoryMatches && searchMatches;
    });
  }, [activeCategory, search]);

  const cartItems = products.filter((product) => cart[product.id] > 0);
  const itemCount = Object.values(cart).reduce((sum, quantity) => sum + quantity, 0);
  const subtotal = cartItems.reduce((sum, product) => sum + product.price * cart[product.id], 0);
  const discount = Math.round(subtotal * discountPercent / 100);
  const delivery = subtotal >= 1500 || subtotal === 0 ? 0 : 60;
  const total = subtotal - discount + delivery;
  const money = (amount: number) => `৳${formatLocalizedNumber(amount, currentLang)}`;

  const changeQuantity = (productId: string, change: number) => {
    setCart((previous) => {
      const nextQuantity = (previous[productId] || 0) + change;
      const next = { ...previous };
      if (nextQuantity <= 0) delete next[productId];
      else next[productId] = nextQuantity;
      return next;
    });
  };

  const applyPromo = () => {
    const code = promoInput.trim().toUpperCase();
    if (code === 'PONNO10') {
      setDiscountPercent(10);
      setAppliedPromoCode(code);
      setPromoMessage(isBn ? 'PONNO10 প্রয়োগ হয়েছে — ১০% ছাড়!' : 'PONNO10 applied — 10% off!');
    } else if (code === 'BABY15') {
      setDiscountPercent(15);
      setAppliedPromoCode(code);
      setPromoMessage(isBn ? 'BABY15 প্রয়োগ হয়েছে — ১৫% ছাড়!' : 'BABY15 applied — 15% off!');
    } else {
      setDiscountPercent(0);
      setAppliedPromoCode('');
      setPromoMessage(isBn ? 'কোডটি মিলছে না। PONNO10 বা BABY15 চেষ্টা করুন।' : 'Code not found. Try PONNO10 or BABY15.');
    }
  };

  const startBkashCheckout = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setCheckoutMessage('');
    const normalizedPhone = phone.replace(/\D/g, '').replace(/^880/, '0');
    if (!/^01[3-9]\d{8}$/.test(normalizedPhone)) {
      setCheckoutMessage(isBn ? 'সঠিক ১১ ডিজিটের বাংলাদেশি মোবাইল নম্বর দিন।' : 'Enter a valid 11-digit Bangladesh mobile number.');
      return;
    }
    if (cartItems.length === 0) {
      setCheckoutMessage(isBn ? 'পেমেন্টের আগে কার্টে পণ্য যোগ করুন।' : 'Add an item to your cart before checkout.');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/payments/bkash/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mobile: normalizedPhone,
          items: cartItems.map(({ id }) => ({ productId: id, quantity: cart[id] })),
          promoCode: appliedPromoCode || undefined,
        }),
      });
      if (!response.ok) {
        setCheckoutMessage(isBn
          ? 'এই মুহূর্তে bKash checkout চালু নেই। অর্ডার বা পেমেন্ট নেওয়া হয়নি।'
          : 'bKash checkout is not available yet. No order or payment was made.');
        return;
      }
      const result: unknown = await response.json();
      if (!isPaymentResponse(result)) {
        setCheckoutMessage(isBn
          ? 'নিরাপদ bKash checkout লিংক পাওয়া যায়নি। কোনো পেমেন্ট নেওয়া হয়নি।'
          : 'Could not get a secure bKash checkout link. No payment was taken.');
        return;
      }
      window.location.assign(result.paymentUrl);
    } catch {
      setCheckoutMessage(isBn
        ? 'bKash gateway সংযোগ করা যায়নি। পরে আবার চেষ্টা করুন; কোনো পেমেন্ট নেওয়া হয়নি।'
        : 'Could not connect to the bKash gateway. Please try again; no payment was taken.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-7 pb-12">
      <section className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-bold text-[#2D3142]">{isBn ? 'দরকারি জিনিস, এক নজরে' : 'Everyday essentials'}</h2>
          <p className="mt-0.5 text-xs text-[#858B98]">{isBn ? 'বিশ্বস্ত ব্র্যান্ড • পরিষ্কার দাম • সহজ অর্ডার' : 'Trusted brands • clear prices • easy ordering'}</p>
        </div>
        <div className="flex gap-2">
          <label className="flex min-w-0 flex-1 items-center gap-2 rounded-xl border border-[#EADFD4] bg-white px-3 py-2.5 sm:w-64 sm:flex-none">
            <Search className="h-4 w-4 shrink-0 text-[#9197A3]" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder={isBn ? 'পণ্য বা ব্র্যান্ড খুঁজুন' : 'Search products or brands'}
              className="w-full min-w-0 bg-transparent text-xs outline-none placeholder:text-[#A2A6AF]"
              aria-label={isBn ? 'পণ্য খুঁজুন' : 'Search products'}
            />
          </label>
          <button
            onClick={() => setCheckoutOpen(true)}
            className="relative inline-flex shrink-0 items-center gap-2 rounded-xl bg-[#2D3142] px-3.5 py-2.5 text-xs font-bold text-white transition hover:bg-[#43485A]"
          >
            <ShoppingBag className="h-4 w-4" />
            <span className="hidden sm:inline">{isBn ? 'কার্ট' : 'Cart'}</span>
            <span>{formatLocalizedNumber(itemCount, currentLang)}</span>
          </button>
        </div>
      </section>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => setActiveCategory(category.id)}
            className={`shrink-0 rounded-full px-4 py-2 text-xs font-semibold transition ${
              activeCategory === category.id
                ? 'bg-[#C47856] text-white'
                : 'border border-[#EADFD4] bg-white text-[#737987] hover:border-[#D6B9A5]'
            }`}
          >
            {isBn ? category.bn : category.en}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-5">
        {visibleProducts.map((product) => {
          const quantity = cart[product.id] || 0;
          return (
            <article key={product.id} className="group overflow-hidden rounded-2xl border border-[#EEE5DC] bg-white transition hover:-translate-y-0.5 hover:shadow-md">
              <div className={`relative flex h-32 items-center justify-center overflow-hidden ${product.color} sm:h-36`}>
                <div className="absolute h-24 w-24 rounded-full bg-white/55 blur-xl" />
                <div className="relative flex h-[88px] w-[70px] flex-col items-center justify-center rounded-xl border border-white/80 bg-white/90 px-1 text-center shadow-sm transition-transform group-hover:scale-105">
                  <span className="text-[9px] font-extrabold tracking-wide text-[#515766]">{isBn ? product.brandBn : product.brandEn}</span>
                  <span className="my-1 text-3xl leading-none" aria-hidden="true">{product.emoji}</span>
                  <span className="max-w-full truncate text-[8px] font-semibold text-[#858B98]">{isBn ? product.nameBn : product.nameEn}</span>
                </div>
                {product.promoted && (
                  <span className="absolute left-2 top-2 rounded-full bg-[#C47856] px-2 py-1 text-[9px] font-bold text-white">
                    {isBn ? 'জনপ্রিয়' : 'Popular'}
                  </span>
                )}
              </div>
              <div className="p-3">
                <p className="text-[10px] font-bold text-[#A7775E]">{isBn ? product.brandBn : product.brandEn}</p>
                <h3 className="mt-1 min-h-9 text-xs font-bold leading-snug text-[#343949]">{isBn ? product.nameBn : product.nameEn}</h3>
                <p className="mt-1 text-[10px] text-[#9398A2]">{isBn ? product.sizeBn : product.sizeEn}</p>
                <div className="mt-3 flex items-center justify-between gap-1">
                  <div className="min-w-0">
                    <span className="text-sm font-extrabold text-[#2D3142]">{money(product.price)}</span>
                    {product.oldPrice && <span className="ml-1 text-[9px] text-[#A5A9B1] line-through">{money(product.oldPrice)}</span>}
                  </div>
                  {quantity === 0 ? (
                    <button
                      onClick={() => changeQuantity(product.id, 1)}
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#F6EDE6] text-[#A46343] transition hover:bg-[#EEDACB]"
                      aria-label={`${isBn ? 'কার্টে যোগ করুন' : 'Add to cart'}: ${isBn ? product.nameBn : product.nameEn}`}
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  ) : (
                    <div className="flex shrink-0 items-center gap-1 rounded-lg bg-[#F6EDE6] p-1">
                      <button onClick={() => changeQuantity(product.id, -1)} className="flex h-6 w-6 items-center justify-center rounded-md text-[#A46343]" aria-label={isBn ? 'একটি কমান' : 'Remove one'}>
                        <Minus className="h-3 w-3" />
                      </button>
                      <span className="min-w-4 text-center text-xs font-bold">{formatLocalizedNumber(quantity, currentLang)}</span>
                      <button onClick={() => changeQuantity(product.id, 1)} className="flex h-6 w-6 items-center justify-center rounded-md text-[#A46343]" aria-label={isBn ? 'একটি বাড়ান' : 'Add one'}>
                        <Plus className="h-3 w-3" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </article>
          );
        })}
      </div>
      {visibleProducts.length === 0 && (
        <div className="rounded-2xl border border-dashed border-[#E5D7C8] bg-white px-4 py-12 text-center text-sm text-[#858B98]">
          {isBn ? 'এই নামে কোনো পণ্য পাওয়া যায়নি।' : 'No products found for that search.'}
        </div>
      )}

      <section className="flex flex-col gap-3 rounded-2xl border border-[#E9E1D8] bg-white p-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#EFF5EE] text-[#628466]"><ShieldCheck className="h-5 w-5" /></div>
          <div>
            <p className="text-xs font-bold text-[#374151]">{isBn ? 'নিরাপদ পেমেন্ট, নিশ্চিন্ত অর্ডার' : 'Secure payment, easy ordering'}</p>
            <p className="mt-0.5 text-[10px] text-[#858B98]">{isBn ? 'bKash merchant checkout-এ নিরাপদে পেমেন্ট করুন' : 'Pay securely through bKash merchant checkout'}</p>
          </div>
        </div>
        <button onClick={() => setCheckoutOpen(true)} className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#C47856] px-4 py-2.5 text-xs font-bold text-white transition hover:bg-[#A96344]">
          <ShoppingCart className="h-4 w-4" />
          {isBn ? 'কার্ট দেখুন ও অর্ডার করুন' : 'View cart & checkout'}
          <ArrowRight className="h-3.5 w-3.5" />
        </button>
      </section>

      {checkoutOpen && (
        <div className="fixed inset-0 z-[70] flex items-end justify-center bg-[#252630]/45 p-0 backdrop-blur-[2px] sm:items-center sm:p-4" onMouseDown={(event) => {
          if (event.target === event.currentTarget) setCheckoutOpen(false);
        }}>
          <section role="dialog" aria-modal="true" aria-labelledby="ponno-checkout-title" className="max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-t-3xl bg-[#FFFCF8] p-5 shadow-2xl sm:rounded-3xl sm:p-6">
            <div className="mb-5 flex items-start justify-between">
              <div>
                <h2 id="ponno-checkout-title" className="text-xl font-extrabold text-[#2D3142]">{isBn ? 'আপনার অর্ডার' : 'Your order'}</h2>
                <p className="mt-1 text-xs text-[#858B98]">{isBn ? 'মোবাইল নম্বর দিন, তারপর নিরাপদ bKash checkout-এ যান।' : 'Enter your mobile number, then continue to secure bKash checkout.'}</p>
              </div>
              <button onClick={() => setCheckoutOpen(false)} className="rounded-lg p-2 text-[#858B98] hover:bg-[#F2EBE4]" aria-label={isBn ? 'বন্ধ করুন' : 'Close'}>
                <X className="h-5 w-5" />
              </button>
            </div>

            {cartItems.length ? (
              <div className="mb-4 max-h-40 space-y-2 overflow-y-auto">
                {cartItems.map((product) => (
                  <div key={product.id} className="flex items-center justify-between gap-3 rounded-xl bg-white px-3 py-2.5">
                    <div className="flex min-w-0 items-center gap-2.5">
                      <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-lg ${product.color}`}>{product.emoji}</span>
                      <div className="min-w-0">
                        <p className="truncate text-xs font-bold text-[#3C4150]">{isBn ? product.nameBn : product.nameEn}</p>
                        <p className="text-[10px] text-[#858B98]">{formatLocalizedNumber(cart[product.id], currentLang)} × {money(product.price)}</p>
                      </div>
                    </div>
                    <span className="shrink-0 text-xs font-bold">{money(product.price * cart[product.id])}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="mb-4 rounded-xl bg-white px-4 py-7 text-center text-xs text-[#858B98]">
                <ShoppingBag className="mx-auto mb-2 h-6 w-6 text-[#C9B6A6]" />
                {isBn ? 'আপনার কার্ট এখনো খালি। কেনাকাটা করতে পণ্য যোগ করুন।' : 'Your cart is empty. Add a product to get started.'}
              </div>
            )}

            <div className="mb-4 rounded-xl border border-[#EEE5DC] bg-white p-3">
              <div className="flex justify-between py-1 text-xs text-[#737987]"><span>{isBn ? 'পণ্যের দাম' : 'Subtotal'}</span><span>{money(subtotal)}</span></div>
              {discountPercent > 0 && <div className="flex justify-between py-1 text-xs text-[#598061]"><span>{isBn ? 'প্রোমো ছাড়' : 'Promo discount'}</span><span>−{money(discount)}</span></div>}
              <div className="flex justify-between py-1 text-xs text-[#737987]"><span>{isBn ? 'ডেলিভারি' : 'Delivery'}</span><span>{delivery === 0 ? (isBn ? 'ফ্রি' : 'Free') : money(delivery)}</span></div>
              <div className="mt-1 flex justify-between border-t border-[#F0E9E2] pt-2 text-sm font-extrabold text-[#2D3142]"><span>{isBn ? 'সর্বমোট' : 'Total'}</span><span>{money(total)}</span></div>
            </div>

            <div className="mb-4">
              <label htmlFor="ponno-promo" className="mb-1.5 block text-xs font-bold text-[#515766]">{isBn ? 'প্রোমো কোড' : 'Promo code'}</label>
              <div className="flex gap-2">
                <input id="ponno-promo" value={promoInput} onChange={(event) => setPromoInput(event.target.value)} placeholder={isBn ? 'কোড লিখুন (যেমন PONNO10)' : 'Enter code (e.g. PONNO10)'} className="min-w-0 flex-1 rounded-xl border border-[#E9E1D8] bg-white px-3 py-2.5 text-xs outline-none focus:border-[#C47856]" />
                <button onClick={applyPromo} className="rounded-xl border border-[#E9D5C8] px-3 text-xs font-bold text-[#A46343] hover:bg-[#F9F1EB]">{isBn ? 'প্রয়োগ' : 'Apply'}</button>
              </div>
              {promoMessage && <p className={`mt-1.5 text-[10px] ${discountPercent ? 'text-[#598061]' : 'text-[#B0544C]'}`}>{promoMessage}</p>}
            </div>

            <form onSubmit={startBkashCheckout} className="space-y-3">
              <label htmlFor="ponno-phone" className="block text-xs font-bold text-[#515766]">{isBn ? 'মোবাইল নম্বর' : 'Mobile number'} <span className="text-[#C47856]">*</span></label>
              <input
                id="ponno-phone"
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                required
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
                placeholder="01XXXXXXXXX"
                className="w-full rounded-xl border border-[#E9E1D8] bg-white px-3.5 py-3 text-sm outline-none focus:border-[#C47856]"
              />
              <p className="text-[10px] leading-relaxed text-[#8B909A]">
                {isBn ? 'এই নম্বরটি অর্ডার আপডেটের জন্য। bKash PIN/OTP এখানে চাওয়া হবে না।' : 'Used for order updates. We will never ask for your bKash PIN or OTP here.'}
              </p>
              {checkoutMessage && <p role="alert" className="rounded-xl bg-[#FFF0ED] px-3 py-2.5 text-xs leading-relaxed text-[#A34840]">{checkoutMessage}</p>}
              <button type="submit" disabled={isSubmitting || cartItems.length === 0} className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#E2136E] px-4 py-3.5 text-sm font-extrabold text-white transition hover:bg-[#C81060] disabled:cursor-not-allowed disabled:opacity-50">
                {isSubmitting ? <ChevronDown className="h-4 w-4 animate-bounce" /> : <Check className="h-4 w-4" />}
                {isSubmitting ? (isBn ? 'সংযোগ করা হচ্ছে…' : 'Connecting…') : `${isBn ? 'bKash দিয়ে পেমেন্ট করুন' : 'Pay with bKash'} · ${money(total)}`}
              </button>
              <p className="text-center text-[9px] leading-relaxed text-[#9A9EA6]">
                {isBn ? 'পেমেন্ট সম্পন্ন হবে bKash-এর নিরাপদ merchant checkout-এ।' : 'Payment is completed on bKash’s secure merchant checkout.'}
              </p>
            </form>
          </section>
        </div>
      )}
    </div>
  );
};
