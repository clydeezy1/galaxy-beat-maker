// searchSounds alowws me to ask for a list of sound maching the ID
// searches Freesound for sounds matching the usur's query
export async function searchSounds(query) {
    const params = new URLSearchParams({
        query,
        fields: 'id,name,previews,username,license,url',
        page_size: '5',
        format: 'json',
    });

    const response = await fetch(
        `/api/freesound/search/text/?${params}`
        );
    if (!response.ok) {
        throw new Error(`Sound request failed: ${response.status}`);
    }

    const data = await response.json();
    
    return data.results;
}
// Retrives one specific sound using its unique Freesound ID
export async function getSoundById(soundId) {
    const response = await fetch(
        `/api/freesound/sounds/${soundId}/`
    );
    if (!response.ok) {
        throw new Error(`Sound request failed: ${response.status}`);
    }

    const data = await response.json();
    return data;
}