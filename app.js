var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser')
var app = express();
const bodyParser = require("body-parser");

app.use(express.static("public")); //To grab images
app.use(bodyParser.urlencoded({
  extended: true
}));

app.use(cookieParser())

var PORT = process.env.PORT || 8080;
app.set("view engine", "ejs");

var urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};


// routes
app.get("/", (req, res) => {
  res.end("Hello!");
});

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

app.get("/urls/:id/delete", (req, res) => {
  let templateVars = {
    username: req.cookies["username"],
    urls: urlDatabase
  };

  res.render('urls_index', templateVars);
});

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
app.post("/urls", (req, res) => {
  if (req.body['longURL'].includes('http://')) {
  } else {
    req.body['longURL'] = req.body['longURL'].replace(/^/, 'http://');
  }
  let key = generateRandomString();
  urlDatabase[key] = req.body['longURL'];
  res.redirect('/urls'); // Respond with 'Ok' (we will replace this)
});

app.post("/urls/:id/delete", (req, res) => {
  if (urlDatabase[req.params.id]) {
    delete urlDatabase[req.params.id];
    res.redirect('/urls');
  } else {
    res.send("Does not exist");
  }

});

app.post("/urls/:id/update", (req, res) => {
  if (req.body['longURL'].includes('http://')) {

  } else {
    req.body['longURL'] = req.body['longURL'].replace(/^/, 'http://');
  }
  urlDatabase[req.body['shortURL']] = req.body['longURL'];
  res.redirect('/urls');

});

app.post("/login", (req, res) => {
  res.cookie('username', req.body['username']).redirect('/urls');
});

app.post("/logout", (req, res) => {
  res.clearCookie('username').redirect('/urls');
  console.log('Cookies: ', res.cookies)
});

//Global functions
function generateRandomString() {
  return Math.random().toString(36).substring(2, 8);
}

function httpCheck(url) {
  if (req.body['longURL'].includes('http://')) {
    return;
  } else {
    return req.body['longURL'] = req.body['longURL'].replace(/^/, 'http://');
  }
}


module.exports = app;
app.listen(8080);
