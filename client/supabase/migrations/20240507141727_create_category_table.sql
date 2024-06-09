create table "category" ( 
  id uuid not null default uuid_generate_v4(), 
  account_id uuid not null references account(id) on delete cascade, 
  parent_id uuid references category(id) on delete cascade,
  name text not null, 
  budget integer not null, 
  created_at timestamptz not null default now(), 
  updated_at timestamptz not null default now(), 

  primary key (id) 
)

