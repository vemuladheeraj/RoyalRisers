/**
 * Teams Page Logic - Modernized
 * Displays all teams for the selected season with search functionality
 */
import { getSeasonTeams, getSeasonData, applyTournamentHeroImage } from './firestore-helpers.js';

// Get URL parameters
const urlParams = new URLSearchParams(window.location.search);
const tournamentId = urlParams.get('tournamentId') || 'royal-risers-cup';
const seasonId = urlParams.get('seasonId');

// DOM Elements
const pageTitle = document.getElementById('pageTitle');
const seasonInfo = document.getElementById('seasonInfo');
const teamsContent = document.getElementById('teamsContent');
const seasonLink = document.getElementById('seasonLink');
const fixturesLink = document.getElementById('fixturesLink');
const pointsLink = document.getElementById('pointsLink');
const statsLink = document.getElementById('statsLink');
const teamSearch = document.getElementById('teamSearch');

// Store teams data for filtering
let allTeams = [];

/**
 * Update navigation links
 */
function updateNavLinks() {
  if (seasonId) {
    const baseUrl = `?tournamentId=${tournamentId}&seasonId=${seasonId}`;
    if (seasonLink) seasonLink.href = `season.html${baseUrl}`;
    if (fixturesLink) fixturesLink.href = `fixtures.html${baseUrl}`;
    if (pointsLink) pointsLink.href = `points.html${baseUrl}`;
    if (statsLink) statsLink.href = `stats.html${baseUrl}`;
  }
}

/**
 * Render teams with modern card design
 */
function renderTeams(teams) {
  if (!teamsContent) return;
  
  if (!teams || teams.length === 0) {
    teamsContent.innerHTML = `
      <div class="empty-state">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="opacity: 0.5;">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
          <circle cx="9" cy="7" r="4"/>
          <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
          <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
        </svg>
        <p>No teams registered for this season.</p>
      </div>
    `;
    return;
  }

  let html = '<div class="team-grid">';

  teams.forEach((team, index) => {
    const teamInitial = (team.name || 'U').charAt(0).toUpperCase();
    const captainName = team.captain || 'TBD';
    const playersCount = team.players ? team.players.length : 0;
    
    html += `
      <div class="team-card" style="animation-delay: ${index * 50}ms;">
        <div class="team-card-header">
          <div class="team-avatar">${teamInitial}</div>
          <div class="team-info">
            <h4>${team.name || 'Unknown Team'}</h4>
            <span class="team-captain">Capt. ${captainName}</span>
          </div>
        </div>
        <div class="flex flex-between" style="margin-top: var(--spacing-md);">
          <span class="team-players-count">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
              <circle cx="9" cy="7" r="4"/>
            </svg>
            ${playersCount} Players
          </span>
        </div>
        ${team.description ? `<p class="text-muted" style="margin-top: var(--spacing-md); font-size: 0.875rem;">${team.description}</p>` : ''}
      </div>
    `;
  });

  html += '</div>';
  teamsContent.innerHTML = html;
}

/**
 * Filter teams by search query
 */
function filterTeams(query) {
  const normalizedQuery = query.toLowerCase().trim();
  
  if (!normalizedQuery) {
    renderTeams(allTeams);
    return;
  }

  const filtered = allTeams.filter(team => {
    const nameMatch = team.name && team.name.toLowerCase().includes(normalizedQuery);
    const captainMatch = team.captain && team.captain.toLowerCase().includes(normalizedQuery);
    return nameMatch || captainMatch;
  });

  renderTeams(filtered);
}

/**
 * Setup search functionality
 */
function setupSearch() {
  if (teamSearch) {
    teamSearch.addEventListener('input', (e) => {
      filterTeams(e.target.value);
    });
    
    // Clear search on escape
    teamSearch.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        teamSearch.value = '';
        filterTeams('');
      }
    });
  }
}

/**
 * Load teams data
 */
async function loadTeams() {
  // Apply hero image
  const heroSection = document.getElementById('heroSection');
  if (heroSection) {
    await applyTournamentHeroImage(heroSection);
  }
  
  if (!seasonId) {
    if (pageTitle) pageTitle.textContent = 'Teams - Error';
    if (seasonInfo) seasonInfo.textContent = 'No season selected';
    if (teamsContent) {
      teamsContent.innerHTML = `
        <div class="alert alert-error">
          <strong>No Season Selected</strong><br>
          Please select a season from the <a href="index.html">home page</a>.
        </div>
      `;
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

    // Load teams
    const teams = await getSeasonTeams(seasonId);
    allTeams = teams || [];
    renderTeams(allTeams);
    updateNavLinks();
    setupSearch();

  } catch (error) {
    console.error('Error loading teams:', error);
    if (teamsContent) {
      teamsContent.innerHTML = `
        <div class="alert alert-error">
          <strong>Error Loading Teams</strong><br>
          Unable to load teams. Please try again later.
        </div>
      `;
    }
  }
}

// Initialize page
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', loadTeams);
} else {
  loadTeams();
}
