CREATE TABLE submissions(
    submission_id INTEGER PRIMARY KEY,
    contest TEXT,
    task TEXT,
    pagenum INTEGER,

    time_unix INTEGER,
    user_name TEXT,
    lang_name TEXT,
    lang_id INTEGER,
    score INTEGER,
    source_length INTEGER,
    status TEXT,
    time_consumption INTEGER,
    memory_consumption INTEGER
);

CREATE TABLE contests(
    contest_slug TEXT,
    contest_name TEXT,
    start_time_unix INTEGER,
    end_time_unix INTEGER
);