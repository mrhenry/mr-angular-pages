SRC_FILES = $(shell find src -name '*.js')
LIB_FILES = $(patsubst src/%.js, lib/%.js, $(SRC_FILES))

all: lib dist

clean:
	rm -r lib dist

lib: $(SRC_FILES)
	babel --out-dir=lib --source-maps=true --module=umdStrict --stage=0 src
	@touch lib

dist: lib $(LIB_FILES)
	@mkdir -p dist
	browserify lib/index.js -o dist/mr-angular-pages.raw.js --standalone=MrAngularPages --extension=js --debug \
		--exclude fd-angular-core
	cat dist/mr-angular-pages.raw.js | exorcist dist/mr-angular-pages.js.map > dist/mr-angular-pages.js
	rm dist/mr-angular-pages.raw.js
	@touch dist

.PHONEY: all clean