# Custom Hooks

This directory contains custom React hooks used throughout the Excel Meet application.

## Available Hooks

### useAdVisibility

**File:** `useAdVisibility.js`

Determines whether Google Ads should be visible to the current user based on their subscription status.

**Usage:**
```javascript
import { useAdVisibility } from '../hooks/useAdVisibility';

function MyComponent() {
  const { shouldShowAds, reason } = useAdVisibility();
  
  if (shouldShowAds) {
    return <AdBanner type="horizontal" />;
  }
  
  return null;
}
```

**Returns:**
```typescript
{
  shouldShowAds: boolean;  // Whether ads should be displayed
  reason: string;          // Reason for the decision (for debugging)
}
```

**Reasons:**
- `loading` - User data is still loading
- `not_logged_in` - User is not authenticated (show ads)
- `no_profile` - User profile not found (show ads)
- `free_tier` - User is on free plan (show ads)
- `subscription_expired` - Subscription has expired (show ads)
- `cancelled_but_active` - Subscription cancelled but still active (no ads)
- `subscription_inactive` - Subscription is inactive (show ads)
- `active_subscription` - Active paid subscription (no ads)
- `default` - Default case (show ads)

**Logic Flow:**
1. Check if user data is loading → Don't show ads
2. Check if user is logged in → Show ads if not logged in
3. Check if user profile exists → Show ads if no profile
4. Check subscription tier → Show ads if free tier
5. Check subscription status and expiry → Determine based on status
6. Default → Show ads

**Dependencies:**
- `useAuth` from `AuthContext` - For user and profile data

**Example with Debugging:**
```javascript
const { shouldShowAds, reason } = useAdVisibility();

console.log('Ad Visibility:', {
  shouldShow: shouldShowAds,
  reason: reason,
  timestamp: new Date().toISOString()
});
```

## Adding New Hooks

When creating new custom hooks:

1. Create a new file in this directory
2. Name it with `use` prefix (e.g., `useMyHook.js`)
3. Add JSDoc comments
4. Export as named or default export
5. Update this README with documentation

**Template:**
```javascript
import { useState, useEffect } from 'react';

/**
 * Description of what the hook does
 * 
 * @param {Type} param - Description of parameter
 * @returns {Type} Description of return value
 */
export const useMyHook = (param) => {
  const [state, setState] = useState(null);
  
  useEffect(() => {
    // Hook logic
  }, [param]);
  
  return state;
};

export default useMyHook;
```

## Best Practices

1. **Single Responsibility** - Each hook should do one thing well
2. **Reusability** - Design hooks to be reusable across components
3. **Documentation** - Always document parameters and return values
4. **Error Handling** - Handle errors gracefully
5. **Dependencies** - Minimize external dependencies
6. **Testing** - Write tests for complex hooks
7. **Performance** - Use memoization when appropriate

## Related Documentation

- [React Hooks Documentation](https://react.dev/reference/react)
- [Custom Hooks Guide](https://react.dev/learn/reusing-logic-with-custom-hooks)
- Excel Meet Component Documentation