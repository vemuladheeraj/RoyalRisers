/**
 * Admin Dashboard Logic
 * Handles all CRUD operations for season data
 */
import { requireAuth, logout, onAuthChange } from '../../js/auth-helpers.js';
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
import { DEFAULT_SEASON_ID } from '../../firebase-config.js';

// State
let currentSeasonId = null;
let currentSeasonData = null;

// DOM Elements
const loadingState = document.getElementById('loadingState');
const dashboardContent = document.getElementById('dashboardContent');
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
    
    // Set default season
    if (seasonSelect.value) {
      await loadSeasonData(seasonSelect.value);
    }
    
    // Show dashboard
    loadingState.style.display = 'none';
    dashboardContent.style.display = 'block';
    
    // Setup event listeners
    setupEventListeners();
    
  } catch (error) {
    console.error('Dashboard init error:', error);
    // Auth guard will redirect if not authenticated
  }
}

/**
 * Setup event listeners
 */
function setupEventListeners() {
  // Season selector
  seasonSelect.addEventListener('change', async (e) => {
    if (e.target.value) {
      await loadSeasonData(e.target.value);
    }
  });
  
  // Logout
  logoutBtn.addEventListener('click', async () => {
    await logout();
    window.location.href = 'login.html';
  });
  
  // Tab switching
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const tabId = tab.dataset.tab;
      switchTab(tabId);
    });
  });
  
  // Form submissions
  overviewForm.addEventListener('submit', handleOverviewSubmit);
  formatForm.addEventListener('submit', handleFormatSubmit);
  awardsForm.addEventListener('submit', handleAwardsSubmit);
  facilitiesForm.addEventListener('submit', handleFacilitiesSubmit);
  costForm.addEventListener('submit', handleCostSubmit);
  paymentForm.addEventListener('submit', handlePaymentSubmit);
  
  // Media and Tournament settings
  document.getElementById('saveMediaBtn').addEventListener('click', handleMediaSave);
  document.getElementById('tournamentForm').addEventListener('submit', handleTournamentSubmit);
  
  // Add buttons
  addMatchBtn.addEventListener('click', () => showMatchModal());
  addTeamBtn.addEventListener('click', () => showTeamModal());
  addSeasonBtn.addEventListener('click', () => showSeasonModal());
  
  // Load tournament settings on init
  loadTournamentSettings();
}

/**
 * Load seasons list
 */
async function loadSeasons() {
  try {
    const seasons = await getAllSeasons();
    seasonSelect.innerHTML = '<option value="">Select a season...</option>';
    
    seasons.forEach(season => {
      const option = document.createElement('option');
      option.value = season.id;
      option.textContent = season.id.replace('s', 'Season ').replace('-', ' ');
      seasonSelect.appendChild(option);
    });
    
    // Set default if available
    if (seasons.length > 0 && !currentSeasonId) {
      seasonSelect.value = seasons[0].id;
      currentSeasonId = seasons[0].id;
    }
  } catch (error) {
    console.error('Error loading seasons:', error);
    seasonSelect.innerHTML = '<option value="">Error loading seasons</option>';
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
      // Initialize empty season data
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
    
  } catch (error) {
    console.error('Error loading season data:', error);
    alert('Error loading season data');
  }
}

/**
 * Populate all forms with current data
 */
function populateForms() {
  // Overview
  document.getElementById('overviewDescription').value = 
    currentSeasonData?.overview?.description || '';
  
  // Format
  document.getElementById('leagueMatches').value = 
    currentSeasonData?.format?.leagueMatches || '';
  document.getElementById('qualificationRules').value = 
    currentSeasonData?.format?.qualificationRules || '';
  
  // Awards
  document.getElementById('matchAwards').value = 
    (currentSeasonData?.awards?.matchAwards || []).join('\n');
  document.getElementById('tournamentAwards').value = 
    (currentSeasonData?.awards?.tournamentAwards || []).join('\n');
  document.getElementById('teamAwards').value = 
    (currentSeasonData?.awards?.teamAwards || []).join('\n');
  
  // Facilities
  document.getElementById('refreshments').value = 
    currentSeasonData?.facilities?.refreshments || '';
  document.getElementById('liveStreaming').value = 
    currentSeasonData?.facilities?.liveStreaming || '';
  document.getElementById('streamingCost').value = 
    currentSeasonData?.facilities?.streamingCost || '';
  
  // Cost Structure
  document.getElementById('groundFee').value = 
    currentSeasonData?.costStructure?.groundFee || '';
  document.getElementById('umpireFee').value = 
    currentSeasonData?.costStructure?.umpireFee || '';
  document.getElementById('refreshmentCost').value = 
    currentSeasonData?.costStructure?.refreshmentCost || '';
  document.getElementById('totalPerMatch').value = 
    currentSeasonData?.costStructure?.totalPerMatch || '';
  
  // Payment Policy
  document.getElementById('advanceMatchFee').value = 
    currentSeasonData?.paymentPolicy?.advanceMatchFee || '';
  document.getElementById('awardsContribution').value = 
    currentSeasonData?.paymentPolicy?.awardsContribution || '';
  document.getElementById('totalAdvance').value = 
    currentSeasonData?.paymentPolicy?.totalAdvance || '';
}

/**
 * Switch tabs
 */
function switchTab(tabId) {
  tabs.forEach(tab => {
    if (tab.dataset.tab === tabId) {
      tab.classList.add('active');
    } else {
      tab.classList.remove('active');
    }
  });
  
  tabContents.forEach(content => {
    if (content.id === `tab-${tabId}`) {
      content.classList.add('active');
    } else {
      content.classList.remove('active');
    }
  });
}

/**
 * Show season creation modal
 */
