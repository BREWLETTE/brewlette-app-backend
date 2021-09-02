const bcrypt = require('bcryptjs');
const client = require('../lib/client');
const breweries = require('./breweries.js');
const usersData = require('./users.js');
const { getEmoji } = require('../lib/emoji.js');

run();

async function run() {

  try {
    await client.connect();

    const users = await Promise.all(
      usersData.map(user => {
        const hash = bcrypt.hashSync(user.password, 8);
        return client.query(`
                      INSERT INTO users (name, email, hash)
                      VALUES ($1, $2, $3)
                      RETURNING *;
                  `,
        [user.name, user.email, hash]);
      })
    );
      
    const user = users[0].rows[0];

    await Promise.all(
      breweries.map(brew => {
        return client.query(`
                    INSERT INTO breweries (brewery_id, name, visited, favorited, user_id)
                    VALUES ($1, $2, $3, $4, $5);
                `,
        [brew.brewery_id, brew.name, brew.visited, brew.favorited, user.id]);
      })
    );
    

    console.log('seed data load complete', getEmoji(), getEmoji(), getEmoji());
  }
  catch(err) {
    console.log(err);
  }
  finally {
    client.end();
  }
    
}
