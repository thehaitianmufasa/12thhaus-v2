# 🎨 12thhaus Frontend Agent Configuration
**Critical Configuration for Tailwind CSS v4 Compatibility**

---

## ⚠️ MANDATORY TAILWIND CSS V4 SETUP

### **ALWAYS Verify These Files Before Starting Frontend Development:**

#### 1. **postcss.config.mjs** - Must Use Object Format
```javascript
const config = {
  plugins: {
    "@tailwindcss/postcss": {},
  },
};

export default config;
```

#### 2. **app/globals.css** - Must Use @import Syntax
```css
@import "tailwindcss";

/* Force light theme for spiritual platform */
:root {
  --foreground-rgb: 0, 0, 0;
  --background-start-rgb: 214, 219, 220;
  --background-end-rgb: 255, 255, 255;
}

body {
  color: rgb(var(--foreground-rgb));
  background: rgb(var(--background-start-rgb));
}

@layer utilities {
  .text-balance {
    text-wrap: balance;
  }
}

/* Custom spiritual theme enhancements */
.spiritual-gradient {
  background: linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%);
}

.backdrop-blur-spiritual {
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
}
```

#### 3. **Cache Clearing Protocol**
```bash
# ALWAYS run these commands if CSS is not compiling correctly:
rm -rf .next
rm -rf node_modules/.cache
npm run dev
```

---

## 🚨 ERROR PREVENTION CHECKLIST

### **Before Starting Any Frontend Work:**
- [ ] Verify postcss.config.mjs uses object format (not array)
- [ ] Verify globals.css uses `@import "tailwindcss"` (not @tailwind directives)
- [ ] Clear .next cache if switching between Tailwind versions
- [ ] Use startup script: `./start-servers.sh` for reliable server startup

### **If Purple Theme Not Displaying:**
1. Check compiled CSS for gradient classes: `.from-purple-50`, `.to-indigo-100`
2. Clear cache: `rm -rf .next && npm run dev`
3. Verify Tailwind v4 configuration is correct

### **Common Issues & Solutions:**
- **Issue:** Black/gray background instead of purple gradient
- **Cause:** Tailwind CSS v4 configuration incorrect
- **Solution:** Use configuration files above and clear cache

- **Issue:** CSS classes not being applied
- **Cause:** PostCSS plugin format incorrect  
- **Solution:** Use object format in postcss.config.mjs

---

## 🎯 12THHAUS SPIRITUAL THEME REQUIREMENTS

### **Required Purple Gradient Classes:**
- Background: `bg-gradient-to-br from-purple-50 to-indigo-100`
- Buttons: `bg-purple-600 hover:bg-purple-700`
- Text: `text-purple-600`, `text-purple-700`
- Cards: Purple borders and accents

### **Spiritual Platform Colors:**
```javascript
purple: {
  50: '#faf5ff',   // Light background gradients
  100: '#f3e8ff',  // Card backgrounds
  600: '#9333ea',  // Primary buttons
  700: '#7c3aed',  // Hover states
}
```

---

## 🔧 DEVELOPMENT WORKFLOW

### **Starting Development:**
```bash
# Use the startup script (recommended)
./start-servers.sh

# Manual startup (if needed)
npm start &                    # GraphQL backend
cd frontend && npm run dev     # Frontend
```

### **Stopping Development:**
```bash
./stop-servers.sh
```

### **Health Checks:**
- GraphQL: http://localhost:4000/graphql
- Frontend: http://localhost:3000
- Purple theme visible on homepage

---

## 📝 AGENT RESPONSIBILITIES

### **Frontend Development Agent Must:**
1. **ALWAYS** verify Tailwind CSS v4 configuration before starting
2. **NEVER** use old @tailwind directives in globals.css
3. **ALWAYS** clear cache when switching Tailwind versions
4. **VERIFY** purple theme is working before claiming completion
5. **USE** startup script for reliable server management

### **Verification Protocol:**
- [ ] Frontend loads at localhost:3000
- [ ] Purple gradient background visible
- [ ] Service cards display with purple theme
- [ ] No console errors related to CSS compilation
- [ ] Screenshot or visual confirmation provided

---

**Last Updated:** July 25, 2025  
**Tailwind Version:** v4.1.11  
**Critical for:** 12thhaus Spiritual Platform Development