/**
 * Landing Page Logic
 * Loads tournament metadata and seasons (header dropdown)
 */
import { getTournamentMeta, getAllSeasons } from './firestore-helpers.js';

// DOM Elements
const heroTagline = document.getElementById('heroTagline');
const whyContent = document.getElementById('whyContent');
const visionContent = document.getElementById('visionContent');
const organizerContent = document.getElementById('organizerContent');
const headerSeasonSelect = document.getElementById('headerSeasonSelect');
const seasonDropdown = document.getElementById('seasonDropdown');
const seasonLink = document.getElementById('seasonLink');
const heroSection = document.getElementById('heroSection');

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
 * Load tournament metadata
 */
async function loadTournamentMeta() {
  try {
    const meta = await getTournamentMeta();
    if (meta) {
      heroTagline.textContent = meta.tagline || meta.description || 'Built to nurture competitive street cricket';

      if (meta.why) {
        whyContent.innerHTML = `<p>${meta.why}</p>`;
      } else {
        whyContent.innerHTML = '<p>Royal Risers Cup was created to provide a platform for competitive street cricket, bringing together passionate players and teams in a structured tournament format.</p>';
      }

      if (meta.vision) {
        visionContent.innerHTML = `<p>${meta.vision}</p>`;
      } else {
        visionContent.innerHTML = '<p>Our vision is to create a sustainable, competitive cricket ecosystem that nurtures talent and promotes fair play. We value sportsmanship, dedication, and community spirit.</p>';
      }

      if (meta.organizer) {
        organizerContent.innerHTML = `
          <p><strong>${meta.organizer}</strong></p>
          ${meta.organizerProfile ? `<p>${meta.organizerProfile}</p>` : ''}
        `;
      } else {
        organizerContent.innerHTML = '<p>Tournament organizer information coming soon.</p>';
      }

      // Use custom hero image only if it's not a Google Photos URL (they block embedding / 429)
      if (meta.heroImage && !isGooglePhotosUrl(meta.heroImage)) {
        heroSection.style.setProperty('--hero-bg-image', `url('${meta.heroImage}')`);
      }
    } else {
      heroTagline.textContent = 'Built to nurture competitive street cricket';
      whyContent.innerHTML = '<p>Royal Risers Cup was created to provide a platform for competitive street cricket.</p>';
      visionContent.innerHTML = '<p>Our vision is to create a sustainable, competitive cricket ecosystem.</p>';
      organizerContent.innerHTML = '<p>Tournament organizer information coming soon.</p>';
    }
  } catch (error) {
    console.error('Error loading tournament meta:', error);
    heroTagline.textContent = 'Royal Risers Cup';
    whyContent.innerHTML = '<p class="alert alert-error">Error loading tournament information.</p>';
  }
}

/**
 * Load seasons: populate header dropdown
 */
async function loadSeasons() {
  try {
    const seasons = await getAllSeasons();

    // Header dropdown
    if (headerSeasonSelect) {
      headerSeasonSelect.innerHTML = '<option value="">Select Season</option>';
      seasons.forEach(season => {
        const option = document.createElement('option');
        option.value = season.id;
        const seasonLabel = season.id.replace(/^s(\d+)/, 'Season $1').replace(/-/g, ' ');
        option.textContent = seasonLabel;
        headerSeasonSelect.appendChild(option);
      });
    }
    if (seasonDropdown && seasons.length > 0) {
      seasonDropdown.style.display = 'block';
    }
    if (seasonLink && seasons.length > 0) {
      seasonLink.style.display = '';
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
 * Show Instagram follow section when URL is set
 */
async function renderInstagramFollow() {
  try {
    const meta = await getTournamentMeta();
    const instagramSection = document.getElementById('instagramFollowSection');
    const instagramLink = document.getElementById('instagramFollowLink');

    if (meta && meta.instagramUrl && instagramSection && instagramLink) {
      instagramLink.href = meta.instagramUrl;
      instagramSection.style.display = 'block';
    } else if (instagramSection) {
      instagramSection.style.display = 'none';
    }
  } catch (error) {
    console.error('Error loading Instagram follow:', error);
  }
}

async function init() {
  await Promise.all([loadTournamentMeta(), loadSeasons()]);
  await renderInstagramFollow();
}

init();
