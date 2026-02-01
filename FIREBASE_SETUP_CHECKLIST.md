# ✅ Firebase Setup Checklist for "royal-risers"

## Current Status: Project Created ✅

Your Firebase project URL: https://console.firebase.google.com/u/1/project/royal-risers/overview

---

## 📋 Complete These Steps (In Order):

### ✅ STEP 1: Get Your Firebase Config
**Location:** Project Settings → Your apps → Web app

- [ ] Click ⚙️ Settings → Project settings
- [ ] Scroll to "Your apps" section
- [ ] Click on Web app (</>) or "Add app" if none exists
- [ ] Copy the `firebaseConfig` values
- [ ] **Write them down here temporarily:**
  - apiKey: `_________________`
  - projectId: `royal-risers` (already known)
  - authDomain: `royal-risers.firebaseapp.com` (already known)
  - storageBucket: `royal-risers.appspot.com` (already known)
  - messagingSenderId: `_________________`
  - appId: `_________________`

---

### ✅ STEP 2: Enable Firestore Database
**Location:** Left menu → Firestore Database

- [ ] Click "Firestore Database"
- [ ] Click "Create database"
- [ ] Select "Start in test mode"
- [ ] Choose location (e.g., us-central1)
- [ ] Click "Enable"
- [ ] Wait for creation (~30 seconds)

---

### ✅ STEP 3: Set Security Rules
**Location:** Firestore Database → Rules tab

- [ ] Click "Rules" tab
- [ ] Replace all code with the rules from SETUP_GUIDE.md
- [ ] Click "Publish"
- [ ] See "Rules published successfully" message

---

### ✅ STEP 4: Enable Authentication
**Location:** Left menu → Authentication

- [ ] Click "Authentication"
- [ ] Click "Get started" (if shown)
- [ ] Click "Sign-in method" tab
- [ ] Click "Email/Password"
- [ ] Toggle "Enable" to ON
- [ ] Click "Save"

---

### ✅ STEP 5: Create Admin User
**Location:** Authentication → Users tab

- [ ] Click "Users" tab
- [ ] Click "Add user"
- [ ] Enter your email: `_________________`
- [ ] Enter password: `_________________` (save this!)
- [ ] Click "Add user"

---

### ✅ STEP 6: Update firebase-config.js
**Location:** Your project folder → firebase-config.js

- [ ] Open `firebase-config.js` file
- [ ] Replace `YOUR_API_KEY` with your actual apiKey
- [ ] Replace `YOUR_PROJECT_ID` with `royal-risers`
- [ ] Replace `YOUR_MESSAGING_SENDER_ID` with your actual value
- [ ] Replace `YOUR_APP_ID` with your actual appId
- [ ] Save the file

---

### ✅ STEP 7: Create Initial Data
**Option A: Using Script (Recommended)**

- [ ] Login to admin panel: http://localhost:8000/admin/login.html
- [ ] Open: http://localhost:8000/initialize-data.html
- [ ] Fill form (or use defaults)
- [ ] Click "Initialize Data"
- [ ] See success messages ✅

**Option B: Manual Entry**

- [ ] Go to Firestore Database → Data tab
- [ ] Click "Start collection"
- [ ] Collection ID: `tournaments`
- [ ] Document ID: `royal-risers-cup`
- [ ] Add field: `meta` (type: map)
  - Inside map: `name` (string): "Royal Risers Cup"
  - Inside map: `description` (string): "A premier cricket tournament"
  - Inside map: `organizer` (string): "Your Organization"
- [ ] Click "Save"
- [ ] Click on `royal-risers-cup` document
- [ ] Click "Start collection" (subcollection)
- [ ] Collection ID: `seasons`
- [ ] Document ID: `s1-2026`
- [ ] Click "Save" (empty is fine)

---

### ✅ STEP 8: Add localhost Domain
**Location:** Authentication → Settings tab

- [ ] Go to Authentication → Settings
- [ ] Scroll to "Authorized domains"
- [ ] If `localhost` is missing, click "Add domain"
- [ ] Enter: `localhost`
- [ ] Click "Add"

---

### ✅ STEP 9: Test Everything
**Location:** Your computer

- [ ] Open terminal in project folder
- [ ] Run: `python -m http.server 8000`
- [ ] Open browser: http://localhost:8000
- [ ] See landing page? ✅
- [ ] Go to: http://localhost:8000/admin/login.html
- [ ] Login with email/password from Step 5
- [ ] See admin dashboard? ✅

---

## 🎉 You're Done!

If all steps are checked, your website is ready!

**Next:** Use the admin panel to add season data (format, awards, matches, teams, etc.)

---

## 🆘 Need Help?

- See `SETUP_GUIDE.md` for detailed instructions
- Check browser console (F12) for errors
- Verify all values in `firebase-config.js` are correct
