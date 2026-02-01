/**
 * Firestore Helper Functions
 * Provides read/write operations for tournament and season data
 */
import { db } from './firebase-init.js';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  addDoc,
  deleteDoc,
  query,
  orderBy
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';
import { TOURNAMENT_ID } from '../firebase-config.js';

/**
 * Get tournament metadata
 */
export async function getTournamentMeta() {
  const docRef = doc(db, 'tournaments', TOURNAMENT_ID);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return docSnap.data().meta || {};
  }
  return null;
}

/** Google Photos URLs block embedding (CORS, SameSite, 429). */
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
 * Apply tournament hero image to a hero section element (for sub-pages).
 * Call with document.getElementById('heroSection') on pages that have the hero.
 */
export async function applyTournamentHeroImage(heroSection) {
  if (!heroSection) return;
  try {
    const meta = await getTournamentMeta();
    if (meta?.heroImage && !isGooglePhotosUrl(meta.heroImage)) {
      heroSection.style.setProperty('--hero-bg-image', `url('${meta.heroImage}')`);
    }
  } catch (_) { /* ignore */ }
}

/**
 * Get all seasons for the tournament
 */
export async function getAllSeasons() {
  const seasonsRef = collection(db, 'tournaments', TOURNAMENT_ID, 'seasons');
  const querySnapshot = await getDocs(seasonsRef);
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  })).sort((a, b) => a.id.localeCompare(b.id));
}

/**
 * Get a specific season's data
 */
export async function getSeasonData(seasonId) {
  const seasonRef = doc(db, 'tournaments', TOURNAMENT_ID, 'seasons', seasonId);
  const seasonSnap = await getDoc(seasonRef);
  if (seasonSnap.exists()) {
    return seasonSnap.data();
  }
  return null;
}

/**
 * Create a new season (admin only)
 */
export async function createSeason(seasonId) {
  const seasonRef = doc(db, 'tournaments', TOURNAMENT_ID, 'seasons', seasonId);
  const seasonSnap = await getDoc(seasonRef);
  
  if (seasonSnap.exists()) {
    throw new Error(`Season ${seasonId} already exists`);
  }
  
  // Create empty season document
  await setDoc(seasonRef, {
    createdAt: new Date().toISOString()
  });
  
  return seasonId;
}

/**
 * Update season data (admin only)
 * Uses setDoc with merge to create document if it doesn't exist
 */
export async function updateSeasonData(seasonId, data) {
  const seasonRef = doc(db, 'tournaments', TOURNAMENT_ID, 'seasons', seasonId);
  await setDoc(seasonRef, data, { merge: true });
}

/**
 * Get all matches for a season
 */
export async function getSeasonMatches(seasonId) {
  const matchesRef = collection(db, 'tournaments', TOURNAMENT_ID, 'seasons', seasonId, 'matches');
  const querySnapshot = await getDocs(query(matchesRef, orderBy('date', 'asc')));
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
}

/**
 * Add a match (admin only)
 */
export async function addMatch(seasonId, matchData) {
  const matchesRef = collection(db, 'tournaments', TOURNAMENT_ID, 'seasons', seasonId, 'matches');
  await addDoc(matchesRef, matchData);
}

/**
 * Update a match (admin only)
 */
export async function updateMatch(seasonId, matchId, matchData) {
  const matchRef = doc(db, 'tournaments', TOURNAMENT_ID, 'seasons', seasonId, 'matches', matchId);
  await updateDoc(matchRef, matchData);
}

/**
 * Delete a match (admin only)
 */
export async function deleteMatch(seasonId, matchId) {
  const matchRef = doc(db, 'tournaments', TOURNAMENT_ID, 'seasons', seasonId, 'matches', matchId);
  await deleteDoc(matchRef);
}

/**
 * Get all teams for a season
 */
export async function getSeasonTeams(seasonId) {
  const teamsRef = collection(db, 'tournaments', TOURNAMENT_ID, 'seasons', seasonId, 'teams');
  const querySnapshot = await getDocs(query(teamsRef, orderBy('name')));
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
}

/**
 * Add a team (admin only)
 */
export async function addTeam(seasonId, teamData) {
  const teamsRef = collection(db, 'tournaments', TOURNAMENT_ID, 'seasons', seasonId, 'teams');
  await addDoc(teamsRef, teamData);
}

/**
 * Update a team (admin only)
 */
export async function updateTeam(seasonId, teamId, teamData) {
  const teamRef = doc(db, 'tournaments', TOURNAMENT_ID, 'seasons', seasonId, 'teams', teamId);
  await updateDoc(teamRef, teamData);
}

/**
 * Delete a team (admin only)
 */
export async function deleteTeam(seasonId, teamId) {
  const teamRef = doc(db, 'tournaments', TOURNAMENT_ID, 'seasons', seasonId, 'teams', teamId);
  await deleteDoc(teamRef);
}

/**
 * Get points table for a season
 */
export async function getPointsTable(seasonId) {
  const seasonData = await getSeasonData(seasonId);
  return seasonData?.pointsTable || [];
}

/**
 * Update points table (admin only)
 */
export async function updatePointsTable(seasonId, pointsData) {
  await updateSeasonData(seasonId, { pointsTable: pointsData });
}

/**
 * Get stats for a season
 */
export async function getSeasonStats(seasonId) {
  const seasonData = await getSeasonData(seasonId);
  return {
    batting: seasonData?.stats?.batting || [],
    bowling: seasonData?.stats?.bowling || []
  };
}

/**
 * Update stats (admin only)
 */
export async function updateStats(seasonId, statsData) {
  await updateSeasonData(seasonId, { stats: statsData });
}

/**
 * Update tournament metadata (admin only)
 */
export async function updateTournamentMeta(metaData) {
  const tournamentRef = doc(db, 'tournaments', TOURNAMENT_ID);
  await setDoc(tournamentRef, { meta: metaData }, { merge: true });
}

/**
 * Get media for a season
 */
export async function getSeasonMedia(seasonId) {
  const seasonData = await getSeasonData(seasonId);
  return seasonData?.media || {
    images: [],
    videos: [],
    instagram: []
  };
}

/**
 * Update season media (admin only)
 */
export async function updateSeasonMedia(seasonId, mediaData) {
  await updateSeasonData(seasonId, { media: mediaData });
}