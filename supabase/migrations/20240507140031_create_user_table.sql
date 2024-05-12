create table "user" ( 
  id uuid not null default uuid_generate_v4(), 
  auth_id uuid not null references auth.users(id) on delete cascade, 
  email text not null, 
  name text, 
  avatar_url text, 
  default_currency currencies not null, 
  created_at timestamptz not null default now(), 
  updated_at timestamptz not null default now(), 

  primary key (id) 
)
