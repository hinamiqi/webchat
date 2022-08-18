CREATE TABLE IF NOT EXISTS message_meme_link
(
    message_id           BIGINT,
    meme_uuid            UUID,

    PRIMARY KEY( message_id, meme_uuid )
);

ALTER TABLE IF EXISTS message_meme_link owner TO postgres;

ALTER TABLE message_meme_link ADD CONSTRAINT message_fk FOREIGN KEY (message_id) REFERENCES chat_message(id);

ALTER TABLE message_meme_link ADD CONSTRAINT meme_uuid_fk FOREIGN KEY (meme_uuid) REFERENCES memes(uuid);
