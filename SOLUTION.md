# ✅ SOLUTION: Port Conflict Fixed

## 🚨 **Problem**
The backend was trying to use port 3000, but it was already in use by another process, causing this error:
```
Error: listen EADDRINUSE: address already in use :::3000
```

## ✅ **Solution**
I've fixed this by:

1. **Changed the backend port from 3000 to 3001**
2. **Updated the frontend to connect to port 3001**
3. **Created helper scripts to start the server properly**

---

## 🚀 **How to Start the Backend**

### Method 1: Using PowerShell Script (Recommended)
```bash
cd stack-backend
powershell -ExecutionPolicy Bypass -File start.ps1
```

### Method 2: Using Batch File
```bash
cd stack-backend
start.bat
```

### Method 3: Manual Start
```bash
cd stack-backend
taskkill /f /im node.exe
node server.js
```

### Method 4: Using npm
```bash
cd stack-backend
npm run dev
```

---

## 🔧 **What Changed**

### Backend (server.js)
- Port changed from `3000` to `3001`
- Added better logging

### Frontend (api.ts)
- API URL changed from `http://localhost:3000/api` to `http://localhost:3001/api`

### New Files Created
- `start.ps1` - PowerShell script to start server
- `start.bat` - Windows batch script to start server
- `test-server.js` - Simple test server

---

## 🎯 **Test the Solution**

1. **Start Backend:**
   ```bash
   cd stack-backend
   powershell -ExecutionPolicy Bypass -File start.ps1
   ```
   
   You should see:
   ```
   ✅ Server running on http://localhost:3001
   ✅ Default admin user: admin@stackit.com / admin123
   ```

2. **Start Frontend:**
   ```bash
   cd stack-frontend
   npm run dev
   ```
   
   You should see:
   ```
   Local:   http://localhost:5173/
   ```

3. **Test the Connection:**
   - Open `http://localhost:5173`
   - Login with: `admin@stackit.com` / `admin123`
   - Everything should work!

---

## 🚨 **If You Still Get Errors**

### "Port still in use"
```bash
# Kill all Node.js processes
taskkill /f /im node.exe

# Or use PowerShell
Get-Process -Name node | Stop-Process -Force

# Then start again
cd stack-backend
node server.js
```

### "Cannot connect to backend"
- Make sure backend is running on port 3001
- Check that frontend is trying to connect to port 3001
- Verify CORS is properly configured

### "Module not found"
```bash
cd stack-backend
npm install
```

---

## 🎉 **Success!**

Your Stack Overflow clone should now be working perfectly with:
- ✅ **Backend:** `http://localhost:3001`
- ✅ **Frontend:** `http://localhost:5173`
- ✅ **No port conflicts**
- ✅ **All features working**

**The port conflict has been resolved!** 🎊 