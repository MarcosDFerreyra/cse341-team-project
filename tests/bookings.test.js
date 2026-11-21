import { beforeEach, describe, expect, test } from 'vitest';
import request from 'supertest';
import app from '../app.js';
import { getDb } from '../src/db/connect.js';
import { User } from '../src/models/schemas/users.js';
import { Role } from '../src/models/schemas/roles.js';

const PASSWORD = 'test-password-123';

const sampleBookings = [
    {
        id: 'JRCUSTOMER1',
        createdAt: '2026-11-18T10:00:00.000Z',
        scheduleId: '1',
        tripId: 'alpine-panorama',
        ticketClass: 'standard',
        selectedDay: 'monday',
        // Capital letters on purpose: the email match must ignore case.
        passengers: [{ firstName: 'Yuki', lastName: 'Tanaka', email: 'Yuki@Example.com', phone: '+81 120-555-1234' }]
    },
    {
        id: 'JROTHER1',
        createdAt: '2026-11-19T10:00:00.000Z',
        scheduleId: '2',
        tripId: 'coastal-wonder',
        ticketClass: 'premium',
        selectedDay: 'friday',
        passengers: [{ firstName: 'James', lastName: 'Smith', email: 'james@example.com', phone: '+1 555-0100-1234' }]
    }
];

// Register a user through the real /register route, then log in with a
// supertest agent so the session cookie is kept between requests.
const signIn = async ({ email, username, role = 'customer' }) => {
    await request(app)
        .post('/register')
        .type('form')
        .send({ display_name: username, username, email, password: PASSWORD });

    if (role === 'admin') {
        const adminRole = await Role.findOne({ name: 'admin' });
        await User.updateOne({ email }, { role: adminRole._id });
    }

    const agent = request.agent(app);
    await agent.post('/login').type('form').send({ email, password: PASSWORD });
    return agent;
};

beforeEach(async () => {
    await User.deleteMany({});
    await getDb().collection('confirmations').insertMany(sampleBookings.map((b) => ({ ...b })));
});

describe('GET /api/bookings', () => {
    test('returns 401 when the user is not signed in', async () => {
        const response = await request(app).get('/api/bookings');
        expect(response.status).toBe(401);
    });

    test('an admin gets every booking without _id', async () => {
        const admin = await signIn({ email: 'admin@example.com', username: 'admin1', role: 'admin' });
        const response = await admin.get('/api/bookings');

        expect(response.status).toBe(200);
        expect(response.body.map((b) => b.id).sort()).toEqual(['JRCUSTOMER1', 'JROTHER1']);
        expect(response.body[0]).not.toHaveProperty('_id');
    });

    test('a customer gets only bookings where their email is a passenger', async () => {
        const customer = await signIn({ email: 'yuki@example.com', username: 'yuki' });
        const response = await customer.get('/api/bookings');

        expect(response.status).toBe(200);
        expect(response.body).toHaveLength(1);
        expect(response.body[0].id).toBe('JRCUSTOMER1');
    });
});

describe('PUT /api/bookings/:id', () => {
    test('a customer can update their own booking', async () => {
        const customer = await signIn({ email: 'yuki@example.com', username: 'yuki' });
        const response = await customer
            .put('/api/bookings/JRCUSTOMER1')
            .send({ ticketClass: 'first', selectedDay: 'Saturday' });

        expect(response.status).toBe(200);
        expect(response.body).toMatchObject({ id: 'JRCUSTOMER1', ticketClass: 'first', selectedDay: 'saturday' });
    });

    test('a customer gets 403 for a booking where they are not a passenger', async () => {
        const customer = await signIn({ email: 'yuki@example.com', username: 'yuki' });
        const response = await customer.put('/api/bookings/JROTHER1').send({ ticketClass: 'first' });

        expect(response.status).toBe(403);
        const unchanged = await getDb().collection('confirmations').findOne({ id: 'JROTHER1' });
        expect(unchanged.ticketClass).toBe('premium');
    });

    test('returns 400 for invalid data', async () => {
        const admin = await signIn({ email: 'admin@example.com', username: 'admin1', role: 'admin' });
        const response = await admin
            .put('/api/bookings/JROTHER1')
            .send({ ticketClass: 'gold', passengers: [{ firstName: '', lastName: 'Smith', email: 'not-an-email' }] });

        expect(response.status).toBe(400);
        expect(response.body.error).toBe('Invalid booking data');
        expect(response.body.details.length).toBeGreaterThanOrEqual(3);
    });

    test('returns 404 when the booking does not exist', async () => {
        const admin = await signIn({ email: 'admin@example.com', username: 'admin1', role: 'admin' });
        const response = await admin.put('/api/bookings/JRNOPE').send({ ticketClass: 'first' });

        expect(response.status).toBe(404);
        expect(response.body).toEqual({ error: 'Booking not found' });
    });
});

describe('DELETE /api/bookings/:id', () => {
    test('a customer can delete their own booking', async () => {
        const customer = await signIn({ email: 'yuki@example.com', username: 'yuki' });
        const response = await customer.delete('/api/bookings/JRCUSTOMER1');

        expect(response.status).toBe(204);
        expect(await getDb().collection('confirmations').findOne({ id: 'JRCUSTOMER1' })).toBeNull();
    });

    test('a customer cannot delete another booking', async () => {
        const customer = await signIn({ email: 'yuki@example.com', username: 'yuki' });
        const response = await customer.delete('/api/bookings/JROTHER1');

        expect(response.status).toBe(403);
    });

    test('an admin can delete any booking', async () => {
        const admin = await signIn({ email: 'admin@example.com', username: 'admin1', role: 'admin' });
        const response = await admin.delete('/api/bookings/JROTHER1');

        expect(response.status).toBe(204);
    });
});

describe('GET /admin/bookings page', () => {
    test('redirects to /login when signed out', async () => {
        const response = await request(app).get('/admin/bookings');

        expect(response.status).toBe(302);
        expect(response.headers.location).toBe('/login');
    });

    test('renders the page for a signed-in user', async () => {
        const customer = await signIn({ email: 'yuki@example.com', username: 'yuki' });
        const response = await customer.get('/admin/bookings');

        expect(response.status).toBe(200);
        expect(response.text).toContain('Booking admin');
        expect(response.text).toContain('/js/booking-admin.js');
    });

    test('the admin dashboard links to the booking admin page', async () => {
        const admin = await signIn({ email: 'admin@example.com', username: 'admin1', role: 'admin' });
        const response = await admin.get('/admin');

        expect(response.status).toBe(200);
        expect(response.text).toContain('href="/admin/bookings"');
    });
});
