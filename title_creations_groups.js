/*	Muhammad Mousa
	
	A program that you paste in the browser when you navigate to
	/creations on cashew. Finds all possible combinations of tag doubles
	in a creation, populates an array with all these doubles for all
	creations, and generates an array with the most popular tag doubles.

	Code is currently inefficient in many places

	Need to implement Levenshtein (I have this) / Damereau-Levenshtein (don't have yet)
	distance for similarly named tags

	Recommended to set creation limit to the
	max number of creations in API, Frontend and Router until a better fix is found.
*/

var min = function (a,b,c) {
	if (a < b && a < c) return a;
	if (b < a && b < c) return b;
	else return c;
}

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
            if (str1[i-1] == str2[j-1]) d[i][j] = d[i - 1][j - 1];
            else d[i][j] = Math.min(d[i-1][j], d[i][j-1], d[i-1][j-1]) + 1;
        }
    }
    return d[m][n];
}

var creations = app.collections.creations = app.collections.creations || new CreationsCollection();
// assign the creations to a variable

var creations_arr;
