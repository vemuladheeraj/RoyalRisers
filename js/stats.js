/**
 * Stats Page Logic
 * Displays batting and bowling statistics for the selected season
 */
import { getSeasonStats, getSeasonData, applyTournamentHeroImage } from './firestore-helpers.js';

// Get URL parameters
const urlParams = new URLSearchParams(window.location.search);
const tournamentId = urlParams.get('tournamentId') || 'royal-risers-cup';
const seasonId = urlParams.get('seasonId');

// DOM Elements
const pageTitle = document.getElementById('pageTitle');
const seasonInfo = document.getElementById('seasonInfo');
const battingStatsContent = document.getElementById('battingStatsContent');
const bowlingStatsContent = document.getElementById('bowlingStatsContent');
const seasonLink = document.getElementById('seasonLink');
const fixturesLink = document.getElementById('fixturesLink');
const pointsLink = document.getElementById('pointsLink');
const teamsLink = document.getElementById('teamsLink');

/**
 * Update navigation links
 */
function updateNavLinks() {
  if (seasonId) {
    const baseUrl = `?tournamentId=${tournamentId}&seasonId=${seasonId}`;
    seasonLink.href = `season.html${baseUrl}`;
    fixturesLink.href = `fixtures.html${baseUrl}`;
    pointsLink.href = `points.html${baseUrl}`;
    teamsLink.href = `teams.html${baseUrl}`;
  }
}

/**
 * Render batting stats
 */
function renderBattingStats(batting) {
  if (!batting || batting.length === 0) {
    battingStatsContent.innerHTML = '<p class="empty-state">No batting statistics available.</p>';
    return;
  }

  // Sort by runs (descending)
  const sorted = [...batting].sort((a, b) => (b.runs || 0) - (a.runs || 0));

  let html = '<div class="table-container"><table><thead><tr>';
  html += '<th>Rank</th><th>Player</th><th>Team</th><th>Matches</th><th>Runs</th><th>Avg</th><th>SR</th><th>50s</th><th>100s</th>';
  html += '</tr></thead><tbody>';

  sorted.forEach((player, index) => {
    const avg = player.innings && player.innings > 0 ? (player.runs / player.innings).toFixed(2) : '0.00';
    const sr = player.balls && player.balls > 0 ? ((player.runs / player.balls) * 100).toFixed(2) : '0.00';
    
    html += '<tr>';
    html += `<td>${index + 1}</td>`;
    html += `<td><strong>${player.name || 'Unknown'}</strong></td>`;
    html += `<td>${player.team || '-'}</td>`;
    html += `<td>${player.matches || 0}</td>`;
    html += `<td><strong>${player.runs || 0}</strong></td>`;
    html += `<td>${avg}</td>`;
    html += `<td>${sr}</td>`;
    html += `<td>${player.fifties || 0}</td>`;
    html += `<td>${player.hundreds || 0}</td>`;
    html += '</tr>';
  });

  html += '</tbody></table></div>';
  battingStatsContent.innerHTML = html;
}

/**
 * Render bowling stats
 */
function renderBowlingStats(bowling) {
  if (!bowling || bowling.length === 0) {
    bowlingStatsContent.innerHTML = '<p class="empty-state">No bowling statistics available.</p>';
    return;
  }

  // Sort by wickets (descending)
  const sorted = [...bowling].sort((a, b) => (b.wickets || 0) - (a.wickets || 0));

  let html = '<div class="table-container"><table><thead><tr>';
  html += '<th>Rank</th><th>Player</th><th>Team</th><th>Matches</th><th>Wickets</th><th>Runs</th><th>Overs</th><th>Econ</th><th>Avg</th>';
  html += '</tr></thead><tbody>';

  sorted.forEach((player, index) => {
    const overs = player.overs || 0;
    const runs = player.runs || 0;
    const wickets = player.wickets || 0;
    const econ = overs > 0 ? (runs / overs).toFixed(2) : '0.00';
    const avg = wickets > 0 ? (runs / wickets).toFixed(2) : '0.00';
    
    html += '<tr>';
    html += `<td>${index + 1}</td>`;
    html += `<td><strong>${player.name || 'Unknown'}</strong></td>`;
    html += `<td>${player.team || '-'}</td>`;
    html += `<td>${player.matches || 0}</td>`;
    html += `<td><strong>${wickets}</strong></td>`;
    html += `<td>${runs}</td>`;
    html += `<td>${overs}</td>`;
    html += `<td>${econ}</td>`;
    html += `<td>${avg}</td>`;
    html += '</tr>';
  });

  html += '</tbody></table></div>';
  bowlingStatsContent.innerHTML = html;
}

/**
 * Load stats data
 */
async function loadStats() {
  await applyTournamentHeroImage(document.getElementById('heroSection'));
  if (!seasonId) {
    pageTitle.textContent = 'Player Stats - Error';
    seasonInfo.textContent = 'No season selected';
    battingStatsContent.innerHTML = '<p class="alert alert-error">Please select a season from the home page.</p>';
    return;
  }

  try {
    // Load season info
    const seasonData = await getSeasonData(seasonId);
    if (seasonData) {
      const seasonDisplay = seasonId.replace('s', 'Season ').replace('-', ' ');
      seasonInfo.textContent = seasonDisplay;
    }

    // Load stats
    const stats = await getSeasonStats(seasonId);
    renderBattingStats(stats.batting);
    renderBowlingStats(stats.bowling);
    updateNavLinks();

  } catch (error) {
    console.error('Error loading stats:', error);
    battingStatsContent.innerHTML = '<p class="alert alert-error">Error loading statistics. Please try again later.</p>';
  }
}

// Initialize page
loadStats();
