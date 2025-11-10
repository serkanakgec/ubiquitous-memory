const request = require('supertest');
const { app, db } = require('./app'); // Correctly import app and db

describe('Transfer API', () => {
    let server;

    beforeAll((done) => {
        // Server is not needed as supertest can directly use the app object
        // We just need to make sure the db is ready
        // The in-memory DB is initialized when app.js is required.
        done();
    });

    afterAll((done) => {
        db.close((err) => {
            if (err) console.error(err.message);
            else console.log('Test database connection closed.');
            done();
        });
    });

    let adminToken, aliceToken;
    let aliceId, bobWalletAddress;

    it('should setup users for transfer', async () => {
        // User creation and top-up logic remains the same
        const adminRes = await request(app).post('/api/auth/register').send({ email: 'admin_test@test.com', password: 'password', isAdmin: 1 });
        const aliceRes = await request(app).post('/api/auth/register').send({ email: 'alice_test@test.com', password: 'password' });
        const bobRes = await request(app).post('/api/auth/register').send({ email: 'bob_test@test.com', password: 'password' });
        aliceId = aliceRes.body.id;
        bobWalletAddress = bobRes.body.wallet_address;

        const adminLoginRes = await request(app).post('/api/auth/login').send({ email: 'admin_test@test.com', password: 'password' });
        adminToken = adminLoginRes.body.accessToken;

        await request(app).post(`/api/admin/users/${aliceId}/topup`).set('Authorization', `Bearer ${adminToken}`).send({ tokenSymbol: 'BTC', amount: 10 });

        const aliceLoginRes = await request(app).post('/api/auth/login').send({ email: 'alice_test@test.com', password: 'password' });
        aliceToken = aliceLoginRes.body.accessToken;
    });

    it('should allow a user to transfer tokens successfully', async () => {
        const res = await request(app)
            .post('/api/transfer')
            .set('Authorization', `Bearer ${aliceToken}`)
            .send({ to_wallet_address: bobWalletAddress, token_symbol: 'BTC', amount: 3 });

        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty('message', 'Transfer successful.');
    });

    it('should fail a transfer with insufficient funds', async () => {
        const res = await request(app)
            .post('/api/transfer')
            .set('Authorization', `Bearer ${aliceToken}`)
            .send({ to_wallet_address: bobWalletAddress, token_symbol: 'BTC', amount: 20 });

        expect(res.statusCode).toEqual(400);
        expect(res.body).toHaveProperty('error', 'Insufficient funds.');
    });
});
