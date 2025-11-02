-- Desire Path Radio Database Schema
-- This file serves as a reference for the Supabase database structure

-- Test types
-- none: no tests
-- jest: created by a jest test
-- manual: created manually using the admin panel
CREATE TYPE test_type_enum AS ENUM ('none', 'jest', 'manual');

-- Episode status
-- draft: saved but not published
-- published: live and visible to public
CREATE TYPE episode_status_enum AS ENUM ('draft', 'published');

-- Episodes
CREATE TABLE episodes (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    aired_on DATE NOT NULL,
    audio_url TEXT NOT NULL,
    image_url TEXT,
    duration_seconds INTEGER,
    test_type test_type_enum NOT NULL DEFAULT 'none',
    status episode_status_enum NOT NULL DEFAULT 'published',
    location TEXT,
    play_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Hosts
CREATE TABLE hosts (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    organization TEXT
);

-- Episode ↔ Host join table
CREATE TABLE episode_hosts (
    episode_id INTEGER NOT NULL REFERENCES episodes(id) ON DELETE CASCADE,
    host_id INTEGER NOT NULL REFERENCES hosts(id) ON DELETE CASCADE,
    PRIMARY KEY (episode_id, host_id)
);

-- Tags
CREATE TYPE tag_type_enum AS ENUM ('CHANNEL', 'FORMAT', 'GENRE', 'TOPIC');

CREATE TABLE tags (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    type tag_type_enum NOT NULL
);

-- Episode ↔ Tag join table
CREATE TABLE episode_tags (
    episode_id INTEGER NOT NULL REFERENCES episodes(id) ON DELETE CASCADE,
    tag_id INTEGER NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
    PRIMARY KEY (episode_id, tag_id)
);

-- Episode Highlights
-- Tracks which episodes are highlighted on the homepage with display order
CREATE TABLE episode_highlights (
    id INTEGER PRIMARY KEY,
    episode_id INTEGER NOT NULL REFERENCES episodes(id) ON DELETE CASCADE,
    display_order INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Coming Up Text
-- Stores the text content for the "coming up" section
CREATE TABLE coming_up_text (
    id SERIAL PRIMARY KEY,
    content TEXT NOT NULL
);

-- Schedule Images
-- Stores uploaded schedule images
CREATE TABLE schedule_image (
    id SERIAL PRIMARY KEY,
    image_url TEXT NOT NULL,
    image_key TEXT NOT NULL,
    uploaded_at TIMESTAMP DEFAULT NOW()
);

-- Admin Logs
-- Used to track system events like database keep-alive pings
CREATE TABLE admin_logs (
    id BIGSERIAL PRIMARY KEY,
    event_type VARCHAR(50) NOT NULL,
    status VARCHAR(20) NOT NULL,
    message TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

