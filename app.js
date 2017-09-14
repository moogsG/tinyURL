var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser')
let app = express();
const bodyParser = require("body-parser");

app.use(express.static("public")); //To grab images
app.use(bodyParser.urlencoded({
  extended: true
}));

app.use(cookieParser())


var PORT = process.env.PORT || 8080;
app.set("view engine", "ejs");

var bcrypt = require('bcrypt');
const saltRounds = 10;
//Global functions

/*Generates random six char string
 **************
 */
function generateRandomString() {
  return Math.random().toString(36).substring(2, 8);
}

/*Not in play yet
 *************
 *
 *
 */
function httpCheck(url) {
  if (req.body['longURL'].includes('http://')) {
    return;
  } else {
    return req.body['longURL'] = req.body['longURL'].replace(/^/, 'http://');
  }
}

let urlDatabase = {
  "b2xVn2": {
    shortURL: 'b2xVn2',
    url: "http://www.lighthouselabs.ca",
    userID: 'd3ks8f'
  },
  "9sm5xK": {
    shortURL: '9sm5xK',
    url: "http://www.google.com",
    userID: 't5sf3j'
  }
};

let users = {
  "d3ks8f": {
    id: "d3ks8f",
    name: "Example",
    email: "example@tinyapp.ca",
    password: "password"
  },
  "t5sf3j": {
    id: "t5sf3j",
    name: "Example2",
    email: "example2@tinyapp.ca",
    password: "password2"
  }
};
let publicData = [];

function urlsForUser(id) {
  publicData = [];
  let data = [];
  for (var x in urlDatabase) {
    if (urlDatabase[x].userID === id) {
      console.log(urlDatabase[x])
      data[x] = {
        shortURL: urlDatabase[x].shortURL,
        url: urlDatabase[x].url,
        userID: urlDatabase[x].userID,
      }
      console.log(data);
    } else {
      publicData[x] = {
        shortURL: urlDatabase[x].shortURL,
        url: urlDatabase[x].url
      }
      console.log('Didnt match');
    }
  }
  return data;
};
// GET
/*Set Root
 **********
 */
app.get("/", (req, res) => {
  res.end("Hello!");
});

/*Gets main page
 ****************
 * Sends username to cookies
 * Grabs view from urls_index
 */
app.get('/urls', (req, res) => {
  //let id = req.cookies.username.id;
  let data = [];
  if (!req.cookies.username) {
    data = urlsForUser(null);
  } else {
    data = urlsForUser(req.cookies.username.id);
  }

  let templateVars = {
    username: req.cookies.username,
    urls: data,
    publicUrls: publicData
  }
  res.render('urls_index', templateVars);
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});


/*Redirect to fullURL
 *********************
 *returns the full URL
 *if short URL does not exist will call 404
 */
app.get("/urls/:id", (req, res, next) => {

  let templateVars = {
    username: req.cookies["user"],
    shortURL: req.params.id,
    targetURL: urlDatabase[req.params.id]
  };
  if (urlDatabase[req.params.id]) {
    res.render("urls_show", templateVars);
  } else {
    var err = new Error();
    err.status = 404;
    next(err);
  }
});

app.get("/u/:shortURL", (req, res) => {
  res.redirect(urlDatabase[req.params.shortURL]['url']);
});


// POST
/*Creates new URL
 *****************
 *Checks if http:// is present
 *Gets random key from generateRandomString
 *Adds key:url to DB
 *Redirects to /urls
 */

app.post("/urls", (req, res) => {
  if (req.body['longURL'].includes('http://')) {
    return;
  } else {
    req.body['longURL'] = req.body['longURL'].replace(/^/, 'http://');
  }
  let key = generateRandomString();
  urlDatabase[key] = {
    shortURL: key,
    url: req.body['longURL'],
    userID: req.cookies.username.id
  }
  res.redirect('/urls'); // Respond with 'Ok' (we will replace this)
});
/*Deletes URL
 *************
 *Matches shortURL, deletes match
 *Redirects to /urls
 */
app.post("/urls/:id/delete", (req, res, next) => {
  if (urlDatabase[req.params.id]) {
    delete urlDatabase[req.params.id];
    res.redirect('/urls');
  } else {
    var err = new Error();
    err.status = 404;
    next(err);
  }
});
/*Updates URL
 *************
 *Checks new URL for http
 *Replaces old URL with matching key
 *Redirects to /urls
 */
app.post("/urls/:id/update", (req, res) => {
  if (req.body['longURL'].includes('http://')) {} else {
    req.body['longURL'] = req.body['longURL'].replace(/^/, 'http://');
  }
  urlDatabase[req.body['shortURL']]['url'] = req.body['longURL'];
  res.redirect('/urls');
});

app.post("/register", (req, res, next) => {
    let key = generateRandomString();
    for (var x in users) {
      var value = users[x];
      for (var i in value) {
        if (value[i] == req.body['name'] || value[i] == req.body['email']) {
          var err = new Error();
          err.status = 404;
          return next(err);
        } else {

        }
      }
    }
    let hash = bcrypt.hashSync(req.body['password'], 10);
    users[key] = {
      id: key,
      name: req.body['name'],
      email: req.body['email'],
      password: hash
    };
    res.cookie('username', users[key]).redirect('/urls');
  })
  /*Updates cookies with username
   *******************************
   *Adds cookie under username
   *Returns to /urls
   */
app.post("/login", (req, res, next) => {
  for (var key in users) {
    var value = users[key];
    for (var email in value) {
      if (value[email] === req.body['email']) {
        if (bcrypt.compareSync(req.body['password'], value.password)) {
          res.cookie('username', value).redirect('/urls');
        } else {
          var err = new Error();
          err.status = 404;
          next(err);
        };
      }
    }
  }

  var err = new Error();
  err.status = 404;
  next(err);
});

app.use(function(err, req, res, next) {
  if (err.status !== 404) {
    return next();
  }

  res.send(err.message || '404');
});
/*Clears cookies username
 **************************
 *Clears username cookie
 *Returns to /urls
 */
app.post("/logout", (req, res) => {
  res.clearCookie('username').redirect('/urls');
});

module.exports = app;
app.listen(8080);
