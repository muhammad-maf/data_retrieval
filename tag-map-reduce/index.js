var MongoClient = require('mongodb').MongoClient;

MongoClient.connect('mongodb://127.0.0.1:27017/matter-and-form-api', function(err, db) {
    if(err) throw err;
 
    var creationsCollection = db.collection('creations');

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

        var creations_arr = [];
        
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
                        creations_arr.push(tags_arr);
                        tags_arr=[];
                    }
                }
            }
        }
        

        const tag_doubles_count = creations_arr.length;
        // number of tag doubles; setting length as constant is supposed to be more efficient than calling .length each time

        const pop_group_tag_lim = Math.floor(Math.log(tag_doubles_count) / Math.log(10));
        // the number of occurrences of a group of tags necessary to make them "popular"
        // Note: The math makes this program scalable so that it adds 1 to popular_group_tag_limit
        //     every time the number of tag doubles increases by an order of magnitude in base 10

        const leven_lim = 3;
        // The maximum Levenshtein distance between two strings in order for them to be considered
        // similar; 

        var group_tag_count = 0;
        // number of occurrences of a group of tags in arr

        var popular_tags = [];

        for (var i=0; i<tag_doubles_count; i++) {
            var cur_tag_group_str = creations_arr[i].join("");
            // parse tags array (double) as string for easy comparisons; this works as tags array is sorted
            for (var j=i+1; j<tag_doubles_count; j++) {
                var comp_tag_group_str = creations_arr[j].join("");
                if (lev_dist(comp_tag_group_str, cur_tag_group_str) <= leven_lim) {
                    group_tag_count++;
                }
                if (group_tag_count === pop_group_tag_lim) {
                    group_tag_count=0;
                    if (popular_tags.join("").indexOf(creations_arr[j]) === -1) {
                        emit({arr: creations_arr[j]}, 1);
                        popular_tags.push(creations_arr[j]);
                    }
                }
            }
            group_tag_count=0;
        }

        // var popular_tags_len = popular_tags.length;

        /*

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

        var similar_tags, similar_sub_tags = [];

        var unique_tags_d = [].concat.apply([], popular_tags);
        // find all the unique tags that are considered popular (flattens popular_tags)

        var unique_tags = uniq_fast(unique_tags_d);
        var unique_tags_len = unique_tags.length;
        for (var i=0; i < unique_tags_len; i++) {
            var cur_search = unique_tags[i];
            for (var j=0; j < popular_tags_len; j++) {
                var found_index = popular_tags[j].indexOf(cur_search);
                if (found_index !== -1) {
                    // emit (cur_search, popular_tags[j][1-found_index]);
                    similar_sub_tags.push(popular_tags[j][1-found_index]);
                }
            }
            // emit (cur_search, 1);
            // console.log(cur_search + " ---> " + similar_sub_tags);
            similar_sub_tags=[];
        }

        */

    }

    function reduceFunc1(tag, counts) {
        return Array.sum(counts);
    }

    creationsCollection.mapReduce(mapFunc1, reduceFunc1, {
    	out: {
    		replace: "tagDoublesCount"
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
    });

    

});