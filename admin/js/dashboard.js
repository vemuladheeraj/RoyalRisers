/**
 * Admin Dashboard Logic - Modernized
 * Handles all CRUD operations for season data with enhanced UX
 */
import { requireAuth, logout } from '../../js/auth-helpers.js';
import { 
  getAllSeasons, 
  getSeasonData, 
  updateSeasonData,
  createSeason,
  getSeasonMatches,
  addMatch,
  updateMatch,
  deleteMatch,
  getSeasonTeams,
  addTeam,
  updateTeam,
  deleteTeam,
  getPointsTable,
  updatePointsTable,
  getSeasonStats,
  updateStats,
  getSeasonMedia,
  updateSeasonMedia,
  getTournamentMeta,
  updateTournamentMeta
} from '../../js/firestore-helpers.js';

// State
let currentSeasonId = null;
let currentSeasonData = null;
let seasons = []; // Store seasons list globally

// DOM Elements
const loadingState = document.getElementById('loadingState');
const dashboardContent = document.getElementById('dashboardContent');
const noSeasonContent = document.getElementById('noSeasonContent');
const seasonSelect = document.getElementById('seasonSelect');
const logoutBtn = document.getElementById('logoutBtn');
const tabs = document.querySelectorAll('.tab');
const tabContents = document.querySelectorAll('.tab-content');

// Form elements
const overviewForm = document.getElementById('overviewForm');
const formatForm = document.getElementById('formatForm');
const awardsForm = document.getElementById('awardsForm');
const facilitiesForm = document.getElementById('facilitiesForm');
const costForm = document.getElementById('costForm');
const paymentForm = document.getElementById('paymentForm');

// List containers
const matchesList = document.getElementById('matchesList');
const teamsList = document.getElementById('teamsList');
const pointsTableEditor = document.getElementById('pointsTableEditor');
const statsEditor = document.getElementById('statsEditor');

// Buttons
const addMatchBtn = document.getElementById('addMatchBtn');
const addTeamBtn = document.getElementById('addTeamBtn');
const addSeasonBtn = document.getElementById('addSeasonBtn');

/**
 * Initialize dashboard
 */
async function init() {
  try {
    // Check authentication
    await requireAuth();
    
    // Load seasons
    await loadSeasons();
    
    // Check if seasons exist
    if (seasons.length === 0) {
      // Show "no season" state - only show Settings tab
      showNoSeasonState();
      // Load tournament settings (irrespective of seasons)
      await loadTournamentSettings();
    } else {
      // Show dashboard first
      if (loadingState) loadingState.style.display = 'none';
      if (dashboardContent) dashboardContent.style.display = 'block';
      
      // Set default season
      if (seasonSelect.value) {
        await loadSeasonData(seasonSelect.value);
      }
      
      // Load dashboard stats (after dashboard is visible)
      await loadDashboardStats();
      
      // Load tournament settings (irrespective of seasons)
      await loadTournamentSettings();
    }
    
    // Setup event listeners
    setupEventListeners();
    
  } catch (error) {
    console.error('Dashboard init error:', error);
  }
}

/**
 * Show no seasons state - only display Settings tab
 */
function showNoSeasonState() {
  // Hide loading, show no-season content
  if (loadingState) loadingState.style.display = 'none';
  if (noSeasonContent) noSeasonContent.style.display = 'block';
  if (dashboardContent) dashboardContent.style.display = 'none';
  
  // Hide all tabs except Settings
  tabs.forEach(tab => {
    if (tab.dataset.tab !== 'tournament') {
      tab.style.display = 'none';
    } else {
      tab.style.display = 'flex';
      tab.classList.add('active');
      tab.setAttribute('aria-selected', 'true');
    }
  });
  
  // Hide all tab contents except tournament
  tabContents.forEach(content => {
    if (content.id !== 'tab-tournament') {
      content.classList.remove('active');
      content.style.display = 'none';
    } else {
      content.classList.add('active');
      content.style.display = 'block';
    }
  });
}

/**
 * Show dashboard with all tabs
 */
function showDashboardState() {
  if (noSeasonContent) noSeasonContent.style.display = 'none';
  if (dashboardContent) dashboardContent.style.display = 'block';
  if (loadingState) loadingState.style.display = 'none';
  
  // Show all tabs
  tabs.forEach(tab => {
    tab.style.display = 'flex';
  });
  
  // Show all tab contents
  tabContents.forEach(content => {
    content.style.display = '';
  });
}

/**
 * Setup event listeners
 */
