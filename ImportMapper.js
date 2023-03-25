const globalImports = globalThis['##IMPORTS##'] = globalThis['##IMPORTS##'] ?? {};
const schema = 'data:application/javascript;charset=utf-8,';

const processIterable = Symbol('processRequires');
const forceDefault    = Symbol('forceDefault');

const wrapRequire   = (names, path) => schema + encodeURIComponent(`export const { ${names.join(',')} } = globalThis.require(${JSON.stringify(path)});`);
const wrapScalar    = (scalar)      => schema + encodeURIComponent(`export default ${JSON.stringify(scalar)};`);
const wrapSomething = (names, something) => {
	let type = typeof something;

	if(names[0] === forceDefault)
	{
		type = 'default-object';
	}

	const uuid = crypto.randomUUID();

	if(type === 'object')
	{
		globalImports[uuid] = something;
		return schema + encodeURIComponent(`export const { ${names.join(',')} } = globalThis['##IMPORTS##']['${uuid}'];`);
	}

	globalImports[uuid] = something;
	return schema + encodeURIComponent(`export default globalThis['##IMPORTS##']['${uuid}'];`);
};

module.exports.ImportMapper = class ImportMapper
{
	constructor(imports, options)
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

	add(name, module)
	{
		this.imports[name] = module;
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
				let names = Object.keys(path[1]);

				if(typeof path[1] === 'object' && path[1][ forceDefault ])
				{
					path[1] = path[1][ forceDefault ];
					names   = [forceDefault];
				}

				return [path[0], wrapSomething(names, path[1])];
			}

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

	static forceDefault(object)
	{
		return {[forceDefault]: object};
	}
}
