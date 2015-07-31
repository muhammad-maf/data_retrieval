/*	Muhammad Mousa
	
	A program that you paste in the browser when you navigate to
	/creations on cashew. Recommended to set creation limit to the
	max number of creations in API, Frontend and Router until a 
	better fix is found.
*/

var creations = app.collections.creations = app.collections.creations || new CreationsCollection();
// assign the creations to a variable

var arr, sub_arr;
// sub_arr is a tag double array
// arr is an array of array doubles for all creations

var tags;
// array of tags for each creation

arr = [];

for (var i in creations.models) {
	tags = creations.models[i]._values.tags;
	arr=[];
	for (var j=0; j < tags.length; j++) {
		sub_arr = [];
		for (var k = j+1; k < tags.length; k++) {
			sub_arr.push(tags[j]);
			sub_arr.push(tags[k]);
			sub_arr.sort();
			arr.push(sub_arr);
			sub_arr=[];
		}
	}
}
console.log(arr);


/*
for (var i=0; i<arr.length; i++) {
	for (var j=i+1; j<arr.length; j++) {
		
	}
}
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