SRC_FILES = $(shell find src -name '*.js')
LIB_FILES = $(patsubst src/%.js, lib/%.js, $(SRC_FILES))

all: lib dist doc

clean:
	rm -r lib dist

doc: dist
	./node_modules/.bin/jsdoc -r -d ./doc ./dist/*.js
	@touch doc

lib: $(SRC_FILES)
	./node_modules/.bin/babel --out-dir=lib --source-maps=true --module=umdStrict --stage=0 src
	@touch lib

dist: lib $(LIB_FILES)
	@mkdir -p dist
	./node_modules/.bin/browserify lib/index.js -o dist/mr-angular-pages.raw.js --standalone=MrAngularPages --extension=js --debug \
		--exclude fd-angular-core \
		--exclude mr-util
	cat dist/mr-angular-pages.raw.js | ./node_modules/.bin/exorcist dist/mr-angular-pages.js.map > dist/mr-angular-pages.js
	rm dist/mr-angular-pages.raw.js
	@touch dist

deploy: doc
	@bash ./script/deploy-docs.sh

.PHONEY: all clean deploy
