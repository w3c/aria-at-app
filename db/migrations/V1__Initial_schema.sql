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

CREATE TABLE at_name (
  id          serial primary key,
  name        text unique
);

CREATE TABLE user_to_at (
  id          serial primary key,
  at_name_id  int not null references at_name(id),
  user_id     int not null references users(id),
  unique (at_name_id, user_id)
);

CREATE TABLE at_version (
  id               serial primary key,
  at_name_id       int not null references at_name(id),
  version          varchar(256),
  release_order    int,
  unique (at_name_id, version)
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
  id             serial primary key,
  git_repo       text,
  git_tag        text,
  git_hash       text,
  git_commit_msg text,
  datetime       timestamp with time zone
);

CREATE TABLE at (
  id              serial primary key,
  key             text,
  at_name_id      int not null references at_name(id),
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
  execution_order int,
  apg_example_id  int not null references apg_example(id),
  test_version_id int not null references test_version(id)
);

CREATE TABLE test_to_at (
  id              serial primary key,
  test_id         int not null references test(id),
  at_id           int not null references at(id)
);

CREATE TABLE test_cycle (
  id              serial primary key,
  name            text,
  test_version_id int not null references test_version(id),
  created_user_id int not null references users(id),
  date            date
);

CREATE TABLE run (
  id                 serial primary key,
  test_cycle_id      int not null references test_cycle(id),
  at_version_id      int not null references at_version(id),
  at_id              int not null references at(id),
  browser_version_id int not null references browser_version(id),
  apg_example_id     int not null references apg_example(id)
);

CREATE TABLE tester_to_run (
  id              serial primary key,
  run_id          int not null references run(id),
  user_id         int not null references users(id)
);