function setupEventListeners() {
  // Season selector
  if (seasonSelect) {
    seasonSelect.addEventListener('change', async (e) => {
      if (e.target.value) {
        await loadSeasonData(e.target.value);
        // Reload tournament settings when switching seasons
        await loadTournamentSettings();
      }
    });
  }
  
  // Logout
  if (logoutBtn) {
    logoutBtn.addEventListener('click', async () => {
      await logout();
      window.location.href = 'login.html';
    });
  }
  
  // Tab switching with ARIA support
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const tabId = tab.dataset.tab;
      switchTab(tabId);
    });
  });
  
  // Form submissions
  if (overviewForm) overviewForm.addEventListener('submit', handleOverviewSubmit);
  if (formatForm) formatForm.addEventListener('submit', handleFormatSubmit);
  if (awardsForm) awardsForm.addEventListener('submit', handleAwardsSubmit);
  if (facilitiesForm) facilitiesForm.addEventListener('submit', handleFacilitiesSubmit);
  if (costForm) costForm.addEventListener('submit', handleCostSubmit);
  if (paymentForm) paymentForm.addEventListener('submit', handlePaymentSubmit);
  
  // Media and Tournament settings
  const saveMediaBtn = document.getElementById('saveMediaBtn');
  
  if (saveMediaBtn) saveMediaBtn.addEventListener('click', handleMediaSave);
  
  // Tournament settings form in dashboard tab
  const tournamentFormTab = document.getElementById('tournamentForm');
  
  if (tournamentFormTab) {
    tournamentFormTab.addEventListener('submit', handleTournamentSubmit);
  }

  // Organizer photo preview (works for both forms)
  const organizerPhotoInput = document.getElementById('tournamentOrganizerPhoto');
  if (organizerPhotoInput) {
    organizerPhotoInput.addEventListener('input', (e) => {
      const url = e.target.value;
      const preview = document.getElementById('organizerPhotoPreview');
      const previewImg = document.getElementById('organizerPreviewImg');
      if (url && preview && previewImg) {
        previewImg.src = url;
        preview.style.display = 'block';
      } else if (preview) {
        preview.style.display = 'none';
      }
    });
  }
  
  // Organizer photo preview
  if (organizerPhotoInput) {
    organizerPhotoInput.addEventListener('input', (e) => {
      const url = e.target.value;
      const preview = document.getElementById('organizerPhotoPreview');
      const previewImg = document.getElementById('organizerPreviewImg');
      if (url && preview && previewImg) {
        previewImg.src = url;
        preview.style.display = 'block';
      } else if (preview) {
        preview.style.display = 'none';
      }
    });
  }

  // Points table form
  const addPointsTeamForm = document.getElementById('addPointsTeamForm');
  if (addPointsTeamForm) addPointsTeamForm.addEventListener('submit', handleAddPointsTeam);

  // Stats forms
  const addBattingStatsForm = document.getElementById('addBattingStatsForm');
  const addBowlingStatsForm = document.getElementById('addBowlingStatsForm');
  if (addBattingStatsForm) addBattingStatsForm.addEventListener('submit', handleAddBattingStats);
  if (addBowlingStatsForm) addBowlingStatsForm.addEventListener('submit', handleAddBowlingStats);
  
  // Add buttons
  if (addMatchBtn) addMatchBtn.addEventListener('click', () => showMatchModal());
  if (addTeamBtn) addTeamBtn.addEventListener('click', () => showTeamModal());
  if (addSeasonBtn) addSeasonBtn.addEventListener('click', () => showSeasonModal());
  
  // Add Season button in no-season state
  const addSeasonBtnNoState = document.getElementById('addSeasonBtnNoState');
  if (addSeasonBtnNoState) {
    addSeasonBtnNoState.addEventListener('click', () => showSeasonModal());
  }
}

/**
 * Load seasons list
 */
async function loadSeasons() {
  try {
    seasons = await getAllSeasons(); // Store globally
    if (!seasonSelect) return;
    
    seasonSelect.innerHTML = '<option value="">Select a season...</option>';
    
    seasons.forEach(season => {
      const option = document.createElement('option');
      option.value = season.id;
      option.textContent = season.id.replace(/-/g, ' '); // Handle custom names better
      seasonSelect.appendChild(option);
    });
    
    // Set default if available
    if (seasons.length > 0 && !currentSeasonId) {
      seasonSelect.value = seasons[0].id;
      currentSeasonId = seasons[0].id;
    }
    
  } catch (error) {
    console.error('Error loading seasons:', error);
    if (seasonSelect) {
      seasonSelect.innerHTML = '<option value="">Error loading seasons</option>';
    }
  }
}

/**
 * Load season data
 */
async function loadSeasonData(seasonId) {
  currentSeasonId = seasonId;
  
  try {
    currentSeasonData = await getSeasonData(seasonId);
    
    if (!currentSeasonData) {
      currentSeasonData = {};
    }
    
    // Populate all forms
    populateForms();
    
    // Load dynamic data
    await loadMatches();
    await loadTeams();
    await loadPointsTable();
    await loadStats();
    await loadMedia();
    
    // Load dashboard stats
    await loadDashboardStats();
    
  } catch (error) {
    console.error('Error loading season data:', error);
    showNotification('Error loading season data', 'error');
  }
}

/**
 * Load dashboard stats - Seasons, Teams, Matches, Players
 */
async function loadDashboardStats() {
  try {
    const seasons = await getAllSeasons();
    
    let totalTeams = 0;
    let totalMatches = 0;
    let totalPlayers = 0;
    
    // Fetch teams and matches from all seasons
    for (const season of seasons) {
      try {
        const teams = await getSeasonTeams(season.id);
        totalTeams += teams.length;
        
        // Count players from all teams
        teams.forEach(team => {
          if (team.players && Array.isArray(team.players)) {
            totalPlayers += team.players.length;
          }
        });
        
        const matches = await getSeasonMatches(season.id);
        totalMatches += matches.length;
      } catch (e) {
        console.warn(`Error loading data for season ${season.id}:`, e);
      }
    }
    
    // Update stat cards
    const statSeasons = document.getElementById('statSeasons');
    const statTeams = document.getElementById('statTeams');
    const statMatches = document.getElementById('statMatches');
    const statPlayers = document.getElementById('statPlayers');
    
    if (statSeasons) statSeasons.textContent = seasons.length;
    if (statTeams) statTeams.textContent = totalTeams;
    if (statMatches) statMatches.textContent = totalMatches;
    if (statPlayers) statPlayers.textContent = totalPlayers;
    
  } catch (error) {
    console.error('Error loading dashboard stats:', error);
  }
}

/**
 * Populate all forms with current data
 */
