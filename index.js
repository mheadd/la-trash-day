var Botkit = require('botkit');
var request = require('request');
var async = require('async');
var config = require('./config').config

var token = process.env.SLACK_TOKEN

var controller = Botkit.slackbot()

if (token) {
  console.log("Starting in single-team mode")
  controller.spawn({ token: token }).startRTM(function(err,bot,payload) {
    if (err) {
      throw new Error('Could not connect to Slack')
    }
  })
} else {
  console.log("Starting in Beep Boop multi-team mode")
  require('beepboop-botkit').start(controller, { debug: true })
}

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
        var feature = JSON.parse(data).features[0]
        if (!feature ) {
          return bot.reply(message, 'Sorry, I was unable to look up the trashday for that address.');
        }

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
  var result = JSON.parse(geodata).results[0]
  if (!result) {
    return callback(new Error('no results returned'))
  }

  var location = result.geometry.location;
  url = config.lahub_url_template.replace('%geometry%', location.lng + ',' + location.lat);
  request(url, function(error, response, body) {
    callback(error, body);
  });
}

