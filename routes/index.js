'use strict';
var express = require('express');
var router = express.Router();
// var tweetBank = require('../tweetBank');
var client = require('../db/index.js');
module.exports = function makeRouterWithSockets(io) {

  // a reusable function
  function respondWithAllTweets(req, res, next) {
    client.query('SELECT * FROM tweets INNER JOIN users ON tweets.user_id = users.id', function (err, result) {
      if (err) return next(err); // pass errors to Express
      var tweets = result.rows;
      // console.log(tweets);
      res.render('index', { title: 'Twitter.js', tweets: tweets, showForm: true });
    });
  }


  // here we basically treet the root view and tweets view as identical
  router.get('/', respondWithAllTweets);
  router.get('/tweets', respondWithAllTweets);

  // single-user page
  router.get('/users/:username', function (req, res, next) {
    client.query('SELECT content, users.name FROM tweets INNER JOIN users ON tweets.user_id = users.id WHERE users.name = $1', [req.params.username], function (err, result) {
      if (err) return next(err); // pass errors to Express
      var tweets = result.rows;
      res.render('index', { title: 'Twitter.js', tweets: tweets, showForm: true });
    });
    // var tweetsForName = tweetBank.find({ name: req.params.username });
    // res.render('index', {
    //   title: 'Twitter.js',
    //   tweets: tweetsForName,
    //   showForm: true,
    //   username: req.params.username
    // });
  });

  // single-tweet page
  router.get('/tweets/:id', function (req, res, next) {
    // var tweetsWithThatId = tweetBank.find({ id: Number(req.params.id) });
    // res.render('index', {
    //   title: 'Twitter.js',
    //   tweets: tweetsWithThatId // an array of only one element ;-)
    // });
    client.query('SELECT content, users.name FROM tweets INNER JOIN users ON tweets.user_id = users.id WHERE tweets.id = $1', [Number(req.params.id)], function (err, result) {
      if (err) return next(err); // pass errors to Express
      var tweets = result.rows;
      res.render('index', { title: 'Twitter.js', tweets: tweets, showForm: true });
    });
  });

  // create a new tweet





  // function userExists(name, content) {
  //   client.query('SELECT * FROM users WHERE users.name = $1', [name], function (err, result) {
  //     if (err) return (err);

  //     if (!result.rows.length) {
  //       createUser(name);
  //       // createTweet(user_id, content);
  //       // return result.rows;
  //     } else {
  //       createTweet(null, result);
  //       // return result.rows;
  //     }
  //   });


  router.post('/tweets', function (req, res, next) {
    client.query('SELECT * FROM users WHERE users.name = $1', [req.body.name], function (err, result) {
      if (err) return (err);

      if (!result.rows.length) {
        createUser(req.body.name);
        // createTweet(user_id, content);
        // return result.rows;
      } else {
        createTweet(null, result);
        // return result.rows;
      }
    });

    function createTweet(err, result) {
      if (err) return (err);


      client.query('INSERT INTO tweets (user_id, content) VALUES ($1, $2)', [newUserId, req.body.content], function (err, result) {
        if (err) return (err);
        res.redirect('/')
      });

      var newUserId = result.rows[0].id; // this is causing an error
      console.log('this is a tweet');
    }
    function createUser(name) {
      client.query('INSERT INTO users (name) VALUES ($1)', [name], createTweet);
    }
  });

  // // replaced this hard-coded route with general static routing in app.js
  // router.get('/stylesheets/style.css', function(req, res, next){
  //   res.sendFile('/stylesheets/style.css', { root: __dirname + '/../public/' });
  // });

  return router;
}
