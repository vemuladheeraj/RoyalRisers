/**
 * Season Page Logic - Modernized
 * Displays complete season information
 */
import { 
  getSeasonData, 
  applyTournamentHeroImage,
  getSeasonTeams,
  getSeasonMatches,
  getSeasonPoints
} from './firestore-helpers.js';

// Get URL parameters
const urlParams = new URLSearchParams(window.location.search);
const tournamentId = urlParams.get('tournamentId') || 'royal-risers-cup';
const seasonId = urlParams.get('seasonId');

// DOM Elements
const seasonTitle = document.getElementById('seasonTitle');
const overviewContent = document.getElementById('overviewContent');
const formatContent = document.getElementById('formatContent');
const awardsContent = document.getElementById('awardsContent');
const facilitiesContent = document.getElementById('facilitiesContent');
const costContent = document.getElementById('costContent');
const paymentContent = document.getElementById('paymentContent');
const mediaSection = document.getElementById('mediaSection');
const mediaPlaceholder = document.getElementById('mediaPlaceholder');
const mediaContent = document.getElementById('mediaContent');
const instagramSection = document.getElementById('instagramFollowSection');
const instagramLink = document.getElementById('instagramFollowLink');
const fixturesBtn = document.getElementById('fixturesBtn');
const pointsBtn = document.getElementById('pointsBtn');
const teamsBtn = document.getElementById('teamsBtn');
const statsBtn = document.getElementById('statsBtn');
const fixturesLink = document.getElementById('fixturesLink');
const pointsLink = document.getElementById('pointsLink');
const teamsLink = document.getElementById('teamsLink');
const statsLink = document.getElementById('statsLink');

// Quick links
const seasonBaseUrl = `?tournamentId=${tournamentId}&seasonId=${seasonId}`;
if (fixturesBtn) fixturesBtn.href = `fixtures.html${seasonBaseUrl}`;
if (pointsBtn) pointsBtn.href = `points.html${seasonBaseUrl}`;
if (teamsBtn) teamsBtn.href = `teams.html${seasonBaseUrl}`;
if (statsBtn) statsBtn.href = `stats.html${seasonBaseUrl}`;

/**
 * Update navigation links
 */
function updateNavLinks() {
  if (fixturesLink) fixturesLink.href = `fixtures.html${seasonBaseUrl}`;
  if (pointsLink) pointsLink.href = `points.html${seasonBaseUrl}`;
  if (teamsLink) teamsLink.href = `teams.html${seasonBaseUrl}`;
  if (statsLink) statsLink.href = `stats.html${seasonBaseUrl}`;
}

/**
 * Render overview section
 */
function renderOverview(season) {
  if (!overviewContent) return;
  
  if (!season) {
    overviewContent.innerHTML = '<p class="text-muted">Season information not available.</p>';
    return;
  }

  let html = '';
  
  // Handle both flat structure (description) and nested structure (overview.description)
  const description = season.description || season.overview?.description;
  
  if (description) {
    html += `<p>${description}</p>`;
  } else {
    html += '<p class="text-muted">No overview description added yet.</p>';
  }

  overviewContent.innerHTML = html;
}

/**
 * Render format section
 */
function renderFormat(season) {
  if (!formatContent) return;
  
  if (!season) {
    formatContent.innerHTML = '<p class="text-muted">Format information not available.</p>';
    return;
  }

  // Handle both flat structure and nested structure
  const leagueMatches = season.leagueMatches || season.format?.leagueMatches;
  const qualificationRules = season.qualificationRules || season.format?.qualificationRules;
  
  let html = '<div class="timeline">';
  
  if (leagueMatches) {
    html += `
      <div class="timeline-item">
        <div class="timeline-year">League Stage</div>
        <div class="timeline-content">
          <h4>${leagueMatches}</h4>
        </div>
      </div>
    `;
  }
  
  if (qualificationRules) {
    html += `
      <div class="timeline-item">
        <div class="timeline-year">Qualification</div>
        <div class="timeline-content">
          <p>${qualificationRules}</p>
        </div>
      </div>
    `;
  }

  if (!leagueMatches && !qualificationRules) {
    html += '<p class="text-muted">No format details added yet.</p>';
  }
  
  html += '</div>';
  formatContent.innerHTML = html;
}

/**
 * Render awards section
 */
