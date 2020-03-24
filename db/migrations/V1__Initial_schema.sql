CREATE TABLE users (
  id          serial primary key,
  first_name  text,
  last_name   text,
  username    text,
  email       text
);

CREATE TABLE role (
  id          serial primary key,
  name        text
);

CREATE TABLE user_to_role (
  id          serial primary key,
  user_id     int not null references users(id),
  role_id     int not null references role(id)
);

CREATE TABLE at (
  id          serial primary key,
  name        text
);

CREATE TABLE user_to_at (
  id          serial primary key,
  at_id       int not null references at(id),
  user_id     int not null references users(id)
);

CREATE TABLE at_version (
  id               serial primary key,
  at_id            int not null references at(id),
  version          varchar(256),
  release_order    int
);

CREATE TABLE browser (
  id          serial primary key,
  name        text
);

CREATE TABLE browser_version (
  id               serial primary key,
  browser_id       int not null references browser(id),
  version          varchar(256),
  release_order    int
);

CREATE TABLE apg_example (
  id          serial primary key,
  name        text
);

CREATE TABLE test_version (
  id          serial primary key,
  git_repo    text,
  git_tag     text
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