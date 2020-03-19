const request = require('supertest');
const listener = require('../../app');

const endpointUrl = '/api';

describe(endpointUrl, () => {
    it(`GET ${endpointUrl}`, async () => {
        const response = await request(listener).get(endpointUrl);
        expect(response.statusCode).toBe(200);
    });
});
