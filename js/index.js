/**
 * Landing Page Logic - Modernized
 * Loads tournament metadata and seasons with enhanced UX
 */
import { getTournamentMeta, getAllSeasons, getSeasonTeams, getSeasonMatches } from './firestore-helpers.js';

// DOM Elements with null checks
const heroTagline = document.getElementById('heroTagline');
const whyContent = document.getElementById('whyContent');
const visionContent = document.getElementById('visionContent');
const organizerContent = document.getElementById('organizerContent');
const headerSeasonSelect = document.getElementById('headerSeasonSelect');
const seasonDropdown = document.getElementById('seasonDropdown');
const heroSection = document.getElementById('heroSection');
const instagramLink = document.getElementById('instagramFollowLink');

/**
 * Google Photos URLs block embedding (CORS, SameSite, 429). Don't use for backgrounds.
 */
function isGooglePhotosUrl(url) {
  if (!url || typeof url !== 'string') return false;
  try {
    const host = new URL(url).hostname.toLowerCase();
    return host.includes('google.com') || host.includes('googleusercontent.com') || host.includes('gstatic.com') || host.includes('photos.fife');
  } catch {
    return false;
  }
}

/**
 * Format number with locale
 */
function formatNumber(num) {
  if (typeof num !== 'number' || isNaN(num)) return '-';
  return new Intl.NumberFormat('en-IN').format(num);
}

/**
 * Load tournament metadata with enhanced UI
 */
async function loadTournamentMeta() {
  try {
    const meta = await getTournamentMeta();
    
    if (meta) {
      // Hero tagline
      if (heroTagline) {
        heroTagline.textContent = meta.tagline || meta.description || 'Built to nurture competitive street cricket';
      }

      // Why section
      if (whyContent) {
        if (meta.why) {
          whyContent.innerHTML = `<p>${meta.why}</p>`;
        } else {
          whyContent.innerHTML = '<p>Royal Risers Cup was created to provide a platform for competitive street cricket, bringing together passionate players and teams in a structured tournament format.</p>';
        }
      }

      // Vision section
      if (visionContent) {
        if (meta.vision) {
          visionContent.innerHTML = `<p>${meta.vision}</p>`;
        } else {
          visionContent.innerHTML = '<p>Our vision is to create a sustainable, competitive cricket ecosystem that nurtures talent and promotes fair play. We value sportsmanship, dedication, and community spirit.</p>';
        }
      }

      // Organizer section with enhanced design
      if (organizerContent && meta.organizer) {
        const organizerTitle = meta.organizerTitle ? `<p class="organizer-title">${meta.organizerTitle}</p>` : '';
        const organizerProfile = meta.organizerProfile ? `<p>${meta.organizerProfile}</p>` : '';
        const organizerPhotoUrl = meta.organizerPhoto || 'assets/ashu.jpg';
        const organizerPhoto = organizerPhotoUrl
          ? `
            <div class="organizer-photo-wrap">
              <img src="${organizerPhotoUrl}" alt="${meta.organizer} photo" loading="lazy" onerror="this.closest('.organizer-photo-wrap').style.display='none'">
            </div>
          `
          : '';

        organizerContent.innerHTML = `
          <div class="organizer-layout">
            <div class="organizer-text">
              <div class="organizer-kicker">Organizer</div>
              <h3 class="organizer-name">${meta.organizer}</h3>
              ${organizerTitle}
              ${organizerProfile}
            </div>
            ${organizerPhoto}
          </div>
        `;
      } else if (organizerContent) {
        organizerContent.innerHTML = '<p>Tournament organizer information coming soon.</p>';
      }

      // Custom hero image
      if (heroSection && meta.heroImage && !isGooglePhotosUrl(meta.heroImage)) {
        heroSection.style.setProperty('--hero-bg-image', `url('${meta.heroImage}')`);
      }

      // Instagram link
      if (instagramLink && meta.instagramUrl) {
        instagramLink.href = meta.instagramUrl;
        instagramLink.style.display = 'inline-flex';
      } else if (instagramLink) {
        instagramLink.style.display = 'none';
      }
    } else {
      // Default content when no meta exists
      if (heroTagline) {
        heroTagline.textContent = 'Built to nurture competitive street cricket';
      }
      if (whyContent) {
        whyContent.innerHTML = '<p>Royal Risers Cup was created to provide a platform for competitive street cricket.</p>';
      }
      if (visionContent) {
        visionContent.innerHTML = '<p>Our vision is to create a sustainable, competitive cricket ecosystem.</p>';
      }
      if (organizerContent) {
        organizerContent.innerHTML = '<p>Tournament organizer information coming soon.</p>';
      }
      if (instagramLink) {
        instagramLink.style.display = 'none';
      }
    }
  } catch (error) {
    console.error('Error loading tournament meta:', error);
    if (heroTagline) {
      heroTagline.textContent = 'Royal Risers Cup';
    }
    if (whyContent) {
      whyContent.innerHTML = '<div class="alert alert-error">Error loading tournament information. Please refresh the page.</div>';
    }
  }
}

