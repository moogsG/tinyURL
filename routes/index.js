'use strict';
var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res) {
  res.render('index', { title: 'Express' });
});
router.get(('/register', (req, res) => {
    console.log('Register')
    res.renderPartial(_register);
    //res.render("partials/_register");
});

module.exports = router;
