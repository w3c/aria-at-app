CREATE TABLE status (
  id              serial primary key,
  name            text
);

INSERT INTO status (name) VALUES
    ('skipped'),
    ('incomplete'),
    ('complete');

CREATE TABLE test_result (
  id              serial primary key,
  test_id         int not null references test(id),
  run_id          int not null references run(id),
  user_id         int not null references users(id),
  status_id       int references test_result_status(id),
  result          json
);
