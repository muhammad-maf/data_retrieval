var MongoClient = require('mongodb').MongoClient;

MongoClient.connect('mongodb://127.0.0.1:27017/matter-and-form-api', function(err, db) {
    if(err) throw err;
 
    var creationsCollection = db.collection('creations');
    var creations_arr = [];
    var popular_tags = [];

    function mapFunc1() {
        // Levenshtein distance, used for similar string comparison
        var lev_dist = function (str1, str2) {
            var m = str1.length,
                n = str2.length,
                d = [],
                i, j;
         
            if (!m) return n;
            if (!n) return m;
            for (i = 0; i <= m; i++) d[i] = [i];
            for (j = 0; j <= n; j++) d[0][j] = j;
         
            for (j = 1; j <= n; j++) {
                for (i = 1; i <= m; i++) {
                    if (str1[i-1] === str2[j-1]) d[i][j] = d[i - 1][j - 1];
                    else d[i][j] = Math.min(d[i-1][j], d[i][j-1], d[i-1][j-1]) + 1;
                }
            }
            return d[m][n];
        }

        //var creations_arr = [];
        
        var tags = this.tags;
        var tags_len = tags.length;
        if (tags.join("") !== "1234567891011121314151617181920212223242526") {
            // literally to work around Michael's broken creation
            // need a fix to ignore tags with just numbers
            for (var j=0; j < tags.length; j++) {
                tags_arr = [];
                for (var k = j+1; k < tags.length; k++) {
                    if (tags[j]!==tags[k]) {
                        // No duplicates like ["space", "space"] - we don't want a tag to be identified as being similar to itself 
                        tags_arr.push(tags[j]);
                        tags_arr.push(tags[k]);
                        tags_arr.sort();
                        emit ({a: tags_arr}, 1);
                        creations_arr.push(tags_arr);
                        tags_arr=[];
                    }
                }
            }
        }
        

    }

    function reduceFunc1(tag, counts) {
        return Array.sum(counts);
    }

    creationsCollection.mapReduce(mapFunc1, reduceFunc1, {
    	out: {
    		replace: "tagDoublesCount"
    	},
        scope: {
            creations_arr: creations_arr,
            popular_tags: popular_tags
        },
    	query: {
            state: 1
    	},
        verbose: true
    }, function(err, popularTagsCollection, result) {
    	if (err) {
    		return console.error(err);
    	}

        console.log("result?", result);

    	popularTagsCollection.find({}).sort({value: 1}).toArray(function(err, tags) {
    		tags.forEach(function(tag) {
                console.log(JSON.stringify(tag));
            });
    	});

        function mapFunc2 () {
            //this = {_id: {arr: [tag1, tag2]}, value: n};
        }

        function reduceFunc2 (tag, count) {
            var lmao = {a: count};
            return lmao;
        }
        /*
        popularTagsCollection.mapReduce(mapFunc2, reduceFunc2, {
            out: {
                replace: "NewCollection"
            },
            query: {

            },
            verbose: true
        }, function(err, collection) {
            if (err) {
                return console.error(err);
            }
            collection.find({}).sort({value: 1}).toArray(function(err, tags) {
                tags.forEach(function(tag) {
                    console.log(JSON.stringify(tag));
                });
            });
        });
        */
    });

    

});