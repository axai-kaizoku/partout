# Partout - Auto Parts Marketplace

## Product Overview

Partout is a modern, full-stack e-commerce platform designed specifically for buying and selling automotive parts. The platform connects buyers looking for specific vehicle parts with sellers who have inventory to sell, creating a marketplace similar to eBay or Craigslist but specialized for auto parts.

### Key Value Propositions

**For Buyers:**
- Advanced search and filtering by vehicle make, model, year, and part specifications
- Detailed product information including compatibility, condition, and warranties
- Multiple images and seller verification
- Transparent pricing with negotiation options
- Integrated shipping cost calculation

**For Sellers:**
- Easy onboarding process with step-by-step guidance
- Comprehensive listing management with image uploads
- Flexible shipping profile configuration
- Address management for multiple locations
- Sales tracking and analytics dashboard

---

## Technical Architecture

### Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| **Framework** | Next.js (App Router) | 16 |
| **UI Library** | React | 19 |
| **Language** | TypeScript | Latest |
| **Database** | PostgreSQL | Latest |
| **ORM** | Drizzle ORM | Latest |
| **API Layer** | tRPC | v11 |
| **Authentication** | Supabase Auth | Latest |
| **Storage** | Supabase Storage | Latest |
| **State Management** | TanStack Query (React Query) | Latest |
| **Styling** | Tailwind CSS | v4 |
| **UI Components** | Radix UI | Latest |
| **Package Manager** | pnpm | Latest |
| **Build Tool** | Turbopack | Next.js turbo |

### Architecture Pattern

**Monorepo Structure:**
```
/src
├── app/              # Next.js App Router pages
│   ├── (main)/      # Public and protected routes
│   └── (auth)/      # Authentication routes
├── server/          # Backend logic
│   ├── api/         # tRPC routers
│   ├── db/          # Database schema and client
│   └── supabase/    # Auth utilities
├── components/      # React components
│   ├── ui/          # Radix UI components
│   ├── auth/        # Auth-related components
│   ├── seller/      # Seller-specific components
│   ├── parts/       # Part-related components
│   └── layout/      # Layout components
├── hooks/           # Custom React hooks
└── lib/             # Utility functions
```

**Key Architectural Decisions:**
- **Server-Side Rendering (SSR)** for SEO optimization on product pages
- **Type-safe APIs** end-to-end with tRPC
- **Client-side cart** with localStorage for reduced DB load
- **Managed auth** via Supabase for security and scalability
- **CDN-based image storage** for performance

---

## User Model & Roles

### Single User Model with Role Flag

The platform uses a unified `profiles` table with an `isSeller` boolean flag to distinguish between buyers and sellers:

**Profile Fields:**
- `id` - Primary key (from Supabase Auth)
- `name`, `email`, `imageUrl`, `phone`, `bio` - Basic info
- `isSeller` - **Boolean flag** (default: false)
- `isVerified` - Verification status
- `totalSales`, `totalPurchases` - Transaction counters
- `responseTime` - Seller metric
- `memberSince`, `lastActive` - Activity tracking

**User Journey:**
1. All users start as **buyers** (`isSeller: false`)
2. Users can **become sellers** through onboarding:
   - Add default address
   - Create default shipping profile
   - Flag updated to `isSeller: true`
3. Sellers retain buyer capabilities (can buy and sell)

---

## Core Features

### Buyer Features

#### 1. Product Discovery & Search
**Homepage** (`/`)
- Featured categories (Engine Parts, Brake System, Electrical, etc.)
- Trust badges (Verified Sellers, Quality Guaranteed, Fast Shipping)
- Latest 6 parts featured

**Search & Browse** (`/parts`)
- Real-time search with 600ms debouncing
- Full-text search across:
  - Part title
  - Description
  - Part numbers
- Advanced filters:
  - Category (Engine, Brakes, Electrical, etc.)
  - Vehicle Brand (BMW, Mercedes, Toyota, etc.)
  - Vehicle Model (E46, C-Class, Camry, etc.)
  - Year range
  - Condition (New, Used, Refurbished)
  - Price range (min-max slider)
  - Negotiable flag
