var methodOverride = require('method-override');
var express = require('express');
var path = require('path');
var cookieSession = require('cookie-session');
let app = express();
const bodyParser = require("body-parser");
var PORT = process.env.PORT || 8080;
var bcrypt = require('bcrypt');
var getIP = require('ipware')().get_ip;
let publicData = []; //For public urls
app.use(methodOverride('_method'));
app.use(express.static("public")); //To grab images
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(cookieSession({
  name: 'session',
  keys: ['key1', 'key2']
}))
app.set("view engine", "ejs");

/*Database
 **********
 */
let urlDatabase = {
  "b2xVn2": {
    shortURL: 'b2xVn2',
    url: "http://www.lighthouselabs.ca",
    userID: 'd3ks8f',
    clicks: '6',
    uniqueClicks: ['127.0.0.1', '192.168.15.1']
  },
  "9sm5xK": {
    shortURL: '9sm5xK',
    url: "http://www.google.com",
    userID: 't5sf3j',
    clicks: '5',
    uniqueClicks: ['127.0.0.1', '192.168.15.1']
  }
}

/*Password for test accounts
 *************
 */
var Example = bcrypt.hashSync('password', 10);
var Example2 = bcrypt.hashSync('password2', 10);
let users = {
  "d3ks8f": {
    id: "d3ks8f",
    name: "Example",
    email: "example@tinyapp.ca",
    password: Example //password
  },
  "t5sf3j": {
    id: "t5sf3j",
    name: "Example2",
    email: "example2@tinyapp.ca",
    password: Example2 //password2
  }
};

//Global functions

/*Generates random six char string
 **************
 */
function generateRandomString() {
  return Math.random().toString(36).substring(2, 8);
}

/*Checks for urls by ID
 ***********************
 *Returns one object
 *Sets Public URLS
 *Returns Object
 */
function urlsForUser(id) {
  publicData = [];
  let data = [];
  for (var x in urlDatabase) {
    if (urlDatabase[x].userID === id) {
      data[x] = {
        shortURL: urlDatabase[x].shortURL,
        url: urlDatabase[x].url,
        userID: urlDatabase[x].userID,
        clicks: urlDatabase[x].clicks,
        uniqueClicks: urlDatabase[x].uniqueClicks
      }
    } else {
      publicData[x] = {
        shortURL: urlDatabase[x].shortURL,
        url: urlDatabase[x].url
      }
    }
  }
  return data;
};

/*Gets main page
 ****************
 * Sends username to cookies
 * Grabs view from urls_index
 */

app.get('/', (req, res) => {
  let data = [];
  if (!req.session.username) {
    data = urlsForUser(null);
  } else {
    data = urlsForUser(req.session.username.id);
  }

  let templateVars = {
    username: req.session.username,
    urls: data,
    publicUrls: publicData,
    error: null
  }
  res.render('urls_index', templateVars);
});


/*Redirect to fullURL
 *********************
 *returns the full URL
 *if short URL does not exist will call 404
 */

app.get("/u/:shortURL", (req, res) => {
  urlDatabase[req.params.shortURL]['uniqueClicks'].indexOf(getIP(req)['clientIp']) === -1 ?
    urlDatabase[req.params.shortURL]['uniqueClicks'].push(getIP(req)['clientIp']) :
    null; //Really ugly line of code.
  urlDatabase[req.params.shortURL]['clicks']++;
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
  if (!req.session.username) {
    var err = new Error();
    err.status = 401;
    err.message = "Please login to continue";
    next(err);
  } else {
    let key = generateRandomString();
    urlDatabase[key] = {
      shortURL: key,
      url: req.body['longURL'],
      userID: req.session.username.id,
      clicks: '0',
      uniqueClicks: []
    }
    res.redirect('/');
  }
});

/*Deletes URL
 *************
 *Matches shortURL, deletes match
 *Redirects to /urls
 */
app.delete("/urls/:id/delete", (req, res, next) => {
  if (!req.session.username) {
    var err = new Error();
    err.status = 401;
    err.message = "Please login to continue";
    next(err);
  } else {
    let data = [];
    data = urlsForUser(req.session.username.id)
    if (data[req.params.id]) {
      delete urlDatabase[req.params.id];
      res.redirect('/');
    } else {
      var err = new Error();
      err.status = 404;
      err.message = "That short url does not exist";
      next(err);
    }
  }
});

/*Updates URL
 *************
 *Checks new URL for http
 *Replaces old URL with matching key
 *Redirects to /urls
 */
app.put("/urls/:id/update", (req, res) => {
  if (!req.session.username) {
    var err = new Error();
    err.status = 401;
    err.message = "Please login to continue";
    next(err);
  } else {
    urlDatabase[req.body['shortURL']]['url'] = req.body['longURL'];
    res.redirect('/');
  }
});

/*Creates User
 *************
 *Checks if user exists
 *Adds user to database
 */
app.post("/register", (req, res, next) => {
  let key = generateRandomString();
  if (req.body['name'] && req.body['email'] && req.body['password']) {
    for (var x in users) {
      var user = users[x];
      if (user.name === req.body['name'] || user.email === req.body['email']) {
        var err = new Error();
        err.status = 409;
        err.message = "That username or email already exists";
        return next(err);
      }
    }
  } else {
    var err = new Error();
    err.status = 406;
    err.message = "Please enter a valid email.";
    return next(err);
  }
  let hash = bcrypt.hashSync(req.body['password'], 10);
  users[key] = {
    id: key,
    name: req.body['name'],
    email: req.body['email'],
    password: hash
  };
  req.session.username = users[key];
  res.redirect('/');
});

/*Updates cookies with username
 *******************************
 *Adds cookie under username
 *Returns to /urls
 */
app.post("/login", (req, res, next) => {
  for (var key in users) {
    var user = users[key];
    if (user.email === req.body['email']) {
      if (bcrypt.compareSync(req.body['password'], user.password)) {
        req.session.username = user;
        res.redirect('/');
      } else {
        var err = new Error();
        err.status = 401;
        err.message = "Wrong password."
        next(err);
      };
    }
  }
  var err = new Error();
  err.status = 404;
  err.message = "Email is not registered."
  next(err);
});

/*Error Handle*/
app.get('*', function(req, res, next) {
  var err = new Error();
  err.status = 404;
  err.message = "Can't find that page!"
  next(err);
});
app.use(function(err, req, res, next) {
  if (!err.status) {

    return next();
  }
  let data = [];
  if (!req.session.username) {
    data = urlsForUser(null);
  } else {
    data = urlsForUser(req.session.username.id);
  }

  let templateVars = {
    urls: data,
    username: req.session.username,
    publicUrls: publicData,
    error: err
  }
  res.render('urls_index', templateVars);
});

/*Clears cookies username
 **************************
 *Clears username cookie
 *Returns to /urls
 */
app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect('/');
});

module.exports = app;
app.listen(8080);
