/**
 * Season Overview Page Logic
 * Reads tournamentId and seasonId from URL params and renders season data
 */
import { getSeasonData, getSeasonMedia, getTournamentMeta, applyTournamentHeroImage } from './firestore-helpers.js';

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
const mediaContent = document.getElementById('mediaContent');

// Navigation links
const fixturesLink = document.getElementById('fixturesLink');
const pointsLink = document.getElementById('pointsLink');
const teamsLink = document.getElementById('teamsLink');
const statsLink = document.getElementById('statsLink');
const fixturesBtn = document.getElementById('fixturesBtn');
const pointsBtn = document.getElementById('pointsBtn');
const teamsBtn = document.getElementById('teamsBtn');
const statsBtn = document.getElementById('statsBtn');

/**
 * Update navigation links with season ID
 */
function updateNavLinks() {
  if (seasonId) {
    const baseUrl = `?tournamentId=${tournamentId}&seasonId=${seasonId}`;
    fixturesLink.href = `fixtures.html${baseUrl}`;
    pointsLink.href = `points.html${baseUrl}`;
    teamsLink.href = `teams.html${baseUrl}`;
    statsLink.href = `stats.html${baseUrl}`;
    fixturesBtn.href = `fixtures.html${baseUrl}`;
    pointsBtn.href = `points.html${baseUrl}`;
    teamsBtn.href = `teams.html${baseUrl}`;
    statsBtn.href = `stats.html${baseUrl}`;
  }
}

/**
 * Render season overview
 */
function renderOverview(data) {
  if (data?.overview?.description) {
    overviewContent.innerHTML = `<p>${data.overview.description}</p>`;
  } else {
    overviewContent.innerHTML = '<p class="text-muted">No overview available for this season.</p>';
  }
}

/**
 * Render tournament format
 */
function renderFormat(data) {
  const format = data?.format;
  if (!format) {
    formatContent.innerHTML = '<p class="text-muted">Format details not available.</p>';
    return;
  }

  let html = '';
  if (format.leagueMatches) {
    html += `<p><strong>League Matches:</strong> ${format.leagueMatches}</p>`;
  }
  if (format.qualificationRules) {
    html += `<p><strong>Qualification Rules:</strong> ${format.qualificationRules}</p>`;
  }
  if (!html) {
    html = '<p class="text-muted">Format details not available.</p>';
  }
  formatContent.innerHTML = html;
}

/**
 * Render awards
 */
function renderAwards(data) {
  const awards = data?.awards;
  if (!awards) {
    awardsContent.innerHTML = '<p class="text-muted">Awards information not available.</p>';
    return;
  }

  let html = '';
  
  if (awards.matchAwards && awards.matchAwards.length > 0) {
    html += '<h4>Match Awards</h4><ul style="margin-left: 1.5rem; margin-bottom: 1rem;">';
    awards.matchAwards.forEach(award => {
      html += `<li>${award}</li>`;
    });
    html += '</ul>';
  }

  if (awards.tournamentAwards && awards.tournamentAwards.length > 0) {
    html += '<h4>Tournament Awards</h4><ul style="margin-left: 1.5rem; margin-bottom: 1rem;">';
    awards.tournamentAwards.forEach(award => {
      html += `<li>${award}</li>`;
    });
    html += '</ul>';
  }

  if (awards.teamAwards && awards.teamAwards.length > 0) {
    html += '<h4>Team Awards</h4><ul style="margin-left: 1.5rem;">';
    awards.teamAwards.forEach(award => {
      html += `<li>${award}</li>`;
    });
    html += '</ul>';
  }

  if (!html) {
    html = '<p class="text-muted">Awards information not available.</p>';
  }
  awardsContent.innerHTML = html;
}

/**
 * Render facilities
 */
function renderFacilities(data) {
  const facilities = data?.facilities;
  if (!facilities) {
    facilitiesContent.innerHTML = '<p class="text-muted">Facilities information not available.</p>';
    return;
  }

  let html = '';
  if (facilities.refreshments) {
    html += `<p><strong>Refreshments:</strong> ${facilities.refreshments}</p>`;
  }
  if (facilities.liveStreaming) {
    html += `<p><strong>Live Streaming:</strong> ${facilities.liveStreaming}</p>`;
  }
  if (facilities.streamingCost) {
    html += `<p><strong>Streaming Cost:</strong> ${facilities.streamingCost}</p>`;
  }
  if (!html) {
    html = '<p class="text-muted">Facilities information not available.</p>';
  }
  facilitiesContent.innerHTML = html;
}

