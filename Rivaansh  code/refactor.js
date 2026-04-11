const fs = require('fs');

let content = fs.readFileSync('backend/server.js', 'utf8');

// Replace `async (req, res) =>` with `async (req, res, next) =>`
content = content.replace(/async\s*\(\s*req\s*,\s*res\s*\)\s*=>/g, 'async (req, res, next) =>');

// Replace catch blocks that use res.status(500).json with next(error)
const catchRegex = /} catch \((.*?)\) \{[\s\S]*?res\.status\(500\)\.json\([\s\S]*?\}\);?\s*\}/g;
content = content.replace(catchRegex, (match, errName) => {
    return `} catch (${errName}) {\n        next(${errName});\n    }`;
});

fs.writeFileSync('backend/server.js', content, 'utf8');
console.log('✅ Updated server.js routes to use next(error)');
