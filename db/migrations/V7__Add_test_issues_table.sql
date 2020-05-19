CREATE TABLE test_issue (
  id              serial primary key,
  test_id         int not null references test(id),
  run_id          int not null references run(id),
  issue_number    int not null,
  open            boolean
);
