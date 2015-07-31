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
// the number of occurrences of a group of tags necessary to make them "popular"
// Note: The math makes this program scalable so that it adds 1 to popular_group_tag_limit
//     every time the number of tags increase by an order of magnitude in base 10

var group_tag_count = 0;
// number of occurrences of a group of tags in arr

var popular_tag_groups = [];

for (var i=0; i<creations_arr.length; i++) {
	var cur_tag_group_str = creations_arr[i].join("");
	// parse tags array (double) as string for easy comparisons; this works as tags array is sorted
	for (var j=i+1; j<creations_arr.length; j++) {
		var comp_tag_group_str = creations_arr[j].join("");
		if (cur_tag_group_str === comp_tag_group_str) {
			group_tag_count++;
		}
		if (group_tag_count == popular_group_tag_limit) {
			popular_tag_groups.push(creations_arr[i]);
			group_tag_count=0;
		}
	}
	group_tag_count=0;
}

console.log(popular_tag_groups);