CREATE TABLE IF NOT EXISTS user_avatar_link
(
    user_id           BIGINT,
    image_id          BIGINT,

    PRIMARY KEY( user_id, image_id )
);

ALTER TABLE IF EXISTS user_avatar_link owner TO postgres;

ALTER TABLE user_avatar_link ADD CONSTRAINT user_id_fk FOREIGN KEY (user_id) REFERENCES users(id);

ALTER TABLE user_avatar_link ADD CONSTRAINT image_id_fk FOREIGN KEY (image_id) REFERENCES images(id);
