alter table chat_message
alter column date type timestamp using to_timestamp(date, 'YYYY-MM-DDTHH24:MI:SS.MSZ');