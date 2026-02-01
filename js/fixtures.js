/**
 * Fixtures Page Logic
 * Displays all matches for the selected season
 */
import { getSeasonMatches, getSeasonData, applyTournamentHeroImage } from './firestore-helpers.js';

// Get URL parameters
const urlParams = new URLSearchParams(window.location.search);
const tournamentId = urlParams.get('tournamentId') || 'royal-risers-cup';
const seasonId = urlParams.get('seasonId');

// DOM Elements
const pageTitle = document.getElementById('pageTitle');
const seasonInfo = document.getElementById('seasonInfo');
const fixturesContent = document.getElementById('fixturesContent');
const seasonLink = document.getElementById('seasonLink');
const pointsLink = document.getElementById('pointsLink');
const teamsLink = document.getElementById('teamsLink');
const statsLink = document.getElementById('statsLink');

/**
 * Update navigation links
 */
function updateNavLinks() {
  if (seasonId) {
    const baseUrl = `?tournamentId=${tournamentId}&seasonId=${seasonId}`;
    seasonLink.href = `season.html${baseUrl}`;
    pointsLink.href = `points.html${baseUrl}`;
    teamsLink.href = `teams.html${baseUrl}`;
    statsLink.href = `stats.html${baseUrl}`;
  }
}

/**
 * Format date for display
 */
function formatDate(dateString) {
  if (!dateString) return 'TBD';
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  } catch {
    return dateString;
  }
}

/**
 * Render fixtures
 */
function renderFixtures(matches) {
  if (!matches || matches.length === 0) {
    fixturesContent.innerHTML = '<p class="empty-state">No fixtures available for this season.</p>';
    return;
  }

  let html = '<div class="table-container"><table><thead><tr>';
  html += '<th>Date</th><th>Team 1</th><th>vs</th><th>Team 2</th><th>Venue</th><th>Status</th>';
  html += '</tr></thead><tbody>';

  matches.forEach(match => {
    const status = match.status || 'Scheduled';
    const statusClass = status === 'Completed' ? 'badge-success' : 
                       status === 'Live' ? 'badge-warning' : 'badge-primary';
    
    html += '<tr>';
    html += `<td>${formatDate(match.date)}</td>`;
    html += `<td>${match.team1 || 'TBD'}</td>`;
    html += '<td>vs</td>';
    html += `<td>${match.team2 || 'TBD'}</td>`;
    html += `<td>${match.venue || 'TBD'}</td>`;
    html += `<td><span class="badge ${statusClass}">${status}</span></td>`;
    html += '</tr>';
  });

  html += '</tbody></table></div>';
  fixturesContent.innerHTML = html;
}

/**
 * Load fixtures data
 */
async function loadFixtures() {
  await applyTournamentHeroImage(document.getElementById('heroSection'));
  if (!seasonId) {
    pageTitle.textContent = 'Fixtures - Error';
    seasonInfo.textContent = 'No season selected';
    fixturesContent.innerHTML = '<p class="alert alert-error">Please select a season from the home page.</p>';
    return;
  }

  try {
    // Load season info
    const seasonData = await getSeasonData(seasonId);
    if (seasonData) {
      const seasonDisplay = seasonId.replace('s', 'Season ').replace('-', ' ');
      seasonInfo.textContent = seasonDisplay;
    }

    // Load matches
    const matches = await getSeasonMatches(seasonId);
    renderFixtures(matches);
    updateNavLinks();

  } catch (error) {
    console.error('Error loading fixtures:', error);
    fixturesContent.innerHTML = '<p class="alert alert-error">Error loading fixtures. Please try again later.</p>';
  }
}

// Initialize page
loadFixtures();