function renderAwards(season) {
  if (!awardsContent) return;
  
  if (!season) {
    awardsContent.innerHTML = '<p class="text-muted">Awards information not available.</p>';
    return;
  }

  // Handle both flat structure and nested structure
  const matchAwards = season.matchAwards || season.awards?.matchAwards || [];
  const tournamentAwards = season.tournamentAwards || season.awards?.tournamentAwards || [];
  const teamAwards = season.teamAwards || season.awards?.teamAwards || [];
  
  let html = '';
  
  // Match awards
  if (matchAwards.length > 0) {
    html += `
      <div class="mb-lg">
        <h4 class="mb-sm">🏅 Match Awards</h4>
        <ul style="list-style: none; padding: 0;">
          ${matchAwards.map(award => `<li style="padding: var(--spacing-xs) 0; border-bottom: 1px solid var(--border);">${award}</li>`).join('')}
        </ul>
      </div>
    `;
  }
  
  // Tournament awards
  if (tournamentAwards.length > 0) {
    html += `
      <div class="mb-lg">
        <h4 class="mb-sm">🏆 Tournament Awards</h4>
        <ul style="list-style: none; padding: 0;">
          ${tournamentAwards.map(award => `<li style="padding: var(--spacing-xs) 0; border-bottom: 1px solid var(--border);">${award}</li>`).join('')}
        </ul>
      </div>
    `;
  }
  
  // Team awards
  if (teamAwards.length > 0) {
    html += `
      <div>
        <h4 class="mb-sm">🎖️ Team Awards</h4>
        <ul style="list-style: none; padding: 0;">
          ${teamAwards.map(award => `<li style="padding: var(--spacing-xs) 0; border-bottom: 1px solid var(--border);">${award}</li>`).join('')}
        </ul>
      </div>
    `;
  }

  if (!html) {
    html = '<p class="text-muted">No awards information added yet.</p>';
  }

  awardsContent.innerHTML = html;
}

/**
 * Render facilities section
 */
function renderFacilities(season) {
  if (!facilitiesContent) return;
  
  if (!season) {
    facilitiesContent.innerHTML = '<p class="text-muted">Facilities information not available.</p>';
    return;
  }

  // Handle both flat structure and nested structure
  const refreshments = season.refreshments || season.facilities?.refreshments;
  const liveStreaming = season.liveStreaming || season.facilities?.liveStreaming;
  const streamingCost = season.streamingCost || season.facilities?.streamingCost;
  
  let html = '<div class="stats-grid">';
  
  if (refreshments) {
    html += `
      <div class="stat-card">
        <div class="stat-icon">🥤</div>
        <div class="stat-label">Refreshments</div>
        <p style="margin-top: var(--spacing-xs); font-size: 0.875rem;">${refreshments}</p>
      </div>
    `;
  }
  
  if (liveStreaming) {
    html += `
      <div class="stat-card">
        <div class="stat-icon">📺</div>
        <div class="stat-label">Live Streaming</div>
        <p style="margin-top: var(--spacing-xs); font-size: 0.875rem;">${liveStreaming}</p>
      </div>
    `;
  }
  
  if (streamingCost) {
    html += `
      <div class="stat-card">
        <div class="stat-icon">💰</div>
        <div class="stat-label">Streaming Cost</div>
        <p style="margin-top: var(--spacing-xs); font-size: 0.875rem;">${streamingCost}</p>
      </div>
    `;
  }

  html += '</div>';
  
  if (!refreshments && !liveStreaming && !streamingCost) {
    html = '<p class="text-muted">No facilities information added yet.</p>';
  }

  facilitiesContent.innerHTML = html;
}

/**
 * Render cost section
 */
function renderCost(season) {
  if (!costContent) return;
  
  if (!season) {
    costContent.innerHTML = '<p class="text-muted">Cost information not available.</p>';
    return;
  }

  // Handle both flat structure and nested structure
  const groundFee = season.groundFee || season.costStructure?.groundFee;
  const umpireFee = season.umpireFee || season.costStructure?.umpireFee;
  const refreshmentCost = season.refreshmentCost || season.costStructure?.refreshmentCost;
  const totalPerMatch = season.totalPerMatch || season.costStructure?.totalPerMatch;
  
  let html = '<div class="stats-grid">';
  
  if (groundFee) {
    html += `
      <div class="stat-card">
        <div class="stat-icon">🏏</div>
        <div class="stat-label">Ground Fee</div>
        <p style="margin-top: var(--spacing-xs); font-size: 0.875rem;">${groundFee}</p>
      </div>
    `;
  }
  
  if (umpireFee) {
    html += `
      <div class="stat-card">
        <div class="stat-icon">👨‍⚖️</div>
        <div class="stat-label">Umpire Fee</div>
        <p style="margin-top: var(--spacing-xs); font-size: 0.875rem;">${umpireFee}</p>
      </div>
    `;
  }
  
  if (refreshmentCost) {
    html += `
      <div class="stat-card">
        <div class="stat-icon">🥤</div>
        <div class="stat-label">Refreshment</div>
        <p style="margin-top: var(--spacing-xs); font-size: 0.875rem;">${refreshmentCost}</p>
      </div>
    `;
  }
  
  if (totalPerMatch) {
    html += `
      <div class="stat-card">
        <div class="stat-icon">💵</div>
        <div class="stat-label">Total/Match</div>
        <p style="margin-top: var(--spacing-xs); font-size: 0.875rem;">${totalPerMatch}</p>
      </div>
    `;
  }

  html += '</div>';
  
  if (!groundFee && !umpireFee && !refreshmentCost && !totalPerMatch) {
    html = '<p class="text-muted">No cost information added yet.</p>';
  }

  costContent.innerHTML = html;
}

