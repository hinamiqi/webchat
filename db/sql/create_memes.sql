CREATE TABLE IF NOT EXISTS memes
(
    uuid          UUID NOT NULL,
    name          varchar(255),
    image_id      BIGINT,

    PRIMARY KEY( uuid )
);

ALTER TABLE IF EXISTS memes owner TO postgres;

ALTER TABLE memes ADD CONSTRAINT image_fk FOREIGN KEY (image_id) REFERENCES images(id);

