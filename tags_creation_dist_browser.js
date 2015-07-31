/*	Muhammad Mousa
	
	A program that you paste in the browser when you navigate to
	/creations on cashew. Finds all possible combinations of tag doubles
	in a creation, populates an array with all these doubles for all
	creations, and generates an array with the most popular tag doubles.

	Code is currently inefficient in many places

	Need to implement Levenshtein (I have this) / Damereau-Levenshtein (don't have yet)
	distance for similarly named tags

	Recommended to set creation limit to the
	max number of creations in API, Frontend and Router until a 
	better fix is found.
*/

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
	for (var j=0; j < tags.length; j++) {
		tags_arr = [];
		for (var k = j+1; k < tags.length; k++) {
			tags_arr.push(tags[j]);
			tags_arr.push(tags[k]);
			tags_arr.sort();
			creations_arr.push(tags_arr);
			tags_arr=[];
		}
	}
}
// populate creations_arr with all the combinations of tag doubles

// console.log(creations_arr);

var tag_doubles_count = creations_arr.length;

const popular_group_tag_limit = Math.floor(Math.log(tag_doubles_count) / Math.log(10));

console.log("YOOOOOOOOOOOOOOOO" + popular_group_tag_limit);
// the number of occurrences of a group of tags necessary to make them "popular"
// 2 currently seems like a reasonable value with our data
// Note: The math makes this program scalable so that it adds 1 to popular_group_tag_limit
//     every time the number of tags increase by a order of magnitude in base 10

var group_tag_count = 0;
// number of occurrences of a group of tags in arr

var popular_tag_groups = [];

for (var i=0; i<creations_arr.length; i++) {
	var cur_tag_group_str = creations_arr[i].join("");
	for (var j=i+1; j<creations_arr.length; j++) {
		var comp_tag_group_str = creations_arr[j].join("");
		if (cur_tag_group_str === comp_tag_group_str) {
			//console.log(cur_tag_group_str + " " + comp_tag_group_str);
			group_tag_count++;
		}
	}
	if (group_tag_count>=popular_group_tag_limit) {
		popular_tag_groups.push(creations_arr[i]);
	}
	group_tag_count=0;
}

console.log(popular_tag_groups);

/*

var min = function (a,b,c) {
	if (a < b && a < c) return a;
	if (b < a && b < c) return b;
	else return c;
}

var LevenshteinDistance = function (s, len_s, t, len_t) {
	var cost;
	if (len_s ==0) return len_t;
	if (len_t ==0) return len_s;

	if (s[len_s-1] == t[len_t-1]) {
		cost=0;
	}
	else {
		cost=1;
	}
	return min(LevenshteinDistance(s, len_s - 1, t, len_t    ) + 1,
                 LevenshteinDistance(s, len_s    , t, len_t - 1) + 1,
                 LevenshteinDistance(s, len_s - 1, t, len_t - 1) + cost);
}

			console.log("lol");
			var creations = app.collections.creations = app.collections.creations || new CreationsCollection();
			var cur_string;
			var str_comp = "Swords";
			var arr = [];
			var sub_arr = [];
			for (var x in creations.models) {
				var sub_arr = [];

				cur_string = creations.models[x]._values.title;
				var leven = LevenshteinDistance(str_comp, str_comp.length, cur_string, cur_string.length);
					sub_arr.push(cur_string, leven);
				
				arr.push(sub_arr);
			}
			console.log("UNSORTED: "+arr);
			arr.sort(function (a,b) {
					return a[1] - b[1];
				});
			console.log("SORTED: "+arr);
			*/