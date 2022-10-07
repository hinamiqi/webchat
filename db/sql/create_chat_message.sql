CREATE TABLE IF NOT EXISTS chat_message
(
    id            BIGINT NOT NULL,
    author_id     BIGINT,
    receiver_id   BIGINT,
    date          timestamp,
    text          text,
    old_text      text,

    PRIMARY KEY( id )
);

ALTER TABLE IF EXISTS chat_message owner TO postgres;

ALTER TABLE chat_message ADD CONSTRAINT author_fk FOREIGN KEY (author_id) REFERENCES users(id);
ALTER TABLE chat_message ADD CONSTRAINT receiver_fk FOREIGN KEY (receiver_id) REFERENCES users(id);

create sequence if not exists chat_message_sequence;