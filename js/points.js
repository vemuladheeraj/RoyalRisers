/**
 * Points Table Page Logic
 * Displays the points table for the selected season
 */
import { getPointsTable, getSeasonData, applyTournamentHeroImage } from './firestore-helpers.js';

// Get URL parameters
const urlParams = new URLSearchParams(window.location.search);
const tournamentId = urlParams.get('tournamentId') || 'royal-risers-cup';
const seasonId = urlParams.get('seasonId');

// DOM Elements
const pageTitle = document.getElementById('pageTitle');
const seasonInfo = document.getElementById('seasonInfo');
const pointsContent = document.getElementById('pointsContent');
const seasonLink = document.getElementById('seasonLink');
const fixturesLink = document.getElementById('fixturesLink');
const teamsLink = document.getElementById('teamsLink');
const statsLink = document.getElementById('statsLink');

/**
 * Update navigation links
 */
function updateNavLinks() {
  if (seasonId) {
    const baseUrl = `?tournamentId=${tournamentId}&seasonId=${seasonId}`;
    seasonLink.href = `season.html${baseUrl}`;
    fixturesLink.href = `fixtures.html${baseUrl}`;
    teamsLink.href = `teams.html${baseUrl}`;
    statsLink.href = `stats.html${baseUrl}`;
  }
}

/**
 * Render points table
 */
function renderPointsTable(pointsData) {
  if (!pointsData || pointsData.length === 0) {
    pointsContent.innerHTML = '<p class="empty-state">Points table not available for this season.</p>';
    return;
  }

  let html = '<div class="table-container"><table><thead><tr>';
  html += '<th>Rank</th><th>Team</th><th>Played</th><th>Won</th><th>Lost</th><th>Tied</th><th>Points</th><th>NRR</th>';
  html += '</tr></thead><tbody>';

  // Sort by points (descending), then by NRR (descending)
  const sorted = [...pointsData].sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    return (b.nrr || 0) - (a.nrr || 0);
  });

  sorted.forEach((team, index) => {
    html += '<tr>';
    html += `<td>${index + 1}</td>`;
    html += `<td><strong>${team.team || 'Unknown'}</strong></td>`;
    html += `<td>${team.played || 0}</td>`;
    html += `<td>${team.won || 0}</td>`;
    html += `<td>${team.lost || 0}</td>`;
    html += `<td>${team.tied || 0}</td>`;
    html += `<td><strong>${team.points || 0}</strong></td>`;
    html += `<td>${team.nrr !== undefined ? team.nrr.toFixed(3) : '0.000'}</td>`;
    html += '</tr>';
  });

  html += '</tbody></table></div>';
  pointsContent.innerHTML = html;
}

/**
 * Load points table data
 */
async function loadPointsTable() {
  await applyTournamentHeroImage(document.getElementById('heroSection'));
  if (!seasonId) {
    pageTitle.textContent = 'Points Table - Error';
    seasonInfo.textContent = 'No season selected';
    pointsContent.innerHTML = '<p class="alert alert-error">Please select a season from the home page.</p>';
    return;
  }

  try {
    // Load season info
    const seasonData = await getSeasonData(seasonId);
    if (seasonData) {
      const seasonDisplay = seasonId.replace('s', 'Season ').replace('-', ' ');
      seasonInfo.textContent = seasonDisplay;
    }

    // Load points table
    const pointsData = await getPointsTable(seasonId);
    renderPointsTable(pointsData);
    updateNavLinks();

  } catch (error) {
    console.error('Error loading points table:', error);
    pointsContent.innerHTML = '<p class="alert alert-error">Error loading points table. Please try again later.</p>';
  }
}

// Initialize page
loadPointsTable();