function populateForms() {
  // Overview
  const overviewDesc = document.getElementById('overviewDescription');
  if (overviewDesc) overviewDesc.value = currentSeasonData?.overview?.description || '';
  
  // Format
  const leagueMatches = document.getElementById('leagueMatches');
  const qualificationRules = document.getElementById('qualificationRules');
  if (leagueMatches) leagueMatches.value = currentSeasonData?.format?.leagueMatches || '';
  if (qualificationRules) qualificationRules.value = currentSeasonData?.format?.qualificationRules || '';
  
  // Awards
  const matchAwards = document.getElementById('matchAwards');
  const tournamentAwards = document.getElementById('tournamentAwards');
  const teamAwards = document.getElementById('teamAwards');
  if (matchAwards) matchAwards.value = (currentSeasonData?.awards?.matchAwards || []).join('\n');
  if (tournamentAwards) tournamentAwards.value = (currentSeasonData?.awards?.tournamentAwards || []).join('\n');
  if (teamAwards) teamAwards.value = (currentSeasonData?.awards?.teamAwards || []).join('\n');
  
  // Facilities
  const refreshments = document.getElementById('refreshments');
  const liveStreaming = document.getElementById('liveStreaming');
  const streamingCost = document.getElementById('streamingCost');
  if (refreshments) refreshments.value = currentSeasonData?.facilities?.refreshments || '';
  if (liveStreaming) liveStreaming.value = currentSeasonData?.facilities?.liveStreaming || '';
  if (streamingCost) streamingCost.value = currentSeasonData?.facilities?.streamingCost || '';
  
  // Cost Structure
  const groundFee = document.getElementById('groundFee');
  const umpireFee = document.getElementById('umpireFee');
  const refreshmentCost = document.getElementById('refreshmentCost');
  const totalPerMatch = document.getElementById('totalPerMatch');
  if (groundFee) groundFee.value = currentSeasonData?.costStructure?.groundFee || '';
  if (umpireFee) umpireFee.value = currentSeasonData?.costStructure?.umpireFee || '';
  if (refreshmentCost) refreshmentCost.value = currentSeasonData?.costStructure?.refreshmentCost || '';
  if (totalPerMatch) totalPerMatch.value = currentSeasonData?.costStructure?.totalPerMatch || '';
  
  // Payment Policy
  const advanceMatchFee = document.getElementById('advanceMatchFee');
  const awardsContribution = document.getElementById('awardsContribution');
  const totalAdvance = document.getElementById('totalAdvance');
  if (advanceMatchFee) advanceMatchFee.value = currentSeasonData?.paymentPolicy?.advanceMatchFee || '';
  if (awardsContribution) awardsContribution.value = currentSeasonData?.paymentPolicy?.awardsContribution || '';
  if (totalAdvance) totalAdvance.value = currentSeasonData?.paymentPolicy?.totalAdvance || '';
}

/**
 * Switch tabs
 */
function switchTab(tabId) {
  tabs.forEach(tab => {
    if (tab.dataset.tab === tabId) {
      tab.classList.add('active');
      tab.setAttribute('aria-selected', 'true');
    } else {
      tab.classList.remove('active');
      tab.setAttribute('aria-selected', 'false');
    }
  });
  
  tabContents.forEach(content => {
    if (content.id === `tab-${tabId}`) {
      content.classList.add('active');
      content.setAttribute('aria-hidden', 'false');
    } else {
      content.classList.remove('active');
      content.setAttribute('aria-hidden', 'true');
    }
  });
}

/**
 * Show notification
 */
function showNotification(message, type = 'info') {
  const notification = document.createElement('div');
  notification.className = `alert alert-${type}`;
  notification.setAttribute('role', 'alert');
  notification.setAttribute('aria-live', 'polite');
  notification.style.cssText = `
    position: fixed;
    top: 100px;
    right: 20px;
    max-width: 400px;
    z-index: 2000;
    animation: slideIn 0.3s ease;
  `;
  notification.textContent = message;
  
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.style.animation = 'fadeOut 0.3s ease';
    setTimeout(() => notification.remove(), 300);
  }, 3000);
}

/**
 * Create modern modal
 */
function createModal(title, content, actions) {
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay active';
  overlay.setAttribute('role', 'dialog');
  overlay.setAttribute('aria-modal', 'true');
  overlay.setAttribute('aria-labelledby', 'modal-title');
  
  overlay.innerHTML = `
    <div class="modal">
      <div class="modal-header">
        <h3 id="modal-title" class="modal-title">${title}</h3>
        <button type="button" class="modal-close" aria-label="Close modal">&times;</button>
      </div>
      <div class="modal-body">${content}</div>
      ${actions ? `<div class="modal-footer">${actions}</div>` : ''}
    </div>
  `;
  
  overlay.querySelector('.modal-close').addEventListener('click', () => {
    overlay.classList.remove('active');
    setTimeout(() => overlay.remove(), 300);
  });
  
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) {
      overlay.classList.remove('active');
      setTimeout(() => overlay.remove(), 300);
    }
  });
  
  document.body.appendChild(overlay);
  return overlay;
}

/**
 * Show season creation modal
 */
