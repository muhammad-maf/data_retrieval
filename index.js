/*  Muhammad Mousa

    Would like to have topic distribution once we have tags that describe the same event that
    don't cooccur. This can be done with TF-IDF of tags matching a creation's description.
    Example: #gocavs & #gowarriors for bball / #vivabrazil & #vivaespana for a soccer match
    
*/

var MongoClient = require('mongodb').MongoClient;

MongoClient.connect('mongodb://127.0.0.1:27017/matter-and-form-api', function(err, db) {
    if(err) throw err;
 
    var creationsCollection = db.collection('creations');

    function mapFunc1() {
        
        var tags = this.tags;
        var all_tag_pairs = [];
        // array to hold all the possible combinations of tag pairs 

         if (isNaN(tags.join(""))) {
            // creations with tags that are all numbers aren't included
            for (var j=0; j < tags.length; j++) {
                var pair = [];
                for (var k = j+1; k < tags.length; k++) {
                    if (tags[j]!==tags[k]) {
                        // No duplicates like ["space", "space"] - we don't want a tag to be
                        // identified as being related to itself 
                        pair.push(tags[j]);
                        pair.push(tags[k]);
                        pair.sort();
                        emit ({tags: pair}, 1);
                        all_tag_pairs.push(pair);
                        pair=[];
                    }
                }
            }
         }
    }

    function reduceFunc1(tag, counts) {
        return Array.sum(counts);
    }

    console.time("mapReduce");

    creationsCollection.mapReduce(mapFunc1, reduceFunc1, {
    	out: {
    		replace: "tagpaircount"
    	},

    	query: {
            state: 1
    	},
        verbose: true
    }, function(err, tagPairCountCollection, result) {
    	if (err) {
    		return console.error(err);
    	}

        // console.log("result?", result);

        // uncomment this to print the results of the first collection
    	// tagPairCountCollection.find({}).sort({value: 1}).toArray(function(err, tags) {
        //        tags.forEach(function(tag) {
        //            console.log(JSON.stringify(tag));
        //        });
    	// });

        var popular_tags = [];
        // array to hold all the tag pairs that appear more than n times
        // see query: { value: n} in tagPairCountCollection.mapReduce below

        function mapFunc2 () {
            popular_tags.push(this._id.tags);

            // removes duplicates from array
            function uniq_fast(a) {
                var seen = {};
                var out = [];
                var len = a.length;
                var j = 0;
                for(var i = 0; i < len; i++) {
                     var item = a[i];
                     if(seen[item] !== 1) {
                           seen[item] = 1;
                           out[j++] = item;
                     }
                }
                return out;
            }
            // 

            var unique_tags_d = [].concat.apply([], popular_tags);
            // unique, popular tags, may have duplicates

            var unique_tags = uniq_fast(unique_tags_d);
            // unique, popular tags 

            var similar_sub_tags = [];
            // related tags for a particular tag 

            // Levenshtein distance, used to find the "distance" between two strings
            // identical strings have a distance of 0
            function Levenshtein (str1, str2) {
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

            for (var i=0; i < unique_tags.length; i++) {
                var cur_search = unique_tags[i];
                for (var j=0; j < popular_tags.length; j++) {
                    var found_index = popular_tags[j].indexOf(cur_search);
                    popular_tags[j].forEach(function (tag) {
                        if (Levenshtein(cur_search, tag) <= 2 && Levenshtein(cur_search, tag) > 0) {
                            found_index = 1;
                        }
                        // we want to group similar tags like matterandform and MatterandForm
                        // with a distance of 2 or less but we don't want duplicate tags
                        // with a distance of 0 (see Levenshtein Distance)
                    });
                    if (found_index !== -1) {
                        similar_sub_tags.push(popular_tags[j][1-found_index]);
                    }
                }
                emit (cur_search, similar_sub_tags);
                similar_sub_tags=[];
            }

        }

        function reduceFunc2 (tag, count) {
            count = [].concat.apply([], count);
            return {related: Array.unique(count)};
            // wrap value in an object to avoid MongoError: 
            // exception: reduce -> multiple not supported yet
        }
        
        tagPairCountCollection.mapReduce(mapFunc2, reduceFunc2, {
            out: {
                replace: "relatedtags"
            },
            query: {
                value: {$gt: 1} 
                // queries for the minimum times a pair of tags needs to appears in creations
                // option: make this value = Math.floor(Math.log(all_tag_pairs.length) / Math.log(10))
                // This can let us query for 1 greater every time the number of tag pairs increase
                // by 10x
            },
            scope: {
                popular_tags: popular_tags
            },
            verbose: true
        }, function(err, collection) {
            if (err) {
                return console.error(err);
            }
            collection.find().sort({value: 1}).toArray(function(err, tags) {
                tags.forEach(function(tag) {
                    console.log(JSON.stringify(tag));
                });
                console.timeEnd("mapReduce");
            });
        });

    });

    

});