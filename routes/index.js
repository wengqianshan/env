var express = require('express');
var router = express.Router();
var api = require('../api/index');
//console.log(api);
var httpd = new api.httpd();


/* GET home page. */
router.get('/', function(req, res) {
    httpd.readFile(function(conf) {
        console.log(conf)
    })
  res.render('index', { title: 'Express' });
});

module.exports = router;
