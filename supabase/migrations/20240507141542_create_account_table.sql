create table "account" ( 
  id uuid not null default uuid_generate_v4(), 
  user_id uuid not null references "user"(id) on delete cascade, 
  name text not null, 
  description text, 
  currency currencies not null, 
  created_at timestamptz not null default now(), 
  updated_at timestamptz not null default now(), 

  primary key (id) 
)

