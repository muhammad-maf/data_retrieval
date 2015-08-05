var MongoClient = require('mongodb').MongoClient;

MongoClient.connect('mongodb://127.0.0.1:27017/matter-and-form-api', function(err, db) {
    if(err) throw err;
 
    var creationsCollection = db.collection('creations');

    function mapFunc() {
    	this.tags.forEach(function(tag) {
    		emit(tag, 1);
    	});
    }

    function reduceFunc(tag, counts) {
    	return Array.sum(counts);
    }

    creationsCollection.mapReduce(mapFunc, reduceFunc, {
    	out: {
    		replace: "creations_tags_reduced"
    	},
    	query: {

    	}
    }, function(err, collection) {
    	if (err) {
    		return console.error(err);
    	}

    	collection.find({}).sort({value: 1}).toArray(function(err, tags) {
    		console.log(tags);
    	});
    });
   
  });