- Sorting options:
  - Relevance (newest first)
  - Price: High to Low
  - Price: Low to High
- Server-side filtering with pagination support

#### 2. Product Detail Page
**Detail View** (`/part/[id]`)
- Image gallery with multiple photos
- Complete product information:
  - Title, description, part number
  - OEM, brand, material
  - Condition, warranty
  - Price (with original price if discounted)
  - Negotiable flag
  - Quantity available
  - Weight and dimensions
- **Vehicle Compatibility Table:**
  - Make, model, year range
  - Engine specifications
  - Trim levels
- **Seller Information:**
  - Seller name and location
  - Member since date
  - Seller stats (when available)
- **Shipping Details:**
  - Carrier, estimated delivery time
  - Base shipping cost
  - Free shipping threshold
- **Related sections** (planned):
  - Customer reviews
  - Related/similar parts

#### 3. Shopping Cart
**Cart Management** (`/cart`)
- Client-side cart stored in localStorage
- Add/remove items
- Update quantities
- Items grouped by seller
- Running totals:
  - Subtotal by seller
  - Shipping costs
  - Grand total
- Cart persists across sessions

#### 4. Checkout Flow
**Checkout** (`/checkout`)
- Shipping address form
- Billing address option
- Order summary with itemized breakdown
- Empty cart protection (redirects if empty)
- Order placement (planned: payment integration)

#### 5. User Profile
**Profile Page** (`/profile`)
- Account settings management
- Order history (planned)
- Favorites/watchlist (planned)
- Protected route (auth required)

### Seller Features

#### 1. Seller Onboarding
**Onboarding Wizard** (`/sell`)

**3-Step Process:**

**Step 1: Welcome**
- Requirements overview
- What sellers need to get started

**Step 2: Add Address**
- Full address form (line1, line2, city, state, zip, country)
- Phone number
- Automatically set as default address
- Required before proceeding

**Step 3: Create Shipping Profile**
- Profile name (e.g., "Standard Shipping", "Express")
- Base shipping cost
- Carrier (UPS, FedEx, USPS)
- Estimated delivery time (min-max days)
- Free shipping threshold (optional)
- Automatically set as default profile
- Required before proceeding

**Completion:**
- Updates `isSeller` status to `true`
- Redirects to seller dashboard
- Smart flow skips already-completed steps

**Important Rules:**
- First address is automatically default (cannot be deleted)
- First shipping profile is automatically default (cannot be deleted)
- Minimum one of each required to list parts

#### 2. Seller Dashboard
**Dashboard** (`/sell`)

**Three Main Tabs:**

1. **Active Listings**
   - Grid view of all seller's parts
   - Part images, titles, prices
   - Status indicators (active, sold, inactive)
   - Quick edit/delete actions
   - "List New Part" button (prominent CTA)

2. **Addresses & Shipping**
   - **Address Management:**
     - View all addresses
     - Add new addresses
     - Edit existing addresses
     - Delete non-default addresses
     - Set default address
   - **Shipping Profile Management:**
     - View all shipping profiles
     - Add new profiles
     - Edit existing profiles
     - Delete non-default profiles
     - Set default profile
     - Toggle active/inactive

3. **Sales History** (planned)
   - Order tracking
   - Revenue analytics
   - Customer information

#### 3. Create New Listing
**New Listing Form** (`/sell/new`)

**Multi-step form with validation:**

**Basic Information:**
- Title (required)
- Description (required)
- Category dropdown (required)
- Brand/Vehicle make (required)

**Part Details:**
- Part number (required)
- OEM (Original Equipment Manufacturer)
- Condition dropdown (New, Used, Refurbished)
- Material (e.g., Ceramic, Metal)
- Warranty period (e.g., "2 Years", "90 Days")

**Pricing:**
- Price (required)
- Original price (for showing discounts)
- Currency (default: USD)
- Negotiable checkbox

