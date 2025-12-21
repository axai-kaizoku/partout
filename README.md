# Partout

- [x] Deploy to vercel
- [x] Setup Auth
- [x] Copy frontend
- [x] Create Tables

Next Steps for Implementation
The form is now ready for:

- tRPC mutations to create parts with related data
- API endpoints for loading categories and vehicle data
- Image upload functionality with cloud storage
- Form validation before step progression
- Real-time model filtering based on selected make

The form structure now perfectly aligns with our e-commerce schema and provides a solid foundation for the full implementation.

---

oauth callback url supabase
https://kfsxoftfoftadpaqdbke.supabase.co/auth/v1/callback

---

## TODO - Needed Discussion

- [x] fix seller profile side - flow

---

# Current state: 6/12/2025 - 10:44

- [x] check create part form
- [x] seller side

  - [x] add address
  - [x] shipping form
  - [x] show active listings
  - [x] fix create part form
  - [x] add edit address, edit shipping

- [-] Home Page
  - [x] create part-card component
  - [x] link part to seller
  - [-] fix search page layout

## Things remaining from my end:

7/12/2025 - 00:24

- [-] search, filters, pagination

  - [x] search
  - [x] filters
  - [x] sorting
  - [-] pagination
    - [-] cursor based pagination
    - [ ] infinite scroll
  - [x] server-side queries

- [x] seller side - flow
- [x] login flow
- [x] responsive layout
- [x] chat based contact
- [ ] ratings, reviews
- [x] contact details - only for signed in users ?

## TODO - My end

- [x] home page shop by category
- [x] search in mobile
- [ ] seller's store
- [x] messages by id page
- [ ] active listings in seller side
- [ ] in add part form, he can add multiple models
  - [ ] or fetch models using VIN number
- [-] oauth callback url
- [x] phone number country code