/**
 * Render payment section
 */
function renderPayment(season) {
  if (!paymentContent) return;
  
  if (!season) {
    paymentContent.innerHTML = '<p class="text-muted">Payment information not available.</p>';
    return;
  }

  // Handle both flat structure and nested structure
  const advanceMatchFee = season.advanceMatchFee || season.paymentPolicy?.advanceMatchFee;
  const awardsContribution = season.awardsContribution || season.paymentPolicy?.awardsContribution;
  const totalAdvance = season.totalAdvance || season.paymentPolicy?.totalAdvance;
  
  let html = '<div class="stats-grid">';
  
  if (advanceMatchFee) {
    html += `
      <div class="stat-card">
        <div class="stat-icon">💳</div>
        <div class="stat-label">Advance Fee</div>
        <p style="margin-top: var(--spacing-xs); font-size: 0.875rem;">${advanceMatchFee}</p>
      </div>
    `;
  }
  
  if (awardsContribution) {
    html += `
      <div class="stat-card">
        <div class="stat-icon">🏆</div>
        <div class="stat-label">Awards Fund</div>
        <p style="margin-top: var(--spacing-xs); font-size: 0.875rem;">${awardsContribution}</p>
      </div>
    `;
  }
  
  if (totalAdvance) {
    html += `
      <div class="stat-card">
        <div class="stat-icon">💰</div>
        <div class="stat-label">Total Advance</div>
        <p style="margin-top: var(--spacing-xs); font-size: 0.875rem;">${totalAdvance}</p>
      </div>
    `;
  }

  html += '</div>';
  
  if (!advanceMatchFee && !awardsContribution && !totalAdvance) {
    html = '<p class="text-muted">No payment information added yet.</p>';
  }

  paymentContent.innerHTML = html;
}

/**
 * Render media gallery
 */
function renderMedia(season) {
  if (!mediaSection || !mediaPlaceholder || !mediaContent) return;
  
  // Handle both flat structure and nested structure
  const images = season.images || season.media?.images || [];
  const videos = season.videos || season.media?.videos || [];
  const hasMedia = images.length > 0 || videos.length > 0;
  
  if (hasMedia) {
    mediaSection.style.display = 'block';
    mediaPlaceholder.style.display = 'none';
    
    let html = '<div class="media-grid">';
    
    // Images
    images.forEach(img => {
      html += `
        <a href="${img}" target="_blank" rel="noopener noreferrer" class="media-item">
          <img src="${img}" alt="Gallery image" loading="lazy" onerror="this.closest('.media-item').style.display='none'">
        </a>
      `;
    });
    
    // Videos
    videos.forEach(video => {
      let videoId = video;
      if (video.includes('youtube.com')) {
        videoId = new URL(video).searchParams.get('v') || video;
      } else if (video.includes('youtu.be')) {
        videoId = video.split('/').pop();
      }
      
      html += `
        <div class="media-item video">
          <iframe 
            src="https://www.youtube.com/embed/${videoId}" 
            title="YouTube video" 
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
            allowfullscreen>
          </iframe>
        </div>
      `;
    });
    
    html += '</div>';
    mediaContent.innerHTML = html;
  } else {
    mediaSection.style.display = 'none';
    mediaPlaceholder.style.display = 'block';
  }
}

/**
 * Load season data
 */
async function loadSeason() {
  const heroSection = document.getElementById('heroSection');
  if (heroSection) {
    await applyTournamentHeroImage(heroSection);
  }
  
  if (!seasonId) {
    if (seasonTitle) seasonTitle.textContent = 'Error - No Season';
    return;
  }

  try {
    // Load season data
    const season = await getSeasonData(seasonId);
    
    if (seasonTitle) {
      const seasonDisplay = seasonId.replace('s', 'Season ').replace(/-/g, ' ');
      seasonTitle.textContent = seasonDisplay;
    }

    // Render all sections
    renderOverview(season);
    renderFormat(season);
    renderAwards(season);
    renderFacilities(season);
    renderCost(season);
    renderPayment(season);
    renderMedia(season);

    // Instagram link - handle nested structure
    const instagramUrl = season.instagramUrl || season.media?.instagramUrl;
    if (instagramUrl && instagramLink) {
      instagramLink.href = instagramUrl;
      if (instagramSection) instagramSection.style.display = 'block';
    } else if (instagramSection) {
      instagramSection.style.display = 'none';
    }

    updateNavLinks();

  } catch (error) {
    console.error('Error loading season:', error);
    if (seasonTitle) seasonTitle.textContent = 'Error Loading Season';
  }
}

// Initialize
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', loadSeason);
} else {
  loadSeason();
}