**Inventory:**
- Quantity available (required)
- Weight (for shipping calculation)
- Dimensions (L × W × H)

**Images:**
- Multiple image upload
- Drag-and-drop support
- Select primary image
- Preview before submission
- Stored in Supabase Storage

**Vehicle Compatibility:**
- Add multiple compatible vehicles
- For each vehicle:
  - Make (dropdown)
  - Model (dropdown, filtered by make)
  - Year range (start-end)
  - Engine specifications (optional)
  - Trim level (optional)

**Shipping:**
- Link to existing shipping profiles
- Multiple profiles can be selected

**API Flow:**
1. Create part record (`part.createPart`)
2. Upload images (`image.uploadTempImage`, then `image.createPartImage`)
3. Link shipping profiles (`part.createPartShipping`)
4. Add vehicle compatibility (`part.createPartCompatibility`)

---

## Database Schema

### Core Tables

#### profiles
User accounts (both buyers and sellers)
```sql
- id (PK, text)
- email (unique, not null)
- name, imageUrl, phone, bio
- isSeller (boolean, default: false)  ← Key differentiator
- isVerified (boolean)
- totalSales, totalPurchases (integers)
- responseTime (text)
- memberSince, lastActive (timestamps)

Indexes: email, name, isSeller, isVerified
```

#### parts
Main product/listing table
```sql
- id (PK, text)
- sellerId (FK → profiles.id)
- categoryId (FK → categories.id)
- title, description, partNumber
- oem, brand, condition
- price, originalPrice, currency
- isNegotiable (boolean)
- quantity, weight, dimensions
- warranty, material
- specifications (JSONB)
- status (active/sold/inactive)
- viewCount, favoriteCount
- createdAt, updatedAt

Indexes: sellerId, categoryId, title, brand,
         condition, price, status, partNumber, createdAt
```

#### categories
Part categories (hierarchical)
```sql
- id (PK, text)
- name, slug (unique)
- description, imageUrl
- parentId (FK → self, for hierarchy)
- isActive (boolean)
- sortOrder (integer)

Indexes: parentId, isActive, sortOrder
Unique: slug
```

#### vehicleMakes
Car manufacturers
```sql
- id (PK, text)
- name, slug (unique)
- logoUrl
- isActive (boolean)

Indexes: name, isActive
Unique: slug
```

#### vehicleModels
Car models
```sql
- id (PK, text)
- makeId (FK → vehicleMakes.id)
- name, slug
- yearStart, yearEnd (year range)
- isActive (boolean)

Indexes: makeId, name, yearRange, isActive
Unique: makeId + slug
```

#### partImages
Product photos
```sql
- id (PK, text)
- partId (FK → parts.id, cascade delete)
- url (stored in Supabase Storage)
- altText
- sortOrder, isPrimary (boolean)

Indexes: partId, (partId + sortOrder), (partId + isPrimary)
```

#### partCompatibility
Vehicle fitment information
```sql
- id (PK, text)
- partId (FK → parts.id, cascade delete)
- makeId (FK → vehicleMakes.id)
- modelId (FK → vehicleModels.id)
- yearStart, yearEnd
- engine, trim

Indexes: partId, (makeId + modelId), (yearStart + yearEnd)
Unique: partId + makeId + modelId + yearRange + engine
```

#### shippingProfiles
Seller shipping options
```sql
- id (PK, text)
- sellerId (FK → profiles.id)
- name, carrier
- baseCost, freeShippingThreshold
- estimatedDaysMin, estimatedDaysMax
- isDefault, isActive (booleans)

Indexes: sellerId, (sellerId + isDefault), isActive
```

#### partShipping
Links parts to shipping profiles
```sql
- id (PK, text)
- partId (FK → parts.id, cascade delete)
- shippingProfileId (FK → shippingProfiles.id)

Indexes: partId, shippingProfileId
Unique: partId + shippingProfileId
```

