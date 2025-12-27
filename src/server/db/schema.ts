// Example model schema from the Drizzle docs
// https://orm.drizzle.team/docs/sql-schema-declaration

import { relations } from "drizzle-orm";
import {
  boolean,
  decimal,
  index,
  integer,
  jsonb,
  pgTableCreator,
  text,
  timestamp,
  unique,
} from "drizzle-orm/pg-core";
import { nanoid } from "nanoid";

/**
 * This is an example of how to use the multi-project schema feature of Drizzle ORM. Use the same
 * database instance for multiple projects.
 *
 * @see https://orm.drizzle.team/docs/goodies#multi-project-schema
 */
export const createTable = pgTableCreator((name) => `partout_${name}`);

// E-commerce schema for auto parts marketplace

const commonIdSchema = (columnName: string) =>
  text(columnName)
    .notNull()
    .$defaultFn(() => nanoid());

const commonTimeStampSchema = (columnName: string) =>
  timestamp(columnName, {
    withTimezone: true,
  });

// User profiles with enhanced seller/buyer capabilities
export const profiles = createTable(
  "profiles",
  {
    id: text("id").primaryKey(),
    name: text("name"),
    email: text("email").notNull(),
    imageUrl: text("image_url"),
    phone: text("phone"),
    bio: text("bio"),
    isVerified: boolean("is_verified").default(false),
    isSeller: boolean("is_seller").default(false),
    memberSince: timestamp("member_since").defaultNow(),
    lastActive: timestamp("last_active"),
    responseTime: text("response_time"), // "< 1 hour", "1-2 hours", etc.
    totalSales: integer("total_sales").default(0),
    totalPurchases: integer("total_purchases").default(0),
    // Stripe Connect fields for seller payouts
    stripeConnectedAccountId: text("stripe_connected_account_id"),
    stripeOnboardingComplete: boolean("stripe_onboarding_complete").default(
      false,
    ),
    stripePayoutsEnabled: boolean("stripe_payouts_enabled").default(false),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: commonTimeStampSchema("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (t) => [
    index("profile_email_idx").on(t.email),
    index("profile_name_idx").on(t.name),
    index("profile_seller_idx").on(t.isSeller),
    index("profile_verified_idx").on(t.isVerified),
  ],
);

// Categories for auto parts
export const categories = createTable(
  "categories",
  {
    id: commonIdSchema("id").primaryKey(),
    name: text("name").notNull(),
    slug: text("slug").notNull(),
    description: text("description"),
    parentId: text("parent_id"), // Self-reference to be added via ALTER TABLE after creation
    imageUrl: text("image_url"),
    isActive: boolean("is_active").default(true),
    sortOrder: integer("sort_order").default(0),
    createdAt: commonTimeStampSchema("created_at").defaultNow().notNull(),
  },
  (t) => [
    unique("category_slug_unique").on(t.slug),
    index("category_parent_idx").on(t.parentId),
    index("category_active_idx").on(t.isActive),
    index("category_sort_idx").on(t.sortOrder),
  ],
);

// Vehicle makes (BMW, Mercedes, etc.)
export const vehicleMakes = createTable(
  "vehicle_makes",
  {
    id: commonIdSchema("id").primaryKey(),
    name: text("name").notNull(),
    slug: text("slug").notNull(),
    logoUrl: text("logo_url"),
    isActive: boolean("is_active").default(true),
    createdAt: commonTimeStampSchema("created_at").defaultNow().notNull(),
  },
  (t) => [
    unique("make_slug_unique").on(t.slug),
    index("make_name_idx").on(t.name),
    index("make_active_idx").on(t.isActive),
  ],
);

// Vehicle models (E46, C-Class, etc.)
export const vehicleModels = createTable(
  "vehicle_models",
  {
    id: commonIdSchema("id").primaryKey(),
    makeId: text("make_id")
      .notNull()
      .references(() => vehicleMakes.id),
    name: text("name").notNull(),
    slug: text("slug").notNull(),
    yearStart: integer("year_start"),
    yearEnd: integer("year_end"),
    isActive: boolean("is_active").default(true),
    createdAt: commonTimeStampSchema("created_at").defaultNow().notNull(),
  },
  (t) => [
    unique("model_make_slug_unique").on(t.makeId, t.slug),
    index("model_make_idx").on(t.makeId),
    index("model_name_idx").on(t.name),
    index("model_year_idx").on(t.yearStart, t.yearEnd),
    index("model_active_idx").on(t.isActive),
  ],
);

// Main parts/products table
export const parts = createTable(
  "parts",
  {
    id: commonIdSchema("id").primaryKey(),
    sellerId: text("seller_id")
      .notNull()
      .references(() => profiles.id),
    categoryId: text("category_id")
      .notNull()
      .references(() => categories.id),
    title: text("title").notNull(),
    description: text("description"),
    partNumber: text("part_number"),

    oem: text("oem"), // Original Equipment Manufacturer
    brand: text("brand"),
    condition: text("condition").notNull(), // New, Used, Refurbished
    price: decimal("price", { precision: 10, scale: 2 }).notNull(),
    originalPrice: decimal("original_price", { precision: 10, scale: 2 }),
    currency: text("currency").default("USD"),
    isNegotiable: boolean("is_negotiable").default(false),
    quantity: integer("quantity").default(1),
    weight: decimal("weight", { precision: 8, scale: 2 }), // in lbs
    dimensions: text("dimensions"), // "12.5 x 5.2 x 0.8 inches"
    warranty: text("warranty"), // "2 Years", "90 Days", etc.
    material: text("material"), // "Ceramic", "Metal", etc.
    specifications: jsonb("specifications"), // Additional specs as JSON
    status: text("status").default("active"), // active, sold, inactive
    viewCount: integer("view_count").default(0),
    favoriteCount: integer("favorite_count").default(0),
    createdAt: commonTimeStampSchema("created_at").defaultNow().notNull(),
    updatedAt: commonTimeStampSchema("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (t) => [
    index("part_seller_idx").on(t.sellerId),
    index("part_category_idx").on(t.categoryId),
    index("part_title_idx").on(t.title),
    index("part_brand_idx").on(t.brand),
    index("part_condition_idx").on(t.condition),
    index("part_price_idx").on(t.price),
    index("part_status_idx").on(t.status),
    index("part_part_number_idx").on(t.partNumber),
    index("part_created_idx").on(t.createdAt),
  ],
);

export type Part = typeof parts.$inferSelect;

// Part images
export const partImages = createTable(
  "part_images",
  {
    id: commonIdSchema("id").primaryKey(),
    partId: text("part_id")
      .notNull()
      .references(() => parts.id, { onDelete: "cascade" }),
    url: text("url").notNull(),
    altText: text("alt_text"),
    sortOrder: integer("sort_order").default(0),
    isPrimary: boolean("is_primary").default(false),
    createdAt: commonTimeStampSchema("created_at").defaultNow().notNull(),
  },
  (t) => [
    index("part_image_part_idx").on(t.partId),
    index("part_image_sort_idx").on(t.partId, t.sortOrder),
    index("part_image_primary_idx").on(t.partId, t.isPrimary),
  ],
);

// Vehicle compatibility for parts
export const partCompatibility = createTable(
  "part_compatibility",
  {
    id: commonIdSchema("id").primaryKey(),
    partId: text("part_id")
      .notNull()
      .references(() => parts.id, { onDelete: "cascade" }),
    makeId: text("make_id")
      .notNull()
      .references(() => vehicleMakes.id),
    modelId: text("model_id")
      .notNull()
      .references(() => vehicleModels.id),
    yearStart: integer("year_start"),
    yearEnd: integer("year_end"),
    engine: text("engine"), // "2.5L", "3.0L V6", etc.
    trim: text("trim"), // "Base", "Sport", "M3", etc.
    createdAt: commonTimeStampSchema("created_at").defaultNow().notNull(),
  },
  (t) => [
    unique("part_compatibility_unique").on(
      t.partId,
      t.makeId,
      t.modelId,
      t.yearStart,
      t.yearEnd,
      t.engine,
    ),
    index("compatibility_part_idx").on(t.partId),
    index("compatibility_make_model_idx").on(t.makeId, t.modelId),
    index("compatibility_year_idx").on(t.yearStart, t.yearEnd),
  ],
);

// Shipping profiles for sellers
export const shippingProfiles = createTable(
  "shipping_profiles",
  {
    id: commonIdSchema("id").primaryKey(),
    sellerId: text("seller_id")
      .notNull()
      .references(() => profiles.id),
    name: text("name").notNull(), // "Standard", "Express", etc.
    baseCost: decimal("base_cost", { precision: 8, scale: 2 }).notNull(),
    freeShippingThreshold: decimal("free_shipping_threshold", {
      precision: 10,
      scale: 2,
    }),
    estimatedDaysMin: integer("estimated_days_min"),
    estimatedDaysMax: integer("estimated_days_max"),
    carrier: text("carrier"), // "UPS", "FedEx", "USPS"
    isDefault: boolean("is_default").default(false),
    isActive: boolean("is_active").default(true),
    createdAt: commonTimeStampSchema("created_at").defaultNow().notNull(),
  },
  (t) => [
    index("shipping_seller_idx").on(t.sellerId),
    index("shipping_default_idx").on(t.sellerId, t.isDefault),
    index("shipping_active_idx").on(t.isActive),
  ],
);

export type ShippingProfile = typeof shippingProfiles.$inferSelect;

// Part shipping (links parts to shipping profiles)
export const partShipping = createTable(
  "part_shipping",
  {
    id: commonIdSchema("id").primaryKey(),
    partId: text("part_id")
      .notNull()
      .references(() => parts.id, { onDelete: "cascade" }),
    shippingProfileId: text("shipping_profile_id")
      .notNull()
      .references(() => shippingProfiles.id),
    createdAt: commonTimeStampSchema("created_at").defaultNow().notNull(),
  },
  (t) => [
    unique("part_shipping_unique").on(t.partId, t.shippingProfileId),
    index("part_shipping_part_idx").on(t.partId),
    index("part_shipping_profile_idx").on(t.shippingProfileId),
  ],
);

// Reviews for parts/sellers
export const reviews = createTable(
  "reviews",
  {
    id: commonIdSchema("id").primaryKey(),
    partId: text("part_id").references(() => parts.id),
    sellerId: text("seller_id").references(() => profiles.id),
    buyerId: text("buyer_id")
      .notNull()
      .references(() => profiles.id),
    orderId: text("order_id"), // Reference to order when implemented
    rating: integer("rating").notNull(), // 1-5
    title: text("title"),
    comment: text("comment"),
    isVerifiedPurchase: boolean("is_verified_purchase").default(false),
    isPublic: boolean("is_public").default(true),
    helpfulCount: integer("helpful_count").default(0),
    createdAt: commonTimeStampSchema("created_at").defaultNow().notNull(),
    updatedAt: commonTimeStampSchema("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (t) => [
    index("review_part_idx").on(t.partId),
    index("review_seller_idx").on(t.sellerId),
    index("review_buyer_idx").on(t.buyerId),
    index("review_rating_idx").on(t.rating),
    index("review_verified_idx").on(t.isVerifiedPurchase),
    index("review_created_idx").on(t.createdAt),
  ],
);

// User addresses
export const addresses = createTable(
  "addresses",
  {
    id: commonIdSchema("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => profiles.id),
    type: text("type"), // "billing", "shipping"
    fullName: text("full_name"),
    company: text("company"),
    line1: text("line1").notNull(),
    line2: text("line2"),
    city: text("city").notNull(),
    state: text("state").notNull(),
    postalCode: text("postal_code").notNull(),
    country: text("country").default("US"),
    phone: text("phone"),
    isDefault: boolean("is_default").default(false),
    createdAt: commonTimeStampSchema("created_at").defaultNow().notNull(),
    updatedAt: commonTimeStampSchema("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (t) => [
    index("address_user_idx").on(t.userId),
    index("address_type_idx").on(t.userId, t.type),
    index("address_default_idx").on(t.userId, t.isDefault),
    index("address_postal_idx").on(t.postalCode),
  ],
);

export type Address = typeof addresses.$inferSelect;

// User favorites/watchlist
export const favorites = createTable(
  "favorites",
  {
    id: commonIdSchema("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => profiles.id),
    partId: text("part_id")
      .notNull()
      .references(() => parts.id, { onDelete: "cascade" }),
    createdAt: commonTimeStampSchema("created_at").defaultNow().notNull(),
  },
  (t) => [
    unique("favorite_user_part_unique").on(t.userId, t.partId),
    index("favorite_user_idx").on(t.userId),
    index("favorite_part_idx").on(t.partId),
    index("favorite_created_idx").on(t.createdAt),
  ],
);

// Seller ratings aggregation (for performance)
export const sellerStats = createTable(
  "seller_stats",
  {
    id: commonIdSchema("id").primaryKey(),
    sellerId: text("seller_id")
      .notNull()
      .references(() => profiles.id),
    averageRating: decimal("average_rating", { precision: 3, scale: 2 }),
    totalReviews: integer("total_reviews").default(0),
    totalSales: integer("total_sales").default(0),
    totalRevenue: decimal("total_revenue", { precision: 12, scale: 2 }).default(
      "0",
    ),
    responseRate: decimal("response_rate", { precision: 5, scale: 2 }), // percentage
    onTimeShipping: decimal("on_time_shipping", { precision: 5, scale: 2 }), // percentage
    updatedAt: commonTimeStampSchema("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (t) => [
    unique("seller_stats_seller_unique").on(t.sellerId),
    index("seller_stats_rating_idx").on(t.averageRating),
    index("seller_stats_sales_idx").on(t.totalSales),
  ],
);

// Orders - master order records
export const orders = createTable(
  "orders",
  {
    id: commonIdSchema("id").primaryKey(),
    orderNumber: text("order_number").notNull().unique(), // ORD-XXXXXX format
    buyerId: text("buyer_id")
      .notNull()
      .references(() => profiles.id),

    // Totals
    subtotal: decimal("subtotal", { precision: 10, scale: 2 }).notNull(),
    shippingTotal: decimal("shipping_total", { precision: 10, scale: 2 })
      .notNull()
      .default("0"),
    taxTotal: decimal("tax_total", { precision: 10, scale: 2 }).default("0"),
    total: decimal("total", { precision: 10, scale: 2 }).notNull(),

    // Status
    status: text("status").notNull().default("pending"),
    // pending, payment_processing, paid, processing, partially_shipped, shipped, delivered, cancelled, refunded

    // Payment info (denormalized for quick access)
    paymentStatus: text("payment_status").notNull().default("pending"),
    // pending, processing, succeeded, failed, refunded, partially_refunded
    paymentIntentId: text("payment_intent_id"), // Stripe Payment Intent ID

    // Shipping address (snapshot at order time)
    shippingAddress: jsonb("shipping_address").notNull(), // Store full address object
    billingAddress: jsonb("billing_address"), // Optional if different from shipping

    // Metadata
    customerNotes: text("customer_notes"),
    internalNotes: text("internal_notes"), // Admin/seller notes

    // Timestamps
    createdAt: commonTimeStampSchema("created_at").defaultNow().notNull(),
    updatedAt: commonTimeStampSchema("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
    paidAt: commonTimeStampSchema("paid_at"),
    cancelledAt: commonTimeStampSchema("cancelled_at"),
  },
  (t) => [
    index("order_buyer_idx").on(t.buyerId),
    index("order_status_idx").on(t.status),
    index("order_payment_status_idx").on(t.paymentStatus),
    index("order_number_idx").on(t.orderNumber),
    index("order_created_idx").on(t.createdAt),
  ],
);

export type Order = typeof orders.$inferSelect;

// Order Items - individual parts within orders
export const orderItems = createTable(
  "order_items",
  {
    id: commonIdSchema("id").primaryKey(),
    orderId: text("order_id")
      .notNull()
      .references(() => orders.id, { onDelete: "cascade" }),
    partId: text("part_id")
      .notNull()
      .references(() => parts.id),
    sellerId: text("seller_id")
      .notNull()
      .references(() => profiles.id),

    // Item details (snapshot at order time - prices can change)
    title: text("title").notNull(),
    partNumber: text("part_number"),
    condition: text("condition").notNull(),

    // Pricing
    unitPrice: decimal("unit_price", { precision: 10, scale: 2 }).notNull(),
    quantity: integer("quantity").notNull().default(1),
    subtotal: decimal("subtotal", { precision: 10, scale: 2 }).notNull(), // unitPrice * quantity

    // Shipping (calculated per seller group)
    shippingCost: decimal("shipping_cost", { precision: 10, scale: 2 })
      .notNull()
      .default("0"),

    // Status (independent tracking per item)
    status: text("status").notNull().default("pending"),
    // pending, processing, shipped, delivered, cancelled, returned, refunded

    // Item metadata
    imageUrl: text("image_url"), // Primary image snapshot

    createdAt: commonTimeStampSchema("created_at").defaultNow().notNull(),
    updatedAt: commonTimeStampSchema("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (t) => [
    index("order_item_order_idx").on(t.orderId),
    index("order_item_seller_idx").on(t.sellerId),
    index("order_item_part_idx").on(t.partId),
    index("order_item_status_idx").on(t.status),
  ],
);

export type OrderItem = typeof orderItems.$inferSelect;

// Shipments - groups items by seller for shipping
export const shipments = createTable(
  "shipments",
  {
    id: commonIdSchema("id").primaryKey(),
    orderId: text("order_id")
      .notNull()
      .references(() => orders.id, { onDelete: "cascade" }),
    sellerId: text("seller_id")
      .notNull()
      .references(() => profiles.id),

    // Shippo data
    shippoShipmentId: text("shippo_shipment_id"), // Shippo shipment object ID
    shippoRateId: text("shippo_rate_id"), // Selected rate ID
    shippoTransactionId: text("shippo_transaction_id"), // Purchase transaction ID

    // Carrier info
    carrier: text("carrier").notNull(), // USPS, UPS, FedEx, DHL
    service: text("service").notNull(), // e.g., "Priority Mail", "Ground"

    // Tracking
    trackingNumber: text("tracking_number"),
    trackingUrl: text("tracking_url"),
    trackingStatus: text("tracking_status").default("unknown"),
    // unknown, pre_transit, transit, delivered, returned, failure

    // Label
    labelUrl: text("label_url"), // PDF label URL from Shippo
    labelFormat: text("label_format").default("PDF"), // PDF, PNG, ZPLII

    // Shipping details
    shippingCost: decimal("shipping_cost", { precision: 8, scale: 2 }).notNull(),
    estimatedDaysMin: integer("estimated_days_min"),
    estimatedDaysMax: integer("estimated_days_max"),

    // Addresses (from Shippo)
    fromAddress: jsonb("from_address").notNull(), // Seller address
    toAddress: jsonb("to_address").notNull(), // Buyer address

    // Package details
    weight: decimal("weight", { precision: 8, scale: 2 }).notNull(), // lbs
    dimensions: jsonb("dimensions").notNull(), // { length, width, height } in inches

    // Status
    status: text("status").notNull().default("pending"),
    // pending, label_created, in_transit, delivered, failed, cancelled

    // Timestamps
    createdAt: commonTimeStampSchema("created_at").defaultNow().notNull(),
    updatedAt: commonTimeStampSchema("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
    shippedAt: commonTimeStampSchema("shipped_at"),
    deliveredAt: commonTimeStampSchema("delivered_at"),
  },
  (t) => [
    index("shipment_order_idx").on(t.orderId),
    index("shipment_seller_idx").on(t.sellerId),
    index("shipment_tracking_idx").on(t.trackingNumber),
    index("shipment_status_idx").on(t.status),
    index("shipment_created_idx").on(t.createdAt),
  ],
);

export type Shipment = typeof shipments.$inferSelect;

// Shipment Items - link between shipments and order items
export const shipmentItems = createTable(
  "shipment_items",
  {
    id: commonIdSchema("id").primaryKey(),
    shipmentId: text("shipment_id")
      .notNull()
      .references(() => shipments.id, { onDelete: "cascade" }),
    orderItemId: text("order_item_id")
      .notNull()
      .references(() => orderItems.id, { onDelete: "cascade" }),
    quantity: integer("quantity").notNull().default(1),
    createdAt: commonTimeStampSchema("created_at").defaultNow().notNull(),
  },
  (t) => [
    unique("shipment_item_unique").on(t.shipmentId, t.orderItemId),
    index("shipment_item_shipment_idx").on(t.shipmentId),
    index("shipment_item_order_item_idx").on(t.orderItemId),
  ],
);

// Payments - track all payment transactions
export const payments = createTable(
  "payments",
  {
    id: commonIdSchema("id").primaryKey(),
    orderId: text("order_id")
      .notNull()
      .references(() => orders.id),

    // Stripe data
    stripePaymentIntentId: text("stripe_payment_intent_id")
      .notNull()
      .unique(),
    stripeChargeId: text("stripe_charge_id"),
    stripeCustomerId: text("stripe_customer_id"),

    // Payment details
    amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
    currency: text("currency").notNull().default("USD"),

    // Status
    status: text("status").notNull().default("pending"),
    // pending, processing, succeeded, failed, cancelled, refunded, partially_refunded

    // Payment method
    paymentMethod: text("payment_method"), // card, bank_transfer, etc.
    paymentMethodDetails: jsonb("payment_method_details"), // Last4, brand, etc.

    // Failure handling
    failureCode: text("failure_code"),
    failureMessage: text("failure_message"),

    // Metadata
    metadata: jsonb("metadata"), // Additional Stripe metadata

    createdAt: commonTimeStampSchema("created_at").defaultNow().notNull(),
    updatedAt: commonTimeStampSchema("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
    succeededAt: commonTimeStampSchema("succeeded_at"),
    failedAt: commonTimeStampSchema("failed_at"),
  },
  (t) => [
    index("payment_order_idx").on(t.orderId),
    index("payment_stripe_pi_idx").on(t.stripePaymentIntentId),
    index("payment_status_idx").on(t.status),
    index("payment_created_idx").on(t.createdAt),
  ],
);

export type Payment = typeof payments.$inferSelect;

// Refunds - track refund transactions
export const refunds = createTable(
  "refunds",
  {
    id: commonIdSchema("id").primaryKey(),
    paymentId: text("payment_id")
      .notNull()
      .references(() => payments.id),
    orderId: text("order_id")
      .notNull()
      .references(() => orders.id),
    orderItemId: text("order_item_id").references(() => orderItems.id), // Null for full refund

    // Stripe data
    stripeRefundId: text("stripe_refund_id").notNull().unique(),

    // Refund details
    amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
    reason: text("reason"), // duplicate, fraudulent, requested_by_customer
    description: text("description"),

    // Status
    status: text("status").notNull().default("pending"),
    // pending, succeeded, failed, cancelled

    createdAt: commonTimeStampSchema("created_at").defaultNow().notNull(),
    processedAt: commonTimeStampSchema("processed_at"),
  },
  (t) => [
    index("refund_payment_idx").on(t.paymentId),
    index("refund_order_idx").on(t.orderId),
    index("refund_stripe_idx").on(t.stripeRefundId),
    index("refund_status_idx").on(t.status),
  ],
);

export type Refund = typeof refunds.$inferSelect;

// Seller Payouts - track seller payments (Stripe Connect)
export const sellerPayouts = createTable(
  "seller_payouts",
  {
    id: commonIdSchema("id").primaryKey(),
    sellerId: text("seller_id")
      .notNull()
      .references(() => profiles.id),
    orderId: text("order_id")
      .notNull()
      .references(() => orders.id),

    // Stripe Connect data
    stripeTransferId: text("stripe_transfer_id"), // Stripe Transfer ID
    stripeConnectedAccountId: text("stripe_connected_account_id"), // Seller's Stripe account

    // Payout details
    amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
    platformFee: decimal("platform_fee", { precision: 10, scale: 2 }).notNull(), // Partout commission
    netAmount: decimal("net_amount", { precision: 10, scale: 2 }).notNull(), // amount - platformFee
    currency: text("currency").notNull().default("USD"),

    // Status
    status: text("status").notNull().default("pending"),
    // pending, processing, paid, failed, cancelled

    failureReason: text("failure_reason"),

    createdAt: commonTimeStampSchema("created_at").defaultNow().notNull(),
    processedAt: commonTimeStampSchema("processed_at"),
  },
  (t) => [
    index("payout_seller_idx").on(t.sellerId),
    index("payout_order_idx").on(t.orderId),
    index("payout_status_idx").on(t.status),
    index("payout_created_idx").on(t.createdAt),
  ],
);

export type SellerPayout = typeof sellerPayouts.$inferSelect;

// Tracking Events - webhook events from Shippo
export const trackingEvents = createTable(
  "tracking_events",
  {
    id: commonIdSchema("id").primaryKey(),
    shipmentId: text("shipment_id")
      .notNull()
      .references(() => shipments.id, { onDelete: "cascade" }),

    // Event details
    status: text("status").notNull(), // From Shippo tracking status
    statusDetails: text("status_details"),
    location: text("location"), // City, State

    // Timestamps
    occurredAt: commonTimeStampSchema("occurred_at").notNull(),
    createdAt: commonTimeStampSchema("created_at").defaultNow().notNull(),
  },
  (t) => [
    index("tracking_event_shipment_idx").on(t.shipmentId),
    index("tracking_event_occurred_idx").on(t.occurredAt),
  ],
);

export type TrackingEvent = typeof trackingEvents.$inferSelect;

// Note: Relations can be added later in a separate file if needed for query building
export const partRelations = relations(parts, ({ one, many }) => ({
  partImages: many(partImages),
  seller: one(profiles, {
    fields: [parts.sellerId],
    references: [profiles.id],
  }),
  category: one(categories, {
    fields: [parts.categoryId],
    references: [categories.id],
  }),
  partShipping: many(partShipping),
  partCompatibility: many(partCompatibility),
  sellerStats: one(sellerStats, {
    fields: [parts.sellerId],
    references: [sellerStats.sellerId],
  }),
}));

export const partImageRelations = relations(partImages, ({ one }) => ({
  part: one(parts, {
    fields: [partImages.partId],
    references: [parts.id],
  }),
}));

export const profileRelations = relations(profiles, ({ one, many }) => ({
  part: many(parts),
  addresses: many(addresses),
  shippingProfiles: many(shippingProfiles),
}));

export const addressRelations = relations(addresses, ({ one }) => ({
  profile: one(profiles, {
    fields: [addresses.userId],
    references: [profiles.id],
  }),
}));

export const partCompatibilityRelations = relations(
  partCompatibility,
  ({ one }) => ({
    part: one(parts, {
      fields: [partCompatibility.partId],
      references: [parts.id],
    }),
    make: one(vehicleMakes, {
      fields: [partCompatibility.makeId],
      references: [vehicleMakes.id],
    }),
    model: one(vehicleModels, {
      fields: [partCompatibility.modelId],
      references: [vehicleModels.id],
    }),
  }),
);

export const makeRelations = relations(vehicleMakes, ({ many }) => ({
  partCompatibility: many(partCompatibility),
}));

export const modelRelations = relations(vehicleModels, ({ many }) => ({
  partCompatibility: many(partCompatibility),
}));

export const partShippingRelations = relations(partShipping, ({ one }) => ({
  part: one(parts, {
    fields: [partShipping.partId],
    references: [parts.id],
  }),
  shippingProfile: one(shippingProfiles, {
    fields: [partShipping.shippingProfileId],
    references: [shippingProfiles.id],
  }),
}));

// Chat/Messaging system
export const conversations = createTable(
  "conversations",
  {
    id: commonIdSchema("id").primaryKey(),
    partId: text("part_id")
      .notNull()
      .references(() => parts.id, { onDelete: "cascade" }),
    sellerId: text("seller_id")
      .notNull()
      .references(() => profiles.id),
    buyerId: text("buyer_id")
      .notNull()
      .references(() => profiles.id),
    lastMessageAt: commonTimeStampSchema("last_message_at"),
    createdAt: commonTimeStampSchema("created_at").defaultNow().notNull(),
    updatedAt: commonTimeStampSchema("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (t) => [
    unique("conversation_unique").on(t.partId, t.sellerId, t.buyerId),
    index("conversation_part_idx").on(t.partId),
    index("conversation_seller_idx").on(t.sellerId),
    index("conversation_buyer_idx").on(t.buyerId),
    index("conversation_last_message_idx").on(t.lastMessageAt),
  ],
);

export type Conversation = typeof conversations.$inferSelect;

export const messages = createTable(
  "messages",
  {
    id: commonIdSchema("id").primaryKey(),
    conversationId: text("conversation_id")
      .notNull()
      .references(() => conversations.id, { onDelete: "cascade" }),
    senderId: text("sender_id")
      .notNull()
      .references(() => profiles.id),
    content: text("content").notNull(),
    isRead: boolean("is_read").default(false),
    createdAt: commonTimeStampSchema("created_at").defaultNow().notNull(),
  },
  (t) => [
    index("message_conversation_idx").on(t.conversationId),
    index("message_sender_idx").on(t.senderId),
    index("message_created_idx").on(t.conversationId, t.createdAt),
    index("message_read_idx").on(t.conversationId, t.isRead),
  ],
);

export type Message = typeof messages.$inferSelect;

// Chat relations
export const conversationRelations = relations(
  conversations,
  ({ one, many }) => ({
    part: one(parts, {
      fields: [conversations.partId],
      references: [parts.id],
    }),
    seller: one(profiles, {
      fields: [conversations.sellerId],
      references: [profiles.id],
      relationName: "sellerConversations",
    }),
    buyer: one(profiles, {
      fields: [conversations.buyerId],
      references: [profiles.id],
      relationName: "buyerConversations",
    }),
    messages: many(messages),
  }),
);

export const messageRelations = relations(messages, ({ one }) => ({
  conversation: one(conversations, {
    fields: [messages.conversationId],
    references: [conversations.id],
  }),
  sender: one(profiles, {
    fields: [messages.senderId],
    references: [profiles.id],
  }),
}));

// Order relations
export const orderRelations = relations(orders, ({ one, many }) => ({
  buyer: one(profiles, {
    fields: [orders.buyerId],
    references: [profiles.id],
  }),
  orderItems: many(orderItems),
  payments: many(payments),
  shipments: many(shipments),
  refunds: many(refunds),
  sellerPayouts: many(sellerPayouts),
}));

export const orderItemRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, {
    fields: [orderItems.orderId],
    references: [orders.id],
  }),
  part: one(parts, {
    fields: [orderItems.partId],
    references: [parts.id],
  }),
  seller: one(profiles, {
    fields: [orderItems.sellerId],
    references: [profiles.id],
  }),
}));

export const shipmentRelations = relations(shipments, ({ one, many }) => ({
  order: one(orders, {
    fields: [shipments.orderId],
    references: [orders.id],
  }),
  seller: one(profiles, {
    fields: [shipments.sellerId],
    references: [profiles.id],
  }),
  shipmentItems: many(shipmentItems),
  trackingEvents: many(trackingEvents),
}));

export const shipmentItemRelations = relations(shipmentItems, ({ one }) => ({
  shipment: one(shipments, {
    fields: [shipmentItems.shipmentId],
    references: [shipments.id],
  }),
  orderItem: one(orderItems, {
    fields: [shipmentItems.orderItemId],
    references: [orderItems.id],
  }),
}));

export const paymentRelations = relations(payments, ({ one, many }) => ({
  order: one(orders, {
    fields: [payments.orderId],
    references: [orders.id],
  }),
  refunds: many(refunds),
}));

export const refundRelations = relations(refunds, ({ one }) => ({
  payment: one(payments, {
    fields: [refunds.paymentId],
    references: [payments.id],
  }),
  order: one(orders, {
    fields: [refunds.orderId],
    references: [orders.id],
  }),
  orderItem: one(orderItems, {
    fields: [refunds.orderItemId],
    references: [orderItems.id],
  }),
}));

export const sellerPayoutRelations = relations(sellerPayouts, ({ one }) => ({
  seller: one(profiles, {
    fields: [sellerPayouts.sellerId],
    references: [profiles.id],
  }),
  order: one(orders, {
    fields: [sellerPayouts.orderId],
    references: [orders.id],
  }),
}));

export const trackingEventRelations = relations(trackingEvents, ({ one }) => ({
  shipment: one(shipments, {
    fields: [trackingEvents.shipmentId],
    references: [shipments.id],
  }),
}));