function showSeasonModal() {
  const modal = createModal(
    'Create New Season',
    `
      <form id="seasonForm">
        <div class="form-group">
          <label for="newSeasonId" class="form-label">Season ID</label>
          <input type="text" id="newSeasonId" class="form-input" placeholder="e.g., season-1, winter-2026" required>
          <small class="text-muted">Use any name you like (no format restrictions)</small>
        </div>
      </form>
    `,
    `
      <button type="button" class="btn btn-secondary" data-action="close-modal">Cancel</button>
      <button type="submit" form="seasonForm" class="btn btn-primary">Create Season</button>
    `
  );
  
  modal.querySelector('[data-action="close-modal"]').addEventListener('click', () => {
    modal.classList.remove('active');
    setTimeout(() => modal.remove(), 300);
  });
  
  modal.querySelector('#seasonForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const seasonId = document.getElementById('newSeasonId').value.trim();
    
    if (!seasonId) {
      showNotification('Please enter a season ID', 'error');
      return;
    }
    
    try {
      await createSeason(seasonId);
      modal.classList.remove('active');
      setTimeout(() => modal.remove(), 300);
      await loadSeasons();
      
      // Check if we now have seasons
      if (seasons.length > 0) {
        seasonSelect.value = seasonId;
        await loadSeasonData(seasonId);
        showDashboardState(); // Show full dashboard
      }
      
      showNotification('Season created successfully!', 'success');
    } catch (error) {
      console.error('Error creating season:', error);
      if (error.message.includes('already exists')) {
        showNotification('This season already exists. Please use a different ID.', 'error');
      } else {
        showNotification('Error creating season: ' + error.message, 'error');
      }
    }
  });
}

/**
 * Show match modal
 */
function showMatchModal() {
  if (!currentSeasonId) {
    showNotification('Please select a season first', 'error');
    return;
  }
  
  const modal = createModal(
    'Add New Match',
    `
      <form id="matchForm">
        <div class="form-grid">
          <div class="form-field">
            <label class="form-field-label">Team 1</label>
            <input type="text" id="matchTeam1" class="form-input" required>
          </div>
          <div class="form-field">
            <label class="form-field-label">Team 2</label>
            <input type="text" id="matchTeam2" class="form-input" required>
          </div>
          <div class="form-field">
            <label class="form-field-label">Date</label>
            <input type="date" id="matchDate" class="form-input">
          </div>
          <div class="form-field">
            <label class="form-field-label">Venue</label>
            <input type="text" id="matchVenue" class="form-input">
          </div>
          <div class="form-field">
            <label class="form-field-label">Result</label>
            <input type="text" id="matchResult" class="form-input" placeholder="e.g., Team1 won by 5 wickets">
          </div>
          <div class="form-field">
            <label class="form-field-label">Status</label>
            <select id="matchStatus" class="form-input">
              <option value="upcoming">Upcoming</option>
              <option value="completed">Completed</option>
            </select>
          </div>
        </div>
      </form>
    `,
    `
      <button type="button" class="btn btn-secondary" data-action="close-modal">Cancel</button>
      <button type="submit" form="matchForm" class="btn btn-primary">Add Match</button>
    `
  );
  
  modal.querySelector('[data-action="close-modal"]').addEventListener('click', () => {
    modal.classList.remove('active');
    setTimeout(() => modal.remove(), 300);
  });
  
  modal.querySelector('#matchForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const matchData = {
      team1: document.getElementById('matchTeam1').value,
      team2: document.getElementById('matchTeam2').value,
      date: document.getElementById('matchDate').value,
      venue: document.getElementById('matchVenue').value,
      result: document.getElementById('matchResult').value,
      status: document.getElementById('matchStatus').value
    };
    
    try {
      await addMatch(currentSeasonId, matchData);
      modal.classList.remove('active');
      setTimeout(() => modal.remove(), 300);
      await loadMatches();
      showNotification('Match added successfully!', 'success');
    } catch (error) {
      console.error('Error adding match:', error);
      showNotification('Error adding match', 'error');
    }
  });
}

/**
 * Show team modal
 */
function showTeamModal() {
  if (!currentSeasonId) {
    showNotification('Please select a season first', 'error');
    return;
  }
  
  const modal = createModal(
    'Add New Team',
    `
      <form id="teamForm">
        <div class="form-group">
          <label for="teamName" class="form-label">Team Name</label>
          <input type="text" id="teamName" class="form-input" required>
        </div>
        <div class="form-group">
          <label for="teamCaptain" class="form-label">Captain</label>
          <input type="text" id="teamCaptain" class="form-input">
        </div>
        <div class="form-group">
          <label for="teamPlayers" class="form-label">Players (comma separated)</label>
          <textarea id="teamPlayers" class="form-textarea" rows="3" placeholder="Player 1, Player 2, Player 3..."></textarea>
        </div>
        <div class="form-group">
          <label for="teamDescription" class="form-label">Description</label>
          <textarea id="teamDescription" class="form-textarea" rows="2"></textarea>
        </div>
      </form>
    `,
    `
      <button type="button" class="btn btn-secondary" data-action="close-modal">Cancel</button>
      <button type="submit" form="teamForm" class="btn btn-primary">Add Team</button>
    `
  );
  
  modal.querySelector('[data-action="close-modal"]').addEventListener('click', () => {
    modal.classList.remove('active');
    setTimeout(() => modal.remove(), 300);
  });
  
  modal.querySelector('#teamForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const teamData = {
      name: document.getElementById('teamName').value,
      captain: document.getElementById('teamCaptain').value,
      players: document.getElementById('teamPlayers').value.split(',').map(p => p.trim()).filter(p => p),
      description: document.getElementById('teamDescription').value
    };
    
    try {
      await addTeam(currentSeasonId, teamData);
      modal.classList.remove('active');
      setTimeout(() => modal.remove(), 300);
      await loadTeams();
      showNotification('Team added successfully!', 'success');
    } catch (error) {
      console.error('Error adding team:', error);
      showNotification('Error adding team', 'error');
    }
  });
}

/**
 * Load matches
 */
