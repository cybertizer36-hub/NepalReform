# Floating Chatbot Widget Integration

## Overview
This document describes the floating chatbot widget integration into the Nepal Reforms Platform. The widget provides users with easy access to the AI assistant (NRAI-Kancha) through a WhatsApp-style floating interface.

## Features
- 🎯 **Floating Button**: Persistent chat icon in the bottom-right corner
- 💬 **Embedded Chat**: iframe-based chat window with smooth animations
- 📱 **Mobile Responsive**: Adapts to different screen sizes
- 🔗 **Open in New Tab**: Option to open the chatbot in a separate browser tab
- 🎨 **WhatsApp-style Design**: Familiar and user-friendly interface
- ⚡ **Lazy Loading**: iframe loads only when the chat is opened
- 🛡️ **Security**: Sandboxed iframe with appropriate permissions
- 🚫 **Admin Exclusion**: Widget doesn't appear on admin pages

## Component Structure

### Main Component
- **Location**: `/components/floating-chat-widget.tsx`
- **Type**: Client-side React component
- **Key Features**:
  - State management for open/closed states
  - Fullscreen toggle capability
  - ESC key to close
  - Animation transitions
  - Path-based rendering exclusion

### Styling
- **Location**: `/components/floating-chat-widget.module.css`
- **Features**:
  - Custom animations (fade-in, pulse, blink)
  - Mobile-specific adjustments
  - Print media exclusion
  - Dark mode support (optional)

## Integration Points

### 1. Providers Component
- **File**: `/app/providers.tsx`
- **Integration**: Dynamic import to avoid SSR issues
```tsx
const FloatingChatWidget = dynamic(
  () => import('@/components/floating-chat-widget'),
  { ssr: false }
)
```

### 2. Environment Variables
Configure the widget behavior through environment variables:

```env
# Required
NEXT_PUBLIC_CHATBOT_URL=https://chat.nepalreforms.com/

# Optional
NEXT_PUBLIC_CHATBOT_TITLE=Nepal Reforms Assistant
NEXT_PUBLIC_SHOW_CHAT_NOTIFICATION=false
```

## Configuration Options

| Variable | Description | Default |
|----------|-------------|---------|
| `NEXT_PUBLIC_CHATBOT_URL` | URL of the hosted chatbot | `https://chat.nepalreforms.com/` |
| `NEXT_PUBLIC_CHATBOT_TITLE` | Title shown in the chat header | `Nepal Reforms Assistant` |
| `NEXT_PUBLIC_SHOW_CHAT_NOTIFICATION` | Show notification dot on button | `false` |

## Security Considerations

### iframe Sandbox Attributes
The iframe is sandboxed with specific permissions:
- `allow-same-origin`: Required for the chatbot to function
- `allow-scripts`: Enable JavaScript execution
- `allow-forms`: Allow form submissions
- `allow-popups`: Enable popup windows if needed
- `allow-modals`: Support modal dialogs
- `allow-downloads`: Enable file downloads from chat

### Content Security
- `referrerPolicy="origin"`: Send only origin information
- Lazy loading to reduce initial load impact
- No sensitive data passed through iframe URL

## Excluded Routes
The widget is automatically hidden on:
- `/admin/*` - All admin panel pages
- `/auth/*` - Authentication pages

## Mobile Responsiveness

### Breakpoints
- **Desktop**: 400px width, 600px height (max)
- **Tablet** (<640px): Adjusted positioning
- **Mobile** (<400px): Reduced button size, full-screen chat window

### Mobile Behavior
- Full-screen chat window on mobile devices
- Smaller floating button (48x48px → 44x44px)
- Touch-friendly interaction areas

## Browser Compatibility
- Modern browsers (Chrome, Firefox, Safari, Edge)
- CSS Grid and Flexbox support required
- JavaScript ES6+ features used

## Performance Optimizations
1. **Dynamic Import**: Component loaded only when needed
2. **Lazy Loading**: iframe content loads on first open
3. **CSS Animations**: Hardware-accelerated transitions
4. **Conditional Rendering**: No DOM presence on excluded pages

## Customization Guide

### Changing Colors
Update the gradient colors in the component:
```tsx
// Button gradient
className="bg-gradient-to-r from-green-500 to-green-600"

// Header gradient
className="bg-gradient-to-r from-green-500 to-green-600"
```

### Modifying Position
Adjust the positioning classes:
```tsx
// Default: bottom-right
className="fixed bottom-6 right-6"

// Alternative: bottom-left
className="fixed bottom-6 left-6"
```

### Animation Timing
Modify transition durations:
```tsx
// Current: 300ms
className="transition-all duration-300"

// Slower: 500ms
className="transition-all duration-500"
```

## Troubleshooting

### Widget Not Appearing
1. Check if current path is excluded (admin/auth)
2. Verify environment variables are set
3. Check browser console for errors
4. Ensure component is imported in Providers

### iframe Not Loading
1. Verify CHATBOT_URL is accessible
2. Check CORS settings on chatbot domain
3. Review browser security settings
4. Test iframe sandbox permissions

### Mobile Display Issues
1. Check viewport meta tag in layout
2. Verify CSS media queries
3. Test on actual devices (not just browser tools)

## Testing Checklist
- [ ] Widget appears on homepage
- [ ] Widget hidden on admin pages
- [ ] Chat opens/closes smoothly
- [ ] Fullscreen mode works
- [ ] "Open in new tab" functions
- [ ] Mobile responsive design
- [ ] ESC key closes chat
- [ ] iframe loads properly
- [ ] Animations are smooth
- [ ] No console errors

## Future Enhancements
- [ ] Message notifications from chatbot
- [ ] Custom themes/color schemes
- [ ] Position preference (left/right)
- [ ] Size preferences (small/medium/large)
- [ ] Keyboard shortcuts
- [ ] Analytics integration
- [ ] Offline mode handling
- [ ] Multi-language support

## Maintenance
- Regularly update chatbot URL if it changes
- Monitor iframe security policies
- Test after Next.js upgrades
- Review mobile compatibility with new devices

## Support
For issues or questions about the chatbot widget integration:
1. Check this documentation
2. Review component code comments
3. Test in development environment
4. Contact the development team

---

**Last Updated**: January 2025
**Version**: 1.0.0
**Maintainer**: Nepal Reforms Development Team
