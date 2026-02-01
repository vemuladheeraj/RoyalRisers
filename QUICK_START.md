# Quick Start Guide

## Technology Stack

### Frontend
- **HTML5** - Structure
- **CSS3** - Styling (with CSS variables for theming)
- **Vanilla JavaScript (ES6+)** - No frameworks, pure JavaScript
- **ES Modules** - Modern JavaScript module system

### Backend & Services
- **Firebase Firestore** - NoSQL database (cloud-hosted)
- **Firebase Authentication** - Email/password auth only
- **Firebase Hosting** - Static hosting (optional, can use Netlify/Vercel)

### Key Features
- ✅ No build step required
- ✅ No npm/node_modules
- ✅ Works directly in browser
- ✅ Static hosting compatible
- ✅ Firebase v9+ Modular SDK (CDN-based)

## Prerequisites

1. **Python 3** (for local server) OR **Node.js** (for http-server)
2. **Firebase Account** (free tier works)
3. **Modern Browser** (Chrome, Firefox, Safari, Edge)

## Step-by-Step Setup

### 1. Configure Firebase

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project
3. Enable **Firestore Database**:
   - Go to Firestore Database
   - Click "Create database"
   - Start in **test mode** (we'll add rules next)
4. Enable **Authentication**:
   - Go to Authentication
   - Click "Get started"
   - Enable "Email/Password" provider
5. Get your config:
   - Project Settings > General > Your apps > Web app
   - Copy the `firebaseConfig` object
6. Update `firebase-config.js` with your values

### 2. Set Firestore Security Rules

Go to Firestore Database > Rules and paste:

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

Click "Publish"

### 3. Create Admin User

1. Go to Authentication > Users
2. Click "Add user"
3. Enter email and password
4. Save - this is your admin login

### 4. Initialize Firestore Data

**Option A: Using Firebase Console (Quick)**

1. Go to Firestore Database
2. Start collection: `tournaments`
3. Add document with ID: `royal-risers-cup`
4. Add field:
   - Field name: `meta`
   - Type: `map`
   - Value:
     ```json
     {
       "name": "Royal Risers Cup",
       "description": "A premier cricket tournament",
       "organizer": "Your Organization"
     }
     ```
5. Create subcollection: `seasons`
6. Add document with ID: `s1-2026`
7. Leave it empty for now (admin panel will populate it)

**Option B: Use Admin Panel (Easier)**

After logging in, use the admin dashboard to add all data through forms.

### 5. Run Locally

#### Windows (PowerShell/CMD):
```bash
# Double-click run-local.bat
# OR run in terminal:
python -m http.server 8000
```

#### Mac/Linux:
```bash
# Make executable (first time only):
chmod +x run-local.sh

# Run:
./run-local.sh
# OR:
python3 -m http.server 8000
```

#### Using Node.js (if Python not available):
```bash
# Install http-server globally (one time):
npm install -g http-server

# Run:
http-server -p 8000
```

### 6. Open in Browser

Open: **http://localhost:8000**

- Public site: http://localhost:8000/index.html
- Admin login: http://localhost:8000/admin/login.html

## Troubleshooting

### "Firebase: Error (auth/unauthorized-domain)"
- Add `localhost` to Firebase Console > Authentication > Settings > Authorized domains

### "Failed to fetch" or CORS errors
- Make sure Firestore is enabled
- Check Firebase config values are correct
- Verify security rules are published

### "No seasons available"
- Create at least one season document in Firestore
- Check the season ID matches `s1-2026` or update `DEFAULT_SEASON_ID` in `firebase-config.js`

### Admin login not working
- Verify user exists in Firebase Authentication
- Check email/password are correct
- Ensure Email/Password provider is enabled

## File Structure

```
RoyalRisers/
├── index.html              # Landing page
├── season.html             # Season overview
├── fixtures.html           # Match fixtures
├── points.html             # Points table
├── teams.html              # Teams list
├── stats.html              # Player stats
├── firebase-config.js      # ⚠️ UPDATE THIS FIRST
├── css/
│   └── styles.css          # All styles
├── js/
│   ├── firebase-init.js    # Firebase setup
│   ├── firestore-helpers.js # Database operations
│   ├── auth-helpers.js     # Authentication
│   └── [page].js           # Page-specific logic
└── admin/
    ├── login.html          # Admin login
    ├── dashboard.html      # Admin panel
    └── js/
        ├── login.js
        └── dashboard.js    # CRUD operations
```

## Next Steps

1. ✅ Update `firebase-config.js`
2. ✅ Set Firestore rules
3. ✅ Create admin user
4. ✅ Initialize data
5. ✅ Run local server
6. ✅ Test public site
7. ✅ Login to admin panel
8. ✅ Add season data via admin panel
9. ✅ Deploy to Firebase Hosting or Netlify

## Deployment

### Firebase Hosting:
```bash
npm install -g firebase-tools
firebase login
firebase init hosting
# Select: Use existing project
# Public directory: . (dot)
# Single-page app: No
firebase deploy --only hosting
```

### Netlify:
1. Push code to GitHub/GitLab
2. Connect repository to Netlify
3. Build settings:
   - Build command: (leave empty)
   - Publish directory: `.` (dot)
4. Deploy

## Need Help?

- Check `README.md` for detailed documentation
- See `FIRESTORE_DATA_STRUCTURE.md` for data model
- Review code comments in JS files
