const { readFileSync, writeFileSync } = require('fs')

const packageJson = JSON.parse(readFileSync('./package.json'))
delete packageJson.scripts
delete packageJson.devDependencies
writeFileSync('./dist/package.json', JSON.stringify(packageJson, null, 2))