function showSeasonModal() {
  const modal = document.createElement('div');
  modal.style.cssText = `
    position: fixed; top: 0; left: 0; right: 0; bottom: 0;
    background: rgba(0,0,0,0.7); display: flex; align-items: center;
    justify-content: center; z-index: 1000;
  `;
  
  modal.innerHTML = `
    <div class="card" style="max-width: 500px; width: 90%;">
      <h2>Create New Season</h2>
      <form id="seasonForm">
        <div class="form-group">
          <label class="form-label">Season ID</label>
          <input type="text" id="newSeasonId" class="form-input" placeholder="e.g., s1-2026, s2-2026" required>
          <small class="text-muted">Format: s1-2026, s2-2026, etc.</small>
        </div>
        <div style="display: flex; gap: var(--spacing-sm);">
          <button type="submit" class="btn btn-primary">Create Season</button>
          <button type="button" class="btn btn-outline" data-action="close-modal">Cancel</button>
        </div>
      </form>
    </div>
  `;
  
  document.getElementById('modalContainer').appendChild(modal);
  
  // Close modal
  modal.querySelector('[data-action="close-modal"]').addEventListener('click', () => {
    modal.remove();
  });

  // Handle form submission
  modal.querySelector('#seasonForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const seasonId = document.getElementById('newSeasonId').value.trim();
    
    if (!seasonId) {
      alert('Please enter a season ID');
      return;
    }
    
    // Validate format (optional but helpful)
    if (!/^s\d+-\d{4}$/.test(seasonId)) {
      if (!confirm('Season ID format should be like "s1-2026". Continue anyway?')) {
        return;
      }
    }
    
    try {
      await createSeason(seasonId);
      modal.remove();
      await loadSeasons();
      // Select the newly created season
      seasonSelect.value = seasonId;
      await loadSeasonData(seasonId);
      alert('Season created successfully!');
    } catch (error) {
      console.error('Error creating season:', error);
      if (error.message.includes('already exists')) {
        alert('This season already exists. Please use a different ID.');
      } else {
        alert('Error creating season: ' + error.message);
      }
    }
  });
}

/**
 * Form submission handlers
 */
async function handleOverviewSubmit(e) {
  e.preventDefault();
  if (!currentSeasonId) {
    alert('Please select a season first');
    return;
  }
  
  const description = document.getElementById('overviewDescription').value;
  
  try {
    await updateSeasonData(currentSeasonId, {
      overview: {
        description: description
      }
    });
    alert('Overview saved successfully!');
    await loadSeasonData(currentSeasonId);
  } catch (error) {
    console.error('Error saving overview:', error);
    alert('Error saving overview');
  }
}

async function handleFormatSubmit(e) {
  e.preventDefault();
  if (!currentSeasonId) {
    alert('Please select a season first');
    return;
  }
  
  const leagueMatches = document.getElementById('leagueMatches').value;
  const qualificationRules = document.getElementById('qualificationRules').value;
  
  try {
    await updateSeasonData(currentSeasonId, {
      format: {
        leagueMatches: leagueMatches,
        qualificationRules: qualificationRules
      }
    });
    alert('Format saved successfully!');
    await loadSeasonData(currentSeasonId);
  } catch (error) {
    console.error('Error saving format:', error);
    alert('Error saving format');
  }
}

async function handleAwardsSubmit(e) {
  e.preventDefault();
  if (!currentSeasonId) {
    alert('Please select a season first');
    return;
  }
  
  const matchAwards = document.getElementById('matchAwards').value
    .split('\n')
    .filter(line => line.trim() !== '');
  const tournamentAwards = document.getElementById('tournamentAwards').value
    .split('\n')
    .filter(line => line.trim() !== '');
  const teamAwards = document.getElementById('teamAwards').value
    .split('\n')
    .filter(line => line.trim() !== '');
  
  try {
    await updateSeasonData(currentSeasonId, {
      awards: {
        matchAwards: matchAwards,
        tournamentAwards: tournamentAwards,
        teamAwards: teamAwards
      }
    });
    alert('Awards saved successfully!');
    await loadSeasonData(currentSeasonId);
  } catch (error) {
    console.error('Error saving awards:', error);
    alert('Error saving awards');
  }
}

async function handleFacilitiesSubmit(e) {
  e.preventDefault();
  if (!currentSeasonId) {
    alert('Please select a season first');
    return;
  }
  
  const refreshments = document.getElementById('refreshments').value;
  const liveStreaming = document.getElementById('liveStreaming').value;
  const streamingCost = document.getElementById('streamingCost').value;
  
  try {
    await updateSeasonData(currentSeasonId, {
      facilities: {
        refreshments: refreshments,
        liveStreaming: liveStreaming,
        streamingCost: streamingCost
      }
    });
    alert('Facilities saved successfully!');
    await loadSeasonData(currentSeasonId);
  } catch (error) {
    console.error('Error saving facilities:', error);
    alert('Error saving facilities');
  }
}

async function handleCostSubmit(e) {
  e.preventDefault();
  if (!currentSeasonId) {
    alert('Please select a season first');
    return;
  }
  
  const groundFee = document.getElementById('groundFee').value;
  const umpireFee = document.getElementById('umpireFee').value;
  const refreshmentCost = document.getElementById('refreshmentCost').value;
  const totalPerMatch = document.getElementById('totalPerMatch').value;
  
  try {
    await updateSeasonData(currentSeasonId, {
      costStructure: {
        groundFee: groundFee,
        umpireFee: umpireFee,
        refreshmentCost: refreshmentCost,
        totalPerMatch: totalPerMatch
      }
    });
    alert('Cost structure saved successfully!');
    await loadSeasonData(currentSeasonId);
  } catch (error) {
    console.error('Error saving cost structure:', error);
    alert('Error saving cost structure');
  }
}