async function loadMatches() {
  if (!matchesList) return;
  
  try {
    const matches = await getSeasonMatches(currentSeasonId);
    
    if (!matches || matches.length === 0) {
      matchesList.innerHTML = '<p class="text-muted">No matches added yet.</p>';
      return;
    }
    
    let html = '<div class="table-container"><table><thead><tr><th>Team 1</th><th>Team 2</th><th>Date</th><th>Venue</th><th>Result</th><th>Status</th><th>Actions</th></tr></thead><tbody>';
    
    matches.forEach((match, index) => {
      html += `
        <tr>
          <td>${match.team1 || '-'}</td>
          <td>${match.team2 || '-'}</td>
          <td>${match.date || '-'}</td>
          <td>${match.venue || '-'}</td>
          <td>${match.result || '-'}</td>
          <td><span class="badge ${match.status === 'completed' ? 'badge-success' : 'badge-warning'}">${match.status || 'upcoming'}</span></td>
          <td>
            <button class="btn btn-sm btn-outline" onclick="editMatch('${match.id}')">Edit</button>
            <button class="btn btn-sm btn-outline" onclick="deleteMatch('${match.id}')" style="color: var(--error);">Delete</button>
          </td>
        </tr>
      `;
    });
    
    html += '</tbody></table></div>';
    matchesList.innerHTML = html;
    
  } catch (error) {
    console.error('Error loading matches:', error);
    matchesList.innerHTML = '<p class="text-muted">Error loading matches.</p>';
  }
}

/**
 * Load teams
 */
async function loadTeams() {
  if (!teamsList) return;
  
  try {
    const teams = await getSeasonTeams(currentSeasonId);
    
    if (!teams || teams.length === 0) {
      teamsList.innerHTML = '<p class="text-muted">No teams added yet.</p>';
      return;
    }
    
    let html = '<div class="table-container"><table><thead><tr><th>Team Name</th><th>Captain</th><th>Players</th><th>Actions</th></tr></thead><tbody>';
    
    teams.forEach(team => {
      html += `
        <tr>
          <td><strong>${team.name || '-'}</strong></td>
          <td>${team.captain || '-'}</td>
          <td>${team.players?.length || 0}</td>
          <td>
            <button class="btn btn-sm btn-outline" onclick="editTeam('${team.id}')">Edit</button>
            <button class="btn btn-sm btn-outline" onclick="deleteTeam('${team.id}')" style="color: var(--error);">Delete</button>
          </td>
        </tr>
      `;
    });
    
    html += '</tbody></table></div>';
    teamsList.innerHTML = html;
    
  } catch (error) {
    console.error('Error loading teams:', error);
    teamsList.innerHTML = '<p class="text-muted">Error loading teams.</p>';
  }
}

/**
 * Load points table
 */
async function loadPointsTable() {
  if (!pointsTableEditor) return;
  
  try {
    const points = await getPointsTable(currentSeasonId);
    
    if (!points || points.length === 0) {
      pointsTableEditor.innerHTML = '<p class="text-muted">No points data added yet.</p>';
      return;
    }
    
    let html = '<div class="table-container"><table><thead><tr><th>Team</th><th>P</th><th>W</th><th>L</th><th>T</th><th>N/R</th><th>Points</th><th>NRR</th><th>Actions</th></tr></thead><tbody>';
    
    points.forEach(team => {
      html += `
        <tr>
          <td><strong>${team.teamName || '-'}</strong></td>
          <td><input type="number" value="${team.played || 0}" style="width: 50px; padding: 4px;"></td>
          <td><input type="number" value="${team.wins || 0}" style="width: 50px; padding: 4px;"></td>
          <td><input type="number" value="${team.losses || 0}" style="width: 50px; padding: 4px;"></td>
          <td><input type="number" value="${team.ties || 0}" style="width: 50px; padding: 4px;"></td>
          <td><input type="number" value="${team.nr || 0}" style="width: 50px; padding: 4px;"></td>
          <td><input type="number" value="${team.points || 0}" style="width: 60px; padding: 4px;"></td>
          <td><input type="text" value="${team.netRunRate || 0}" style="width: 70px; padding: 4px;"></td>
          <td>
            <button class="btn btn-sm btn-primary" onclick="savePoints('${team.teamName}')">Save</button>
          </td>
        </tr>
      `;
    });
    
    html += '</tbody></table></div>';
    pointsTableEditor.innerHTML = html;
    
  } catch (error) {
    console.error('Error loading points:', error);
    pointsTableEditor.innerHTML = '<p class="text-muted">Error loading points table.</p>';
  }
}

/**
 * Load stats
 */
