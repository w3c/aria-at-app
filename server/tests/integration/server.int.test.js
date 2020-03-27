const request = require('supertest');
const listener = require('../../app');

const endpointUrl = '/api';

describe(endpointUrl, () => {
    it(`GET ${endpointUrl}`, async () => {
        const response = await request(listener).get(endpointUrl);
        expect(response.statusCode).toBe(200);
    });
});

const userEndpoint = `${endpointUrl}/user`;
const newUser = require('../mock-data/newUser.json');
const newUserToRole = require('../mock-data/newUserToRole.json');
jest.mock('../../routes/users');

describe(userEndpoint, () => {
    it(`POST ${userEndpoint}`, async () => {
        const response = await request(listener)
            .post(userEndpoint)
            .send(newUser);
        expect(response.statusCode).toBe(201);
        expect(response.body).toBeTruthy();
    });
    it(`POST ${userEndpoint}/role`, async () => {
        const response = await request(listener)
            .post(`${userEndpoint}/role`)
            .send(newUserToRole);
        expect(response.statusCode).toBe(201);
        expect(response.body).toBeTruthy();
    });
});
