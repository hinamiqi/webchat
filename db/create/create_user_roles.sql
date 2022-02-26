CREATE TABLE IF NOT EXISTS user_roles
(
    user_id     BIGINT,
    role_id     BIGINT,

    PRIMARY KEY( user_id, role_id )
);

ALTER TABLE IF EXISTS user_roles owner TO postgres;

ALTER TABLE user_roles ADD CONSTRAINT user_roles_fk FOREIGN KEY (user_id) REFERENCES users(id);

ALTER TABLE user_roles ADD CONSTRAINT user_roles_roles_fk FOREIGN KEY (role_id) REFERENCES roles(id);