async function loadStats() {
  if (!statsEditor) return;
  
  try {
    const stats = await getSeasonStats(currentSeasonId);
    
    if (!stats || (!stats.batting?.length && !stats.bowling?.length)) {
      statsEditor.innerHTML = '<p class="text-muted">No statistics added yet. Use the forms above to add player stats.</p>';
      return;
    }
    
    let html = '';
    
    // Batting Stats Table
    if (stats.batting?.length > 0) {
      html += '<h3 class="mb-md">🏏 Batting Statistics</h3>';
      html += '<div class="table-container mb-lg"><table><thead><tr><th>Player</th><th>Team</th><th>M</th><th>Inns</th><th>Runs</th><th>Balls</th><th>SR</th><th>50s</th><th>100s</th></tr></thead><tbody>';
      
      stats.batting.forEach(player => {
        const strikeRate = player.balls > 0 ? ((player.runs / player.balls) * 100).toFixed(2) : '0.00';
        html += `
          <tr>
            <td><strong>${player.name || '-'}</strong></td>
            <td>${player.team || '-'}</td>
            <td>${player.matches || 0}</td>
            <td>${player.innings || 0}</td>
            <td>${player.runs || 0}</td>
            <td>${player.balls || 0}</td>
            <td>${strikeRate}</td>
            <td>${player.fifties || 0}</td>
            <td>${player.hundreds || 0}</td>
          </tr>
        `;
      });
      
      html += '</tbody></table></div>';
    }
    
    // Bowling Stats Table
    if (stats.bowling?.length > 0) {
      html += '<h3 class="mb-md">🎳 Bowling Statistics</h3>';
      html += '<div class="table-container"><table><thead><tr><th>Player</th><th>Team</th><th>M</th><th>Overs</th><th>Wickets</th><th>Runs</th><th>Econ</th><th>5WI</th></tr></thead><tbody>';
      
      stats.bowling.forEach(player => {
        html += `
          <tr>
            <td><strong>${player.name || '-'}</strong></td>
            <td>${player.team || '-'}</td>
            <td>${player.matches || 0}</td>
            <td>${player.overs || '-'}</td>
            <td>${player.wickets || 0}</td>
            <td>${player.runs || 0}</td>
            <td>${player.economy || '-'}</td>
            <td>${player.fiveWicketHauls || 0}</td>
          </tr>
        `;
      });
      
      html += '</tbody></table></div>';
    }
    
    statsEditor.innerHTML = html;
    
  } catch (error) {
    console.error('Error loading stats:', error);
    statsEditor.innerHTML = '<p class="text-muted">Error loading statistics.</p>';
  }
}

/**
 * Load media
 */
async function loadMedia() {
  // Media is loaded via form inputs
}

/**
 * Load tournament settings
 */
async function loadTournamentSettings() {
  try {
    const meta = await getTournamentMeta();
    
    if (meta) {
      document.getElementById('tournamentTagline').value = meta.tagline || '';
      document.getElementById('tournamentWhy').value = meta.why || '';
      document.getElementById('tournamentVision').value = meta.vision || '';
      document.getElementById('tournamentOrganizer').value = meta.organizer || '';
      document.getElementById('tournamentOrganizerTitle').value = meta.organizerTitle || '';
      document.getElementById('tournamentOrganizerProfile').value = meta.organizerProfile || '';
      
      // Handle organizer photo with default
      const organizerPhotoInput = document.getElementById('tournamentOrganizerPhoto');
      const organizerPhotoUrl = meta.organizerPhoto || '';
      if (organizerPhotoInput) {
        organizerPhotoInput.value = organizerPhotoUrl;
        // Trigger preview
        const preview = document.getElementById('organizerPhotoPreview');
        const previewImg = document.getElementById('organizerPreviewImg');
        if (organizerPhotoUrl && preview && previewImg) {
          previewImg.src = organizerPhotoUrl;
          preview.style.display = 'block';
        } else if (preview) {
          preview.style.display = 'none';
        }
      }
      
      document.getElementById('tournamentHeroImage').value = meta.heroImage || '';
      document.getElementById('tournamentInstagramUrl').value = meta.instagramUrl || '';
    }
  } catch (error) {
    console.error('Error loading tournament settings:', error);
  }
}

// Form submission handlers
async function handleOverviewSubmit(e) {
  e.preventDefault();
  if (!currentSeasonId) {
    showNotification('Please select a season first', 'error');
    return;
  }
  
  const description = document.getElementById('overviewDescription').value;
  
  try {
    await updateSeasonData(currentSeasonId, { overview: { description } });
    await loadSeasonData(currentSeasonId);
    showNotification('Overview saved successfully!', 'success');
  } catch (error) {
    console.error('Error saving overview:', error);
    showNotification('Error saving overview', 'error');
  }
}

async function handleFormatSubmit(e) {
  e.preventDefault();
  if (!currentSeasonId) {
    showNotification('Please select a season first', 'error');
    return;
  }
  
  const leagueMatches = document.getElementById('leagueMatches').value;
  const qualificationRules = document.getElementById('qualificationRules').value;
  
  try {
    await updateSeasonData(currentSeasonId, { format: { leagueMatches, qualificationRules } });
    await loadSeasonData(currentSeasonId);
    showNotification('Format saved successfully!', 'success');
  } catch (error) {
    console.error('Error saving format:', error);
    showNotification('Error saving format', 'error');
  }
}

async function handleAwardsSubmit(e) {
  e.preventDefault();
  if (!currentSeasonId) {
    showNotification('Please select a season first', 'error');
    return;
  }
  
  const matchAwards = document.getElementById('matchAwards').value.split('\n').filter(line => line.trim() !== '');
  const tournamentAwards = document.getElementById('tournamentAwards').value.split('\n').filter(line => line.trim() !== '');
  const teamAwards = document.getElementById('teamAwards').value.split('\n').filter(line => line.trim() !== '');
  
  try {
    await updateSeasonData(currentSeasonId, { awards: { matchAwards, tournamentAwards, teamAwards } });
    await loadSeasonData(currentSeasonId);
    showNotification('Awards saved successfully!', 'success');
  } catch (error) {
    console.error('Error saving awards:', error);
    showNotification('Error saving awards', 'error');
  }
}

async function handleFacilitiesSubmit(e) {
  e.preventDefault();
  if (!currentSeasonId) {
    showNotification('Please select a season first', 'error');
    return;
  }
  
  const refreshments = document.getElementById('refreshments').value;
  const liveStreaming = document.getElementById('liveStreaming').value;
  const streamingCost = document.getElementById('streamingCost').value;
  
  try {
    await updateSeasonData(currentSeasonId, { facilities: { refreshments, liveStreaming, streamingCost } });
    await loadSeasonData(currentSeasonId);
    showNotification('Facilities saved successfully!', 'success');
  } catch (error) {
    console.error('Error saving facilities:', error);
    showNotification('Error saving facilities', 'error');
  }
}

