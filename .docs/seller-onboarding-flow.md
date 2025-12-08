# Seller Onboarding Flow - Implementation Summary

## Overview
Implemented a complete seller onboarding flow that guides users through becoming sellers on the Partout platform.

## Flow Description

### User Journey

1. **User navigates to `/sell` page**
   - System checks if user is already a seller (`isSeller` boolean)

2. **If user is NOT a seller:**
   - Shows the **Seller Onboarding** component with welcome screen
   - Displays progress cards showing:
     - ✅ Address (shows checkmark if already added)
     - ✅ Shipping Profile (shows checkmark if already added)

3. **Step 1: Add Address**
   - User clicks "Get Started"
   - If no address exists, shows address form
   - User fills in their address details
   - **First address is automatically set as default** (cannot be deleted)
   - On success, moves to shipping step

4. **Step 2: Add Shipping Profile**
   - Shows shipping profile form
   - User configures:
     - Name (e.g., "Standard", "Express")
     - Carrier (UPS, FedEx, USPS)
     - Base cost
     - Free shipping threshold (optional)
     - Estimated delivery days (min/max)
   - **First shipping profile is automatically set as default** (cannot be deleted)
   - On success, completes onboarding

5. **Completion**
   - Updates user's `isSeller` status to `true`
   - Shows success message
   - Refreshes page to show seller dashboard

6. **If user IS a seller:**
   - Directly shows the **Seller Dashboard**

## Files Changed/Created

### New Files
- `src/components/seller/seller-onboarding.tsx` - Onboarding component
- `src/server/api/routers/user.ts` - User-related tRPC procedures

### Modified Files
- `src/app/(main)/sell/page.tsx` - Updated to show onboarding or dashboard
- `src/server/api/routers/address.ts` - Auto-default first address
- `src/server/api/routers/shipping.ts` - Auto-default first shipping profile
- `src/server/api/root.ts` - Added user and seller routers

## Key Features

### Automatic Defaults
- **First address** created is automatically set as default
- **First shipping profile** created is automatically set as default
- Primary addresses/shipping profiles cannot be deleted (enforced in delete mutations)

### Smart Flow
- If user already has an address but no shipping, skips to shipping step
- If user has both but hasn't completed onboarding, allows completion
- Validates completion requirements before activating seller status

### User Experience
- Loading states while checking seller status
- Clear progress indicators
- Success toasts for each step
- Automatic page reload after completion

## API Endpoints (tRPC)

### User Router (`user.*`)
- `getUser` - Gets current user profile with `isSeller` status
- `updateSellerStatus` - Updates user's seller status

### Address Router (`address.*`)
- `createAddress` - Creates address (auto-defaults first one)
- `getAllAddresses` - Lists user's addresses
- `updateAddress` - Updates an address
- `deleteAddress` - Deletes address (blocks deleting default)

### Shipping Router (`shipping.*`)
- `createShippingProfile` - Creates shipping profile (auto-defaults first one)
- `getAllShippingProfiles` - Lists user's shipping profiles
- `updateShippingProfile` - Updates a shipping profile
- `deleteShippingProfile` - Deletes profile (blocks deleting default)

## Testing Checklist

- [ ] Navigate to `/sell` as a non-seller user
- [ ] Verify welcome screen shows with both cards
- [ ] Add an address through the onboarding
- [ ] Verify it's set as default automatically
- [ ] Add a shipping profile through the onboarding
- [ ] Verify it's set as default automatically
- [ ] Verify completion message appears
- [ ] Verify page reloads and shows seller dashboard
- [ ] Try to delete the default address (should fail)
- [ ] Try to delete the default shipping profile (should fail)
- [ ] Navigate to `/sell` again and verify dashboard shows directly

## Future Enhancements
- Add ability to skip steps if user wants to set up later
- Email verification before allowing selling
- More detailed shipping options
- Multiple addresses/shipping profiles management UI
