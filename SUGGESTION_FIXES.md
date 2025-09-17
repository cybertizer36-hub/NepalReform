# Suggestion System Fixes

This document outlines the fixes applied to the suggestion system to resolve the following issues:

1. **Rejected suggestions were still being shown** - Fixed by filtering suggestions by status
2. **No confirmation messages after submission** - Added proper user feedback

## Changes Made

### 1. API Route Updates (`app/api/suggestions/route.ts`)

#### GET Endpoint Fix
- **Problem**: Was fetching ALL suggestions regardless of status
- **Fix**: Added `.eq("status", "approved")` filter to only show approved suggestions
- **Result**: Rejected and pending suggestions are now properly hidden from public view

#### POST Endpoint Fix
- **Problem**: No confirmation messages were being returned to users
- **Fix**: Added dynamic confirmation messages based on `auto_approve_suggestions` setting:
  - **Auto-approve ON**: "Thank you for your suggestion! Our team will review it and compile it in our next version of the manifesto."
  - **Auto-approve OFF**: "Thanks for the suggestion! Due to many malicious actors, auto approve system is currently disabled but it is submitted to the team. It will be shown on website if it's approved."

### 2. Frontend Component Updates (`components/suggestion-form.tsx`)

#### Added Success Message Handling
- **Added**: `successMessage` state to track confirmation messages
- **Updated**: `handleSubmit` function to display API response messages
- **Added**: Green success message UI component with dismiss functionality
- **Enhancement**: Auto-dismiss success messages after 7 seconds

### 3. Database Schema Updates

#### System Settings Table (`scripts/create-system-settings-table.sql`)
- **Created**: New SQL script to ensure `system_settings` table exists
- **Features**: 
  - Singleton table (only one row allowed)
  - `auto_approve_suggestions` boolean column
  - Automatic `updated_at` timestamp trigger
  - Default value: `false` (manual approval required)

## How It Works Now

### For Users Submitting Suggestions:
1. **Submit suggestion** → Form submission
2. **System checks** → Auto-approve setting from database  
3. **Suggestion saved** → With status 'approved' or 'pending'
4. **User sees confirmation** → Appropriate message based on setting
5. **Form resets** → Ready for next suggestion

### For Viewing Suggestions:
1. **API call** → Only fetches suggestions with status = 'approved'
2. **Display** → Users only see approved suggestions
3. **Hidden** → Rejected and pending suggestions are not shown

## Admin Features Required

To fully utilize this system, you'll need admin functionality to:
- Toggle the `auto_approve_suggestions` setting
- View pending suggestions
- Approve/reject suggestions manually
- Bulk actions for suggestion moderation

## Database Commands to Run

1. **Add status column** (if not already done):
   ```sql
   -- Run the existing script
   \i scripts/add-suggestions-status-column.sql
   ```

2. **Create system settings table**:
   ```sql
   -- Run the new script  
   \i scripts/create-system-settings-table.sql
   ```

## Testing the Fixes

### Test Scenario 1: Auto-approve ON
1. Set `auto_approve_suggestions = true` in database
2. Submit suggestion → Should see: "Thank you for your suggestion! Our team will review it and compile it in our next version of the manifesto."
3. Suggestion should appear immediately in suggestion list

### Test Scenario 2: Auto-approve OFF  
1. Set `auto_approve_suggestions = false` in database
2. Submit suggestion → Should see: "Thanks for the suggestion! Due to many malicious actors, auto approve system is currently disabled but it is submitted to the team. It will be shown on website if it's approved."
3. Suggestion should NOT appear in suggestion list until manually approved

### Test Scenario 3: Rejected Suggestions
1. Set suggestion status to 'rejected' in database
2. Refresh suggestion list → Rejected suggestion should not appear
3. Verify only 'approved' suggestions are visible

## Security Considerations

- ✅ Only authenticated users can submit suggestions
- ✅ Input validation and sanitization in place  
- ✅ Rate limiting recommended (not implemented)
- ✅ Moderation system prevents spam/malicious content
- ✅ Email notifications to admin on new submissions

## Next Steps

Consider implementing:
- Rate limiting for suggestion submissions
- Admin dashboard for suggestion moderation
- Bulk actions for managing suggestions
- Enhanced anti-spam measures
- Suggestion categories/tagging
