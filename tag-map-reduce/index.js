var MongoClient = require('mongodb').MongoClient;

MongoClient.connect('mongodb://127.0.0.1:27017/matter-and-form-api', function(err, db) {
    if(err) throw err;
 
    var creationsCollection = db.collection('creations');

    function mapFunc() {

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
    	for (var i in this) {
            var tags = this.tags;
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
                        tags_arr.push(tags[j]);
                        tags_arr.push(tags[k]);
                        tags_arr.sort();
                        creations_arr.push(tags_arr);
                        tags_arr=[];
                    }
                }
            }
        }
        
        var tag_doubles_count = creations_arr.length;
        // number of tag doubles

        const pop_group_tag_lim = Math.floor(Math.log(tag_doubles_count) / Math.log(10));
        // the number of occurrences of a group of tags necessary to make them "popular"
        // Note: The math makes this program scalable so that it adds 1 to popular_group_tag_limit
        //     every time the number of tag doubles increases by an order of magnitude in base 10

        const leven_lim = 3;
        // The maximum Levenshtein distance between two strings in order for them to be considered
        // similar; 

        var group_tag_count = 0;
        // number of occurrences of a group of tags in arr

        var popular_tag_groups = [];

        for (var i=0; i<creations_arr.length; i++) {
            var cur_tag_group_str = creations_arr[i].join("");
            // parse tags array (double) as string for easy comparisons; this works as tags array is sorted
            for (var j=i+1; j<creations_arr.length; j++) {
                var comp_tag_group_str = creations_arr[j].join("");
                if (lev_dist(comp_tag_group_str, cur_tag_group_str) <= leven_lim) {
                    group_tag_count++;
                }
                if (group_tag_count === pop_group_tag_lim) {
                    group_tag_count=0;
                    if (popular_tag_groups.join("").indexOf(creations_arr[j]) === -1) {
                        var key = {
                            tags: creations_arr[j]
                        };
                        emit (key, 1);
                        // popular_tag_groups.push(creations_arr[j]);
                    }
                }
            }
            group_tag_count=0;
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
    		tags.forEach(function(tag) {
                console.log(JSON.stringify(tag));
            });
    	});
    });
   
  });