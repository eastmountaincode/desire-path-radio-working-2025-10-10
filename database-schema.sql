-- Desire Path Radio Database Schema
-- This file serves as a reference for the Supabase database structure

-- Test types
-- none: no tests
-- jest: created by a jest test
-- manual: created manually using the admin panel
CREATE TYPE test_type_enum AS ENUM ('none', 'jest', 'manual');

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

