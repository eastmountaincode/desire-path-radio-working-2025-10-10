/**
 * Evenings.fm API integration
 * Fetches live stream data from the Evenings API
 */

export interface EveningsStreamData {
  online: boolean
  name: string
  streamUrl: string
  image?: string
  description?: string
}

/**
 * Fetches stream data from the Evenings API
 * @param slug - The station slug (e.g., 'desire-path-radio-test-ab')
 * @returns Stream data including online status, name, and stream URL
 */
export async function fetchStreamData(slug: string): Promise<EveningsStreamData> {
  try {
    if (!slug) {
      throw new Error('Station slug is required')
    }

    const response = await fetch(
      `https://api.evenings.co/v1/streams/${slug}/public`
    )

    if (!response.ok) {
      throw new Error(`Failed to fetch stream data: ${response.statusText}`)
    }

    const data = await response.json()
    // console.log('Evenings stream data:', data)
    return data
  } catch (error) {
    console.error('Error fetching stream data:', error)
    throw error
  }
}
