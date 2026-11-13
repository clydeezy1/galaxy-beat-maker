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