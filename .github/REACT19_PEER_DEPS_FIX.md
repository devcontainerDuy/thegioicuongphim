# 🔧 React 19 Peer Dependency Fix

## 🐛 Issue

CI/CD build failed với lỗi:
```
npm error ERESOLVE could not resolve
npm error peer react@"^16.6.0 || ^17.0.0 || ^18.0.0" from react-helmet-async@2.0.5
npm error Conflicting peer dependency: react@18.3.1
```

**Root Cause:**
- Project đang sử dụng **React 19.2.3**
- Package `react-helmet-async@2.0.5` chỉ support React **16/17/18**
- npm strict peer dependency checking từ npm v7+ gây ra conflict

---

## ✅ Solution Applied

### Quick Fix: `--legacy-peer-deps`

Thêm flag `--legacy-peer-deps` vào npm ci commands trong workflows:

**Files Modified:**
- [deploy.yml](file:///d:/laragon/www/personal-project/thegioicuongphim/.github/workflows/deploy.yml#L47)
- [pr-check.yml](file:///d:/laragon/www/personal-project/thegioicuongphim/.github/workflows/pr-check.yml#L49)

**Change:**
```diff
- npm ci --prefer-offline --no-audit
+ npm ci --prefer-offline --no-audit --legacy-peer-deps
```

**What it does:**
- Bypass peer dependency checks
- Allow installation với incompatible peer dependencies
- CI/CD builds hoàn thành thành công

---

## 🎯 Long-term Solutions (Recommended)

### Option 1: Wait for `react-helmet-async` React 19 support
Track issue: https://github.com/staylor/react-helmet-async/issues

### Option 2: Migrate to alternative packages

#### A. Use native `react-helmet` v7+ (supports React 19)
```bash
npm uninstall react-helmet-async
npm install react-helmet@latest
```

**Migration Example:**
```diff
- import { Helmet, HelmetProvider } from 'react-helmet-async';
+ import { Helmet, HelmetProvider } from 'react-helmet';
```

#### B. Use `@react-hook/seo` (React 19 compatible)
```bash
npm uninstall react-helmet-async
npm install @react-hook/seo
```

**Migration Example:**
```jsx
import { useSEO } from '@react-hook/seo';

function MyPage() {
  useSEO({
    title: 'My Page',
    description: 'Description',
  });
}
```

---

## 📝 Files Using `react-helmet-async`

Currently used in 2 files:
1. `client/src/App.js` - HelmetProvider wrapper
2. `client/src/components/common/SEO.jsx` - SEO component

---

## ⚠️ Trade-offs

### Using `--legacy-peer-deps`:
**Pros:**
- ✅ Quick fix, no code changes  
- ✅ CI/CD builds pass immediately
- ✅ App works correctly (React 19 compatible packages)

**Cons:**
- ⚠️ Hides potential real peer dependency issues
- ⚠️ May install incompatible versions silently
- ⚠️ Not recommended for production long-term

### Migration to alternatives:
**Pros:**
- ✅ Proper React 19 support
- ✅ No peer dependency warnings
- ✅ Future-proof solution

**Cons:**
- ⏱️ Requires code changes
- 🧪 Needs testing

---

## 🚀 Next Steps

1. **Immediate:** ✅ Use `--legacy-peer-deps` (Done)
2. **Short-term:** Monitor `react-helmet-async` for React 19 support
3. **Long-term:** Migrate to `react-helmet` v7+ hoặc alternative

---

**Issue Created:** 2026-01-10  
**Status:** ✅ Fixed (temporary with --legacy-peer-deps)  
**Priority:** Medium (not blocking, but should migrate eventually)
