--
-- PostgreSQL database dump
--

-- Dumped from database version 14.18 (Homebrew)
-- Dumped by pg_dump version 14.18 (Homebrew)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: DiscountType; Type: TYPE; Schema: public; Owner: aashishneupane
--

CREATE TYPE public."DiscountType" AS ENUM (
    'PERCENTAGE',
    'FIXED_AMOUNT'
);


ALTER TYPE public."DiscountType" OWNER TO aashishneupane;

--
-- Name: OrderStatus; Type: TYPE; Schema: public; Owner: aashishneupane
--

CREATE TYPE public."OrderStatus" AS ENUM (
    'PENDING',
    'CONFIRMED',
    'PROCESSING',
    'SHIPPED',
    'DELIVERED',
    'CANCELLED',
    'REFUNDED'
);


ALTER TYPE public."OrderStatus" OWNER TO aashishneupane;

--
-- Name: PaymentStatus; Type: TYPE; Schema: public; Owner: aashishneupane
--

CREATE TYPE public."PaymentStatus" AS ENUM (
    'PENDING',
    'PAID',
    'FAILED',
    'REFUNDED'
);


ALTER TYPE public."PaymentStatus" OWNER TO aashishneupane;

--
-- Name: PromoCodeType; Type: TYPE; Schema: public; Owner: aashishneupane
--

CREATE TYPE public."PromoCodeType" AS ENUM (
    'PERCENTAGE',
    'FIXED_AMOUNT',
    'FREE_SHIPPING'
);


ALTER TYPE public."PromoCodeType" OWNER TO aashishneupane;

--
-- Name: Role; Type: TYPE; Schema: public; Owner: aashishneupane
--

CREATE TYPE public."Role" AS ENUM (
    'ADMIN',
    'CUSTOMER',
    'PROMOTER'
);


ALTER TYPE public."Role" OWNER TO aashishneupane;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: cart_items; Type: TABLE; Schema: public; Owner: aashishneupane
--

