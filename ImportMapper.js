const globalImports = globalThis['##IMPORTS##'] = globalThis['##IMPORTS##'] ?? {};
const schema = 'data:application/javascript;charset=utf-8,';

const processIterable = Symbol('processRequires');
const forceDefault    = Symbol('forceDefault');

const wrapRequire   = (names, path) => schema + encodeURIComponent(`export const { ${names.join(',')} } = globalThis.require(${JSON.stringify(path)});`);
const wrapScalar    = (scalar)      => schema + encodeURIComponent(`export default ${JSON.stringify(scalar)};`);
const wrapSomething = (name, something) => {
	let type = typeof something;

	if(name === forceDefault)
	{
		type = 'default-object';
	}

	console.log(name, something);

	const uuid = crypto.randomUUID();

	if(type === 'object')
	{
		globalImports[uuid] = something[name];
		return schema + encodeURIComponent(`export const ${name} = globalThis['##IMPORTS##']['${uuid}'];`);
	}

	globalImports[uuid] = something;
	return schema + encodeURIComponent(`export default globalThis['##IMPORTS##']['${uuid}'];`);
};

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

	static forceDefault(object)
	{
		return {[forceDefault]: object};
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
		// importMap.remove();
	}

	[processIterable](list)
	{
		const pairs = [...list].map(path => {

			if(Array.isArray(path) && path.length === 2)
			{
				let names = Object.keys(path[1]);

				if(typeof path[1] === 'object' && path[1][ forceDefault ])
				{
					path[1] = path[1][ forceDefault ];
					names   = [forceDefault];
				}

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
