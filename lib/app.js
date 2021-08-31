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

app.get('/breweryinfo', async(req, res) => {
  try {
    const search = req.query.search;
    const apiResp = await fetch(`http://beermapping.com/webservice/loccity/${process.env.API_KEY}/${search}&s=json`);
    const apiData = await apiResp.json();
    // console.log(apiData)
    const returnData = {
      brewery_id: apiData[0].id,
      brewery_name: apiData[0].name,
      five_mile_proxylink: apiData[0].proxylink,
      url: apiData[0].url,
      phone_number: apiData[0].phone,
      address: apiData[0].street,
      city: apiData[0].city,
      state: apiData[0].state,
      zip_code: apiData[0].zip,
    
    };
  
    res.json(returnData);
  } catch(e) {
      
    res.status(500).json({ error: e.message });
  }
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


// app.get('/breweryinfo', async(req, res) => {
//   try {
//     // const search = req.query.search;
//     const apiResp = await fetch(`http://beermapping.com/webservice/loccity/${process.env.API_KEY}/bend,or&s=json`);
//     const apiData = await apiResp.json();
//     const returnData = {
//       brewery_id: apiData[0].id,
//       brewery_name: apiData[0].name,
//       five_mile_proxylink: apiData[0].proxylink,
//       url: apiData[0].url,
//       phone_number: apiData[0].phone,
//     };
  
//     res.json(returnData);
//   } catch(e) {
      
//     res.status(500).json({ error: e.message });
//   }
// });





app.use(require('./middleware/error'));

module.exports = app;


// heroku.com/breweryinfo?search=userinput
//reroll if it's too far: display map after roulette runs