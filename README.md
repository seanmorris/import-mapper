# import-mapper
*Inject require()'d modules into dynamic imports()*

`import-mapper` allows you to inject pretty much anything into dynamically `import()`ed modules.

## install
Install with npm:

```bash
$ npm install import-mapper
```

## Usage
### Basic
Let's say you've got the following module, `Bar.mjs`. It exports one class, `Bar`, which extends `Foo`. The `Foo` class is brought in via an ESM `import {...}`.

The objective here is to inject the `@foo/Foo` module, and prevent the need to pull the module via HTTP if it already exists in our bundled script.

#### Bar.mjs
```javascript
import { Foo } from '@foo/Foo';

export class Bar extends Foo{}
```

Now, in `main.js`, we can create

#### main.js
```javascript
// pretend this came from elsewhere
class Foo{};

// Create the ImportMapper.
const importMapper = new ImportMapper({
    '@foo/Foo': { Foo } // "@foo/Foo" has one export: "Foo".
});

// Register it.
importMapper.register();

import('/Bar.mjs').then( module => {

    const { Bar } = module;

    const barInstance = new Bar;

    barInstance instanceof Foo
});
```

### Use with require()
#### Longhand
If the module `@foo/Foo` is available `require()`, then the above example can be modified to this:

```javascript
const importMapper = new ImportMapper({
    '@foo/Foo': require('@foo/Foo')
});
```

#### Shorthand
If `require()` is available in the global scope, and you're only importing stuff from `require()`, then you can just pass an array of module names:

```javascript
const importMapper = new ImportMapper( ['@foo/Foo'] );
```

#### Short(er)hand
If your bundler is awesome like [brunch](https://brunch.io/) is, then you can just call `require.list()` to get an array of all available module names:

```javascript
const importMapper = new ImportMapper( globalThis.require.list() );
```