/**
 * Render cost structure
 */
function renderCostStructure(data) {
  const cost = data?.costStructure;
  if (!cost) {
    costContent.innerHTML = '<p class="text-muted">Cost structure not available.</p>';
    return;
  }

  let html = '<table><thead><tr><th>Item</th><th>Amount</th></tr></thead><tbody>';
  if (cost.groundFee) {
    html += `<tr><td>Ground Fee</td><td>${cost.groundFee}</td></tr>`;
  }
  if (cost.umpireFee) {
    html += `<tr><td>Umpire Fee</td><td>${cost.umpireFee}</td></tr>`;
  }
  if (cost.refreshmentCost) {
    html += `<tr><td>Refreshment Cost</td><td>${cost.refreshmentCost}</td></tr>`;
  }
  if (cost.totalPerMatch) {
    html += `<tr><td style="font-weight: 600;">Total Per Match</td><td style="font-weight: 600; color: var(--primary);">${cost.totalPerMatch}</td></tr>`;
  }
  html += '</tbody></table>';

  if (html === '<table><thead><tr><th>Item</th><th>Amount</th></tr></thead><tbody></tbody></table>') {
    html = '<p class="text-muted">Cost structure not available.</p>';
  }
  costContent.innerHTML = html;
}

/**
 * Render payment policy
 */
function renderPaymentPolicy(data) {
  const policy = data?.paymentPolicy;
  if (!policy) {
    paymentContent.innerHTML = '<p class="text-muted">Payment policy not available.</p>';
    return;
  }

  let html = '<table><thead><tr><th>Item</th><th>Amount</th></tr></thead><tbody>';
  if (policy.advanceMatchFee) {
    html += `<tr><td>Advance Match Fee</td><td>${policy.advanceMatchFee}</td></tr>`;
  }
  if (policy.awardsContribution) {
    html += `<tr><td>Awards Contribution</td><td>${policy.awardsContribution}</td></tr>`;
  }
  if (policy.totalAdvance) {
    html += `<tr><td style="font-weight: 600;">Total Advance</td><td style="font-weight: 600; color: var(--primary);">${policy.totalAdvance}</td></tr>`;
  }
  html += '</tbody></table>';

  if (html === '<table><thead><tr><th>Item</th><th>Amount</th></tr></thead><tbody></tbody></table>') {
    html = '<p class="text-muted">Payment policy not available.</p>';
  }
  paymentContent.innerHTML = html;
}

/**
 * Load and render season data
 */
async function loadSeasonData() {
  await applyTournamentHeroImage(document.getElementById('heroSection'));
  if (!seasonId) {
    seasonTitle.textContent = 'Season Not Found';
    overviewContent.innerHTML = '<p class="alert alert-error">No season ID provided in URL.</p>';
    return;
  }

  try {
    const seasonData = await getSeasonData(seasonId);
    
    if (!seasonData) {
      seasonTitle.textContent = `Season ${seasonId} - Not Found`;
      overviewContent.innerHTML = '<p class="alert alert-error">Season data not found.</p>';
      return;
    }

    // Update page title
    const seasonDisplay = seasonId.replace('s', 'Season ').replace('-', ' ');
    seasonTitle.textContent = seasonDisplay;

    // Render all sections
    renderOverview(seasonData);
    renderFormat(seasonData);
    renderAwards(seasonData);
    renderFacilities(seasonData);
    renderCostStructure(seasonData);
    renderPaymentPolicy(seasonData);
    await renderMedia();

    // Update navigation links
    updateNavLinks();

  } catch (error) {
    console.error('Error loading season data:', error);
    seasonTitle.textContent = 'Error Loading Season';
    overviewContent.innerHTML = '<p class="alert alert-error">Error loading season data. Please try again later.</p>';
  }
}

/**
 * Render media gallery
 */
