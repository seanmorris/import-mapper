# import-mapper
*Inject require()'d modules into dynamic imports()*

`import-mapper` allows you to inject pretty much anything into dynamically `import()`ed modules.

Please report issues to https://github.com/seanmorris/import-mapper/issues

## install
Install with npm:

```bash
$ npm install import-mapper
```

*Or*, include with unpkg:
```html
<script src = "https://unpkg.com/commonjs-require-definition/require.js"></script>
<script src = "https://unpkg.com/import-mapper/dist/ImportMapper.js"></script>
```

## Usage
### Basic
Let's say you've got the following module, `Bar.mjs`. It exports one class, `Bar`, which extends `Foo` from module `@foo/Foo`.

#### Bar.mjs
```javascript
import { Foo } from '@foo/Foo';

export class Bar extends Foo{}
```

The `Foo` class is brought into `Bar` via an ESM `import {...}`. However, the `Foo` class already exists in our namespace, possibly brought in via `require()`.

The objective here is to inject the *existing* `@foo/Foo`, and prevent the need to pull the module via HTTP if it already exists in our bundled script.


Now, in `main.js`, we can create an `ImportMapper` to inject `@foo/Foo` into `Bar.mjs`:

#### main.js
```javascript
const { ImportMapper } = require('import-mapper');

// pretend this came from elsewhere
class Foo{};

// Create the ImportMapper.
const importMapper = new ImportMapper({
    '@foo/Foo': { Foo } // "@foo/Foo" has one export: "Foo".
});

// Register it.
importMapper.register();

// Import Bar.
import('/Bar.mjs').then( module => {

    // Get the class...
    const { Bar } = module;

    // Create the instance
    const barInstance = new Bar;

    // Check that Bar extends Foo
    console.log(barInstance instanceof Foo);
});
```

### Use with require()
#### Longhand
If the module `@foo/Foo` is available via `require()`, then we can declare our `ImportMapper` like so:

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

This will map all modules available to `require()` to dynamic imports.

### Scalars

Bare scalar values will be returned as the default export of a module:

```javascript
const importMapper = new ImportMapper({
    'someString': 'this is a string'
});

importMapper.register();

import('someString').then(module => console.log(module.default));
```

Wrap the scalar in an object if you need a named export:

```javascript
const importMapper = new ImportMapper({
    'someString': {someString: 'this is a string'}
});

importMapper.register();

import('someString').then(module => console.log(module.someString));
```

### Multiple Exports
You can pass an object with multiple keys to get a module with multiple exports.

```javascript
// pretend this came from elsewhere
class Foo{};
class Baz{};

// Create the ImportMapper.
const importMapper = new ImportMapper({
    '@foo/Foo': { Foo, Baz } // "@foo/Foo" has two exports: "Foo" and "Baz".
});
````

### Exporting a Default Object
Astute readers will notice that the above notation does not allow for the export of a default object. This is because the keys of the top level object will always be used as the named exports for the injected module.

```javascript
const importMapper = new ImportMapper({
    'someObject': {label: 'this is an object'}
});

importMapper.register();

import('someObject').then(module => console.log(module.label));
```

Pass the module content into the **static method** `ImportMapper.forceDefault()` and use the return value to get this behavior:

```javascript
const importMapper = new ImportMapper({
    'someObject': ImportMapper.forceDefault({label: 'this is an object'})
});

importMapper.register();

import('someObject').then(module => console.log(module.default));
```

## Methods
### ImportMapper.constructor(modules)
Create a new `ImportMapper`.

#### Parameters
* `modules` - A list of modules to inject

  May be one of the following:
  * An object, keyed by module name, each value is an object where the keys are the module's exports.
  * An array of module names to `require()` and map automatically.

#### Returns
A newly constructed `ImportMapper` object

### ImportMapper.register()
Register the imports.

#### Parameters
*none*
#### Returns
*none*

### ImportMapper.forceDefault(object)
**Static method**, returns an object that will be treated as the default export from the module.

#### Parameters
* `object` - The object to use as the default export
#### Returns
Returns a wrapped module object.
