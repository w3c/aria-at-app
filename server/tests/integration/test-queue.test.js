const { gql } = require('apollo-server');
const { query } = require('../util/graphql-test-utilities');

describe('test queue', () => {
    /* TODO: This test is a placeholder which confirms the test query APIs are
    working. It should be replaced with actual tests for the test queue as
    part of the upcoming GraphQL test queue backend task. */
    it('test query', async () => {
        expect(
            await query(
                gql`
                    query {
                        me {
                            username
                            roles
                        }
                    }
                `
            )
        ).toMatchInlineSnapshot(`
            Object {
              "me": Object {
                "roles": Array [
                  "ADMIN",
                  "TESTER",
                ],
                "username": "foobar",
              },
            }
        `);
    });
});
