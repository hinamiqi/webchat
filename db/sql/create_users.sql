CREATE TABLE IF NOT EXISTS users
(
    id            BIGINT NOT NULL,
    username      varchar(255),
    password      varchar(255),
    uuid          UUID NOT NULL,

    PRIMARY KEY( id )
);

ALTER TABLE IF EXISTS users owner TO postgres;