#### addresses
User/seller addresses
```sql
- id (PK, text)
- userId (FK → profiles.id)
- type (billing/shipping)
- fullName, company
- line1, line2, city, state, postalCode, country
- phone
- isDefault (boolean)

Indexes: userId, (userId + type), (userId + isDefault), postalCode
```

#### reviews
Product and seller reviews (planned)
```sql
- id (PK, text)
- partId (FK → parts.id, nullable)
- sellerId (FK → profiles.id)
- buyerId (FK → profiles.id)
- orderId (reference to order)
- rating (1-5)
- title, comment
- isVerifiedPurchase, isPublic (booleans)
- helpfulCount

Indexes: partId, sellerId, buyerId, rating,
         isVerifiedPurchase, createdAt
```

#### favorites
User watchlist/saved items (planned)
```sql
- id (PK, text)
- userId (FK → profiles.id)
- partId (FK → parts.id, cascade delete)

Indexes: userId, partId, createdAt
Unique: userId + partId
```

#### sellerStats
Aggregated seller metrics (for performance)
```sql
- id (PK, text)
- sellerId (FK → profiles.id, unique)
- averageRating, totalReviews
- totalSales, totalRevenue
- responseRate, onTimeShipping (percentages)

Indexes: averageRating, totalSales
Unique: sellerId
```

### Database Relations

**Drizzle ORM Relations:**
- Parts → Images (one-to-many)
- Parts → Seller (many-to-one)
- Parts → Category (many-to-one)
- Parts → PartShipping (one-to-many)
- Parts → PartCompatibility (one-to-many)
- Profiles → Parts (one-to-many)
- Profiles → Addresses (one-to-many)
- Profiles → ShippingProfiles (one-to-many)
- PartCompatibility → Make, Model (many-to-one each)

---

## API Structure (tRPC)

### Router Configuration

**Context:**
- `user` - Current authenticated user (from Supabase)
- `db` - Drizzle database instance
- `headers` - Request headers

**Procedure Types:**
- `publicProcedure` - No authentication required
- `privateProcedure` - Requires authenticated user
- `adminProcedure` - Requires admin role

**Data Transformer:**
- SuperJSON for complex types (Dates, BigInts, etc.)

### API Routers

#### part (Product/Listing APIs)

**Queries:**
- `getHomePageParts()` - Latest 6 parts for homepage
- `getSearchResults({ search, filters, sort, cursor, pageSize })` - Advanced search with filters
- `getPartById(id)` - Single part with full details (images, seller, compatibility, shipping)
- `getPartsByUserId()` - Seller's active listings (private)

**Mutations:**
- `createPart({ title, description, categoryId, ... })` - Create new listing (private)
- `createPartShipping({ partId, shippingProfileId })` - Link shipping to part (private)
- `createPartCompatibility({ partId, makeId, modelId, ... })` - Add vehicle compatibility (private)

#### partInfo (Reference Data)

**Queries:**
- `getCategories()` - All categories with full details
- `getCategoriesForDropdown()` - ID + name only (optimized)
- `getMakes()` - All vehicle makes
- `getMakesForDropdown()` - ID + name only (optimized)

**Mutations:**
- `createMockCategories()` - Seed 10 sample categories
- `createMockMakes()` - Seed 20 vehicle brands
- `createModelForMake({ makeId, name, yearStart, yearEnd })` - Add vehicle model

#### user (User Management)

**Queries:**
- `getUser()` - Current user profile (private)

**Mutations:**
- `updateSellerStatus({ isSeller })` - Toggle seller status (private)

#### address (Address Management)

**Queries:**
- `getAllAddresses()` - User's addresses (private)

**Mutations:**
- `createAddress({ fullName, line1, city, state, ... })` - Auto-defaults first address (private)
- `updateAddress({ id, address })` - Modify address (private)
- `deleteAddress({ id, isDefault })` - Prevents deleting default (private)

#### shipping (Shipping Profile Management)

**Queries:**
- `getAllShippingProfiles()` - Seller's profiles (private)