async function renderMedia() {
  if (!seasonId) return;
  
  try {
    const media = await getSeasonMedia(seasonId);
    const mediaPlaceholder = document.getElementById('mediaPlaceholder');
    
    if (!media || (!media.images?.length && !media.videos?.length)) {
      mediaSection.style.display = 'none';
      mediaPlaceholder.style.display = 'block';
      return;
    }
    
    mediaSection.style.display = 'block';
    mediaPlaceholder.style.display = 'none';
    let html = '';
    
    // Images
    if (media.images?.length > 0) {
      html += '<h3 class="mb-md">Photos</h3>';
      html += '<div class="media-grid">';
      media.images.forEach((url, index) => {
        // Check if it's a share link
        if (isGooglePhotosShareLink(url)) {
          // Show as clickable card for share links
          html += `
            <a href="${url}" target="_blank" rel="noopener noreferrer" class="media-item google-photos-card" style="text-decoration: none; display: flex; flex-direction: column; align-items: center; justify-content: center; background: linear-gradient(135deg, #4285f4 0%, #34a853 100%); color: white;">
              <div style="font-size: 2.5rem; margin-bottom: var(--spacing-sm);">📷</div>
              <div style="font-weight: 600; text-align: center; padding: 0 var(--spacing-sm); font-size: 0.875rem;">View Photo ${index + 1}</div>
              <div style="font-size: 0.75rem; margin-top: var(--spacing-xs); opacity: 0.9;">Click to open in Google Photos</div>
              <div style="font-size: 0.65rem; margin-top: var(--spacing-xs); opacity: 0.7; padding: 0 var(--spacing-sm); text-align: center;">⚠️ Share link - get direct URL for embedding</div>
            </a>
          `;
        } else {
          // Direct image URL - try to convert and display
          const directUrl = convertGooglePhotosUrl(url);
          html += `
            <div class="media-item">
              <img src="${directUrl}" alt="Gallery photo ${index + 1}" loading="lazy" 
                   onerror="this.parentElement.innerHTML='<div class=\\'media-placeholder\\'><div class=\\'media-placeholder-icon\\'>🖼️</div><div class=\\'media-placeholder-text\\'>Image ${index + 1}<br>Failed to load<br><small style=\\'font-size:0.7rem;opacity:0.7;margin-top:4px;\\'>Check if URL is a direct image link</small></div></div>'">
            </div>
          `;
        }
      });
      html += '</div>';
    }
    
    // Videos
    if (media.videos?.length > 0) {
      html += '<h3 class="mb-md mt-lg">Videos</h3>';
      html += '<div class="media-grid">';
      media.videos.forEach(videoUrl => {
        const videoId = extractYouTubeId(videoUrl);
        if (videoId) {
          html += `
            <div class="media-item video">
              <iframe src="https://www.youtube.com/embed/${videoId}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
            </div>
          `;
        }
      });
      html += '</div>';
    }
    
    
    mediaContent.innerHTML = html;
  } catch (error) {
    console.error('Error loading media:', error);
    mediaSection.style.display = 'none';
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
 * If it's already a direct URL (lh3.googleusercontent.com), return as-is
 * Otherwise, try to extract or convert the URL
 */
function convertGooglePhotosUrl(url) {
  if (!url) return url;
  
  // If it's a share link, return null to indicate it needs special handling
  if (isGooglePhotosShareLink(url)) {
    return null;
  }
  
  // If it's already a direct Google Photos URL, return as-is
  if (url.includes('lh3.googleusercontent.com') || url.includes('googleusercontent.com')) {
    // Ensure it's a direct image URL (not a page URL)
    if (url.includes('/p/') || url.includes('/d/')) {
      // Add parameters for direct image access
      const separator = url.includes('?') ? '&' : '?';
      return url + separator + 'w=800&h=800&fit=crop';
    }
    return url;
  }
  
  // For any other URL, return as-is
  return url;
}

/**
 * Render Instagram follow section
 */
async function renderInstagramFollow() {
  try {
    const meta = await getTournamentMeta();
    const instagramSection = document.getElementById('instagramFollowSection');
    const instagramLink = document.getElementById('instagramFollowLink');
    
    if (meta && meta.instagramUrl) {
      instagramLink.href = meta.instagramUrl;
      instagramSection.style.display = 'block';
    } else {
      instagramSection.style.display = 'none';
    }
  } catch (error) {
    console.error('Error loading Instagram follow:', error);
  }
}

// Initialize page
loadSeasonData();
