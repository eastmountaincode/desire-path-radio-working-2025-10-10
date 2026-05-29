CREATE TABLE IF NOT EXISTS homepage_text (
    id SERIAL PRIMARY KEY,
    content TEXT NOT NULL
);

INSERT INTO homepage_text (id, content)
VALUES (
    1,
    'Exploratory programming where nature meets culture, for the outdoor community and beyond. Based in New York, streaming earth-wide.

Music from the underground. Talk, education, documentary, experimental, archival from the field.'
)
ON CONFLICT (id) DO NOTHING;
