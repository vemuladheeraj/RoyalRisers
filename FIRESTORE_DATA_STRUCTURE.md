# Firestore Data Structure

This document describes the Firestore data structure for the Royal Risers Cup tournament website.

## Collection Structure

```
tournaments (collection)
 └── royal-risers-cup (document)
      ├── meta (object)
      │    ├── name: string
      │    ├── description: string
      │    └── organizer: string
      └── seasons (subcollection)
           └── s1-2026 (document)
                ├── overview (object)
                │    └── description: string
                ├── format (object)
                │    ├── leagueMatches: string
                │    └── qualificationRules: string
                ├── awards (object)
                │    ├── matchAwards: array<string>
                │    ├── tournamentAwards: array<string>
                │    └── teamAwards: array<string>
                ├── facilities (object)
                │    ├── refreshments: string
                │    ├── liveStreaming: string
                │    └── streamingCost: string
                ├── costStructure (object)
                │    ├── groundFee: string
                │    ├── umpireFee: string
                │    ├── refreshmentCost: string
                │    └── totalPerMatch: string
                ├── paymentPolicy (object)
                │    ├── advanceMatchFee: string
                │    ├── awardsContribution: string
                │    └── totalAdvance: string
                ├── pointsTable: array<object>
                ├── stats (object)
                │    ├── batting: array<object>
                │    └── bowling: array<object>
                ├── matches (subcollection)
                └── teams (subcollection)
```

## Sample Data

### Tournament Document (`tournaments/royal-risers-cup`)

```json
{
  "meta": {
    "name": "Royal Risers Cup",
    "description": "A premier cricket tournament bringing together the best teams and players for competitive cricket action.",
    "organizer": "Ashutosh Kumar"
  }
}
```

### Season Document (`tournaments/royal-risers-cup/seasons/s1-2026`)

```json
{
  "overview": {
    "description": "Season 1 of Royal Risers Cup features 8 teams competing in a round-robin format followed by playoffs."
  },
  "format": {
    "leagueMatches": "Round-robin: Each team plays 7 matches",
    "qualificationRules": "Top 4 teams qualify for semi-finals. Winners advance to finals."
  },
  "awards": {
    "matchAwards": [
      "Man of the Match",
      "Best Fielder",
      "Best Bowler"
    ],
    "tournamentAwards": [
      "Player of the Tournament",
      "Best Batsman",
      "Best Bowler",
      "Emerging Player"
    ],
    "teamAwards": [
      "Champions",
      "Runner-up",
      "Fair Play Award"
    ]
  },
  "facilities": {
    "refreshments": "Lunch and refreshments provided for all players",
    "liveStreaming": "All matches will be live streamed on YouTube",
    "streamingCost": "Free for viewers"
  },
  "costStructure": {
    "groundFee": "₹5,000 per match",
    "umpireFee": "₹2,000 per match",
    "refreshmentCost": "₹3,000 per match",
    "totalPerMatch": "₹10,000 per match"
  },
  "paymentPolicy": {
    "advanceMatchFee": "₹70,000 (7 matches × ₹10,000)",
    "awardsContribution": "₹5,000",
    "totalAdvance": "₹75,000"
  },
  "pointsTable": [
    {
      "team": "Team Alpha",
      "played": 5,
      "won": 4,
      "lost": 1,
      "tied": 0,
      "points": 8,
      "nrr": 0.523
    },
    {
      "team": "Team Beta",
      "played": 5,
      "won": 3,
      "lost": 2,
      "tied": 0,
      "points": 6,
      "nrr": 0.215
    }
  ],
  "stats": {
    "batting": [
      {
        "name": "John Doe",
        "team": "Team Alpha",
        "matches": 5,
        "innings": 5,
        "runs": 245,
        "balls": 180,
        "fifties": 2,
        "hundreds": 1
      }
    ],
    "bowling": [
      {
        "name": "Jane Smith",
        "team": "Team Beta",
        "matches": 5,
        "wickets": 12,
        "runs": 180,
        "overs": 25.5
      }
    ]
  }
}
```

### Match Document (`tournaments/royal-risers-cup/seasons/s1-2026/matches/{matchId}`)

```json
{
  "date": "2026-01-15",
  "team1": "Team Alpha",
  "team2": "Team Beta",
  "venue": "Cricket Ground A",
  "status": "Scheduled"
}
```

**Status values:** `Scheduled`, `Live`, `Completed`, `Cancelled`

### Team Document (`tournaments/royal-risers-cup/seasons/s1-2026/teams/{teamId}`)

```json
{
  "name": "Team Alpha",
  "captain": "John Doe",
  "description": "A competitive team with strong batting lineup"
}
```

## Setting Up Firestore

1. **Create the tournament document:**
   - Go to Firestore Console
   - Create collection: `tournaments`
   - Create document with ID: `royal-risers-cup`
   - Add `meta` object with tournament information

2. **Create a season:**
   - Navigate to `tournaments/royal-risers-cup`
   - Create subcollection: `seasons`
   - Create document with ID: `s1-2026` (or your season ID)
   - Add all season fields as shown in the sample above

3. **Add matches:**
   - Navigate to `tournaments/royal-risers-cup/seasons/s1-2026`
   - Create subcollection: `matches`
   - Add match documents with the structure shown above

4. **Add teams:**
   - Navigate to `tournaments/royal-risers-cup/seasons/s1-2026`
   - Create subcollection: `teams`
   - Add team documents with the structure shown above

## Security Rules

Make sure to set up Firestore security rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Public read access
    match /tournaments/{tournamentId} {
      allow read: if true;
      
      match /seasons/{seasonId} {
        allow read: if true;
        
        match /matches/{matchId} {
          allow read: if true;
        }
        
        match /teams/{teamId} {
          allow read: if true;
        }
      }
    }
    
    // Admin write access (authenticated users only)
    match /tournaments/{tournamentId} {
      allow write: if request.auth != null;
      
      match /seasons/{seasonId} {
        allow write: if request.auth != null;
        
        match /matches/{matchId} {
          allow write: if request.auth != null;
        }
        
        match /teams/{teamId} {
          allow write: if request.auth != null;
        }
      }
    }
  }
}
```

## Notes

- All season-specific data is stored in the season document
- Matches and teams are stored as subcollections for scalability
- Points table and stats are stored as arrays in the season document
- Season IDs should follow a consistent format (e.g., `s1-2026`, `s2-2026`)
- Date fields should be stored as strings in ISO format (YYYY-MM-DD)
