CREATE TABLE test_status (
  id              serial primary key,
  name            text
);

INSERT INTO test_status (name) VALUES
    ('skipped'),
    ('incomplete'),
    ('complete');

CREATE TABLE test_result (
  id              serial primary key,
  test_id         int not null references test(id),
  run_id          int not null references run(id),
  user_id         int not null references users(id),
  status_id       int references test_status(id),
  result          json
);

