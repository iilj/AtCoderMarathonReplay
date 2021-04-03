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
    memory_consumption INTEGER,
    magnification INTEGER DEFAULT 1
);

CREATE TABLE contests(
    contest_slug TEXT,
    contest_name TEXT,
    start_time_unix INTEGER,
    end_time_unix INTEGER,
    crawl_completed INTEGER DEFAULT 0,
    closed INTEGER DEFAULT 0
);

CREATE TABLE tasks(
    contest_slug TEXT,
    task_slug TEXT,
    label TEXT,
    name TEXT,
    time_limit_sec REAL,
    memory_limit_mb INTEGER,
    PRIMARY KEY(contest_slug, task_slug)
);
