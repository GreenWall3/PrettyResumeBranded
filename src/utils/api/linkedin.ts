/**
 * LinkedIn API Utilities
 * 
 * Functions for interacting with LinkedIn APIs via RapidAPI
 */

/**
 * Fetches LinkedIn profile data from a given URL using RapidAPI's 'linkedin-api8' endpoint
 */
export async function fetchLinkedInProfileByUrl(url: string): Promise<any> {
  try {
    // Encode URL for the API
    const encodedUrl = encodeURIComponent(url);
    const apiKey = process.env.RAPIDAPI_KEY;
    
    if (!apiKey) {
      throw new Error('RAPIDAPI_KEY is not defined in environment variables');
    }

    const response = await fetch(`https://linkedin-api8.p.rapidapi.com/get-profile-data-by-url?url=${encodedUrl}`, {
      method: 'GET',
      headers: {
        'x-rapidapi-key': apiKey,
        'x-rapidapi-host': 'linkedin-api8.p.rapidapi.com'
      }
    });

    if (!response.ok) {
      throw new Error(`LinkedIn API request failed with status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error: any) {
    console.error('Error fetching LinkedIn profile:', error);
    throw new Error(`Failed to fetch LinkedIn profile: ${error.message}`);
  }
} 