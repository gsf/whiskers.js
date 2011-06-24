min:
	uglifyjs lib/whiskers.js > dist/whiskers.min.js

test:
	@find test/test-*.js | xargs -n 1 -t node

.PHONY: min test
