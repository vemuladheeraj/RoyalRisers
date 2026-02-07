/**
 * Fixtures Page Logic - Modernized
 * Displays match schedule with filtering
 */
import { getSeasonMatches, getSeasonData, applyTournamentHeroImage } from './firestore-helpers.js';

// Get URL parameters
const urlParams = new URLSearchParams(window.location.search);
const tournamentId = urlParams.get('tournamentId') || 'royal-risers-cup';
const seasonId = urlParams.get('seasonId');

// DOM Elements
const seasonInfo = document.getElementById('seasonInfo');
const fixturesContent = document.getElementById('fixturesContent');
const seasonLink = document.getElementById('seasonLink');
const pointsLink = document.getElementById('pointsLink');
const teamsLink = document.getElementById('teamsLink');
const statsLink = document.getElementById('statsLink');
const matchFilter = document.getElementById('matchFilter');

// Store all matches for filtering
let allMatches = [];

/**
 * Update navigation links
 */
function updateNavLinks() {
  if (seasonId) {
    const baseUrl = `?tournamentId=${tournamentId}&seasonId=${seasonId}`;
    if (seasonLink) seasonLink.href = `season.html${baseUrl}`;
    if (pointsLink) pointsLink.href = `points.html${baseUrl}`;
    if (teamsLink) teamsLink.href = `teams.html${baseUrl}`;
    if (statsLink) statsLink.href = `stats.html${baseUrl}`;
  }
}

/**
 * Format date for display
 */
function formatDate(dateString) {
  if (!dateString) return 'Date TBD';
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  } catch {
    return dateString;
  }
}

/**
 * Render matches with modern card design
 */
function renderMatches(matches) {
  if (!fixturesContent) return;
  
  if (!matches || matches.length === 0) {
    fixturesContent.innerHTML = `
      <div class="empty-state">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="opacity: 0.5;">
          <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
        </svg>
        <p>No matches scheduled yet.</p>
      </div>
    `;
    return;
  }

  // Sort matches by date
  const sortedMatches = [...matches].sort((a, b) => {
    const dateA = a.date ? new Date(a.date) : new Date(0);
    const dateB = b.date ? new Date(b.date) : new Date(0);
    return dateA - dateB;
  });

  let html = '';
  
  sortedMatches.forEach((match, index) => {
    const isCompleted = match.status === 'completed';
    const team1Name = match.team1 || 'TBD';
    const team2Name = match.team2 || 'TBD';
    
    html += `
      <div class="match-card" style="animation-delay: ${index * 50}ms;">
        <div class="match-header">
          <span class="match-date">${formatDate(match.date)}</span>
          <span class="match-venue">${match.venue || 'Venue TBD'}</span>
        </div>
        <div class="match-teams">
          <div class="match-team">
            <div class="match-team-name">${team1Name}</div>
          </div>
          <span class="match-vs">VS</span>
          <div class="match-team">
            <div class="match-team-name">${team2Name}</div>
          </div>
        </div>
        ${match.result ? `
          <div class="match-result">
            <strong>Result:</strong> ${match.result}
          </div>
        ` : ''}
        ${isCompleted ? '<span class="badge badge-success" style="margin-top: var(--spacing-sm);">Completed</span>' : ''}
      </div>
    `;
  });

  fixturesContent.innerHTML = html;
}

/**
 * Filter matches
 */
function filterMatches(filter) {
  if (filter === 'all') {
    renderMatches(allMatches);
  } else if (filter === 'completed') {
    const completed = allMatches.filter(m => m.status === 'completed');
    renderMatches(completed);
  } else if (filter === 'upcoming') {
    const upcoming = allMatches.filter(m => m.status !== 'completed');
    renderMatches(upcoming);
  }
}

/**
 * Setup filter functionality
 */
function setupFilter() {
  if (matchFilter) {
    matchFilter.addEventListener('change', (e) => {
      filterMatches(e.target.value);
    });
  }
}

/**
 * Load matches data
 */
async function loadMatches() {
  const heroSection = document.getElementById('heroSection');
  if (heroSection) {
    await applyTournamentHeroImage(heroSection);
  }
  
  if (!seasonId) {
    if (seasonInfo) seasonInfo.textContent = 'No season selected';
    if (fixturesContent) {
      fixturesContent.innerHTML = '<div class="alert alert-error">Please select a season from the home page.</div>';
    }
    return;
  }

  try {
    // Load season info
    const seasonData = await getSeasonData(seasonId);
    if (seasonData && seasonInfo) {
      const seasonDisplay = seasonId.replace('s', 'Season ').replace('-', ' ');
      seasonInfo.textContent = seasonDisplay;
    }

    // Load matches
    const matches = await getSeasonMatches(seasonId);
    allMatches = matches || [];
    renderMatches(allMatches);
    updateNavLinks();
    setupFilter();

  } catch (error) {
    console.error('Error loading matches:', error);
    if (fixturesContent) {
      fixturesContent.innerHTML = '<div class="alert alert-error">Error loading fixtures. Please try again later.</div>';
    }
  }
}

// Initialize
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', loadMatches);
} else {
  loadMatches();
}
