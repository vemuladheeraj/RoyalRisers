/**
 * Teams Page Logic
 * Displays all teams for the selected season
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

/**
 * Update navigation links
 */
function updateNavLinks() {
  if (seasonId) {
    const baseUrl = `?tournamentId=${tournamentId}&seasonId=${seasonId}`;
    seasonLink.href = `season.html${baseUrl}`;
    fixturesLink.href = `fixtures.html${baseUrl}`;
    pointsLink.href = `points.html${baseUrl}`;
    statsLink.href = `stats.html${baseUrl}`;
  }
}

/**
 * Render teams
 */
function renderTeams(teams) {
  if (!teams || teams.length === 0) {
    teamsContent.innerHTML = '<p class="empty-state">No teams registered for this season.</p>';
    return;
  }

  let html = '<div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: var(--spacing-md);">';

  teams.forEach(team => {
    html += '<div class="card">';
    html += `<h3 style="color: var(--primary); margin-bottom: var(--spacing-sm);">${team.name || 'Unknown Team'}</h3>`;
    
    if (team.captain) {
      html += `<p><strong>Captain:</strong> ${team.captain}</p>`;
    }
    if (team.players && team.players.length > 0) {
      html += `<p><strong>Players:</strong> ${team.players.length}</p>`;
    }
    if (team.description) {
      html += `<p class="text-muted" style="margin-top: var(--spacing-sm);">${team.description}</p>`;
    }
    
    html += '</div>';
  });

  html += '</div>';
  teamsContent.innerHTML = html;
}

/**
 * Load teams data
 */
async function loadTeams() {
  await applyTournamentHeroImage(document.getElementById('heroSection'));
  if (!seasonId) {
    pageTitle.textContent = 'Teams - Error';
    seasonInfo.textContent = 'No season selected';
    teamsContent.innerHTML = '<p class="alert alert-error">Please select a season from the home page.</p>';
    return;
  }

  try {
    // Load season info
    const seasonData = await getSeasonData(seasonId);
    if (seasonData) {
      const seasonDisplay = seasonId.replace('s', 'Season ').replace('-', ' ');
      seasonInfo.textContent = seasonDisplay;
    }

    // Load teams
    const teams = await getSeasonTeams(seasonId);
    renderTeams(teams);
    updateNavLinks();

  } catch (error) {
    console.error('Error loading teams:', error);
    teamsContent.innerHTML = '<p class="alert alert-error">Error loading teams. Please try again later.</p>';
  }
}

// Initialize page
loadTeams();
