var a = "XD";

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

console.log (LevenshteinDistance("ddd", 3, "xds", 3));