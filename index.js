var Botkit = require('botkit');
var request = require('request');
var async = require('async');
var config = require('./config').config

if(!process.env.SLACK_TOKEN) {
  console.error('SLACK_TOKEN is required!');
  process.exit(1);
}

var controller = Botkit.slackbot()
var bot = controller.spawn({ token: process.env.SLACK_TOKEN }).startRTM(function (err, bot, payload) {
  if(err) {
    throw new Error('Could not connect to Slack');
  }
});

controller.hears('.*', ['direct_mention'], function (bot, message) {

  // The address submitted by the user.
  var address = message.text;

  /*
   * 1. Geocode address.
   * 2. Lookup trash day using coordinates.
   * 3. Render response to user.
   */
  async.waterfall([ 
      async.apply(geoCodeAddress, address),
      lookUpTrashDay
    ], 
    function(error, data) {
      if(error) {
        bot.reply(message, 'Sorry, I was unable to look up the trashday for that address.');
      }
      else {
        var day = JSON.parse(data).features[0].attributes.Day;
        bot.reply(message, 'Your trash day is on ' + config.titleCase(day));
      }
    });
});

// Geocode the address entered by the user.
function geoCodeAddress(address, callback) {
  var url = config.geocode_url + address;
  request(url, function(error, response, body) {
    callback(error, body);
  });
}

// Look up the user's trash day.
function lookUpTrashDay(geodata, callback) {
  var location = JSON.parse(geodata).results[0].geometry.location;
  url = config.lahub_url_template.replace('%geometry%', location.lng + ',' + location.lat);
  request(url, function(error, response, body) {
    callback(error, body);
  });
}

