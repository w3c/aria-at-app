CREATE TABLE users (
  id          serial primary key,
  fullname    text,
  username    text unique,
  email       text
);

CREATE TABLE role (
  id          serial primary key,
  name        text unique
);

CREATE TABLE user_to_role (
  id          serial primary key,
  user_id     int not null references users(id),
  role_id     int not null references role(id),
  unique (user_id, role_id)
);

CREATE TABLE at (
  id          serial primary key,
  name        text unique
);

CREATE TABLE user_to_at (
  id          serial primary key,
  at_id       int not null references at(id),
  user_id     int not null references users(id),
  unique (at_id, user_id)
);

CREATE TABLE at_version (
  id               serial primary key,
  at_id            int not null references at(id),
  version          varchar(256),
  release_order    int,
  unique (at_id, version)
);

CREATE TABLE browser (
  id          serial primary key,
  name        text unique
);

CREATE TABLE browser_version (
  id               serial primary key,
  browser_id       int not null references browser(id),
  version          varchar(256),
  release_order    int,
  unique (browser_id, version)
);

CREATE TABLE test_version (
  id          serial primary key,
  git_repo    text,
  git_tag     text,
  git_hash    text,
  datetime    timestamp with time zone
);

CREATE TABLE at_key (
  id              serial primary key,
  key             text,
  at_id           int not null references at(id),
  test_version_id int not null references test_version(id)
);

CREATE TABLE apg_example (
  id              serial primary key,
  directory       text,
  name            text,
  test_version_id int not null references test_version(id)
);

CREATE TABLE test (
  id              serial primary key,
  name            text,
  file            text,
  apg_example_id  int not null references apg_example(id),
  test_version_id int not null references test_version(id)
);

CREATE TABLE round (
  id              serial primary key,
  test_version_id int not null references test_version(id),
  created_user_id int not null references users(id),
  date            date
);

CREATE TABLE tester_to_round (
  id              serial primary key,
  round_id        int not null references round(id),
  user_id         int not null references users(id)
);

CREATE TABLE run (
  id                 serial primary key,
  round_id           int not null references round(id),
  at_version_id      int not null references at_version(id),
  browser_version_id int not null references browser_version(id),
  apg_example_id     int not null references apg_example(id)
);

CREATE TABLE test_to_run (
  id                 serial primary key,
  run_id             int not null references run(id),
  test_id            int not null references test(id),
  execution_order    int
);
