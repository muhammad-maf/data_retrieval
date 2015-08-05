var MongoClient = require('mongodb').MongoClient;

MongoClient.connect('mongodb://127.0.0.1:27017/matter-and-form-api', function(err, db) {
    if(err) throw err;
 
    var creationsCollection = db.collection('creations');

    function mapFunc() {
        var creations_arr = [];
    	for (var tag in this) {
            tags = this.tags;
            if (tags.join("") === "1234567891011121314151617181920212223242526") {
                continue;
            }
            // literally to work around Michael's broken creation
            // need a fix to ignore tags with just numbers 
            for (var j=0; j < tags.length; j++) {
                tags_arr = [];
                for (var k = j+1; k < tags.length; k++) {
                    if (tags[j]!==tags[k]) {
                        // No duplicates like ["space", "space"] - we don't want a tag to be identified as being similar to itself 
                        emit(tag, [tags[k], tags[k]]);
                        tags_arr.push(tags[j]);
                        tags_arr.push(tags[k]);
                        tags_arr.sort();
                        creations_arr.push(tags_arr);
                        tags_arr=[];
                    }
                }
            }
        }
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