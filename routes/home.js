'use strict';

var express = require('express');
var router = express.Router();

router.get('/', function(req, res)
{
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.render('index');
});

module.exports = router;