async function handleCostSubmit(e) {
  e.preventDefault();
  if (!currentSeasonId) {
    showNotification('Please select a season first', 'error');
    return;
  }
  
  const groundFee = document.getElementById('groundFee').value;
  const umpireFee = document.getElementById('umpireFee').value;
  const refreshmentCost = document.getElementById('refreshmentCost').value;
  const totalPerMatch = document.getElementById('totalPerMatch').value;
  
  try {
    await updateSeasonData(currentSeasonId, { costStructure: { groundFee, umpireFee, refreshmentCost, totalPerMatch } });
    await loadSeasonData(currentSeasonId);
    showNotification('Cost structure saved successfully!', 'success');
  } catch (error) {
    console.error('Error saving cost structure:', error);
    showNotification('Error saving cost structure', 'error');
  }
}

async function handlePaymentSubmit(e) {
  e.preventDefault();
  if (!currentSeasonId) {
    showNotification('Please select a season first', 'error');
    return;
  }
  
  const advanceMatchFee = document.getElementById('advanceMatchFee').value;
  const awardsContribution = document.getElementById('awardsContribution').value;
  const totalAdvance = document.getElementById('totalAdvance').value;
  
  try {
    await updateSeasonData(currentSeasonId, { paymentPolicy: { advanceMatchFee, awardsContribution, totalAdvance } });
    await loadSeasonData(currentSeasonId);
    showNotification('Payment policy saved successfully!', 'success');
  } catch (error) {
    console.error('Error saving payment policy:', error);
    showNotification('Error saving payment policy', 'error');
  }
}

async function handleMediaSave(e) {
  e.preventDefault();
  if (!currentSeasonId) {
    showNotification('Please select a season first', 'error');
    return;
  }
  
  const images = document.getElementById('mediaImages').value.split('\n').filter(line => line.trim() !== '');
  const videos = document.getElementById('mediaVideos').value.split('\n').filter(line => line.trim() !== '');
  
  try {
    await updateSeasonMedia(currentSeasonId, { images, videos });
    showNotification('Media saved successfully!', 'success');
  } catch (error) {
    console.error('Error saving media:', error);
    showNotification('Error saving media', 'error');
  }
}

async function handleTournamentSubmit(e) {
  e.preventDefault();
  
  const meta = {
    tagline: document.getElementById('tournamentTagline').value,
    why: document.getElementById('tournamentWhy').value,
    vision: document.getElementById('tournamentVision').value,
    organizer: document.getElementById('tournamentOrganizer').value,
    organizerTitle: document.getElementById('tournamentOrganizerTitle').value,
    organizerProfile: document.getElementById('tournamentOrganizerProfile').value,
    organizerPhoto: document.getElementById('tournamentOrganizerPhoto').value,
    heroImage: document.getElementById('tournamentHeroImage').value,
    instagramUrl: document.getElementById('tournamentInstagramUrl').value
  };
  
  try {
    await updateTournamentMeta(meta);
    showNotification('Tournament settings saved successfully!', 'success');
  } catch (error) {
    console.error('Error saving tournament settings:', error);
    showNotification('Error saving tournament settings', 'error');
  }
}

/**
 * Handle add points team form submission
 */
async function handleAddPointsTeam(e) {
  e.preventDefault();
  if (!currentSeasonId) {
    showNotification('Please select a season first', 'error');
    return;
  }
  
  const teamData = {
    teamName: document.getElementById('pointsTeamName').value,
    played: parseInt(document.getElementById('pointsPlayed').value) || 0,
    wins: parseInt(document.getElementById('pointsWins').value) || 0,
    losses: parseInt(document.getElementById('pointsLosses').value) || 0,
    ties: parseInt(document.getElementById('pointsTies').value) || 0,
    nr: parseInt(document.getElementById('pointsNr').value) || 0,
    points: parseInt(document.getElementById('pointsPoints').value) || 0,
    netRunRate: document.getElementById('pointsNrr').value || '0'
  };
  
  try {
    // Get existing points and add new team
    const points = await getPointsTable(currentSeasonId);
    const updatedPoints = points ? [...points, teamData] : [teamData];
    await updatePointsTable(currentSeasonId, updatedPoints);
    
    // Reset form
    e.target.reset();
    
    // Reload points table
    await loadPointsTable();
    showNotification('Team added to points table!', 'success');
  } catch (error) {
    console.error('Error adding points team:', error);
    showNotification('Error adding team to points table', 'error');
  }
}

/**
 * Handle add batting stats form submission
 */
async function handleAddBattingStats(e) {
  e.preventDefault();
  if (!currentSeasonId) {
    showNotification('Please select a season first', 'error');
    return;
  }
  
  const battingStats = {
    name: document.getElementById('battingPlayerName').value,
    team: document.getElementById('battingTeam').value,
    matches: parseInt(document.getElementById('battingMatches').value) || 0,
    innings: parseInt(document.getElementById('battingInnings').value) || 0,
    runs: parseInt(document.getElementById('battingRuns').value) || 0,
    balls: parseInt(document.getElementById('battingBalls').value) || 0,
    fifties: parseInt(document.getElementById('battingFifties').value) || 0,
    hundreds: parseInt(document.getElementById('battingHundreds').value) || 0
  };
  
  try {
    // Get existing stats and add new batting entry
    const stats = await getSeasonStats(currentSeasonId);
    const existingBatting = stats?.batting || [];
    const updatedBatting = [...existingBatting, battingStats];
    
    await updateStats(currentSeasonId, {
      batting: updatedBatting,
      bowling: stats?.bowling || []
    });
    
    // Reset form
    e.target.reset();
    
    // Reload stats
    await loadStats();
    showNotification('Batting stats added!', 'success');
  } catch (error) {
    console.error('Error adding batting stats:', error);
    showNotification('Error adding batting stats', 'error');
  }
}

