"use strict";
var express = require('express');
var path = require('path');
var app = express();
const bodyParser = require("body-parser");
app.use(express.static("public")); //To grab images
app.use(bodyParser.urlencoded({
  extended: true
}));
var PORT = process.env.PORT || 8080;
app.set("view engine", "ejs");

var urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};
// routes

//GET
//app.get("url"), (req, res)

app.get("/", (req, res) => {
  res.end("Hello!");
});

app.get('/urls', (req, res) => {

  let templateVars = {
    urls: urlDatabase
  };

  res.render('urls_index', templateVars);
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.get("/urls/:id", (req, res) => {

  let templateVars = {
    shortURL: req.params.id,
    urls: urlDatabase
  };
  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  res.redirect(urlDatabase[req.params.shortURL]);
});

// POST

app.post("/urls", (req, res) => {
  if (req.body['longURL'].includes('http://')) {
    req.body = req.body['longURL']
  } else {
    req.body = req.body['longURL'].replace(/^/, 'http://');
  }
  let key = generateRandomString();
  urlDatabase[key] = req.body;
  res.send("Ok"); // Respond with 'Ok' (we will replace this)
});

//Global functions
function generateRandomString() {
  return Math.random().toString(36).substring(2, 8);
}

module.exports = app;
app.listen(8080);
