/*	Muhammad Mousa
	
	Identical to tags_creation_dist_doubles, except this compares tag triples
	Very experimental :p
*/

var min = function (a,b,c) {
	if (a < b && a < c) return a;
	if (b < a && b < c) return b;
	else return c;
}

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
            if (str1[i-1] == str2[j-1]) d[i][j] = d[i - 1][j - 1];
            else d[i][j] = Math.min(d[i-1][j], d[i][j-1], d[i-1][j-1]) + 1;
        }
    }
    return d[m][n];
}

var creations = app.collections.creations = app.collections.creations || new CreationsCollection();

var creations_arr, tags_arr;

var tags;

creations_arr = [];

for (var i in creations.models) {
	tags = creations.models[i]._values.tags;
	if (tags.join("") === "1234567891011121314151617181920212223242526") {
		continue;
	}
	for (var j=0; j < tags.length; j++) {
		tags_arr = [];
		for (var k = j+1; k < tags.length; k++) {
			for (var l = k+1; l < tags.length; l++) {
				if (tags[j]!==tags[k] && tags[j]!==tags[l] && tags[k]!==tags[l]) {
					tags_arr.push(tags[j]);
					tags_arr.push(tags[k]);
					tags_arr.push(tags[l]);
					tags_arr.sort();
					creations_arr.push(tags_arr);
					tags_arr=[];
				}
			}
		}
	}
}

var tag_triples_count = creations_arr.length;
// number of tag triples

const pop_group_tag_lim = Math.floor(Math.log(tag_triples_count) / Math.log(10));

const leven_lim = 3;

var group_tag_count = 0;

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
				popular_tag_groups.push(creations_arr[j]);
			}
		}
	}
	group_tag_count=0;
}

console.log(popular_tag_groups);