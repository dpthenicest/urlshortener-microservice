require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const dns = require('dns');
const bodyParser = require('body-parser');
const crypto = require('crypto');

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));

// Middleware to parse application/x-www-form-urlencoded requests
app.use(bodyParser.urlencoded({ extended: true }));

let urlMap = {}; // Store mapping of short URL to original URL

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

// Post request to /api/shorturl
app.post('/api/shorturl', (req, res) => {

  const originalUrl =  req.body.url;
    // console.log(req.theurl, " 2");

    const urlRegex = /^(http|https):\/\/[^ "]+$/;
    if(!urlRegex.test(originalUrl)){
      return res.json({error: "Invalid url"});
    }

    const urlObject = new URL(originalUrl);

    // Call the dns_lookup function
    dns_lookup(originalUrl, urlObject.hostname, (err, shortUrl) => {
      if (err) {
        return res.json({error: "Invalid url"});
      }

      res.json({original_url: originalUrl, short_url: shortUrl});
    });
});

const dns_lookup = (originalUrl, url, callback) => {
  dns.lookup(url, (err, address, family) => {
    if (err) {
      return callback(err);
    }

    // Generate short URL (You might want a better logic here)
    const shortUrl = generateShortUrl(originalUrl);

    urlMap[shortUrl] = originalUrl;
    
    callback(null, shortUrl);
  });
};

app.get("/api/shorturl/:shorturl", (req,res) => {
  const shortUrl = req.params.shorturl;
  // console.log(req.params.shorturl, " 3");
  // Redirect to the original URL
  const originalUrl = urlMap[shortUrl];
  if (originalUrl) {
    console.log(originalUrl, 'kpai kpoi');
    res.redirect(301, originalUrl);
  } else {
    res.json({error: "Short URL not found"});
  }
})

function generateShortUrl(originalUrl) {
  const hash = crypto.createHash('sha256');
  hash.update(originalUrl);
  const shortUrl = hash.digest('hex').substr(0, 8); // Generate an 8-character hash
  return shortUrl;
}

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
