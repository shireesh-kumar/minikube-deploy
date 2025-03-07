const express = require("express");
const redis = require('redis');
const { Client } = require('pg');


const app = express();
const port = 3000;

app.set("view engine", "ejs");
app.use(express.json());

// Create a Redis client
const client = redis.createClient({
  socket: {
    port: 6379,
    host: "redis",
  },
});

const sql_client = new Client({
  host: 'pg-container', 
  port: 5432,
  database: 'votes',
  user: 'admin',
  password: 'admin',
});


const connectRedis = async () => {
  try {
    await client.connect(); 
    console.log("Redis client successfully connected.");
  } catch (err) {
    console.error("Error connecting to Redis:", err);
  }
};


const pushMessage = async (list, message) => {
  try {
    console.log(`Pushing message to ${list}: ${message}`);
    await client.lPush(list, message); // Push the message to the Redis list
  } catch (err) {
    console.error("Error pushing message to Redis:", err);
  }
};

async function setupDatabase() {
  try {

    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS vote_counts (
          option TEXT PRIMARY KEY,
          count INTEGER DEFAULT 0
      );
      
      INSERT INTO vote_counts (option, count)
      VALUES ('yes', 0), ('no', 0)
      ON CONFLICT (option) DO NOTHING;
    `;

    await sql_client.query(createTableQuery);
    console.log("Table created or ensured.");

  } catch (err) {
    console.error('Error setting up the database:', err.stack);
  }
}

sql_client.connect()
  .then(() => console.log('Connected to PostgreSQL'))
  .catch(err => console.error('Connection error', err.stack));

connectRedis();

(async () => {
  await setupDatabase();  
})();



app.post("/vote", async (req, res) => {
  const { vote } = req.body;
  
  // Validation for empty vote
  if (!vote || !['yes', 'no'].includes(vote)) {
    return res.status(400).json({
      message: "Invalid vote. Please send either 'yes' or 'no'.",
    });
  }

  await pushMessage('voting_queue', vote); 

  return res.status(200).json({
    message: "Vote successfully registered",
    vote,
  });
});



app.get('/result', async (req, res) => {
  try {
    const result = await sql_client.query('SELECT * FROM vote_counts WHERE option IN ($1, $2)', ['yes', 'no']);
    
    let yesVotes = 0, noVotes = 0;
    
    result.rows.forEach(row => {
      if (row.option === 'yes') yesVotes = row.count;
      if (row.option === 'no') noVotes = row.count;
    });

    const totalVotes = yesVotes + noVotes;
    const yesPercentage = totalVotes === 0 ? 0 : ((yesVotes / totalVotes) * 100).toFixed(2);
    const noPercentage = totalVotes === 0 ? 0 : ((noVotes / totalVotes) * 100).toFixed(2);

    res.render('result', { yesVotes, noVotes, yesPercentage, noPercentage });
  } catch (err) {
    console.error('Error fetching votes:', err);
    res.status(500).send('Error fetching votes');
  }
});



app.get("/", (req, res) => {
  res.render("index");
});

app.listen(port);
