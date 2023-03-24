const globalImports = globalThis['##IMPORTS##'] = globalThis['##IMPORTS##'] ?? {};
const schema = 'data:application/javascript;charset=utf-8,';

const wrapRequire = (names, path) => schema + encodeURIComponent(
	`export const { ${names.join(',')} } = globalThis.require(${JSON.stringify(path)});`
);

const wrapScalar  = (scalar) => schema + encodeURIComponent(
	`export default ${JSON.stringify(scalar)};`
);

const wrapSomething = (name, something) => {
	switch(typeof something)
	{
		case 'function':
			globalImports[name] = something;
			return schema + encodeURIComponent(`export const ${name||something.name} = globalThis['##IMPORTS##']['${name}'];`);
		case 'object':
			globalImports[name] = something[name];
			return schema + encodeURIComponent(`export const ${name} = globalThis['##IMPORTS##']['${name}'];`);
		default:
			globalImports[name] = something[name];
			return schema + encodeURIComponent(`export default globalThis['##IMPORTS##']['${name}'];`);
	}
};

const processIterable = Symbol('processRequires');

module.exports.ImportMapper = class ImportMapper
{
	constructor(imports)
	{
		if(imports)
		{
			if(typeof imports[Symbol.iterator] !== 'function')
			{
				imports = Object.entries(imports);
			}

			Object.assign(this.imports = {}, this[processIterable](imports));
		}
	}

	generate()
	{
		const script  = document.createElement('script');
		const imports = this.imports;

		script.setAttribute('type', 'importmap');
		script.innerHTML = JSON.stringify({imports}, null, 4);
		return script;
	}

	register()
	{
		const importMap = this.generate();
		document.head.append(importMap);
		importMap.remove();
	}

	[processIterable](list)
	{
		const pairs = [...list].map(path => {

			if(Array.isArray(path) && path.length === 2)
			{
				const names = Object.keys(path[1]);

				return [path[0], wrapSomething(names[0], path[1])];
			}

			console.log(path);

			const stuff = globalThis.require(path);
			const names = Object.keys(stuff);

			if(!names.length)
			{
				return;
			}

			if(typeof stuff === 'object' || typeof stuff === 'function')
			{
				return [path, wrapRequire(names, path)];
			}
			else
			{
				return [path, wrapScalar(stuff)];
			}
		});

		return Object.fromEntries(pairs.filter(x => x));
	}
}
