const fs = require('fs');

process.stdout.write(
`require.register("${process.argv[2]}", function(exports, require, module) {
${fs.readFileSync(process.argv[3], 'utf-8')}
});`
);
