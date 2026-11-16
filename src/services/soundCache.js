import { get, set } from 'idb-keyval';
const FIVE_DAYS = 5 * 24 * 60 * 60 * 1000; // 5 days in milliseconds

export async function saveSoundToCache(soundId, audioData) {
  const cacheEntry = {
    audioData,
    expiresAt: Date.now() + FIVE_DAYS
  };

  await set(`sound-${soundId}`, cacheEntry);
}

export async function getSoundFromCache(soundId) {
  const cacheEntry = await get(`sound-${soundId}`);

  if (!cacheEntry) {
    return null;
  }

  if (Date.now() > cacheEntry.expiresAt) {
    return null;
  }

  return cacheEntry.audioData;
}

export async function loadSoundWithCache(soundId, audioUrl) {
  // Step 1: Look for a previously saved sound
  const cachedSound = await getSoundFromCache(soundId);

  if (cachedSound !== null) {
    console.log("Sound loaded from cache:", soundId);
    return cachedSound;
  }

  // Step 2: Download the sound if it isn't cached
  const response = await fetch(audioUrl);

  if (!response.ok) {
    throw new Error(`Audio download failed: ${response.status}`);
  }

  // Step 3: Convert the response into audio data
  const audioData = await response.arrayBuffer();

  // Step 4: Save the downloaded audio
  await saveSoundToCache(soundId, audioData);

  console.log("Sound downloaded and cached:", soundId);

  return audioData;
}
