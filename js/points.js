/**
 * Points Table Page Logic - Modernized
 * Displays league standings with enhanced UI
 */
import { getPointsTable, getSeasonData, applyTournamentHeroImage } from './firestore-helpers.js';

// Get URL parameters
const urlParams = new URLSearchParams(window.location.search);
const tournamentId = urlParams.get('tournamentId') || 'royal-risers-cup';
const seasonId = urlParams.get('seasonId');

// DOM Elements
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
    if (seasonLink) seasonLink.href = `season.html${baseUrl}`;
    if (fixturesLink) fixturesLink.href = `fixtures.html${baseUrl}`;
    if (teamsLink) teamsLink.href = `teams.html${baseUrl}`;
    if (statsLink) statsLink.href = `stats.html${baseUrl}`;
  }
}

/**
 * Render points table
 */
function renderPointsTable(points) {
  if (!pointsContent) return;
  
  if (!points || points.length === 0) {
    pointsContent.innerHTML = `
      <div class="empty-state">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="opacity: 0.5;">
          <path d="M12 20V10"/><path d="M18 20V4"/><path d="M6 20v-4"/>
        </svg>
        <p>Points table not available yet.</p>
      </div>
    `;
    return;
  }

  // Sort by points (descending)
  const sortedPoints = [...points].sort((a, b) => (b.points || 0) - (a.points || 0));

  let html = `
    <div class="table-container">
      <table>
        <thead>
          <tr>
            <th style="width: 50px;">#</th>
            <th>Team</th>
            <th>P</th>
            <th>W</th>
            <th>L</th>
            <th>T</th>
            <th>N/R</th>
            <th>Points</th>
            <th>NRR</th>
          </tr>
        </thead>
        <tbody>
  `;

  sortedPoints.forEach((team, index) => {
    const position = index + 1;
    const rowClass = position <= 4 ? 'table-row-highlight' : '';
    
    html += `
      <tr class="${rowClass}">
        <td><strong>${position}</strong></td>
        <td><strong>${team.teamName || 'Unknown'}</strong></td>
        <td>${team.played || 0}</td>
        <td>${team.wins || 0}</td>
        <td>${team.losses || 0}</td>
        <td>${team.ties || 0}</td>
        <td>${team.nr || 0}</td>
        <td><strong>${team.points || 0}</strong></td>
        <td>${typeof team.netRunRate === 'number' ? team.netRunRate.toFixed(3) : (team.netRunRate || '0.000')}</td>
      </tr>
    `;
  });

  html += `
        </tbody>
      </table>
    </div>
    <p class="text-muted" style="margin-top: var(--spacing-md); font-size: 0.875rem;">
      <strong>P</strong> = Played | <strong>W</strong> = Wins | <strong>L</strong> = Losses | <strong>T</strong> = Ties | <strong>N/R</strong> = No Result | <strong>Points</strong> = Total Points | <strong>NRR</strong> = Net Run Rate
    </p>
  `;

  pointsContent.innerHTML = html;
}

/**
 * Load points data
 */
async function loadPoints() {
  const heroSection = document.getElementById('heroSection');
  if (heroSection) {
    await applyTournamentHeroImage(heroSection);
  }
  
  if (!seasonId) {
    if (seasonInfo) seasonInfo.textContent = 'No season selected';
    if (pointsContent) {
      pointsContent.innerHTML = '<div class="alert alert-error">Please select a season from the home page.</div>';
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

    // Load points
    const points = await getPointsTable(seasonId);
    renderPointsTable(points);
    updateNavLinks();

  } catch (error) {
    console.error('Error loading points:', error);
    if (pointsContent) {
      pointsContent.innerHTML = '<div class="alert alert-error">Error loading points table. Please try again later.</div>';
    }
  }
}

// Initialize
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', loadPoints);
} else {
  loadPoints();
}
