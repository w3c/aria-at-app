const request = require('supertest');
const listener = require('../../app');
const newUser = require('../mock-data/newUser.json');

const endpointUrl = '/api';

describe(endpointUrl, () => {
    it(`GET ${endpointUrl}`, async () => {
        const response = await request(listener).get(endpointUrl);
        expect(response.statusCode).toBe(200);
    });
});

const userEndpoint = `${endpointUrl}/user`;
jest.mock('../../routes/users');

describe(userEndpoint, () => {
    it(`POST ${userEndpoint}`, async () => {
        const response = await request(listener)
            .post(userEndpoint)
            .send(newUser);
        expect(response.statusCode).toBe(201);
        expect(response.body).toBeTruthy();
    });
});
