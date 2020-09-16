const MongoClient = require('mongodb').MongoClient
const assert = require('assert')

const url = 'mongodb://localhost:27017'

const dbName = 'txs'

class db {

  connect() {
    // Connect to server
    MongoClient.connect(url, function(){
      assert.equal(null, err)
      console.log('Connected to mongo server')

      const db = client.db(dbName)
      client.close();
      return db
    })
  }

  insertDocuments(data, callback, db) {
    if (assert.equal(null, db)) {
      db = this.connect()
    }
    // Get the documents collection
    const collection = db.collection('documents');
    // Insert some documents
    collection.insertMany([data], function(err, result) {
      assert.equal(err, null);
      assert.equal(3, result.result.n);
      assert.equal(3, result.ops.length);
      console.log("Inserted documents into the collection");
      callback(result);
    });
  }

}

module.exports = db