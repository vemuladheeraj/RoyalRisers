# Firebase Setup Guide - Step by Step

## Your Firebase Project: royal-risers

Follow these steps in order:

---

## STEP 1: Get Firebase Config Values

1. Go to: https://console.firebase.google.com/u/1/project/royal-risers/overview
2. Click the **⚙️ Settings icon** (top left) → **Project settings**
3. Scroll down to **"Your apps"** section
4. If you see a web app (</> icon), click on it
   - If NO web app exists:
     - Click **"Add app"** → Select **Web** (</> icon)
     - App nickname: "Royal Risers Website" (or leave blank)
     - Click **"Register app"**
5. You'll see a `firebaseConfig` object like this:
   ```javascript
   const firebaseConfig = {
     apiKey: "AIzaSyC...",
     authDomain: "royal-risers.firebaseapp.com",
     projectId: "royal-risers",
     storageBucket: "royal-risers.appspot.com",
     messagingSenderId: "123456789012",
     appId: "1:123456789012:web:abc123def456"
   };
   ```
6. **Copy these values** - you'll need them in Step 4

---

## STEP 2: Enable Firestore Database

1. In Firebase Console, click **"Firestore Database"** in the left menu
2. Click **"Create database"** button
3. Choose **"Start in test mode"** (we'll add security rules next)
4. Select a **location** (choose closest to you, e.g., `us-central1`)
5. Click **"Enable"**
6. Wait for database to be created (takes ~30 seconds)

---

## STEP 3: Set Firestore Security Rules

1. Still in **Firestore Database**, click the **"Rules"** tab (top)
2. You'll see default test mode rules
3. **Replace everything** with this:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /tournaments/{tournamentId} {
      allow read: if true;
      allow write: if request.auth != null;
      
      match /seasons/{seasonId} {
        allow read: if true;
        allow write: if request.auth != null;
        
        match /matches/{matchId} {
          allow read: if true;
          allow write: if request.auth != null;
        }
        
        match /teams/{teamId} {
          allow read: if true;
          allow write: if request.auth != null;
        }
      }
    }
  }
}
```

4. Click **"Publish"** button
5. You should see: "Rules published successfully"

---

## STEP 4: Enable Authentication

1. Click **"Authentication"** in the left menu
2. Click **"Get started"** button (if you see it)
3. Click the **"Sign-in method"** tab (top)
4. Click on **"Email/Password"**
5. Toggle **"Enable"** to ON
6. Click **"Save"**

---

## STEP 5: Create Admin User

1. Still in **Authentication**, click **"Users"** tab (top)
2. Click **"Add user"** button
3. Enter:
   - **Email**: your-email@example.com (use your real email)
   - **Password**: Create a strong password (remember this!)
4. Click **"Add user"**
5. **Save these credentials** - you'll use them to login to admin panel

---

## STEP 6: Update firebase-config.js File

1. Open `firebase-config.js` in your project
2. Replace the placeholder values with your actual values from Step 1:

```javascript
export const firebaseConfig = {
  apiKey: "YOUR_ACTUAL_API_KEY_HERE",
  authDomain: "royal-risers.firebaseapp.com",
  projectId: "royal-risers",
  storageBucket: "royal-risers.appspot.com",
  messagingSenderId: "YOUR_ACTUAL_SENDER_ID",
  appId: "YOUR_ACTUAL_APP_ID"
};
```

**Important:** 
- Replace `YOUR_ACTUAL_API_KEY_HERE` with your real apiKey
- Replace `YOUR_ACTUAL_SENDER_ID` with your real messagingSenderId
- Replace `YOUR_ACTUAL_APP_ID` with your real appId
- The `authDomain`, `projectId`, and `storageBucket` should already match (they use "royal-risers")

---

## STEP 7: Initialize Firestore Data

**Option A: Using Script (Recommended - Easy!)**

1. Make sure you've completed Steps 4 & 5 (Authentication enabled + Admin user created)
2. Open: http://localhost:8000/admin/login.html
3. Login with your admin credentials
4. Open: http://localhost:8000/initialize-data.html
5. Fill in the form (or use defaults):
   - Tournament Name: Royal Risers Cup
   - Description: (your description)
   - Organizer: (your organization)
   - Season ID: s1-2026
6. Click **"Initialize Data"**
7. Wait for success messages
8. Done! ✅

**Option B: Manual Entry (Alternative)**

1. Go to **Firestore Database** → **Data** tab
2. Click **"Start collection"**
3. Collection ID: `tournaments`
4. Click **"Next"**
5. Document ID: `royal-risers-cup`
6. Click **"Next"**
7. Add a field:
   - Field: `meta`
   - Type: **map** (click the dropdown, select "map")
   - Click **"Add field"** inside the map:
     - Field: `name`, Type: **string**, Value: `Royal Risers Cup`
     - Field: `description`, Type: **string**, Value: `A premier cricket tournament`
     - Field: `organizer`, Type: **string**, Value: `Your Organization Name`
8. Click **"Save"**
9. Now create a season:
   - Click on the `royal-risers-cup` document
   - Click **"Start collection"** (this creates a subcollection)
   - Collection ID: `seasons`
   - Click **"Next"**
   - Document ID: `s1-2026`
   - Click **"Next"**
   - **Don't add any fields** - just click **"Save"** (empty document is fine)
   - The admin panel will let you add all data later

---

## STEP 8: Add localhost to Authorized Domains

1. Go to **Authentication** → **Settings** tab
2. Scroll to **"Authorized domains"**
3. If `localhost` is NOT in the list:
   - Click **"Add domain"**
   - Enter: `localhost`
   - Click **"Add"**

---

## STEP 9: Test Your Setup

1. Open terminal/command prompt in your project folder
2. Run:
   ```bash
   python -m http.server 8000
   ```
   (Or double-click `run-local.bat` on Windows)
3. Open browser: http://localhost:8000
4. You should see the landing page
5. Try admin login: http://localhost:8000/admin/login.html
   - Use the email/password from Step 5

---

## Troubleshooting

### "Firebase: Error (auth/unauthorized-domain)"
- Make sure you added `localhost` in Step 8

### "Failed to fetch" or blank page
- Check browser console (F12) for errors
- Verify `firebase-config.js` has correct values
- Make sure Firestore is enabled (Step 2)

### "No seasons available"
- Make sure you created the season document in Step 7
- Check the document ID is exactly `s1-2026`

### Admin login fails
- Verify user exists in Authentication → Users
- Check email/password are correct
- Make sure Email/Password is enabled (Step 4)

---

## What's Next?

After completing all steps:
1. ✅ Your website should load at http://localhost:8000
2. ✅ You can login to admin panel
3. ✅ Use admin panel to add season data (format, awards, matches, etc.)
4. ✅ Public site will display your data dynamically

---

## Quick Checklist

- [ ] Step 1: Got Firebase config values
- [ ] Step 2: Enabled Firestore Database
- [ ] Step 3: Set security rules
- [ ] Step 4: Enabled Email/Password auth
- [ ] Step 5: Created admin user
- [ ] Step 6: Updated firebase-config.js
- [ ] Step 7: Created tournament and season documents
- [ ] Step 8: Added localhost to authorized domains
- [ ] Step 9: Tested website locally

Once all checked, you're ready to go! 🎉