**Mutations:**
- `createShippingProfile({ name, baseCost, carrier, ... })` - Auto-defaults first profile (private)
- `updateShippingProfile({ id, shippingProfile })` - Modify profile (private)
- `deleteShippingProfile({ id, isDefault })` - Prevents deleting default (private)

#### image (Image Upload)

**Mutations:**
- `uploadTempImage({ imageData, fileName, contentType })` - Upload to Supabase Storage (private)
- `createPartImage({ partId, url, isPrimary, sortOrder })` - Create DB record (private)

---

## Frontend Structure

### Page Routes

**Public Routes:**
- `/` - Homepage with featured parts
- `/parts` - Search/browse with filters
- `/part/[id]` - Product detail page
- `/cart` - Shopping cart
- `/checkout` - Checkout flow
- `/order-success` - Order confirmation (planned)

**Auth Routes:**
- `/sign-in` - Login (email/password + Google OAuth)
- `/sign-up` - Registration

**Protected Routes:**
- `/profile` - User account settings
- `/favorites` - Saved items (planned)
- `/orders` - Order history (planned)
- `/sell` - Seller dashboard or onboarding
- `/sell/new` - Create listing
- `/sell/addresses` - Address management
- `/sell/shipping` - Shipping management

### Component Organization

**Layout Components** (`/components/layout/`)
- `header.tsx` - Top navigation with search bar, logo, user menu
- `bottom-nav.tsx` - Mobile bottom navigation

**Auth Components** (`/components/auth/`)
- `login-form.tsx` - Email/password + Google OAuth
- `signup-form.tsx` - Registration form with validation

**Seller Components** (`/components/seller/`)
- `seller-onboarding.tsx` - 3-step onboarding wizard
- `seller-dashboard.tsx` - Dashboard with tabs
- `seller-stats.tsx` - Metrics overview
- `active-listings.tsx` - Part list view
- `sales-history.tsx` - Sales tracking
- `new-listing-form/` - Multi-step listing creation
- `address-form/` - Address CRUD
- `shipping-profiles-form/` - Shipping CRUD

**Parts Components** (`/components/parts/`)
- `part-card.tsx` - Product card for grid/list views

**UI Components** (`/components/ui/`)
- 20+ Radix UI components (Button, Card, Dialog, Input, etc.)
- Consistent design system
- Accessible, keyboard-navigable

### State Management

**Server State (TanStack Query):**
- Parts, categories, makes/models
- User profile, addresses, shipping profiles
- Cached queries with automatic revalidation
- Optimistic updates

**Client State:**
- **Shopping cart** - React Context + localStorage
  - Persists across sessions
  - Add/remove/update items
  - Grouped by seller
- **User context** - Authentication state
- **Form state** - TanStack Form

### UI Patterns

**Search:**
- Header search bar with keyboard shortcut (`/`)
- Real-time search with 600ms debouncing
- Auto-navigation to `/parts` with query params

**Mobile-First:**
- Responsive grid layouts (1-col mobile, 3-col desktop)
- Bottom navigation for mobile
- Touch-optimized interactions

**Loading States:**
- Skeleton loaders during data fetch
- Loading spinners on buttons
- Suspense boundaries for async components

---

## Authentication & Authorization

### Authentication Provider
**Supabase Auth:**
- Email/password authentication
- Google OAuth integration
- JWT-based sessions
- Automatic session refresh

### Auth Flow
1. User signs up/signs in
2. Supabase creates user in `auth.users`
3. Profile created in `profiles` table (via trigger or manual)
4. JWT token stored in cookie
5. Server-side auth via Supabase SSR helpers
6. Client-side auth via Supabase browser client

### Protected Routes
**Server-side:**
- tRPC `privateProcedure` - Requires auth
- tRPC `adminProcedure` - Requires admin role
- Page-level checks with `getUser()`

**Client-side:**
- User context provider
- Conditional rendering based on auth state

---

## Key Business Logic

### Seller Onboarding Rules
1. First address is automatically default
2. First shipping profile is automatically default
3. Default address cannot be deleted (must set new default first)
4. Default shipping profile cannot be deleted (must set new default first)
5. Must complete all steps before listing parts

