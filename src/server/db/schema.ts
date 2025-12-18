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
  part: one(parts, {
    fields: [profiles.id],
    references: [parts.sellerId],
  }),
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
