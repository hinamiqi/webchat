CREATE TABLE IF NOT EXISTS message_reply_link
(
    message_id           BIGINT,
    reply_message_id     BIGINT,

    PRIMARY KEY( message_id, reply_message_id )
);

ALTER TABLE IF EXISTS message_reply_link owner TO postgres;

ALTER TABLE message_reply_link ADD CONSTRAINT message_fk FOREIGN KEY (message_id) REFERENCES chat_message(id);

ALTER TABLE message_reply_link ADD CONSTRAINT reply_message_fk FOREIGN KEY (reply_message_id) REFERENCES chat_message(id);
