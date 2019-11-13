const mongodb = require('mongodb');
const MongoClient = mongodb.MongoClient;
const username = 'dannyvas'
const password = 'cqz58XbA4M!eBBw'
let _db;
const remoteMongo = `mongodb+srv://${username}:${password}@pubg-counter-c2ecu.mongodb.net/test?retryWrites=true&w=majority`;
const localMongo = 'mongodb://localhost:27017';

const mongoConnect = callback => {
    MongoClient.connect(localMongo)
        .then(client => {
            console.log('mongodb connected');
            _db = client.db('pubg-data');
            callback();
        })
        .catch(err => {
            console.log(err);
            throw err;
        });
};

const getDb = () => {
    if (_db) {
        return _db;
    } else {
        throw 'No database found!';
    }
};

exports.mongoConnect = mongoConnect;
exports.getDb = getDb;
