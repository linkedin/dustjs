#
# Run all tests
#
test:
	node test/server.js

#
# Run jasmine-test
#
jasmine:
	node test/jasmine-test/server/specRunner.js helpersTests

#
# Run code coverage and generate report
#
coverage:
	cover run test/server.js && cover report && cover report html

#
# Build the docs
#
docs:
	node docs/build.js

#
# Build dust.js
#

VERSION = ${shell cat package.json | grep version | grep -o '[0-9]\.[0-9]\.[0-9]\+'}


SRC = lib
VERSION = ${shell cat package.json | grep version | grep -o '[0-9]\.[0-9]\.[0-9]\+'}
HELPERS = dist/dust-helpers-${VERSION}.js


define HEADER
//
// Dust-helpers - Addional functionality for dustjs-linkedin package v${VERSION}
//
// Copyright (c) 2012, LinkedIn
// Released under the MIT License.
//

endef

export HEADER

helpers:
	@@mkdir -p dist
	@@touch ${HELPERS}
	@@echo "$$HEADER" > ${HELPERS}
	@@cat ${SRC}/dust-helpers.js >> ${HELPERS}
	@@echo ${HELPERS} built

release: clean docs min
	git add dist/*
	git commit -a -m "release v${VERSION}"
	git tag -a -m "version v${VERSION}" v${VERSION}
	npm publish

.PHONY: test docs bench parser
