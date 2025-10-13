/**
 * @jest-environment node
 */

import { POST } from './route';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs';

// setup

jest.mock('next/headers', () => ({
    cookies: jest.fn(() => ({
        get: (name: string) => 
            name === 'admin_authenticated' 
                ? { value: 'true' }  // simulate logged-in admin
                : undefined,
        getAll: () => [
            { name: 'admin_authenticated', value: 'true' },
        ],
    })),
}));

beforeAll(async () => {
    const { createServerSupabase } = await import('@/lib/supabase');
    const supabase = await createServerSupabase();
    await global.cleanupTestData(supabase);
});

test('route file should load and export POST', () => {
    expect(typeof POST).toBe('function')
})

test('test episode is created correctly', async () => {
    const episode = global.createTestEpisodeData();
    expect(episode).toBeDefined();
    expect(episode.title).toBe('Test Episode 1')
    //console.log(episode);
})

describe('POST /api/admin/episodes', () => {
    it('should construct a NextResponse correctly', async () => {
        const response = new NextResponse('OK', { status: 200 });
        expect(response.status).toBe(200);
        expect(await response.text()).toBe('OK');
    });

    it('should create a real episode in supabase, even if no image', async () => {
        const episode = global.createTestEpisodeData();

        const formData = new FormData();
        formData.append('episodeData', JSON.stringify(episode));

        const audioPath = path.resolve(process.cwd(), 'public/test-assets/sound-of-waves-marine-drive-mumbai.mp3');
        const audioBuffer = fs.readFileSync(audioPath);
        const audioFile = new File([audioBuffer], 'sound-of-waves-marine-drive-mumbai.mp3', { type: 'audio/mpeg' });

        formData.append('audioFile', audioFile);

        // Build a NextRequest
        const req = new NextRequest('http://localhost:3000/api/admin/episodes', {
            method: 'POST',
            body: formData,
        });

        // Invoke the actual route handler
        const res = await POST(req);

        const data = await res.json();
        console.log('POST response:', data);

        expect(res.status).toBe(200);
        expect(data.success).toBe(true);
        expect(data.episode_id).toBeDefined();

    });

    it('should increment slug when uploading the same episode again', async () => {
        const episode = global.createTestEpisodeData();
    
        const formData = new FormData();
        formData.append('episodeData', JSON.stringify(episode));
    
        const audioPath = path.resolve(process.cwd(), 'public/test-assets/sound-of-waves-marine-drive-mumbai.mp3');
        const audioBuffer = fs.readFileSync(audioPath);
        const audioFile = new File([audioBuffer], 'sound-of-waves-marine-drive-mumbai.mp3', { type: 'audio/mpeg' });
    
        formData.append('audioFile', audioFile);
    
        const req = new NextRequest('http://localhost:3000/api/admin/episodes', {
            method: 'POST',
            body: formData,
        });
    
        const res = await POST(req);
        const data = await res.json();
    
        console.log('Duplicate upload response:', data);
    
        expect(res.status).toBe(200);
        expect(data.success).toBe(true);
        expect(data.episode_id).toBeDefined();
        expect(data.message).toContain('Episode created successfully');
        expect(data.episode_slug).toBe(`test-episode-1-1`);
    });

    it('should increment slug when uploading the same episode again... again', async () => {
        const episode = global.createTestEpisodeData();
    
        const formData = new FormData();
        formData.append('episodeData', JSON.stringify(episode));
    
        const audioPath = path.resolve(process.cwd(), 'public/test-assets/sound-of-waves-marine-drive-mumbai.mp3');
        const audioBuffer = fs.readFileSync(audioPath);
        const audioFile = new File([audioBuffer], 'sound-of-waves-marine-drive-mumbai.mp3', { type: 'audio/mpeg' });
    
        formData.append('audioFile', audioFile);
    
        const req = new NextRequest('http://localhost:3000/api/admin/episodes', {
            method: 'POST',
            body: formData,
        });
    
        const res = await POST(req);
        const data = await res.json();
    
        console.log('Duplicate upload response:', data);
    
        expect(res.status).toBe(200);
        expect(data.success).toBe(true);
        expect(data.episode_id).toBeDefined();
        expect(data.message).toContain('Episode created successfully');
        expect(data.episode_slug).toBe(`test-episode-1-2`);
    });
});

afterAll(async () => {
    const { createServerSupabase } = await import('@/lib/supabase');
    const supabase = await createServerSupabase();
    await global.cleanupTestData(supabase);
});
