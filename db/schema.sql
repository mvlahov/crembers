-- Crembers WhatsApp bot — database schema (PostgreSQL).
-- Safe to run more than once: `npm run db:migrate`.

-- Everyone who has ever written to the WhatsApp number.
create table if not exists contacts (
  phone           text primary key,            -- WhatsApp id, digits only (e.g. 385911234567)
  name            text,                        -- WhatsApp profile name
  lang            text,                        -- 'en' | 'hr'; null until chosen
  role            text check (role in ('skipper', 'charter')),
  state           text not null default 'start',
  state_data      jsonb not null default '{}',
  last_inbound_at timestamptz,                 -- opens WhatsApp's 24h free-reply window
  created_at      timestamptz not null default now()
);

-- Skipper CVs.
create table if not exists skippers (
  phone            text primary key references contacts (phone) on delete cascade,
  full_name        text,
  birth_year       int,
  nationality      text,
  email            text,
  languages        text[] not null default '{}',
  licence          text,
  experience_years int,
  boat_types       text[] not null default '{}',
  base             text,
  about            text,
  complete         boolean not null default false,
  active           boolean not null default true,  -- false = paused, receives no offers
  updated_at       timestamptz not null default now()
);

-- Charter companies.
create table if not exists charters (
  phone        text primary key references contacts (phone) on delete cascade,
  company      text,
  contact_name text,
  email        text,
  updated_at   timestamptz not null default now()
);

-- Skipper requests sent in by charter companies.
create table if not exists offers (
  id             serial primary key,
  charter_phone  text references contacts (phone) on delete set null,
  company        text,
  base           text not null,
  check_in       date not null,
  check_out      date not null,
  boat_type      text not null,
  boat           text,
  languages      text[] not null default '{}',
  min_experience int not null default 0,
  fee            text,
  notes          text,
  status         text not null default 'open' check (status in ('open', 'closed')),
  created_at     timestamptz not null default now()
);

-- Which skipper got which offer and what they answered.
create table if not exists offer_recipients (
  offer_id      int not null references offers (id) on delete cascade,
  skipper_phone text not null references contacts (phone) on delete cascade,
  status        text not null default 'sent' check (status in ('sent', 'accepted', 'declined')),
  sent_at       timestamptz not null default now(),
  responded_at  timestamptz,
  primary key (offer_id, skipper_phone)
);

-- Messages waiting for the recipient to reopen the 24h window
-- (they were notified with an approved template).
create table if not exists outbox (
  id         serial primary key,
  phone      text not null references contacts (phone) on delete cascade,
  payload    jsonb not null,
  created_at timestamptz not null default now()
);

-- WhatsApp retries webhooks; this keeps every message handled exactly once.
create table if not exists processed_messages (
  id         text primary key,
  created_at timestamptz not null default now()
);

create index if not exists offers_charter_idx on offers (charter_phone, created_at desc);
create index if not exists recipients_skipper_idx on offer_recipients (skipper_phone);
create index if not exists outbox_phone_idx on outbox (phone, id);
