CREATE TABLE IF NOT EXISTS images
(
    id            BIGINT NOT NULL,
    name          varchar(255),
    type          varchar(255),
    pic           bytea,

    PRIMARY KEY( id )
);

ALTER TABLE IF EXISTS chat_message owner TO postgres;