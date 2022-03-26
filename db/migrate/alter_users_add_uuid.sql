alter table users
add column uuid UUID;

update users
set uuid = uuid_generate_v4()
where uuid is null;

alter table users 
alter column uuid set not null;