async function handlePaymentSubmit(e) {
  e.preventDefault();
  if (!currentSeasonId) {
    alert('Please select a season first');
    return;
  }
  
  const advanceMatchFee = document.getElementById('advanceMatchFee').value;
  const awardsContribution = document.getElementById('awardsContribution').value;
  const totalAdvance = document.getElementById('totalAdvance').value;
  
  try {
    await updateSeasonData(currentSeasonId, {
      paymentPolicy: {
        advanceMatchFee: advanceMatchFee,
        awardsContribution: awardsContribution,
        totalAdvance: totalAdvance
      }
    });
    alert('Payment policy saved successfully!');
    await loadSeasonData(currentSeasonId);
  } catch (error) {
    console.error('Error saving payment policy:', error);
    alert('Error saving payment policy');
  }
}

/**
 * Load and render matches
 */
async function loadMatches() {
  if (!currentSeasonId) return;
  
  try {
    const matches = await getSeasonMatches(currentSeasonId);
    
    if (matches.length === 0) {
      matchesList.innerHTML = '<p class="empty-state">No matches added yet. Click "Add Match" to get started.</p>';
      return;
    }
    
    let html = '<div class="table-container"><table><thead><tr>';
    html += '<th>Date</th><th>Team 1</th><th>vs</th><th>Team 2</th><th>Venue</th><th>Status</th><th>Actions</th>';
    html += '</tr></thead><tbody>';
    
    matches.forEach(match => {
      html += '<tr>';
      html += `<td>${match.date || 'TBD'}</td>`;
      html += `<td>${match.team1 || 'TBD'}</td>`;
      html += '<td>vs</td>';
      html += `<td>${match.team2 || 'TBD'}</td>`;
      html += `<td>${match.venue || 'TBD'}</td>`;
      html += `<td>${match.status || 'Scheduled'}</td>`;
      html += `<td>
        <button class="btn btn-sm btn-outline" data-match-id="${match.id}">Edit</button>
        <button class="btn btn-sm btn-danger" data-match-id="${match.id}">Delete</button>
      </td>`;
      html += '</tr>';
    });
    
    html += '</tbody></table></div>';
    matchesList.innerHTML = html;
    
    // Attach event listeners using event delegation
    matchesList.addEventListener('click', (e) => {
      if (e.target.classList.contains('btn')) {
        const matchId = e.target.dataset.matchId;
        if (e.target.textContent === 'Edit') {
          editMatch(matchId);
        } else if (e.target.textContent === 'Delete') {
          deleteMatchHandler(matchId);
        }
      }
    });
    
  } catch (error) {
    console.error('Error loading matches:', error);
    matchesList.innerHTML = '<p class="alert alert-error">Error loading matches</p>';
  }
}

/**
 * Show match modal (add/edit)
 */
function showMatchModal(matchId = null) {
  if (!currentSeasonId) {
    alert('Please select a season first');
    return;
  }
  
  const match = matchId ? 
    matchesList.querySelector(`[data-match-id="${matchId}"]`)?.dataset : null;
  
  const modal = document.createElement('div');
  modal.style.cssText = `
    position: fixed; top: 0; left: 0; right: 0; bottom: 0;
    background: rgba(0,0,0,0.7); display: flex; align-items: center;
    justify-content: center; z-index: 1000;
  `;
  
  modal.innerHTML = `
    <div class="card" style="max-width: 500px; width: 90%; max-height: 90vh; overflow-y: auto;">
      <h2>${matchId ? 'Edit Match' : 'Add Match'}</h2>
      <form id="matchForm">
        <div class="form-group">
          <label class="form-label">Date</label>
          <input type="date" id="matchDate" class="form-input" required>
        </div>
        <div class="form-group">
          <label class="form-label">Team 1</label>
          <input type="text" id="matchTeam1" class="form-input" required>
        </div>
        <div class="form-group">
          <label class="form-label">Team 2</label>
          <input type="text" id="matchTeam2" class="form-input" required>
        </div>
        <div class="form-group">
          <label class="form-label">Venue</label>
          <input type="text" id="matchVenue" class="form-input">
        </div>
        <div class="form-group">
          <label class="form-label">Status</label>
          <select id="matchStatus" class="form-select">
            <option value="Scheduled">Scheduled</option>
            <option value="Live">Live</option>
            <option value="Completed">Completed</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>
        <div style="display: flex; gap: var(--spacing-sm);">
          <button type="submit" class="btn btn-primary">Save</button>
          <button type="button" class="btn btn-outline" data-action="close-modal">Cancel</button>
        </div>
      </form>
    </div>
  `;
  
  document.getElementById('modalContainer').appendChild(modal);
  
  // Close modal
  modal.querySelector('[data-action="close-modal"]').addEventListener('click', () => {
    modal.remove();
  });

  // Populate if editing
  if (matchId) {
    // Load match data
    getSeasonMatches(currentSeasonId).then(matches => {
      const matchData = matches.find(m => m.id === matchId);
      if (matchData) {
        document.getElementById('matchDate').value = matchData.date || '';
        document.getElementById('matchTeam1').value = matchData.team1 || '';
        document.getElementById('matchTeam2').value = matchData.team2 || '';
        document.getElementById('matchVenue').value = matchData.venue || '';
        document.getElementById('matchStatus').value = matchData.status || 'Scheduled';
      }
    });
  }
  
  // Handle form submission
  modal.querySelector('#matchForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const matchData = {
      date: document.getElementById('matchDate').value,
      team1: document.getElementById('matchTeam1').value,
      team2: document.getElementById('matchTeam2').value,
      venue: document.getElementById('matchVenue').value,
      status: document.getElementById('matchStatus').value
    };
    
    try {
      if (matchId) {
        await updateMatch(currentSeasonId, matchId, matchData);
      } else {
        await addMatch(currentSeasonId, matchData);
      }
      modal.remove();
      await loadMatches();
      alert('Match saved successfully!');
    } catch (error) {
      console.error('Error saving match:', error);
      alert('Error saving match');
    }
  });
}

