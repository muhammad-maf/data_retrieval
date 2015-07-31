// levenshtein is way better than this

			console.log("lol");
			var creations = app.collections.creations = app.collections.creations || new CreationsCollection();
			var cur_string;
			var str_comp = "Sword";
			var arr = [];
			var sub_arr = [];
			for (var x in creations.models) {
				var sub_arr = [];

				cur_string = creations.models[x]._values.title;
				var comp = cur_string.indexOf(str_comp);
				sub_arr.push(cur_string, comp);
				arr.push(sub_arr);
			}
			console.log("UNSORTED: "+arr);
			arr.sort(function (a,b) {
					return -a[1] + b[1];
				});
			console.log("SORTED: "+arr);