/**
 * Stats Page Logic - Modernized
 * Displays player statistics with enhanced UI
 */
import { getSeasonStats, getSeasonData, applyTournamentHeroImage } from './firestore-helpers.js';

// Get URL parameters
const urlParams = new URLSearchParams(window.location.search);
const tournamentId = urlParams.get('tournamentId') || 'royal-risers-cup';
const seasonId = urlParams.get('seasonId');

// DOM Elements
const seasonInfo = document.getElementById('seasonInfo');
const battingContent = document.getElementById('battingStatsContent');
const bowlingContent = document.getElementById('bowlingStatsContent');
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
    if (seasonLink) seasonLink.href = `season.html${baseUrl}`;
    if (fixturesLink) fixturesLink.href = `fixtures.html${baseUrl}`;
    if (pointsLink) pointsLink.href = `points.html${baseUrl}`;
    if (teamsLink) teamsLink.href = `teams.html${baseUrl}`;
  }
}

/**
 * Render batting stats table
 */
function renderBattingStats(stats) {
  if (!battingContent) return;
  
  if (!stats || stats.length === 0) {
    battingContent.innerHTML = `
      <div class="empty-state">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="opacity: 0.5;">
          <path d="M12 20V10"/><path d="M18 20V4"/><path d="M6 20v-4"/>
        </svg>
        <p>No batting statistics available yet.</p>
      </div>
    `;
    return;
  }

  // Sort by runs (descending)
  const sortedStats = [...stats].sort((a, b) => (b.runs || 0) - (a.runs || 0));

  let html = `
    <div class="table-container">
      <table>
        <thead>
          <tr>
            <th style="width: 50px;">#</th>
            <th>Player</th>
            <th>Team</th>
            <th>Inns</th>
            <th>Runs</th>
            <th>Balls</th>
            <th>SR</th>
            <th>50s</th>
            <th>100s</th>
          </tr>
        </thead>
        <tbody>
  `;

  sortedStats.forEach((player, index) => {
    const strikeRate = player.balls > 0 ? ((player.runs / player.balls) * 100).toFixed(2) : '0.00';
    html += `
      <tr>
        <td><strong>${index + 1}</strong></td>
        <td><strong>${player.name || 'Unknown'}</strong></td>
        <td>${player.team || '-'}</td>
        <td>${player.innings || 0}</td>
        <td>${player.runs || 0}</td>
        <td>${player.highestScore || '-'}</td>
        <td>${player.average || '-'}</td>
        <td>${strikeRate}</td>
        <td>${player.fifties || 0}</td>
        <td>${player.hundreds || 0}</td>
      </tr>
    `;
  });

  html += `
        </tbody>
      </table>
    </div>
  `;

  battingContent.innerHTML = html;
}

/**
 * Render bowling stats table
 */
function renderBowlingStats(stats) {
  if (!bowlingContent) return;
  
  if (!stats || stats.length === 0) {
    bowlingContent.innerHTML = `
      <div class="empty-state">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="opacity: 0.5;">
          <path d="M12 20V10"/><path d="M18 20V4"/><path d="M6 20v-4"/>
        </svg>
        <p>No bowling statistics available yet.</p>
      </div>
    `;
    return;
  }

  // Sort by wickets (descending)
  const sortedStats = [...stats].sort((a, b) => (b.wickets || 0) - (a.wickets || 0));

  let html = `
    <div class="table-container">
      <table>
        <thead>
          <tr>
            <th style="width: 50px;">#</th>
            <th>Player</th>
            <th>Team</th>
            <th>M</th>
            <th>Wkts</th>
            <th>Runs</th>
            <th>Overs</th>
            <th>Econ</th>
            <th>5WI</th>
          </tr>
        </thead>
        <tbody>
  `;

  sortedStats.forEach((player, index) => {
    html += `
      <tr>
        <td><strong>${index + 1}</strong></td>
        <td><strong>${player.name || 'Unknown'}</strong></td>
        <td>${player.team || '-'}</td>
        <td>${player.matches || 0}</td>
        <td>${player.wickets || 0}</td>
        <td>${player.runs || 0}</td>
        <td>${player.overs || '-'}</td>
        <td>${player.economy || '-'}</td>
        <td>${player.fiveWicketHauls || 0}</td>
      </tr>
    `;
  });

  html += `
        </tbody>
      </table>
    </div>
  `;

  bowlingContent.innerHTML = html;
}

/**
 * Load stats data
 */
async function loadStats() {
  const heroSection = document.getElementById('heroSection');
  if (heroSection) {
    await applyTournamentHeroImage(heroSection);
  }
  
  if (!seasonId) {
    if (seasonInfo) seasonInfo.textContent = 'No season selected';
    if (battingContent) {
      battingContent.innerHTML = '<div class="alert alert-error">Please select a season from the home page.</div>';
    }
    if (bowlingContent) {
      bowlingContent.innerHTML = '<div class="alert alert-error">Please select a season from the home page.</div>';
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

    // Load stats
    const stats = await getSeasonStats(seasonId);
    if (stats) {
      renderBattingStats(stats.batting || []);
      renderBowlingStats(stats.bowling || []);
    }
    updateNavLinks();

  } catch (error) {
    console.error('Error loading stats:', error);
    if (battingContent) {
      battingContent.innerHTML = '<div class="alert alert-error">Error loading statistics. Please try again later.</div>';
    }
    if (bowlingContent) {
      bowlingContent.innerHTML = '<div class="alert alert-error">Error loading statistics. Please try again later.</div>';
    }
  }
}

// Initialize
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', loadStats);
} else {
  loadStats();
}
