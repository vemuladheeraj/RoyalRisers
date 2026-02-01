# Royal Risers Cup - Cricket Tournament Website

A production-ready, multi-season cricket tournament website built with vanilla JavaScript and Firebase. Fully dynamic, admin-editable, and free to host.

## Features

- ✅ Multi-season support (Season 1, Season 2, etc.)
- ✅ Season-specific rules, format, awards, fees, and policies
- ✅ Public site with dynamic season data
- ✅ Protected admin panel with full CRUD operations
- ✅ Firebase backend (Firestore + Email/Password Auth)
- ✅ Static hosting compatible (Firebase Hosting / Netlify)
- ✅ Mobile-first, responsive design
- ✅ No frameworks - Pure HTML, CSS, and Vanilla JavaScript

## Assets & images

- **`assets/`** – Hero and section backgrounds (JPEG). Add images here; then run **`npm run optimize-images`** to resize (max 1400px) and compress (~80% smaller) so they load fast and render correctly.

## Project Structure

```
RoyalRisers/
├── assets/                 # Optimized images (hero, section backgrounds)
├── index.html              # Landing page (season selector)
├── season.html             # Season overview page
├── fixtures.html           # Match fixtures
├── points.html             # Points table
├── teams.html              # Teams list
├── stats.html              # Player statistics
├── firebase-config.js      # Firebase configuration
├── css/
│   └── styles.css          # Shared stylesheet
├── js/
│   ├── firebase-init.js    # Firebase initialization
│   ├── firestore-helpers.js # Firestore operations
│   ├── auth-helpers.js     # Authentication helpers
│   ├── index.js            # Landing page logic
│   ├── season.js           # Season page logic
│   ├── fixtures.js         # Fixtures page logic
│   ├── points.js           # Points table logic
│   ├── teams.js            # Teams page logic
│   └── stats.js            # Stats page logic
└── admin/
    ├── login.html          # Admin login page
    ├── dashboard.html      # Admin dashboard
    └── js/
        ├── login.js        # Login logic
        └── dashboard.js    # Dashboard CRUD logic
```

## Setup Instructions

### 1. Firebase Setup

1. Create a new Firebase project at [Firebase Console](https://console.firebase.google.com/)
2. Enable Firestore Database
3. Enable Authentication (Email/Password only)
4. Get your Firebase config from Project Settings > General > Your apps
5. Update `firebase-config.js` with your Firebase credentials:

```javascript
export const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};
```

### 2. Firestore Security Rules

Set up Firestore security rules (see `FIRESTORE_DATA_STRUCTURE.md` for details):

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

### 3. Create Admin User

1. Go to Firebase Console > Authentication
2. Click "Add user"
3. Enter email and password
4. This user can now log in to the admin panel

### 4. Initialize Firestore Data

1. Create the tournament document structure (see `FIRESTORE_DATA_STRUCTURE.md`)
2. Add at least one season with sample data
3. The admin panel can be used to add/edit data after initial setup

### 5. Local Development

1. Install a local server (if needed):
   ```bash
   # Using Python
   python -m http.server 8000
   
   # Using Node.js (http-server)
   npx http-server
   ```

2. Open `http://localhost:8000` in your browser

**Note:** Firebase requires HTTPS for authentication in production. For local development, Firebase allows localhost.

### 6. Deploy to Firebase Hosting

1. Install Firebase CLI:
   ```bash
   npm install -g firebase-tools
   ```

2. Login to Firebase:
   ```bash
   firebase login
   ```

3. Initialize Firebase Hosting:
   ```bash
   firebase init hosting
   ```

4. Configure hosting:
   - Public directory: `.` (root)
   - Single-page app: No
   - Overwrite index.html: No

5. Deploy:
   ```bash
   firebase deploy --only hosting
   ```

### 7. Deploy to Netlify

1. Connect your repository to Netlify
2. Build settings:
   - Build command: (leave empty)
   - Publish directory: `.` (root)
3. Deploy

## Usage

### Public Site

- **Home Page**: Select a season to view
- **Season Page**: View season overview, format, awards, facilities, costs, and payment policy
- **Fixtures**: View all matches for the selected season
- **Points Table**: View league standings
- **Teams**: View all registered teams
- **Stats**: View batting and bowling statistics

### Admin Panel

1. Navigate to `/admin/login.html`
2. Login with your admin credentials
3. Select a season from the dropdown
4. Use tabs to edit:
   - Season Overview
   - Tournament Format
   - Awards
   - Facilities
   - Cost Structure
   - Payment Policy
   - Matches (CRUD)
   - Teams (CRUD)
   - Points Table
   - Player Stats

## Data Model

See `FIRESTORE_DATA_STRUCTURE.md` for complete data structure documentation.

Key points:
- Tournament metadata is stored in `tournaments/royal-risers-cup`
- Each season is a document in `tournaments/royal-risers-cup/seasons/{seasonId}`
- Matches and teams are subcollections under each season
- Points table and stats are arrays in the season document

## Customization

### Change Tournament ID

Update `TOURNAMENT_ID` in `firebase-config.js`:

```javascript
export const TOURNAMENT_ID = "your-tournament-id";
```

### Styling

Modify `css/styles.css` to customize colors, fonts, and layout. CSS variables are defined in `:root` for easy theming.

### Adding New Fields

1. Update Firestore data structure
2. Update rendering functions in public JS files
3. Add form fields in `admin/dashboard.html`
4. Update form handlers in `admin/js/dashboard.js`

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## License

This project is open source and available for use.

## Support

For issues or questions, please refer to the code comments or Firebase documentation.
