// cd ~/Desktop
// gcc -o abc ./abc.c
// ./abc

#include <stdio.h>
#include <string.h>
#include <assert.h>

int min (int a, int b, int c) {
	if (a < b && a < c) return a;
	if (b < a && b < c) return b;
	else return c;
}

int LevenshteinDistance(char * s, int len_s, char * t, int len_t)
{ int cost;

  /* base case: empty strings */
  if (len_s == 0) return len_t;
  if (len_t == 0) return len_s;

  /* test if last characters of the strings match */
  if (s[len_s-1] == t[len_t-1]) {
  	cost = 0;
  }
  else {
  	cost = 1;
  }

  return min(LevenshteinDistance(s, len_s - 1, t, len_t    ) + 1,
                 LevenshteinDistance(s, len_s    , t, len_t - 1) + 1,
                 LevenshteinDistance(s, len_s - 1, t, len_t - 1) + cost);
}

int main () {
	char a [] = "TOPKEKm8";
	char b [] = "TOPlelm8";
	int a_len = strlen(a);
	int b_len = strlen(b);
	printf("%d\n", LevenshteinDistance(a, a_len, b, b_len));
}