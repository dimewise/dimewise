create table "expense" ( 
  id uuid not null default uuid_generate_v4(), 
  account_id uuid not null references account(id) on delete cascade, 
  category_id uuid references category(id) on delete set null, -- ideally this should be not null since we want an expense to always have a category
  title text not null, 
  description text not null, 
  amount integer not null, 
  expense_date timestamptz not null, 
  created_at timestamptz not null default now(), 
  updated_at timestamptz not null default now(), 

  primary key (id) 
)

