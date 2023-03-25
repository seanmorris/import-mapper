.PHONY: all clean

all: build/ImportMapper.js test/ImportMapper.js dist/ImportMapper.js

build/ImportMapper.js: ImportMapper.js
	npx babel ImportMapper.js -o build/ImportMapper.js

dist/ImportMapper.js: build/ImportMapper.js
	node build/wrap.js ImportMapper.js build/ImportMapper.js > dist/ImportMapper.js

test/ImportMapper.js: dist/ImportMapper.js
	cp dist/ImportMapper.js test/ImportMapper.js

clean:
	rm -f build/ImportMapper.js test/ImportMapper.js dist/ImportMapper.js
