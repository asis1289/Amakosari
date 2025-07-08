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
-- Data for Name: categories; Type: TABLE DATA; Schema: public; Owner: aashishneupane
--

COPY public.categories (id, name, slug, description, "parentCategory", "imageUrl", "isActive", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: products; Type: TABLE DATA; Schema: public; Owner: aashishneupane
--

COPY public.products (id, name, description, price, "originalPrice", "imageUrl", "model3DUrl", sizes, colors, stock, category, "categoryId", "isOnSale", "isNewArrival", "isFeatured", tags, weight, dimensions, material, "careInstructions", "isActive", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: aashishneupane
--

COPY public.users (id, "firstName", "lastName", email, password, phone, "dateOfBirth", role, "isActive", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: cart_items; Type: TABLE DATA; Schema: public; Owner: aashishneupane
--

COPY public.cart_items (id, "userId", "productId", quantity, size, color, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: collections; Type: TABLE DATA; Schema: public; Owner: aashishneupane
--

COPY public.collections (id, name, description, "discountPercent", "imageUrl", "isActive", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: color_variants; Type: TABLE DATA; Schema: public; Owner: aashishneupane
--

COPY public.color_variants (id, "productId", color, name, images, stock, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: contacts; Type: TABLE DATA; Schema: public; Owner: aashishneupane
--

COPY public.contacts (id, name, email, phone, subject, message, "isRead", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: hero_backgrounds; Type: TABLE DATA; Schema: public; Owner: aashishneupane
--

COPY public.hero_backgrounds (id, "imageUrl", "isActive", "isDefault", "overlayOpacity", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: offers; Type: TABLE DATA; Schema: public; Owner: aashishneupane
--

COPY public.offers (id, title, description, "imageUrl", link, "isActive", "createdAt", "updatedAt", "minimumOrderAmount", "discountValue", "startDate", "endDate", discount) FROM stdin;
\.


--
-- Data for Name: orders; Type: TABLE DATA; Schema: public; Owner: aashishneupane
--

COPY public.orders (id, "userId", status, "totalAmount", "shippingAddress", "billingAddress", "paymentMethod", "paymentStatus", "trackingNumber", notes, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: order_items; Type: TABLE DATA; Schema: public; Owner: aashishneupane
--

COPY public.order_items (id, "orderId", "productId", quantity, price, size, color, "createdAt") FROM stdin;
\.


--
-- Data for Name: product_collections; Type: TABLE DATA; Schema: public; Owner: aashishneupane
--

COPY public.product_collections (id, "productId", "collectionId", "createdAt") FROM stdin;
\.


--
-- Data for Name: promo_codes; Type: TABLE DATA; Schema: public; Owner: aashishneupane
--

COPY public.promo_codes (id, code, description, "discountType", "discountValue", "minOrderAmount", "maxUses", "usedCount", "startDate", "endDate", "isActive", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: promo_code_usage; Type: TABLE DATA; Schema: public; Owner: aashishneupane
--

COPY public.promo_code_usage (id, "promoCodeId", "userId", "orderId", "usedAt") FROM stdin;
\.


--
-- Data for Name: reviews; Type: TABLE DATA; Schema: public; Owner: aashishneupane
--

COPY public.reviews (id, "productId", "userId", rating, comment, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: sales; Type: TABLE DATA; Schema: public; Owner: aashishneupane
--

COPY public.sales (id, name, description, "discountPercent", "startDate", "endDate", "isActive", "collectionId", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: sale_items; Type: TABLE DATA; Schema: public; Owner: aashishneupane
--

COPY public.sale_items (id, "saleId", "productId", "createdAt") FROM stdin;
\.


--
-- Data for Name: site_settings; Type: TABLE DATA; Schema: public; Owner: aashishneupane
--

COPY public.site_settings (id, key, value, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: wishlist_items; Type: TABLE DATA; Schema: public; Owner: aashishneupane
--

COPY public.wishlist_items (id, "userId", "productId", "createdAt") FROM stdin;
\.


--
-- PostgreSQL database dump complete
--