CREATE TABLE public.cart_items (
    id text NOT NULL,
    "userId" text NOT NULL,
    "productId" text NOT NULL,
    quantity integer DEFAULT 1 NOT NULL,
    size text,
    color text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.cart_items OWNER TO aashishneupane;

--
-- Name: categories; Type: TABLE; Schema: public; Owner: aashishneupane
--

CREATE TABLE public.categories (
    id text NOT NULL,
    name text NOT NULL,
    slug text NOT NULL,
    description text,
    "parentCategory" text,
    "imageUrl" text,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.categories OWNER TO aashishneupane;

--
-- Name: collections; Type: TABLE; Schema: public; Owner: aashishneupane
--

CREATE TABLE public.collections (
    id text NOT NULL,
    name text NOT NULL,
    description text NOT NULL,
    "discountPercent" double precision DEFAULT 0 NOT NULL,
    "imageUrl" text,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.collections OWNER TO aashishneupane;

--
-- Name: color_variants; Type: TABLE; Schema: public; Owner: aashishneupane
--

CREATE TABLE public.color_variants (
    id text NOT NULL,
    "productId" text NOT NULL,
    color text NOT NULL,
    name text NOT NULL,
    images text[],
    stock integer DEFAULT 0 NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.color_variants OWNER TO aashishneupane;

--
-- Name: contacts; Type: TABLE; Schema: public; Owner: aashishneupane
--

CREATE TABLE public.contacts (
    id text NOT NULL,
    name text NOT NULL,
    email text NOT NULL,
    phone text,
    subject text NOT NULL,
    message text NOT NULL,
    "isRead" boolean DEFAULT false NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.contacts OWNER TO aashishneupane;

--
-- Name: hero_backgrounds; Type: TABLE; Schema: public; Owner: aashishneupane
--

CREATE TABLE public.hero_backgrounds (
    id text NOT NULL,
    "imageUrl" text,
    "isActive" boolean DEFAULT true NOT NULL,
    "isDefault" boolean DEFAULT false NOT NULL,
    "overlayOpacity" double precision DEFAULT 0.2 NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.hero_backgrounds OWNER TO aashishneupane;

--
-- Name: offers; Type: TABLE; Schema: public; Owner: aashishneupane
--

CREATE TABLE public.offers (
    id text NOT NULL,
    title text NOT NULL,
    description text NOT NULL,
    "imageUrl" text NOT NULL,
    link text,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "minimumOrderAmount" double precision,
    "discountValue" double precision,
    "startDate" timestamp(3) without time zone,
    "endDate" timestamp(3) without time zone,
    discount double precision
);


ALTER TABLE public.offers OWNER TO aashishneupane;

--
-- Name: order_items; Type: TABLE; Schema: public; Owner: aashishneupane
--

CREATE TABLE public.order_items (
    id text NOT NULL,
    "orderId" text NOT NULL,
    "productId" text NOT NULL,
    quantity integer NOT NULL,
    price double precision NOT NULL,
    size text,
    color text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.order_items OWNER TO aashishneupane;

--
-- Name: orders; Type: TABLE; Schema: public; Owner: aashishneupane
--

CREATE TABLE public.orders (
    id text NOT NULL,
    "userId" text NOT NULL,
    status public."OrderStatus" DEFAULT 'PENDING'::public."OrderStatus" NOT NULL,
    "totalAmount" double precision NOT NULL,
    "shippingAddress" text NOT NULL,
    "billingAddress" text NOT NULL,
    "paymentMethod" text NOT NULL,
    "paymentStatus" public."PaymentStatus" DEFAULT 'PENDING'::public."PaymentStatus" NOT NULL,
    "trackingNumber" text,
    notes text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.orders OWNER TO aashishneupane;

--
-- Name: product_collections; Type: TABLE; Schema: public; Owner: aashishneupane
--

CREATE TABLE public.product_collections (
    id text NOT NULL,
    "productId" text NOT NULL,
    "collectionId" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.product_collections OWNER TO aashishneupane;

--
-- Name: products; Type: TABLE; Schema: public; Owner: aashishneupane
--

CREATE TABLE public.products (
    id text NOT NULL,
    name text NOT NULL,
    description text NOT NULL,
    price double precision NOT NULL,
    "originalPrice" double precision,
    "imageUrl" text NOT NULL,
    "model3DUrl" text,
    sizes text[],
    colors text[],
    stock integer DEFAULT 0 NOT NULL,
    category text NOT NULL,
    "categoryId" text,
    "isOnSale" boolean DEFAULT false NOT NULL,
    "isNewArrival" boolean DEFAULT false NOT NULL,
    "isFeatured" boolean DEFAULT false NOT NULL,
    tags text[],
    weight double precision,
    dimensions text,
    material text,
    "careInstructions" text,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.products OWNER TO aashishneupane;

--
-- Name: promo_code_usage; Type: TABLE; Schema: public; Owner: aashishneupane
--

CREATE TABLE public.promo_code_usage (
    id text NOT NULL,
    "promoCodeId" text NOT NULL,
    "userId" text NOT NULL,
    "orderId" text NOT NULL,
    "usedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.promo_code_usage OWNER TO aashishneupane;

--
-- Name: promo_codes; Type: TABLE; Schema: public; Owner: aashishneupane
--

CREATE TABLE public.promo_codes (
    id text NOT NULL,
    code text NOT NULL,
    description text NOT NULL,
    "discountType" public."PromoCodeType" NOT NULL,
    "discountValue" double precision NOT NULL,
    "minOrderAmount" double precision,
    "maxUses" integer,
    "usedCount" integer DEFAULT 0 NOT NULL,
    "startDate" timestamp(3) without time zone NOT NULL,
    "endDate" timestamp(3) without time zone NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.promo_codes OWNER TO aashishneupane;

--
-- Name: reviews; Type: TABLE; Schema: public; Owner: aashishneupane
--

CREATE TABLE public.reviews (
    id text NOT NULL,
    "productId" text NOT NULL,
    "userId" text NOT NULL,
    rating integer NOT NULL,
    comment text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.reviews OWNER TO aashishneupane;

--
-- Name: sale_items; Type: TABLE; Schema: public; Owner: aashishneupane
--

CREATE TABLE public.sale_items (
    id text NOT NULL,
    "saleId" text NOT NULL,
    "productId" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.sale_items OWNER TO aashishneupane;

--
-- Name: sales; Type: TABLE; Schema: public; Owner: aashishneupane
--

CREATE TABLE public.sales (
    id text NOT NULL,
    name text NOT NULL,
    description text NOT NULL,
    "discountPercent" double precision NOT NULL,
    "startDate" timestamp(3) without time zone NOT NULL,
    "endDate" timestamp(3) without time zone NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "collectionId" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.sales OWNER TO aashishneupane;

--
-- Name: site_settings; Type: TABLE; Schema: public; Owner: aashishneupane
--

CREATE TABLE public.site_settings (
    id text NOT NULL,
    key text NOT NULL,
    value text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.site_settings OWNER TO aashishneupane;

--
-- Name: users; Type: TABLE; Schema: public; Owner: aashishneupane
--

CREATE TABLE public.users (
    id text NOT NULL,
    "firstName" text NOT NULL,
    "lastName" text NOT NULL,
    email text NOT NULL,
    password text NOT NULL,
    phone text,
    "dateOfBirth" timestamp(3) without time zone,
    role public."Role" DEFAULT 'CUSTOMER'::public."Role" NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.users OWNER TO aashishneupane;

--
-- Name: wishlist_items; Type: TABLE; Schema: public; Owner: aashishneupane
--

CREATE TABLE public.wishlist_items (
    id text NOT NULL,
    "userId" text NOT NULL,
    "productId" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.wishlist_items OWNER TO aashishneupane;

--
-- Name: cart_items cart_items_pkey; Type: CONSTRAINT; Schema: public; Owner: aashishneupane
--

ALTER TABLE ONLY public.cart_items
    ADD CONSTRAINT cart_items_pkey PRIMARY KEY (id);


--
-- Name: categories categories_pkey; Type: CONSTRAINT; Schema: public; Owner: aashishneupane
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_pkey PRIMARY KEY (id);


--
-- Name: collections collections_pkey; Type: CONSTRAINT; Schema: public; Owner: aashishneupane
--

ALTER TABLE ONLY public.collections
    ADD CONSTRAINT collections_pkey PRIMARY KEY (id);


--
-- Name: color_variants color_variants_pkey; Type: CONSTRAINT; Schema: public; Owner: aashishneupane
--

ALTER TABLE ONLY public.color_variants
    ADD CONSTRAINT color_variants_pkey PRIMARY KEY (id);


--
-- Name: contacts contacts_pkey; Type: CONSTRAINT; Schema: public; Owner: aashishneupane
--

ALTER TABLE ONLY public.contacts
    ADD CONSTRAINT contacts_pkey PRIMARY KEY (id);


--
-- Name: hero_backgrounds hero_backgrounds_pkey; Type: CONSTRAINT; Schema: public; Owner: aashishneupane
--

ALTER TABLE ONLY public.hero_backgrounds
    ADD CONSTRAINT hero_backgrounds_pkey PRIMARY KEY (id);


--
-- Name: offers offers_pkey; Type: CONSTRAINT; Schema: public; Owner: aashishneupane
--

ALTER TABLE ONLY public.offers
    ADD CONSTRAINT offers_pkey PRIMARY KEY (id);


--
-- Name: order_items order_items_pkey; Type: CONSTRAINT; Schema: public; Owner: aashishneupane
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT order_items_pkey PRIMARY KEY (id);


--
-- Name: orders orders_pkey; Type: CONSTRAINT; Schema: public; Owner: aashishneupane
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_pkey PRIMARY KEY (id);


--
-- Name: product_collections product_collections_pkey; Type: CONSTRAINT; Schema: public; Owner: aashishneupane
--

ALTER TABLE ONLY public.product_collections
    ADD CONSTRAINT product_collections_pkey PRIMARY KEY (id);


--
-- Name: products products_pkey; Type: CONSTRAINT; Schema: public; Owner: aashishneupane
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_pkey PRIMARY KEY (id);


--
-- Name: promo_code_usage promo_code_usage_pkey; Type: CONSTRAINT; Schema: public; Owner: aashishneupane
--

ALTER TABLE ONLY public.promo_code_usage
    ADD CONSTRAINT promo_code_usage_pkey PRIMARY KEY (id);


--
-- Name: promo_codes promo_codes_pkey; Type: CONSTRAINT; Schema: public; Owner: aashishneupane
--

ALTER TABLE ONLY public.promo_codes
    ADD CONSTRAINT promo_codes_pkey PRIMARY KEY (id);


--
-- Name: reviews reviews_pkey; Type: CONSTRAINT; Schema: public; Owner: aashishneupane
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT reviews_pkey PRIMARY KEY (id);


--
-- Name: sale_items sale_items_pkey; Type: CONSTRAINT; Schema: public; Owner: aashishneupane
--

ALTER TABLE ONLY public.sale_items
    ADD CONSTRAINT sale_items_pkey PRIMARY KEY (id);


--
-- Name: sales sales_pkey; Type: CONSTRAINT; Schema: public; Owner: aashishneupane
--

ALTER TABLE ONLY public.sales
    ADD CONSTRAINT sales_pkey PRIMARY KEY (id);


--
-- Name: site_settings site_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: aashishneupane
--

ALTER TABLE ONLY public.site_settings
    ADD CONSTRAINT site_settings_pkey PRIMARY KEY (id);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: aashishneupane
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: wishlist_items wishlist_items_pkey; Type: CONSTRAINT; Schema: public; Owner: aashishneupane
--

ALTER TABLE ONLY public.wishlist_items
    ADD CONSTRAINT wishlist_items_pkey PRIMARY KEY (id);


--
-- Name: cart_items_userId_productId_size_color_key; Type: INDEX; Schema: public; Owner: aashishneupane
--

CREATE UNIQUE INDEX "cart_items_userId_productId_size_color_key" ON public.cart_items USING btree ("userId", "productId", size, color);


--
-- Name: categories_slug_key; Type: INDEX; Schema: public; Owner: aashishneupane
--

CREATE UNIQUE INDEX categories_slug_key ON public.categories USING btree (slug);


--
-- Name: product_collections_productId_collectionId_key; Type: INDEX; Schema: public; Owner: aashishneupane
--

CREATE UNIQUE INDEX "product_collections_productId_collectionId_key" ON public.product_collections USING btree ("productId", "collectionId");


--
-- Name: promo_code_usage_promoCodeId_userId_orderId_key; Type: INDEX; Schema: public; Owner: aashishneupane
--

CREATE UNIQUE INDEX "promo_code_usage_promoCodeId_userId_orderId_key" ON public.promo_code_usage USING btree ("promoCodeId", "userId", "orderId");


--
-- Name: promo_codes_code_key; Type: INDEX; Schema: public; Owner: aashishneupane
--

CREATE UNIQUE INDEX promo_codes_code_key ON public.promo_codes USING btree (code);


--
-- Name: reviews_productId_userId_key; Type: INDEX; Schema: public; Owner: aashishneupane
--

CREATE UNIQUE INDEX "reviews_productId_userId_key" ON public.reviews USING btree ("productId", "userId");


--
-- Name: sale_items_saleId_productId_key; Type: INDEX; Schema: public; Owner: aashishneupane
--

CREATE UNIQUE INDEX "sale_items_saleId_productId_key" ON public.sale_items USING btree ("saleId", "productId");


--
-- Name: site_settings_key_key; Type: INDEX; Schema: public; Owner: aashishneupane
--

CREATE UNIQUE INDEX site_settings_key_key ON public.site_settings USING btree (key);


--
-- Name: users_email_key; Type: INDEX; Schema: public; Owner: aashishneupane
--

CREATE UNIQUE INDEX users_email_key ON public.users USING btree (email);


--
-- Name: wishlist_items_userId_productId_key; Type: INDEX; Schema: public; Owner: aashishneupane
--

CREATE UNIQUE INDEX "wishlist_items_userId_productId_key" ON public.wishlist_items USING btree ("userId", "productId");


--
-- Name: cart_items cart_items_productId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: aashishneupane
--

ALTER TABLE ONLY public.cart_items
    ADD CONSTRAINT "cart_items_productId_fkey" FOREIGN KEY ("productId") REFERENCES public.products(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: cart_items cart_items_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: aashishneupane
--

ALTER TABLE ONLY public.cart_items
    ADD CONSTRAINT "cart_items_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: color_variants color_variants_productId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: aashishneupane
--

ALTER TABLE ONLY public.color_variants
    ADD CONSTRAINT "color_variants_productId_fkey" FOREIGN KEY ("productId") REFERENCES public.products(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: order_items order_items_orderId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: aashishneupane
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT "order_items_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES public.orders(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: order_items order_items_productId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: aashishneupane
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT "order_items_productId_fkey" FOREIGN KEY ("productId") REFERENCES public.products(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: orders orders_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: aashishneupane
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT "orders_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: product_collections product_collections_collectionId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: aashishneupane
--

ALTER TABLE ONLY public.product_collections
    ADD CONSTRAINT "product_collections_collectionId_fkey" FOREIGN KEY ("collectionId") REFERENCES public.collections(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: product_collections product_collections_productId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: aashishneupane
--

ALTER TABLE ONLY public.product_collections
    ADD CONSTRAINT "product_collections_productId_fkey" FOREIGN KEY ("productId") REFERENCES public.products(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: products products_categoryId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: aashishneupane
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT "products_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES public.categories(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: promo_code_usage promo_code_usage_promoCodeId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: aashishneupane
--

ALTER TABLE ONLY public.promo_code_usage
    ADD CONSTRAINT "promo_code_usage_promoCodeId_fkey" FOREIGN KEY ("promoCodeId") REFERENCES public.promo_codes(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: promo_code_usage promo_code_usage_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: aashishneupane
--

ALTER TABLE ONLY public.promo_code_usage
    ADD CONSTRAINT "promo_code_usage_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: reviews reviews_productId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: aashishneupane
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT "reviews_productId_fkey" FOREIGN KEY ("productId") REFERENCES public.products(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: reviews reviews_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: aashishneupane
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT "reviews_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: sale_items sale_items_productId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: aashishneupane
--

ALTER TABLE ONLY public.sale_items
    ADD CONSTRAINT "sale_items_productId_fkey" FOREIGN KEY ("productId") REFERENCES public.products(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: sale_items sale_items_saleId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: aashishneupane
--

ALTER TABLE ONLY public.sale_items
    ADD CONSTRAINT "sale_items_saleId_fkey" FOREIGN KEY ("saleId") REFERENCES public.sales(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: sales sales_collectionId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: aashishneupane
--

ALTER TABLE ONLY public.sales
    ADD CONSTRAINT "sales_collectionId_fkey" FOREIGN KEY ("collectionId") REFERENCES public.collections(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: wishlist_items wishlist_items_productId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: aashishneupane
--

ALTER TABLE ONLY public.wishlist_items
    ADD CONSTRAINT "wishlist_items_productId_fkey" FOREIGN KEY ("productId") REFERENCES public.products(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: wishlist_items wishlist_items_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: aashishneupane
--

ALTER TABLE ONLY public.wishlist_items
    ADD CONSTRAINT "wishlist_items_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

