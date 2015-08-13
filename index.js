/*  Muhammad Mousa

    Would like to have topic distribution once we have tags that describe the same event that
    don't cooccur. This can be done with TF-IDF of tags matching a creation's description.
    Example: #gocavs & #gowarriors for bball / #vivabrazil & #vivaespana for a soccer match
    
*/

var MongoClient = require('mongodb').MongoClient;

console.time("MongoClient.connect");

MongoClient.connect('mongodb://127.0.0.1:27017/matter-and-form-api', function(err, db) {
    if(err) throw err;
 
    var creationsCollection = db.collection('creations');

    function mapFunc1() {
        var tags = this.tags;
        var all_tag_pairs = [];
        // array to hold all the possible combinations of tag pairs 
         if (isNaN(tags.join(""))) {
         // creations with tags that are all numbers aren't included

            tags = tags
                .filter(function (tag, index, array) {
                    return array.indexOf(tag) === index;
                    // remove duplicates
                })
                .filter(function (tag) {
                    return !(/([\uD800-\uDBFF])/g.test(tag));
                    // remove emojis
                })
                .map(function(tag) {
                    return tag.toLowerCase();
                    // lowercase all tags
                });
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

    creationsCollection.mapReduce(mapFunc1, reduceFunc1, {
    	out: {
    		replace: "tagpaircount"
    	}

    }, function(err, tagPairCountCollection, result) {
    	if (err) {
    		return console.error(err);
    	}

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
        
        db.createCollection("relatedtags");
        var relatedTagsCollection = db.collection('relatedtags');
        relatedTagsCollection.remove({});

        var popular_tags = [];
        // holds all tag pairs that appear more than n times, specified in query

        var unique_tags = [];
        // the unique tags that are popular

        var count = tagPairCountCollection.count();
        // number of tag pairs, used for median calculation

        tagPairCountCollection.find().sort({value: 1}).skip(count/2 - 1).forEach (function (x) {
            // take creations greater than the median value for tagpaircount.value
            if (x.value > 1) {
                popular_tags.push(x._id.tags);
                for (var i=0; i<2; i++) {
                    unique_tags.push(x._id.tags[i]);
                }
                console.log(x);
            }
            
        }, function() {
         // callback baby! Four months later and I finally understand why this is useful! <3 <3

            unique_tags = uniq_fast(unique_tags);

            var similar_sub_tags = [];

            for (var i=0; i < unique_tags.length; i++) {
                var cur_search = unique_tags[i];
                for (var j=0; j < popular_tags.length; j++) {
                    var found_index = popular_tags[j].indexOf(cur_search);
                    for (var k in popular_tags[j]) {
                        var lev_dist = Levenshtein(cur_search, popular_tags[j][k]);
                        if (lev_dist > 0 && lev_dist <= 3 && cur_search.length>=4 && popular_tags[j][k].length >=4) {
                            similar_sub_tags.push(popular_tags[j][k]);
                        }
                    }
                    if (found_index !== -1) {
                        similar_sub_tags.push(popular_tags[j][1-found_index]);
                    }
                }
                similar_sub_tags = uniq_fast(similar_sub_tags);
                console.log("TAG: " + cur_search + " RELATED: " + similar_sub_tags);
                relatedTagsCollection.insert({_id: cur_search, related: similar_sub_tags});
                similar_sub_tags=[];    
            }
            console.timeEnd("MongoClient.connect");
        })
    });

    

});