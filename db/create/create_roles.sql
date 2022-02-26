CREATE TABLE IF NOT EXISTS roles
(
    id          BIGINT          NOT NULL,
    name        VARCHAR(20),

    PRIMARY KEY( id )
);

ALTER TABLE IF EXISTS roles owner TO postgres;