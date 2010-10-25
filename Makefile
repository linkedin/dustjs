#
# Run all tests
#
test:
	node test/server.js

#
# Run the benchmarks
#
bench:
	node benchmark/server.js

#
# Build the docs
#
docs:
	node docs/build.js

.PHONY: test docs bench