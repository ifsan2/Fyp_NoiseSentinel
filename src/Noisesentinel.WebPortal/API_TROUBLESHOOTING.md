# API Connection Troubleshooting Guide

## Current Configuration

- Frontend: `http://localhost:3001`
- Backend API: `http://localhost:5200/api`

## Common Issues and Solutions

### 1. SSL Protocol Error (`net::ERR_SSL_PROTOCOL_ERROR`)

**Problem**: Frontend is trying to connect to HTTPS but backend is running on HTTP.

**Solution**: Update `.env` file to use HTTP instead of HTTPS:

```env
VITE_API_BASE_URL=http://localhost:5200/api
```

### 2. Network Error / Connection Refused

**Problem**: Backend server is not running or running on different port.

**Solutions**:

1. Check if backend is running: `netstat -an | grep 5200`
2. Update port in `.env` if backend runs on different port
3. Start your backend server

### 3. CORS Errors

**Problem**: Cross-Origin Resource Sharing blocked.

**Solution**: Backend should include CORS headers for `http://localhost:3001`

### 4. Proxy Issues

**Problem**: Vite proxy not working properly.

**Check**: `vite.config.ts` proxy configuration:

```typescript
server: {
  proxy: {
    '/api': {
      target: 'http://localhost:5200',
      changeOrigin: true,
      secure: false,
    },
  },
}
```

## Environment Variables

Create `.env` file with:

```env
VITE_API_BASE_URL=http://localhost:5200/api
VITE_APP_NAME=NoiseSentinel Admin Portal
VITE_DEV_MODE=true
VITE_LOG_LEVEL=debug
```

## Testing Connection

1. Open browser dev tools (F12)
2. Navigate to login page
3. Check console for connection logs
4. Look for "📤 API Request" and "❌ API Error" messages

## Backend Requirements

Your backend should:

1. Run on HTTP port 5200 (or update config accordingly)
2. Accept requests from `http://localhost:3001`
3. Have CORS configured properly
4. Have an endpoint at `/api/Auth/login`

## Quick Fix Checklist

- [ ] Backend server is running
- [ ] .env file has correct API URL
- [ ] Using HTTP instead of HTTPS for local development
- [ ] CORS is enabled on backend
- [ ] Firewall/antivirus not blocking connections
