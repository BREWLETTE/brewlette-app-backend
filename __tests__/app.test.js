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

    test('GET /breweries returns all breweries in dummy data', async() => {
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

    test('GET /breweries/:id returns an brewery by id', async() => {
      const expectation = 
        {
          brewery_id: 200,
          name: 'Breckenridge BBQ and Brew Pub',
          visited: '2022-01-24T00:00:00.000-08:00',
          favorited: false,
          user_id: 1
        };
      const data = await fakeRequest(app)
        .get('/api/breweries/1')
        .set('Authorization', token)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(data.body).toEqual(expectation);
    });

    test('POST /breweries creates a new brewery', async() => {
      const expectation = 
        {
          brewery_id: 1124,
          name: 'Triana Loves Beer',
          visited: '2022-01-24T00:00:00.000-08:00',
          favorited: false,
          user_id: 1
        };
      const data = await fakeRequest(app)
        .post('/api/breweries')
        .send(expectation)
        .set('Authorization', token)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(data.body.brewery_id).toEqual(expectation.brewery_id);
      expect(data.body.id).toBeGreaterThan(0);
    });

    test('PUT /breweries/:id updates a brewery--selected by id', async() => {
      const expectation = 
        {
          brewery_id: 1124,
          name: 'Triana Loves Beer',
          visited: '2022-01-24T00:00:00.000-08:00',
          favorited: true,
          user_id: 1
        };
      const data = await fakeRequest(app)
        .put('/api/breweries/6')
        .send(expectation)
        .set('Authorization', token)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(data.body.brewery_id).toEqual(expectation.brewery_id);
      expect(data.body.id).toBeGreaterThan(0);
    });

    // test('DELETE /breweries/:id deletes a brewery--selected by id', async() => {
    //   const deletedBrewery = 
    //     {
    //       id: 6, 
    //       brewery_id: 1124,
    //       name: 'Triana Loves Beer',
    //       visited: '2022-01-24T00:00:00.000-08:00',
    //       favorited: true,
    //       user_id: 1
    //     };
    //   await fakeRequest(app)
    //     .post('/api/breweries')
    //     .send(deletedBrewery)
    //     .set('Authorization', token)
    //     .expect('Content-Type', /json/);
    //   const data = await fakeRequest(app)
    //     .delete('/api/breweries/6')
    //     .set('Authorization', token)
    //     .expect(200)
    //     .expect('Content-Type', /json/);
    //   expect(data.body).toEqual(...deletedBrewery, id: 6 );
    // });



  });
});