### Part Listing Requirements
- Must be a seller (`isSeller: true`)
- Must have at least one address
- Must have at least one shipping profile
- Must select at least one shipping profile for the part
- Must add at least one vehicle compatibility

### Search & Filter Logic
1. Text search across title, description, part number (ILIKE)
2. Category filter resolved by name/slug
3. Brand filter resolved by make name/slug
4. Model filter requires brand to be selected first
5. Year filter checks compatibility year ranges
6. Compatibility filtering done post-query (JS filter)
7. Results sorted by relevance (newest), price-high, or price-low

### Cart Logic
- Items stored in localStorage
- Grouped by seller for shipping calculation
- Each item includes: partId, title, price, quantity, image, sellerId
- Cart persists across browser sessions
- Cart cleared on order completion (planned)

---

## Scalability Considerations

### Current Capacity
- **Estimated:** 10k-50k parts, 1k-5k concurrent users
- **Bottlenecks:** Search performance, lack of caching

### Known Scalability Issues

#### 1. Search Performance ⚠️
**Problem:** ILIKE full-table scans on `title`, `description`, `partNumber`
**Impact:** Slow queries at 100k+ parts
**Solution:** PostgreSQL full-text search (tsvector + GIN index) or Elasticsearch

#### 2. Inefficient Compatibility Filtering ⚠️
**Problem:** Fetches 1000 parts, filters in JavaScript
**Impact:** Wastes DB resources, slow response times
**Solution:** Use SQL EXISTS subquery for filtering

#### 3. Large Page Size ⚠️
**Problem:** Default 1000 items per page with nested joins
**Impact:** Heavy memory usage, slow JSON serialization
**Solution:** Reduce to 20-50 items, proper cursor pagination

#### 4. No Caching ⚠️
**Problem:** Reference data (categories, makes) fetched on every request
**Impact:** Unnecessary DB load
**Solution:** Redis caching for static/semi-static data

#### 5. Missing Infrastructure
- No rate limiting (API abuse risk)
- No connection pooling (PgBouncer recommended)
- No async job queue (image processing is synchronous)
- No monitoring/alerting

### Scalability Roadmap

**Phase 1: Quick Wins**
- Add PostgreSQL full-text search
- Reduce page size to 20-50
- Redis cache for reference data
- Fix compatibility filtering (SQL)
- Add rate limiting

**Phase 2: Performance**
- Proper cursor pagination
- Query result caching
- Database connection pooling
- Optimize image uploads (compression)

**Phase 3: Infrastructure**
- Read replicas for search
- Background job queue (BullMQ)
- CDN for static assets
- Monitoring (DataDog/New Relic)

**Phase 4: Advanced**
- Database sharding (if needed)
- Microservices for heavy operations
- Edge caching (Cloudflare Workers)
- Event-driven architecture

**Projected Capacity After Improvements:**
- Phase 1+2: 500k-1M parts, 10k-20k concurrent users
- All phases: Multi-million parts, 100k+ concurrent users

---

## Development Status

### Completed Features ✅
- User authentication (email/password + Google OAuth)
- Seller onboarding (3-step wizard)
- Create new listings (multi-step form)
- Advanced search and filtering
- Product detail pages
- Shopping cart (localStorage)
- Address management
- Shipping profile management
- Seller dashboard
- Image uploads to Supabase Storage

### In Progress 🚧
- Responsive layout improvements
- Cursor-based pagination
- Performance optimizations

### Planned 📋
- Checkout and payment integration (Stripe)
- Order management system
- Seller-buyer chat/messaging
- Reviews and ratings
- Favorites/watchlist
- Email notifications
- Seller analytics dashboard
- Advanced seller stats
- Mobile app (React Native)

---

## Deployment Recommendations