/**
 * Edit match
 */
function editMatch(matchId) {
  showMatchModal(matchId);
}

/**
 * Delete match
 */
async function deleteMatchHandler(matchId) {
  if (!confirm('Are you sure you want to delete this match?')) return;
  
  try {
    await deleteMatch(currentSeasonId, matchId);
    await loadMatches();
    alert('Match deleted successfully!');
  } catch (error) {
    console.error('Error deleting match:', error);
    alert('Error deleting match');
  }
}

/**
 * Load and render teams
 */
async function loadTeams() {
  if (!currentSeasonId) return;
  
  try {
    const teams = await getSeasonTeams(currentSeasonId);
    
    if (teams.length === 0) {
      teamsList.innerHTML = '<p class="empty-state">No teams added yet. Click "Add Team" to get started.</p>';
      return;
    }
    
    let html = '<div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: var(--spacing-md);">';
    
    teams.forEach(team => {
      html += `<div class="card">
        <h3>${team.name || 'Unknown Team'}</h3>
        ${team.captain ? `<p><strong>Captain:</strong> ${team.captain}</p>` : ''}
        ${team.description ? `<p class="text-muted">${team.description}</p>` : ''}
        <div style="margin-top: var(--spacing-sm); display: flex; gap: var(--spacing-xs);">
          <button class="btn btn-sm btn-outline" data-team-id="${team.id}">Edit</button>
          <button class="btn btn-sm btn-danger" data-team-id="${team.id}">Delete</button>
        </div>
      </div>`;
    });
    
    html += '</div>';
    teamsList.innerHTML = html;
    
    // Attach event listeners using event delegation
    teamsList.addEventListener('click', (e) => {
      if (e.target.classList.contains('btn')) {
        const teamId = e.target.dataset.teamId;
        if (e.target.textContent === 'Edit') {
          editTeam(teamId);
        } else if (e.target.textContent === 'Delete') {
          deleteTeamHandler(teamId);
        }
      }
    });
    
  } catch (error) {
    console.error('Error loading teams:', error);
    teamsList.innerHTML = '<p class="alert alert-error">Error loading teams</p>';
  }
}

/**
 * Show team modal (add/edit)
 */
function showTeamModal(teamId = null) {
  if (!currentSeasonId) {
    alert('Please select a season first');
    return;
  }
  
  const modal = document.createElement('div');
  modal.style.cssText = `
    position: fixed; top: 0; left: 0; right: 0; bottom: 0;
    background: rgba(0,0,0,0.7); display: flex; align-items: center;
    justify-content: center; z-index: 1000;
  `;
  
  modal.innerHTML = `
    <div class="card" style="max-width: 500px; width: 90%;">
      <h2>${teamId ? 'Edit Team' : 'Add Team'}</h2>
      <form id="teamForm">
        <div class="form-group">
          <label class="form-label">Team Name</label>
          <input type="text" id="teamName" class="form-input" required>
        </div>
        <div class="form-group">
          <label class="form-label">Captain</label>
          <input type="text" id="teamCaptain" class="form-input">
        </div>
        <div class="form-group">
          <label class="form-label">Description</label>
          <textarea id="teamDescription" class="form-textarea" rows="3"></textarea>
        </div>
        <div style="display: flex; gap: var(--spacing-sm);">
          <button type="submit" class="btn btn-primary">Save</button>
          <button type="button" class="btn btn-outline" data-action="close-modal">Cancel</button>
        </div>
      </form>
    </div>
  `;
  
  document.getElementById('modalContainer').appendChild(modal);
  
  // Close modal
  modal.querySelector('[data-action="close-modal"]').addEventListener('click', () => {
    modal.remove();
  });

  // Populate if editing
  if (teamId) {
    getSeasonTeams(currentSeasonId).then(teams => {
      const teamData = teams.find(t => t.id === teamId);
      if (teamData) {
        document.getElementById('teamName').value = teamData.name || '';
        document.getElementById('teamCaptain').value = teamData.captain || '';
        document.getElementById('teamDescription').value = teamData.description || '';
      }
    });
  }
  
  // Handle form submission
  modal.querySelector('#teamForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const teamData = {
      name: document.getElementById('teamName').value,
      captain: document.getElementById('teamCaptain').value,
      description: document.getElementById('teamDescription').value
    };
    
    try {
      if (teamId) {
        await updateTeam(currentSeasonId, teamId, teamData);
      } else {
        await addTeam(currentSeasonId, teamData);
      }
      modal.remove();
      await loadTeams();
      alert('Team saved successfully!');
    } catch (error) {
      console.error('Error saving team:', error);
      alert('Error saving team');
    }
  });
}

/**
 * Edit team
 */
function editTeam(teamId) {
  showTeamModal(teamId);
}

/**
 * Delete team
 */
async function deleteTeamHandler(teamId) {
  if (!confirm('Are you sure you want to delete this team?')) return;
  
  try {
    await deleteTeam(currentSeasonId, teamId);
    await loadTeams();
    alert('Team deleted successfully!');
  } catch (error) {
    console.error('Error deleting team:', error);
    alert('Error deleting team');
  }
}

/**
 * Load and render points table editor
 */
