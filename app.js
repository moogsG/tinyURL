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

var urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
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
    username: req.cookies["username"],
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
  if (req.body['longURL'].includes('http://')) {
  } else {
    req.body['longURL'] = req.body['longURL'].replace(/^/, 'http://');
  }
  urlDatabase[req.body['shortURL']] = req.body['longURL'];
  res.redirect('/urls');
});
/*Updates cookies with username
*******************************
*Adds cookie under username
*Returns to /urls
*/
app.post("/login", (req, res) => {
  res.cookie('username', req.body['username']).redirect('/urls');
});
/*Clears cookies username
**************************
*Clears username cookie
*Returns to /urls
*/
app.post("/logout", (req, res) => {
  res.clearCookie('username').redirect('/urls');
  console.log('Cookies: ', res.cookies)
});

module.exports = app;
app.listen(8080);