/**
 * Load seasons: populate header dropdown with animation
 */
async function loadSeasons() {
  try {
    const seasons = await getAllSeasons();

    // Header dropdown
    if (headerSeasonSelect) {
      headerSeasonSelect.innerHTML = '<option value="">Select Season</option>';
      
      // Add seasons with animation delay
      seasons.forEach((season, index) => {
        const option = document.createElement('option');
        option.value = season.id;
        const seasonLabel = season.id.replace(/^s(\d+)/, 'Season $1').replace(/-/g, ' ');
        option.textContent = seasonLabel;
        option.style.animationDelay = `${index * 50}ms`;
        headerSeasonSelect.appendChild(option);
      });
    }
    
    if (seasonDropdown && seasons.length > 0) {
      seasonDropdown.style.display = 'block';
      seasonDropdown.style.animation = 'fadeIn 0.3s ease';
    }
  } catch (error) {
    console.error('Error loading seasons:', error);
  }
}

/**
 * Header season dropdown: navigate when user selects a season
 */
if (headerSeasonSelect) {
  headerSeasonSelect.addEventListener('change', (e) => {
    const selectedSeason = e.target.value;
    if (selectedSeason) {
      window.location.href = `season.html?tournamentId=royal-risers-cup&seasonId=${selectedSeason}`;
    }
  });
}

/**
 * Update quick links with season data
 */
function updateQuickLinks(seasons) {
  const fixturesBtn = document.getElementById('fixturesBtn');
  const pointsBtn = document.getElementById('pointsBtn');
  const teamsLink = document.getElementById('teamsLink');
  const statsLink = document.getElementById('statsLink');
  const quickLinksSection = document.getElementById('quickLinksSection');
  
  if (seasons.length > 0) {
    const baseUrl = `?tournamentId=royal-risers-cup&seasonId=${seasons[0].id}`;
    
    if (fixturesBtn) fixturesBtn.href = `fixtures.html${baseUrl}`;
    if (pointsBtn) pointsBtn.href = `points.html${baseUrl}`;
    if (teamsLink) teamsLink.href = `teams.html${baseUrl}`;
    if (statsLink) statsLink.href = `stats.html${baseUrl}`;
    
    // Show quick links section
    if (quickLinksSection) {
      quickLinksSection.style.display = 'block';
      quickLinksSection.style.animation = 'fadeIn 0.3s ease';
    }
  } else {
    // Hide quick links section if no seasons
    if (quickLinksSection) {
      quickLinksSection.style.display = 'none';
    }
  }
}

/**
 * Load quick stats: Seasons, Teams, Matches, Players
 */
async function loadQuickStats() {
  try {
    const seasons = await getAllSeasons();
    
    let totalTeams = 0;
    let totalMatches = 0;
    let totalPlayers = 0;
    
    // Fetch teams and matches from all seasons
    for (const season of seasons) {
      try {
        // Get teams for this season
        const teams = await getSeasonTeams(season.id);
        totalTeams += teams.length;
        
        // Count players from all teams
        teams.forEach(team => {
          if (team.players && Array.isArray(team.players)) {
            totalPlayers += team.players.length;
          }
        });
        
        // Get matches for this season
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
    
    if (statSeasons) statSeasons.textContent = formatNumber(seasons.length);
    if (statTeams) statTeams.textContent = formatNumber(totalTeams);
    if (statMatches) statMatches.textContent = formatNumber(totalMatches);
    if (statPlayers) statPlayers.textContent = formatNumber(totalPlayers);
    
  } catch (error) {
    console.error('Error loading quick stats:', error);
  }
}

/**
 * Initialize page with all data
 */
async function init() {
  // Show loading states
  const loadingElements = document.querySelectorAll('.loading');
  loadingElements.forEach(el => {
    el.style.animation = 'pulse 1.5s ease-in-out infinite';
  });

  await Promise.all([loadTournamentMeta(), loadSeasons(), loadQuickStats()]);
  
  // Remove loading animations
  loadingElements.forEach(el => {
    el.style.animation = '';
  });
  
  // Get seasons for quick links
  const seasons = await getAllSeasons();
  updateQuickLinks(seasons);
}

// Initialize on DOM ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