async function loadPointsTable() {
  if (!currentSeasonId) return;
  
  try {
    const pointsData = await getPointsTable(currentSeasonId);
    
    let html = '<p class="text-muted mb-md">Edit points table. Add or update team standings.</p>';
    html += '<button id="addPointsRowBtn" class="btn btn-primary btn-sm mb-md">Add Team</button>';
    html += `
      <div class="form-grid-header">
        <span>Team</span>
        <span>Played</span>
        <span>Won</span>
        <span>Lost</span>
        <span>Tied</span>
        <span>Points</span>
        <span>NRR</span>
        <span>Actions</span>
      </div>
    `;
    html += '<div id="pointsTableRows"></div>';
    html += '<button id="savePointsBtn" class="btn btn-primary mt-md">Save Points Table</button>';
    
    pointsTableEditor.innerHTML = html;
    
    // Render existing rows
    const rowsContainer = document.getElementById('pointsTableRows');
    if (pointsData && pointsData.length > 0) {
      pointsData.forEach((team, index) => {
        rowsContainer.appendChild(createPointsRow(team, index));
      });
    }
    
    // Event listeners
    document.getElementById('addPointsRowBtn').addEventListener('click', () => {
      rowsContainer.appendChild(createPointsRow({}, rowsContainer.children.length));
    });
    
    document.getElementById('savePointsBtn').addEventListener('click', async () => {
      const rows = Array.from(rowsContainer.children);
      const pointsData = rows.map(row => ({
        team: row.querySelector('[name="team"]').value,
        played: parseInt(row.querySelector('[name="played"]').value) || 0,
        won: parseInt(row.querySelector('[name="won"]').value) || 0,
        lost: parseInt(row.querySelector('[name="lost"]').value) || 0,
        tied: parseInt(row.querySelector('[name="tied"]').value) || 0,
        points: parseInt(row.querySelector('[name="points"]').value) || 0,
        nrr: parseFloat(row.querySelector('[name="nrr"]').value) || 0
      })).filter(t => t.team);
      
      try {
        await updatePointsTable(currentSeasonId, pointsData);
        alert('Points table saved successfully!');
        await loadPointsTable();
      } catch (error) {
        console.error('Error saving points table:', error);
        alert('Error saving points table');
      }
    });
    
  } catch (error) {
    console.error('Error loading points table:', error);
    pointsTableEditor.innerHTML = '<p class="alert alert-error">Error loading points table</p>';
  }
}

/**
 * Create points table row
 */
function createPointsRow(team, index) {
  const row = document.createElement('div');
  row.className = 'card';
  row.style.marginBottom = 'var(--spacing-sm)';
  row.innerHTML = `
    <div class="form-grid">
      <div class="form-field">
        <span class="form-field-label">Team</span>
        <input type="text" name="team" class="form-input" placeholder="Team Name" value="${team.team || ''}" required>
      </div>
      <div class="form-field">
        <span class="form-field-label">Played</span>
        <input type="number" name="played" class="form-input" placeholder="Played" value="${team.played || 0}" min="0">
      </div>
      <div class="form-field">
        <span class="form-field-label">Won</span>
        <input type="number" name="won" class="form-input" placeholder="Won" value="${team.won || 0}" min="0">
      </div>
      <div class="form-field">
        <span class="form-field-label">Lost</span>
        <input type="number" name="lost" class="form-input" placeholder="Lost" value="${team.lost || 0}" min="0">
      </div>
      <div class="form-field">
        <span class="form-field-label">Tied</span>
        <input type="number" name="tied" class="form-input" placeholder="Tied" value="${team.tied || 0}" min="0">
      </div>
      <div class="form-field">
        <span class="form-field-label">Points</span>
        <input type="number" name="points" class="form-input" placeholder="Points" value="${team.points || 0}" min="0">
      </div>
      <div class="form-field">
        <span class="form-field-label">NRR</span>
        <input type="number" name="nrr" class="form-input" placeholder="NRR" step="0.001" value="${team.nrr || 0}">
      </div>
      <div class="form-field form-field-action">
        <span class="form-field-label">Actions</span>
        <button type="button" class="btn btn-sm btn-danger" onclick="this.closest('.card').remove()">Remove</button>
      </div>
    </div>
  `;
  return row;
}

/**
 * Load and render stats editor
 */
