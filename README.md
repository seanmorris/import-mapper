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
Let's say you've got the following module, `Bar.mjs`. It exports one class, `Bar`, which extends `Foo` from module `@foo/Foo`.

The `Foo` class is brought into `Bar` via an ESM `import {...}`. However, the `Foo` class already exists in our namespace, possibly brought in via `require()`.

The objective here is to inject the *   existing* `@foo/Foo`, and prevent the need to pull the module via HTTP if it already exists in our bundled script.

#### Bar.mjs
```javascript
import { Foo } from '@foo/Foo';

export class Bar extends Foo{}
```

Now, in `main.js`, we can create an `ImportMapper` to inject `@foo/Foo` into `Bar.mjs`:

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

### Exporting a Default Object

Astute readers will notice. that the above notation does not allow for the export of a default object. This is because the keys of the top level object will always be used as the named exports for the injected module.

```javascript
const importMapper = new ImportMapper({
    'someObject': {label: 'this is an object'}
});

importMapper.register();

import('someObject').then(module => console.log(module.default));
```

Call the static method, `ImportMapper.forceDefault()` on your object, and pass the return value as your module contents to get this behavior:

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

`modules` May be one of the following:

* An array of module names to `require()` and map automatically.
* An object, keyed by module name, The values are objects where each key is an export.

#### Returns
A newly constructed `ImportMapper` object

### ImportMapper.constructor(modules)
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
