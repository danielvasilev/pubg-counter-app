var express = require('express');
const getDb = require('../utils/database').getDb;
var router = express.Router();
const { exec } = require('child_process');

router.get('/', function (req, res, next) {
  let mongoConnectionStatus = getMongoConnectionStatus(getDb());
  let mongoPlayersStatus = getPlayersStatus2(getDb());
  let mongoMatchesStatus = getMatchesStatus2(getDb());
  let date = Date(Date.now());

  getCronJobStatus(cronJobStatus => {
    mongoConnectionStatus.then(mongoStatus => {
      mongoPlayersStatus.then(playersStatus => {
        mongoMatchesStatus.then(matchesStatus => {
          let payLoad = {
            cronJob: cronJobStatus,
            date: date,
            mongoStatus: mongoStatus,
            playersStatus: playersStatus,
            matchesStatus: matchesStatus
          }

          res.render('index', payLoad);
        })
      })
    });
  });
});

function renderError(res) {
  res.locals.message = 'shell command failed';
  res.locals.error = {};
  res.status(500);
  res.render('error');
}

function getMongoConnectionStatus(db) {
  return db.collection('players').find({}).toArray().then(product => {
    return {
      status: 'ON',
      statusColor: 'green'
    };
  }).catch(err => {
    console.log(err);
    return {
      status: 'OFF',
      statusColor: 'red'
    };
  });
}

function getPlayersStatus2(db) {
  return db.collection('players').find({}).toArray().then(players => {
    let total = (typeof players === 'undefined') ? 0 : players.length;
    return db.collection('players').find({ is_processed: true }).toArray().then(processedPlayers => {
      let processed = (typeof processedPlayers === 'undefined') ? 0 : processedPlayers.length;
      return {
        processed: processed,
        total: total
      };
    });
  }).catch(err => {
    console.log(err);
    return {
      processed: 0,
      total: 0
    };
  });
}

function getMatchesStatus2(db) {
  return db.collection('matches').find({}).toArray().then(matches => {
    let total = (typeof matches === 'undefined') ? 0 : matches.length;
    return db.collection('matches').find({ is_processed: true }).toArray().then(processedMatches => {
      let processed = (typeof processedMatches === 'undefined') ? 0 : processedMatches.length;
      return {
        processed: processed,
        total: total
      };
    });
  }).catch(err => {
    console.log(err);
    return {
      processed: 0,
      total: 0
    };
  });
}

function getCronJobStatus(callback) {
  const command = 'ps | grep cron-pubg.js';
  const cmdCronJob = exec(command, (err, stdout, stderr) => {
    if (err) {
      renderError(res);
    }
  });

  cmdCronJob.stdout.on('data', function (lsData) {
    let cmdCronJobResult = lsData.split('\n').filter(line => line.includes(`node cron-pubg.js`));
    return callback(getCronStatus(cmdCronJobResult));
  });
}

function getCronStatus(cmdCronJobResult) {
  if (cmdCronJobResult.length == 1) {
    return {
      status: 'ON',
      statusColor: 'green'
    }
  } else {
    return {
      status: 'OFF',
      statusColor: 'red'
    }
  }
};

module.exports = router;