async function loadStats() {
  if (!currentSeasonId) return;
  
  try {
    const stats = await getSeasonStats(currentSeasonId);
    
    let html = `
      <div class="tabs" style="margin-bottom: var(--spacing-md);">
        <button class="tab active" data-stat-tab="batting">Batting Stats</button>
        <button class="tab" data-stat-tab="bowling">Bowling Stats</button>
      </div>
      <div id="battingStatsEditor" class="tab-content active">
        <button id="addBattingRowBtn" class="btn btn-primary btn-sm mb-md">Add Player</button>
        <div class="form-grid-header">
          <span>Player</span>
          <span>Team</span>
          <span>Matches</span>
          <span>Innings</span>
          <span>Runs</span>
          <span>Balls</span>
          <span>50s</span>
          <span>100s</span>
          <span>Actions</span>
        </div>
        <div id="battingRows"></div>
        <button id="saveBattingBtn" class="btn btn-primary mt-md">Save Batting Stats</button>
      </div>
      <div id="bowlingStatsEditor" class="tab-content">
        <button id="addBowlingRowBtn" class="btn btn-primary btn-sm mb-md">Add Player</button>
        <div class="form-grid-header">
          <span>Player</span>
          <span>Team</span>
          <span>Matches</span>
          <span>Wickets</span>
          <span>Runs</span>
          <span>Overs</span>
          <span>Actions</span>
        </div>
        <div id="bowlingRows"></div>
        <button id="saveBowlingBtn" class="btn btn-primary mt-md">Save Bowling Stats</button>
      </div>
    `;
    
    statsEditor.innerHTML = html;
    
    // Render existing batting stats
    const battingRows = document.getElementById('battingRows');
    if (stats.batting && stats.batting.length > 0) {
      stats.batting.forEach((player, index) => {
        battingRows.appendChild(createBattingRow(player, index));
      });
    }
    
    // Render existing bowling stats
    const bowlingRows = document.getElementById('bowlingRows');
    if (stats.bowling && stats.bowling.length > 0) {
      stats.bowling.forEach((player, index) => {
        bowlingRows.appendChild(createBowlingRow(player, index));
      });
    }
    
    // Tab switching
    document.querySelectorAll('[data-stat-tab]').forEach(tab => {
      tab.addEventListener('click', () => {
        const tabId = tab.dataset.statTab;
        document.querySelectorAll('[data-stat-tab]').forEach(t => t.classList.remove('active'));
        document.querySelectorAll('#battingStatsEditor, #bowlingStatsEditor').forEach(c => c.classList.remove('active'));
        tab.classList.add('active');
        document.getElementById(`${tabId}StatsEditor`).classList.add('active');
      });
    });
    
    // Event listeners
    document.getElementById('addBattingRowBtn').addEventListener('click', () => {
      battingRows.appendChild(createBattingRow({}, battingRows.children.length));
    });
    
    document.getElementById('addBowlingRowBtn').addEventListener('click', () => {
      bowlingRows.appendChild(createBowlingRow({}, bowlingRows.children.length));
    });
    
    document.getElementById('saveBattingBtn').addEventListener('click', async () => {
      const rows = Array.from(battingRows.children);
      const battingData = rows.map(row => ({
        name: row.querySelector('[name="name"]').value,
        team: row.querySelector('[name="team"]').value,
        matches: parseInt(row.querySelector('[name="matches"]').value) || 0,
        innings: parseInt(row.querySelector('[name="innings"]').value) || 0,
        runs: parseInt(row.querySelector('[name="runs"]').value) || 0,
        balls: parseInt(row.querySelector('[name="balls"]').value) || 0,
        fifties: parseInt(row.querySelector('[name="fifties"]').value) || 0,
        hundreds: parseInt(row.querySelector('[name="hundreds"]').value) || 0
      })).filter(p => p.name);
      
      try {
        const currentStats = await getSeasonStats(currentSeasonId);
        await updateStats(currentSeasonId, {
          batting: battingData,
          bowling: currentStats.bowling || []
        });
        alert('Batting stats saved successfully!');
        await loadStats();
      } catch (error) {
        console.error('Error saving batting stats:', error);
        alert('Error saving batting stats');
      }
    });
    
    document.getElementById('saveBowlingBtn').addEventListener('click', async () => {
      const rows = Array.from(bowlingRows.children);
      const bowlingData = rows.map(row => ({
        name: row.querySelector('[name="name"]').value,
        team: row.querySelector('[name="team"]').value,
        matches: parseInt(row.querySelector('[name="matches"]').value) || 0,
        wickets: parseInt(row.querySelector('[name="wickets"]').value) || 0,
        runs: parseInt(row.querySelector('[name="runs"]').value) || 0,
        overs: parseFloat(row.querySelector('[name="overs"]').value) || 0
      })).filter(p => p.name);
      
      try {
        const currentStats = await getSeasonStats(currentSeasonId);
        await updateStats(currentSeasonId, {
          batting: currentStats.batting || [],
          bowling: bowlingData
        });
        alert('Bowling stats saved successfully!');
        await loadStats();
      } catch (error) {
        console.error('Error saving bowling stats:', error);
        alert('Error saving bowling stats');
      }
    });
    
  } catch (error) {
    console.error('Error loading stats:', error);
    statsEditor.innerHTML = '<p class="alert alert-error">Error loading statistics</p>';
  }
}

/**
 * Create batting stats row
 */
function createBattingRow(player, index) {
  const row = document.createElement('div');
  row.className = 'card';
  row.style.marginBottom = 'var(--spacing-sm)';
  row.innerHTML = `
    <div class="form-grid">
      <div class="form-field">
        <span class="form-field-label">Player</span>
        <input type="text" name="name" class="form-input" placeholder="Player Name" value="${player.name || ''}" required>
      </div>
      <div class="form-field">
        <span class="form-field-label">Team</span>
        <input type="text" name="team" class="form-input" placeholder="Team" value="${player.team || ''}">
      </div>
      <div class="form-field">
        <span class="form-field-label">Matches</span>
        <input type="number" name="matches" class="form-input" placeholder="Matches" value="${player.matches || 0}" min="0">
      </div>
      <div class="form-field">
        <span class="form-field-label">Innings</span>
        <input type="number" name="innings" class="form-input" placeholder="Innings" value="${player.innings || 0}" min="0">
      </div>
      <div class="form-field">
        <span class="form-field-label">Runs</span>
        <input type="number" name="runs" class="form-input" placeholder="Runs" value="${player.runs || 0}" min="0">
      </div>
      <div class="form-field">
        <span class="form-field-label">Balls</span>
        <input type="number" name="balls" class="form-input" placeholder="Balls" value="${player.balls || 0}" min="0">
      </div>
      <div class="form-field">
        <span class="form-field-label">50s</span>
        <input type="number" name="fifties" class="form-input" placeholder="50s" value="${player.fifties || 0}" min="0">
      </div>
      <div class="form-field">
        <span class="form-field-label">100s</span>
        <input type="number" name="hundreds" class="form-input" placeholder="100s" value="${player.hundreds || 0}" min="0">
      </div>
      <div class="form-field form-field-action">
        <span class="form-field-label">Actions</span>
        <button type="button" class="btn btn-sm btn-danger" onclick="this.closest('.card').remove()">Remove</button>
      </div>
    </div>
  `;
  return row;
}

/**
 * Create bowling stats row
 */
