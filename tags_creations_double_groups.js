/*	Muhammad Mousa
	
	A program that you paste in the browser console when you navigate to
	/creations on cashew. Finds all possible combinations of tag doubles
	in a creation, populates an array with all these doubles for all
	creations, and generates an array with the most popular tag doubles,
	taking into account similar spelling / typos.

	Coocurrences and edit distance are implemented

	Would like to have topic distribution once tags that describe the same event that
	don't cooccur start showing up
	(e.g., #gocavs #gowarriors for bball / #vivabrazil #vivaespana for a fifa match)

	Code is currently inefficient as hell...somewhere between
	O(n^3) and O(2^n) LOL

	Would like to implement Damereau-Levenshtein distance (don't have yet)
	for similarly named tags. Levenshtein distance doesn't take into account
	transposition

	Recommended to set creation limit to the
	max number of creations in API, Frontend and Router until a better fix is found.
*/

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

var creations = app.collections.creations = app.collections.creations || new CreationsCollection();
// assign the creations to a variable

var creations_arr, tags_arr;
// sub_arr is a tag double array
// arr is an array of array doubles for all creations

var tags;
// array of tags for each creation

creations_arr = [];

for (var i in creations.models) {
	tags = creations.models[i]._values.tags;
	var tags_len = tags.length;
	if (tags.join("") === "1234567891011121314151617181920212223242526") {
		continue;
	}
	// literally to work around Michael's broken creation
	// need a fix to ignore tags with just numbers 
	for (var j=0; j < tags_len; j++) {
		tags_arr = [];
		for (var k = j+1; k < tags_len; k++) {
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
// populate creations_arr with all the combinations of tag doubles

// console.log(creations_arr);

var creations_len = creations_arr.length;

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

var popular_tags = [];


for (var i=0; i<creations_len; i++) {
	var cur_tag_group_str = creations_arr[i].join("");
	// parse tags array (double) as string for easy comparisons; this works as tags array is sorted
	for (var j=i+1; j<creations_len; j++) {
		var comp_tag_group_str = creations_arr[j].join("");
		if (lev_dist(comp_tag_group_str, cur_tag_group_str) <= leven_lim) {
			group_tag_count++;
		}
		if (group_tag_count === pop_group_tag_lim) {
			group_tag_count=0;
			if (popular_tags.join("").indexOf(creations_arr[j]) === -1) {
				popular_tags.push(creations_arr[j]);
			}
		}
	}
	group_tag_count=0;
}

var popular_tags_len = popular_tags.length;

console.log (popular_tags);

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

var unique_related_tags = [];

for (var i=0; i < unique_tags_len; i++) {
	var cur_search = unique_tags[i];
	for (var j=0; j < popular_tags_len; j++) {
		var found_index = popular_tags[j].indexOf(cur_search);
		if (found_index !== -1) {
			similar_sub_tags.push(popular_tags[j][1-found_index]);
		}
	}
	unique_related_tags.push([cur_search, similar_sub_tags]);
	similar_sub_tags=[];
}

// console.log(unique_related_tags);