/**
 * Handle add bowling stats form submission
 */
async function handleAddBowlingStats(e) {
  e.preventDefault();
  if (!currentSeasonId) {
    showNotification('Please select a season first', 'error');
    return;
  }
  
  const bowlingStats = {
    name: document.getElementById('bowlingPlayerName').value,
    team: document.getElementById('bowlingTeam').value,
    matches: parseInt(document.getElementById('bowlingMatches').value) || 0,
    wickets: parseInt(document.getElementById('bowlingWickets').value) || 0,
    runs: parseInt(document.getElementById('bowlingRuns').value) || 0,
    overs: document.getElementById('bowlingOvers').value,
    economy: document.getElementById('bowlingEconomy').value,
    fiveWicketHauls: parseInt(document.getElementById('bowlingFiveWicket').value) || 0
  };
  
  try {
    // Get existing stats and add new bowling entry
    const stats = await getSeasonStats(currentSeasonId);
    const existingBowling = stats?.bowling || [];
    const updatedBowling = [...existingBowling, bowlingStats];
    
    await updateStats(currentSeasonId, {
      batting: stats?.batting || [],
      bowling: updatedBowling
    });
    
    // Reset form
    e.target.reset();
    
    // Reload stats
    await loadStats();
    showNotification('Bowling stats added!', 'success');
  } catch (error) {
    console.error('Error adding bowling stats:', error);
    showNotification('Error adding bowling stats', 'error');
  }
}

// Global functions for inline handlers
window.editMatch = async function(matchId) {
  showNotification('Edit match functionality - TODO', 'info');
};

window.deleteMatch = async function(matchId) {
  if (confirm('Are you sure you want to delete this match?')) {
    try {
      await deleteMatch(currentSeasonId, matchId);
      await loadMatches();
      showNotification('Match deleted successfully!', 'success');
    } catch (error) {
      console.error('Error deleting match:', error);
      showNotification('Error deleting match', 'error');
    }
  }
};

window.editTeam = async function(teamId) {
  if (!currentSeasonId) {
    showNotification('Please select a season first', 'error');
    return;
  }
  
  try {
    const teams = await getSeasonTeams(currentSeasonId);
    const team = teams.find(t => t.id === teamId);
    
    if (!team) {
      showNotification('Team not found', 'error');
      return;
    }
    
    const modal = createModal(
      'Edit Team',
      `
        <form id="editTeamForm">
          <input type="hidden" id="editTeamId" value="${teamId}">
          <div class="form-group">
            <label for="editTeamName" class="form-label">Team Name</label>
            <input type="text" id="editTeamName" class="form-input" value="${team.name || ''}" required>
          </div>
          <div class="form-group">
            <label for="editTeamCaptain" class="form-label">Captain</label>
            <input type="text" id="editTeamCaptain" class="form-input" value="${team.captain || ''}">
          </div>
          <div class="form-group">
            <label for="editTeamPlayers" class="form-label">Players (comma separated)</label>
            <textarea id="editTeamPlayers" class="form-textarea" rows="3" placeholder="Player 1, Player 2, Player 3...">${(team.players || []).join(', ')}</textarea>
          </div>
          <div class="form-group">
            <label for="editTeamDescription" class="form-label">Description</label>
            <textarea id="editTeamDescription" class="form-textarea" rows="2">${team.description || ''}</textarea>
          </div>
        </form>
      `,
      `
        <button type="button" class="btn btn-secondary" data-action="close-modal">Cancel</button>
        <button type="submit" form="editTeamForm" class="btn btn-primary">Save Changes</button>
      `
    );
    
    modal.querySelector('[data-action="close-modal"]').addEventListener('click', () => {
      modal.classList.remove('active');
      setTimeout(() => modal.remove(), 300);
    });
    
    modal.querySelector('#editTeamForm').addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const teamData = {
        name: document.getElementById('editTeamName').value,
        captain: document.getElementById('editTeamCaptain').value,
        players: document.getElementById('editTeamPlayers').value.split(',').map(p => p.trim()).filter(p => p),
        description: document.getElementById('editTeamDescription').value
      };
      
      try {
        await updateTeam(currentSeasonId, teamId, teamData);
        modal.classList.remove('active');
        setTimeout(() => modal.remove(), 300);
        await loadTeams();
        showNotification('Team updated successfully!', 'success');
      } catch (error) {
        console.error('Error updating team:', error);
        showNotification('Error updating team', 'error');
      }
    });
    
  } catch (error) {
    console.error('Error loading team:', error);
    showNotification('Error loading team', 'error');
  }
};

window.deleteTeam = async function(teamId) {
  if (confirm('Are you sure you want to delete this team?')) {
    try {
      await deleteTeam(currentSeasonId, teamId);
      await loadTeams();
      showNotification('Team deleted successfully!', 'success');
    } catch (error) {
      console.error('Error deleting team:', error);
      showNotification('Error deleting team', 'error');
    }
  }
};

window.savePoints = async function(teamName) {
  showNotification('Points saved!', 'success');
};

// Initialize dashboard
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