function createBowlingRow(player, index) {
  const row = document.createElement('div');
  row.className = 'card';
  row.style.marginBottom = 'var(--spacing-sm)';
  row.innerHTML = `
    <div class="form-grid">
      <div class="form-field">
        <span class="form-field-label">Player</span>
        <input type="text" name="name" class="form-input" placeholder="Player Name" value="${player.name || ''}" required>
      </div>
      <div class="form-field">
        <span class="form-field-label">Team</span>
        <input type="text" name="team" class="form-input" placeholder="Team" value="${player.team || ''}">
      </div>
      <div class="form-field">
        <span class="form-field-label">Matches</span>
        <input type="number" name="matches" class="form-input" placeholder="Matches" value="${player.matches || 0}" min="0">
      </div>
      <div class="form-field">
        <span class="form-field-label">Wickets</span>
        <input type="number" name="wickets" class="form-input" placeholder="Wickets" value="${player.wickets || 0}" min="0">
      </div>
      <div class="form-field">
        <span class="form-field-label">Runs</span>
        <input type="number" name="runs" class="form-input" placeholder="Runs" value="${player.runs || 0}" min="0">
      </div>
      <div class="form-field">
        <span class="form-field-label">Overs</span>
        <input type="number" name="overs" class="form-input" placeholder="Overs" step="0.1" value="${player.overs || 0}" min="0">
      </div>
      <div class="form-field form-field-action">
        <span class="form-field-label">Actions</span>
        <button type="button" class="btn btn-sm btn-danger" onclick="this.closest('.card').remove()">Remove</button>
      </div>
    </div>
  `;
  return row;
}

/**
 * Load media for current season
 */
async function loadMedia() {
  if (!currentSeasonId) return;
  
  try {
    const media = await getSeasonMedia(currentSeasonId);
    
    // Populate media fields
    document.getElementById('mediaImages').value = (media.images || []).join('\n');
    document.getElementById('mediaVideos').value = (media.videos || []).join('\n');
    document.getElementById('mediaInstagram').value = (media.instagram || []).join('\n');
    
    // Show preview
    updateMediaPreview(media);
  } catch (error) {
    console.error('Error loading media:', error);
  }
}

/**
 * Handle media save
 */
async function handleMediaSave(e) {
  e.preventDefault();
  
  if (!currentSeasonId) {
    alert('Please select a season first');
    return;
  }
  
  try {
    const images = document.getElementById('mediaImages').value
      .split('\n')
      .map(url => url.trim())
      .filter(url => url.length > 0);
    
    const videos = document.getElementById('mediaVideos').value
      .split('\n')
      .map(url => url.trim())
      .filter(url => url.length > 0);
    
    const mediaData = {
      images,
      videos
    };
    
    await updateSeasonMedia(currentSeasonId, mediaData);
    alert('Media saved successfully!');
    updateMediaPreview(mediaData);
  } catch (error) {
    console.error('Error saving media:', error);
    alert('Error saving media');
  }
}

/**
 * Update media preview
 */
function updateMediaPreview(media) {
  const preview = document.getElementById('mediaPreview');
  const previewContent = document.getElementById('mediaPreviewContent');
  
  if (!media || (!media.images?.length && !media.videos?.length)) {
    preview.style.display = 'none';
    return;
  }
  
  preview.style.display = 'block';
  previewContent.innerHTML = '<div class="alert alert-info mb-md"><strong>Preview:</strong> This is how your media will appear on the season page.</div>';
  
  // Images
  if (media.images?.length > 0) {
    const imagesSection = document.createElement('div');
    imagesSection.innerHTML = `<h4 class="mb-sm">📸 Photos (${media.images.length})</h4><div class="media-grid">`;
    media.images.forEach((url, index) => {
      // Check if it's a share link
      if (isGooglePhotosShareLink(url)) {
        // Show as clickable card for share links
        const card = document.createElement('a');
        card.href = url;
        card.target = '_blank';
        card.rel = 'noopener noreferrer';
        card.className = 'media-item google-photos-card';
        card.style.cssText = 'text-decoration: none; display: flex; flex-direction: column; align-items: center; justify-content: center; background: linear-gradient(135deg, #4285f4 0%, #34a853 100%); color: white;';
        card.innerHTML = `
          <div style="font-size: 2.5rem; margin-bottom: var(--spacing-sm);">📷</div>
          <div style="font-weight: 600; text-align: center; padding: 0 var(--spacing-sm); font-size: 0.875rem;">View Photo ${index + 1}</div>
          <div style="font-size: 0.75rem; margin-top: var(--spacing-xs); opacity: 0.9;">Click to open</div>
          <div style="font-size: 0.65rem; margin-top: var(--spacing-xs); opacity: 0.7; padding: 0 var(--spacing-sm); text-align: center;">⚠️ Share link detected</div>
        `;
        imagesSection.querySelector('.media-grid').appendChild(card);
      } else {
        // Direct image URL
        const directUrl = convertGooglePhotosUrl(url);
        const img = document.createElement('div');
        img.className = 'media-item';
        img.innerHTML = `
          <img src="${directUrl}" alt="Gallery image ${index + 1}" loading="lazy" 
               onerror="this.parentElement.innerHTML='<div class=\\'media-placeholder\\'><div class=\\'media-placeholder-icon\\'>🖼️</div><div class=\\'media-placeholder-text\\'>Image ${index + 1}<br>Failed to load<br><small style=\\'font-size:0.7rem;opacity:0.7;margin-top:4px;\\'>Check if URL is a direct image link</small></div></div>'">
        `;
        imagesSection.querySelector('.media-grid').appendChild(img);
      }
    });
    imagesSection.innerHTML += '</div>';
    previewContent.appendChild(imagesSection);
  } else {
    const placeholder = document.createElement('div');
    placeholder.className = 'media-grid';
    placeholder.innerHTML = `
      <div class="media-placeholder">
        <div class="media-placeholder-icon">📸</div>
        <div class="media-placeholder-text">No photos yet<br>Add Google Photos URLs above</div>
      </div>
    `;
    const imagesSection = document.createElement('div');
    imagesSection.innerHTML = '<h4 class="mb-sm">📸 Photos</h4>';
    imagesSection.appendChild(placeholder);
    previewContent.appendChild(imagesSection);
  }
  
  // Videos
  if (media.videos?.length > 0) {
    const videosSection = document.createElement('div');
    videosSection.innerHTML = `<h4 class="mb-sm mt-md">🎥 Videos (${media.videos.length})</h4><div class="media-grid">`;
    media.videos.forEach((videoUrl, index) => {
      const videoId = extractYouTubeId(videoUrl);
      if (videoId) {
        const video = document.createElement('div');
        video.className = 'media-item video';
        video.innerHTML = `<iframe src="https://www.youtube.com/embed/${videoId}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`;
        videosSection.querySelector('.media-grid').appendChild(video);
      } else {
        const placeholder = document.createElement('div');
        placeholder.className = 'media-placeholder';
        placeholder.innerHTML = `
          <div class="media-placeholder-icon">⚠️</div>
          <div class="media-placeholder-text">Invalid URL ${index + 1}</div>
        `;
        videosSection.querySelector('.media-grid').appendChild(placeholder);
      }
    });
    videosSection.innerHTML += '</div>';
    previewContent.appendChild(videosSection);
  } else {
    const placeholder = document.createElement('div');
    placeholder.className = 'media-grid';
    placeholder.innerHTML = `
      <div class="media-placeholder">
        <div class="media-placeholder-icon">🎥</div>
        <div class="media-placeholder-text">No videos yet<br>Add YouTube URLs above</div>
      </div>
    `;
    const videosSection = document.createElement('div');
    videosSection.innerHTML = '<h4 class="mb-sm mt-md">🎥 Videos</h4>';
    videosSection.appendChild(placeholder);
    previewContent.appendChild(videosSection);
  }
  
}

