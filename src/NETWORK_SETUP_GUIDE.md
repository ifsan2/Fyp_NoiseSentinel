# Network Setup Guide - NoiseSentinel

## Quick IP Configuration for Different Network Scenarios

### 📍 Find Your Computer's IP Address

**Windows:**

```bash
ipconfig | findstr "IPv4"
```

**Look for:** `192.168.x.x` or `10.x.x.x`

---

## 🔧 Configuration Files (3 Files to Update)

### 1. **Mobile App** → `NoiseSentinel.MobileApp/src/utils/constants.ts`

```typescript
BASE_URL: __DEV__
  ? "http://YOUR_IP:5200/api"  // ← Change this
  : "https://noisesentinel.tech/api",
```

### 2. **Web Portal (CRITICAL)** → `Noisesentinel.WebPortal/.env`

```bash
VITE_API_BASE_URL=http://YOUR_IP:5200/api  # ← Change this
```

**⚠️ This .env file overrides everything else!**

### 3. **Web Portal** → `Noisesentinel.WebPortal/src/utils/constants.ts`

```typescript
BASE_URL: import.meta.env.VITE_API_BASE_URL || "http://YOUR_IP:5200/api",
```

---

## 🔥 Windows Firewall Setup (REQUIRED)

**Allow Backend Port 5200:**

**Option 1: PowerShell (Run as Administrator)**

```powershell
New-NetFirewallRule -DisplayName "NoiseSentinel Backend API" -Direction Inbound -LocalPort 5200 -Protocol TCP -Action Allow
```

**Option 2: GUI Method**

1. Search "Windows Defender Firewall" → Advanced Settings
2. Inbound Rules → New Rule
3. Port → TCP → Port 5200 → Allow → All Profiles
4. Name: "NoiseSentinel Backend" → Finish

---

## 📱 Network Scenarios

### **Scenario 1: Home/Office WiFi**

- **Find IP:** `ipconfig | findstr "IPv4"` → Example: `192.168.100.16`
- **Update 3 Files:**
  - Mobile App: `constants.ts`
  - Web Portal: `.env` + `constants.ts`
- **Access:**
  - Backend: `http://192.168.100.16:5200`
  - Web Portal: `http://192.168.100.16:3000`
  - Mobile App: Auto-connects

### **Scenario 2: Laptop Hotspot**

- **Find IP:** `ipconfig | findstr "IPv4"` (hotspot adapter)
- **Common IP:** `192.168.137.1`
- **Update 3 Files** with hotspot IP
- Connect devices to laptop hotspot

### **Scenario 3: Changing WiFi Networks**

1. Connect to new WiFi
2. Get new IP: `ipconfig | findstr "IPv4"`
3. Update **3 files** (Mobile constants.ts, Web .env, Web constants.ts)
4. Restart all services
5. Clear browser cache on other devices (Ctrl+Shift+R)

---

## ⚡ Complete Setup Checklist

### Backend Configuration

1. ✅ **Program.cs** → Add before database config:

```csharp
builder.WebHost.UseUrls("http://0.0.0.0:5200");
```

2. ✅ **CORS Policy** → Update to allow credentials:

```csharp
policy.SetIsOriginAllowed(origin => true)
      .AllowAnyMethod()
      .AllowAnyHeader()
      .AllowCredentials();
```

3. ✅ **Firewall Rule** → Allow port 5200 (see above)

### Frontend Configuration

4. ✅ Find your IP: `ipconfig | findstr "IPv4"`
5. ✅ Update Mobile App: `constants.ts`
6. ✅ Update Web Portal: `.env` (most important!)
7. ✅ Update Web Portal: `constants.ts` (fallback)
8. ✅ Restart Backend + Web Portal dev server
9. ✅ Clear browser cache on other devices

---

## 🚨 Common Issues

**Problem:** Backend not accessible from other devices

- **Check:** Backend listening on `0.0.0.0:5200` (run `netstat -an | findstr "5200"`)
- **Fix:** Add `builder.WebHost.UseUrls("http://0.0.0.0:5200")` to Program.cs
- **Firewall:** Allow port 5200 (see Firewall Setup above)

**Problem:** Web portal loads but login fails

- **Root Cause:** `.env` file has `localhost` instead of your IP
- **Fix:** Update `Noisesentinel.WebPortal/.env` → `VITE_API_BASE_URL=http://YOUR_IP:5200/api`
- **Restart:** Web portal dev server
- **Clear:** Browser cache (Ctrl+Shift+R)

**Problem:** Swagger works but web portal doesn't

- **Diagnosis:** CORS issue or .env misconfiguration
- **Fix:** Update CORS to use `SetIsOriginAllowed + AllowCredentials`
- **Verify:** `.env` file has correct IP (not localhost)

**Problem:** Works on localhost but not network

- **Check 1:** Firewall rule exists for port 5200
- **Check 2:** Backend listening on `0.0.0.0` not `127.0.0.1`
- **Check 3:** `.env` file updated (most common issue)

---

## 📝 Complete Example (IP: 192.168.100.16)

### Mobile App

**File:** `NoiseSentinel.MobileApp/src/utils/constants.ts`

```typescript
BASE_URL: __DEV__ ? "http://192.168.100.16:5200/api" : "...",
```

### Web Portal

**File:** `Noisesentinel.WebPortal/.env`

```bash
VITE_API_BASE_URL=http://192.168.100.16:5200/api
```

**File:** `Noisesentinel.WebPortal/src/utils/constants.ts`

```typescript
BASE_URL: import.meta.env.VITE_API_BASE_URL || "http://192.168.100.16:5200/api",
```

### Backend

**File:** `NoiseSentinel.WebApi/Program.cs`

```csharp
var builder = WebApplication.CreateBuilder(args);
builder.WebHost.UseUrls("http://0.0.0.0:5200");
```

**Firewall:**

```powershell
New-NetFirewallRule -DisplayName "NoiseSentinel Backend API" -Direction Inbound -LocalPort 5200 -Protocol TCP -Action Allow
```

---

## 🔄 Quick Switch Network Workflow

```
New Network → ipconfig → Update 3 Files → Restart → Clear Cache → Test
```

**Files:** Mobile constants.ts + Web .env + Web constants.ts  
**Time:** ~2 minutes
