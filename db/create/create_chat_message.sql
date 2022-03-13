CREATE TABLE IF NOT EXISTS chat_message
(
    id            BIGINT NOT NULL,
    author_id     BIGINT,
    date          VARCHAR(30),
    text          text,

    PRIMARY KEY( id )
);

ALTER TABLE IF EXISTS chat_message owner TO postgres;

ALTER TABLE chat_message ADD CONSTRAINT user_fk FOREIGN KEY (author_id) REFERENCES users(id);

create sequence if not exists chat_message_sequence;