/**
 * Extract YouTube video ID from URL
 */
function extractYouTubeId(url) {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
}

/**
 * Check if URL is a Google Photos share link (not a direct image URL)
 */
function isGooglePhotosShareLink(url) {
  if (!url) return false;
  return url.includes('photos.app.goo.gl') || 
         (url.includes('photos.google.com') && !url.includes('lh3.googleusercontent.com'));
}

/**
 * Convert Google Photos share URL to direct image URL
 */
function convertGooglePhotosUrl(url) {
  if (!url) return url;
  
  // If it's a share link, return null to indicate it needs special handling
  if (isGooglePhotosShareLink(url)) {
    return null;
  }
  
  // If it's already a direct Google Photos URL, return as-is
  if (url.includes('lh3.googleusercontent.com') || url.includes('googleusercontent.com')) {
    // Ensure it's a direct image URL with proper parameters
    if (url.includes('/p/') || url.includes('/d/')) {
      const separator = url.includes('?') ? '&' : '?';
      return url + separator + 'w=800&h=800&fit=crop';
    }
    return url;
  }
  
  // For any other URL, return as-is
  return url;
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
      document.getElementById('tournamentOrganizerPhoto').value = meta.organizerPhoto || '';
      document.getElementById('tournamentHeroImage').value = meta.heroImage || '';
      document.getElementById('tournamentInstagramUrl').value = meta.instagramUrl || '';
      
      // Preview organizer photo
      if (meta.organizerPhoto) {
        const organizerPreview = document.getElementById('organizerPhotoPreview');
        const organizerPreviewImg = document.getElementById('organizerPreviewImg');
        organizerPreviewImg.src = meta.organizerPhoto;
        organizerPreview.style.display = 'block';
      }

      // Preview hero image
      if (meta.heroImage) {
        const preview = document.getElementById('heroImagePreview');
        const previewImg = document.getElementById('heroPreviewImg');
        previewImg.src = meta.heroImage;
        preview.style.display = 'block';
      }
      
      // Image preview on change
      document.getElementById('tournamentHeroImage').addEventListener('input', (e) => {
        const url = e.target.value.trim();
        const preview = document.getElementById('heroImagePreview');
        const previewImg = document.getElementById('heroPreviewImg');
        if (url) {
          previewImg.src = url;
          preview.style.display = 'block';
        } else {
          preview.style.display = 'none';
        }
      });

      // Organizer photo preview on change
      document.getElementById('tournamentOrganizerPhoto').addEventListener('input', (e) => {
        const url = e.target.value.trim();
        const preview = document.getElementById('organizerPhotoPreview');
        const previewImg = document.getElementById('organizerPreviewImg');
        if (url) {
          previewImg.src = url;
          preview.style.display = 'block';
        } else {
          preview.style.display = 'none';
        }
      });
    }
  } catch (error) {
    console.error('Error loading tournament settings:', error);
  }
}

/**
 * Handle tournament settings submit
 */
async function handleTournamentSubmit(e) {
  e.preventDefault();
  
  try {
    const metaData = {
      tagline: document.getElementById('tournamentTagline').value.trim(),
      why: document.getElementById('tournamentWhy').value.trim(),
      vision: document.getElementById('tournamentVision').value.trim(),
      organizer: document.getElementById('tournamentOrganizer').value.trim(),
      organizerTitle: document.getElementById('tournamentOrganizerTitle').value.trim(),
      organizerProfile: document.getElementById('tournamentOrganizerProfile').value.trim(),
      organizerPhoto: document.getElementById('tournamentOrganizerPhoto').value.trim(),
      heroImage: document.getElementById('tournamentHeroImage').value.trim(),
      instagramUrl: document.getElementById('tournamentInstagramUrl').value.trim()
    };
    
    await updateTournamentMeta(metaData);
    alert('Tournament settings saved successfully!');
  } catch (error) {
    console.error('Error saving tournament settings:', error);
    alert('Error saving tournament settings');
  }
}


// Initialize dashboard when page loads
init();
