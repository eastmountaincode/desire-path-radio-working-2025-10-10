import '@testing-library/jest-dom'
import 'dotenv/config';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';


// --- Load environment variables manually ---
const envPath = path.resolve(process.cwd(), '.env.local');

if (fs.existsSync(envPath)) {
    dotenv.config({ path: envPath });
    // console.log('✅ Loaded environment from .env.local');
} else {
    console.warn('⚠️  No .env.local file found at', envPath);
}

// Global test utilities
global.createTestEpisodeData = (overrides = {}) => ({
    title: `Test Episode 1`,
    slug: `test-episode-1`,
    description: 'Test description for automated testing',
    aired_on: '2025-10-13',
    duration_seconds: 3600,
    guests: [{ name: `Test Guest 1`, organization: 'Test Org' }],
    tags: [
        { type: 'TOPIC', value: 'Technology' },
        { type: 'CHANNEL', value: 'Channel 1' }
    ],
    test_type: 'jest',
    ...overrides,
})

global.createTestEpisodeDataFromFigma = (overrides = {}) => ({
    title: `Saving the Old Growth Forest`,
    slug: `saving-the-old-growth-forest`,
    description: 'In this episode, we explore the importance of old growth forests and the threats they face. We talk about the importance of protecting these forests and the steps we can take to do so.',
    aired_on: '2025-04-18',
    duration_seconds: 3601,
    guests: [{ name: `Rebecca Thompson`, organization: 'Forest Defense Coalition' }],
    tags: [
        { type: 'FORMAT', value: 'Music' },
        { type: 'FORMAT', value: 'Environment' }
    ],
    test_type: 'jest',
    ...overrides,
})



// Cleanup function for after tests - uses existing database
global.cleanupTestData = async (supabase) => {
    if (!supabase) return

    try {
        // Delete test episodes (marked with test_type: 'jest')
        await supabase.from('episodes').delete().in('test_type', ['jest'])

        // Note: CASCADE DELETE will automatically clean up episode_guests and episode_tags
        // when episodes are deleted, so we don't need to manually delete them

        console.log('Test data cleaned up')
    } catch (error) {
        console.warn('Failed to cleanup test data:', error.message)
    }
}

