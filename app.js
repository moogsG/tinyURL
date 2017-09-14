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

function compare(users) {
  if (users.name === req.body['name']) {
    return 'HI';
  } else {
    return data;
  }
}

let urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
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

  let templateVars = {
    username: req.cookies["username"],
    urls: urlDatabase
  };

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
app.get("/urls/:id", (req, res) => {

  let templateVars = {
    username: req.cookies["name"],
    shortURL: req.params.id,
    targetURL: urlDatabase[req.params.id]
  };
  if (urlDatabase[req.params.id]) {
    res.render("urls_show", templateVars);
  } else {
    res.send("404");
  }
});

app.get("/u/:shortURL", (req, res) => {
  res.redirect(urlDatabase[req.params.shortURL]);
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
  urlDatabase[key] = req.body['longURL'];
  res.redirect('/urls'); // Respond with 'Ok' (we will replace this)
});
/*Deletes URL
 *************
 *Matches shortURL, deletes match
 *Redirects to /urls
 */
app.post("/urls/:id/delete", (req, res) => {
  if (urlDatabase[req.params.id]) {
    delete urlDatabase[req.params.id];
    res.redirect('/urls');
  } else {
    res.send("Does not exist");
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
  urlDatabase[req.body['shortURL']] = req.body['longURL'];
  res.redirect('/urls');
});

app.post("/register", (req, res) => {
    let key = generateRandomString();
    for (var x in users) {
      var value = users[x];
      for (var i in value) {
        if (value[i] == req.body['name'] || value[i] == req.body['email']) {
          res.send('Duplicate Found').redirect('/urls')
        } else {
          console.log('didnt work')
        }
      }
    }
    users[key] = {
      id: key,
      name: req.body['name'],
      email: req.body['email'],
      password: req.body['password']
    };
    console.log(users);
    res.cookie('username', req.body['name']).redirect('/urls');
  })
  /*Updates cookies with username
   *******************************
   *Adds cookie under username
   *Returns to /urls
   */
app.post("/login", (req, res) => {
  for (var key in users) {
    var value = users[key];
    for (var email in value) {
      if (value[email] === req.body['email']) {
        for (var pass in value) {
          if (value[pass] === req.body['password']) {
            res.cookie('username', value['name']).redirect('/urls');
          }
        }
      }
    }
        res.send('Not valid email and password');
        console.log('didnt work')
  }
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
