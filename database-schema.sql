-- Desire Path Radio Database Schema
-- This file serves as a reference for the Supabase database structure

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
    is_test BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Guests
CREATE TABLE guests (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    organization TEXT
);

-- Episode ↔ Guest join table
CREATE TABLE episode_guests (
    episode_id INTEGER NOT NULL REFERENCES episodes(id) ON DELETE CASCADE,
    guest_id INTEGER NOT NULL REFERENCES guests(id) ON DELETE CASCADE,
    PRIMARY KEY (episode_id, guest_id)
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

