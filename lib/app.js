const fetch =  require('node-fetch');
const express = require('express');
const cors = require('cors');
const client = require('./client.js');
const app = express();
const morgan = require('morgan');
const ensureAuth = require('./auth/ensure-auth');
const createAuthRoutes = require('./auth/create-auth-routes');


app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(morgan('dev')); // http logging

const authRoutes = createAuthRoutes();

// setup authentication routes to give user an auth token
// creates a /auth/signin and a /auth/signup POST route. 
// each requires a POST body with a .email and a .password
app.use('/auth', authRoutes);

// everything that starts with "/api" below here requires an auth token!
app.use('/api', ensureAuth);

// and now every request that has a token in the Authorization header will have a `req.userId` property for us to see who's talking
app.get('/api/test', (req, res) => {
  res.json({
    message: `in this proctected route, we get the user's id like so: ${req.userId}`
  });
});


app.get('/api/breweries', async(req, res) => {
  try {
    const data = await client.query('SELECT * from breweries');
    
    res.json(data.rows);
  } catch(e) {
    
    res.status(500).json({ error: e.message });
  }
});

app.get('/api/breweries/:id', async (req, res) => {
  const id = req.params.id;
  try {
    const data = await client.query(`
    SELECT 
    breweries.brewery_id,
    breweries.name,
    breweries.visited,
    breweries.favorited,
    breweries.user_id
    FROM breweries
    WHERE breweries.id = $1
    ORDER BY breweries.id;`, [id]);

    res.json(data.rows[0]);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/api/breweries', async(req, res) => {
  try{
    const data = await client.query(`
    INSERT into breweries (brewery_id, name, visited, favorited, user_id)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING *
    `, [req.body.brewery_id, req.body.name, req.body.visited, req.body.favorited, req.userId]);

    res.json(data.rows[0]);
  } catch(e) {
    res.status(500).json({ error: e.message });
  }
});

app.put('/api/breweries/:id', async(req, res) => {
  try{
    const data = await client.query(`
    UPDATE breweries 
    SET
    brewery_id=$2,
    name=$3,
    visited=$4,
    favorited=$5,
    user_id=$6
    WHERE id = $1
    RETURNING *
    `, [req.params.id, req.body.brewery_id, req.body.name, req.body.visited, req.body.favorited, req.userId]);

    res.json(data.rows[0]);
  } catch(e) {
    res.status(500).json({ error: e.message });
  }
});

app.delete('/api/breweries/:id', async (req, res) => {
  try {
    const data = await client.query(`
    DELETE FROM breweries WHERE id=$1
    RETURNING *`, 
    [req.params.id]);
    res.json(data.rows[0]);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// -----------------------------  BREW ENDPOINTS ---------------------------------//

// ALLBREWS API ENDPOINT
app.get('/allbreweryinfo', async(req, res) => {
  try {
    const search = req.query.search;
    const apiResp = await fetch(`http://beermapping.com/webservice/loccity/${process.env.API_KEY}/${search}&s=json`);
    const apiData = await apiResp.json();
    
    const data = apiData.map((obj) => {
      return {
        brewery_id: obj.id,
        brewery_name: obj.name,
        five_mile_proxylink: obj.proxylink,
        url: obj.url,
        phone_number: obj.phone,
        address: obj.street,
        city: obj.city,
        state: obj.state,
        zip_code: obj.zip

      };
    });

    const newData = res.json(data);
    return newData;
    
  } catch(e) {
    res.status(500).json({ error: e.message });
  }
});

//BREWERY REVIEWS ENDPOINT
app.get('/breweryreviews', async(req, res) => {
  try {
    const id = req.query.id;
    const apiResp = await fetch(`http://beermapping.com/webservice/locscore/${process.env.API_KEY}/${id}&s=json`);
    const apiData = await apiResp.json();
   
    const detailsData = {
      selection: apiData[0].selection,
      service: apiData[0].service,
      atmosphere: apiData[0].atmosphere,
      food: apiData[0].food,
      reviewcount: apiData[0].reviewcount
    };
  

    const newData = res.json(detailsData);
   
    return newData;
    
  } catch(e) {
    res.status(500).json({ error: e.message });
  }
});

//BREWERY REVIEWS/DETAILS ENDPOINT
app.get('/breweryimages', async(req, res) => {
  try {
    const id = req.query.id;
    const apiResp = await fetch(`http://beermapping.com/webservice/locimage/${process.env.API_KEY}/${id}&s=json`);
    const apiData = await apiResp.json();
   
    const detailsData = {
      imageurl: apiData[0].imageurl,
    };
  
    const newData = res.json(detailsData);
    return newData;
    
  } catch(e) {
    res.status(500).json({ error: e.message });
  }
});


app.use(require('./middleware/error'));

module.exports = app;
