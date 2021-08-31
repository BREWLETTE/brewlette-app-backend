require('dotenv').config();

const { execSync } = require('child_process');

const fakeRequest = require('supertest');
const app = require('../lib/app');
const client = require('../lib/client');

describe('app routes', () => {
  describe('routes', () => {
    let token;
  
    beforeAll(async () => {
      execSync('npm run setup-db');
  
      await client.connect();
      const signInData = await fakeRequest(app)
        .post('/auth/signup')
        .send({
          name: 'jon',
          email: 'jon@user.com',
          password: '1234'
        });
      
      token = signInData.body.token; // eslint-disable-line
    }, 10000);
  
    afterAll(done => {
      return client.end(done);
    });

    test('GET /returns all breweries in dummy data', async() => {
      const expectation = [
        {
          brewery_id: 200,
          name: 'Breckenridge BBQ and Brew Pub',
          visited: new Date(2021, 12, 24),
          favorited: false,
          user_id: 1
        },
        {
          brewery_id: 8352,
          name: 'Vine Street Pub and Brewery',
          visited: new Date(2021, 12, 24),
          favorited: false,
          user_id: 1
        },
        {
          brewery_id: 12916,
          name: 'Highland Tap and Burger',
          visited: new Date(2021, 12, 24),
          favorited: false,
          user_id: 1
        },
        {
          brewery_id: 13875,
          name: 'Copper Kettle Brewing Company',
          visited: new Date(2021, 12, 24),
          favorited: false,
          user_id: 1
        },
        {
          brewery_id: 13995,
          name: 'Freshcraft',
          visited: new Date(2021, 12, 24),
          favorited: false,
          user_id: 1
        }
      ];
      const data = await fakeRequest(app)
        .get('/api/breweries')
        .set('Authorization', token)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(data.body.length).toEqual(expectation.length);
    });
  });
});
