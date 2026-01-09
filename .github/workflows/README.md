# 🔄 CI/CD Workflows

This directory contains GitHub Actions workflows for the **thegioicuongphim** React application.

## 📁 Active Workflows

### 1. `deploy.yml` - Production Deployment
**Trigger:** Push to `main` branch  
**Purpose:** Build React app và deploy lên production FTP server

**Steps:**
- ✅ Setup Node.js 20 với npm cache
- ✅ Install dependencies (`npm ci`)
- ✅ Build production bundle
- ✅ Show build size analytics
- ✅ Upload build artifacts (7 days retention)
- ✅ Deploy via FTP to production server

**Runtime:** ~2-3 minutes (với cache)

---

### 2. `pr-check.yml` - Pull Request Validation
**Trigger:** Pull requests to `main` branch  
**Purpose:** Verify build trước khi merge

**Steps:**
- ✅ Setup Node.js với caching
- ✅ Run tests (nếu có)
- ✅ Build verification
- ✅ Build size report trong PR comments
- ✅ Upload PR artifacts (3 days retention)

**Runtime:** ~2-3 minutes

---

## 🚫 Removed Workflows

~~`jekyll-gh-pages.yml`~~ - **Deleted** (không cần cho React app)  
~~`static.yml`~~ - **Deleted** (deploy method khác)

---

## 🔧 Configuration Files

- **`size-limit.config`** - Bundle size limits để monitor performance
- **`CI_CD_OPTIMIZATION.md`** - Chi tiết về optimizations đã thực hiện

---

## 📊 Secrets Required

Cần config các secrets sau trong GitHub repository settings:

```
REACT_APP_API_URL         # API endpoint URL
SERVER                     # FTP server address
USERNAME                   # FTP username
PASSWORD                   # FTP password
```

---

## 🎯 Best Practices

1. **Always test locally trước khi push:**
   ```bash
   cd client
   npm run build
   ```

2. **Tạo PR cho mọi changes** - Đừng push trực tiếp lên `main`

3. **Review build size reports** trong PRs

4. **Check artifacts** nếu cần debug deployment issues

---

**Last Updated:** 2026-01-10
