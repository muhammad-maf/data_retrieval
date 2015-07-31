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

			var creations = app.collections.creations = app.collections.creations || new CreationsCollection();
			for (var x in creations.models) {
				var tags = creations.models[x]._values.tags;
				console.log(tags);
			}

// copy paste all this in browser when u go to creations
/*
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