### Infrastructure
- **Hosting:** Vercel (Next.js optimized) or AWS/GCP
- **Database:** Supabase (managed PostgreSQL) or self-hosted with PgBouncer
- **Storage:** Supabase Storage or AWS S3 + CloudFront CDN
- **Cache:** Redis (Upstash, Redis Cloud, or ElastiCache)
- **Monitoring:** Vercel Analytics + Sentry for error tracking

### Environment Variables
```env
# Database
DATABASE_URL=postgresql://...
DIRECT_URL=postgresql://... (for migrations)

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbG...
SUPABASE_SERVICE_ROLE_KEY=eyJhbG... (server-side only)

# App
NEXT_PUBLIC_APP_URL=https://partout.com
NODE_ENV=production
```

### CI/CD Pipeline
1. **Lint & Type Check:** ESLint + TypeScript
2. **Build:** Next.js build
3. **Database Migrations:** Drizzle push/migrate
4. **Deploy:** Vercel or custom deployment
5. **Smoke Tests:** Basic API health checks

---

## Security Considerations

### Current Security Measures ✅
- Supabase Auth with JWT tokens
- Server-side authentication validation
- tRPC input validation with Zod schemas
- SQL injection prevention (parameterized queries via Drizzle)
- File upload validation (type, size)
- Environment variable separation
- HTTPS enforced (via Vercel/hosting)

### Recommended Enhancements 🔒
- Rate limiting on API endpoints
- CSRF protection for mutations
- Input sanitization for user-generated content (XSS prevention)
- File upload malware scanning
- Database row-level security (RLS) with Supabase
- Audit logging for sensitive operations
- Regular dependency updates
- Content Security Policy (CSP) headers
- DDoS protection (Cloudflare)

---

## Analytics & Monitoring (Planned)

### Key Metrics to Track
**User Metrics:**
- Daily/Monthly active users (DAU/MAU)
- User retention rate
- Buyer-to-seller conversion rate

**Product Metrics:**
- Total listings
- Active vs. inactive parts
- Views per listing
- Favorites per listing
- Search queries (top keywords)

**Transaction Metrics:**
- Conversion rate (views → cart → checkout → purchase)
- Average order value (AOV)
- Revenue by category
- Revenue by seller

**Performance Metrics:**
- Page load times
- API response times
- Database query performance
- Error rates
- Uptime/availability

### Recommended Tools
- **Analytics:** Google Analytics 4, Mixpanel, or PostHog
- **Performance:** Vercel Analytics, New Relic, or DataDog
- **Error Tracking:** Sentry
- **Database:** pganalyze or Supabase dashboard

---

## Competitive Advantages

1. **Specialized for Auto Parts** - Unlike generic marketplaces (eBay, Craigslist)
2. **Vehicle Compatibility Matching** - Buyers find exactly what fits their car
3. **Seller-Friendly Onboarding** - Easy setup vs. complex platforms
4. **Transparent Shipping** - Clear costs upfront
5. **Modern UX** - Fast, mobile-optimized, clean design
6. **Type-Safe Architecture** - Fewer bugs, faster development

---

## Growth Opportunities

### Short-Term
- SEO optimization for product pages
- Email marketing campaigns
- Seller referral program
- Buyer loyalty rewards
- Social media integration

### Mid-Term
- Mobile app (iOS/Android)
- Seller verification program
- Premium seller subscriptions
- Featured listings (paid placement)
- API for third-party integrations

### Long-Term
- International expansion
- B2B wholesale marketplace
- Vehicle repair shops as sellers
- Parts installation service marketplace
- Automotive data/insights platform

---

## Contact & Resources

**Repository:** `/Users/akshayyelle/personal/partout`

**Key Files:**
- Database Schema: `src/server/db/schema.ts`
- API Routers: `src/server/api/routers/*`
- Main Pages: `src/app/(main)/*`
- Components: `src/components/*`

**Documentation:**
- Next.js: https://nextjs.org/docs
- tRPC: https://trpc.io/docs
- Drizzle ORM: https://orm.drizzle.team
- Supabase: https://supabase.com/docs
- Radix UI: https://www.radix-ui.com

---

**Last Updated:** 2025-12-12
