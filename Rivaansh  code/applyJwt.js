const fs = require('fs');

let serverContent = fs.readFileSync('backend/server.js', 'utf8');

// 1. Fix the syntax error from previous regex on requireAuth function
serverContent = serverContent.replace(/function requireAuth\([\s\S]*?\}\s*\)\;/, (match) => {
    // If it ends with }); we remove the ');'
    if (match.endsWith(');')) {
         return match.slice(0, -2);
    }
    return match;
});

// Remove function requireAuth entirely because we'll replace it with authMiddleware
serverContent = serverContent.replace(/const JWT_SECRET[\s\S]*?\}\n/g, (match) => {
    if (match.includes('requireAuth')) {
        return `// Replaced by authMiddleware.js\nconst authMiddleware = require('./middleware/authMiddleware');\n`;
    }
    return match;
});

serverContent = serverContent.replace(/function requireAuth[\s\S]*?catch \([\s\S]*?\n\}\;?\n?/g, (match) => {
    if (match.includes("next(err);")) {
        return "";
    }
    return match;
});

// In case the above remove didn't work perfectly due to the syntax error earlier
const requireAuthRegex = /function requireAuth\(req, res, next\) \{[\s\S]*?catch \(err\) \{\s*next\(err\);\s*\}\n\}\)?\;?/g;
serverContent = serverContent.replace(requireAuthRegex, '');

// Import jsonwebtoken at the top
if (!serverContent.includes("const jwt = require('jsonwebtoken');")) {
    serverContent = serverContent.replace("const express = require('express');", "const express = require('express');\nconst jwt = require('jsonwebtoken');");
}

// 2. Modify /api/users/login to generate JWT
const loginMatch = /const user = await User\.findOne\(\{ email: normalizedEmail \}\);\s*if \(user && \(await user\.matchPassword\(password\)\)\) \{\s*res\.json\(\{([\s\S]*?)\}\);\s*\} else \{/g;
serverContent = serverContent.replace(loginMatch, `const user = await User.findOne({ email: normalizedEmail });

        if (user && (await user.matchPassword(password))) {
            const token = jwt.sign({ id: user._id }, process.env.SESSION_SECRET || 'rivaansh_jwt_secret_key_2024', { expiresIn: '30d' });
            res.json({
                token,
                uid: user._id,
                name: user.name,
                email: user.email,
                isAdmin: user.isAdmin
            });
        } else {`);

// 3. Modify /api/users/register to generate JWT
const registerMatch = /const user = await User\.create\(\{[\s\S]*?\}\);\s*res\.status\(201\)\.json\(\{([\s\S]*?)\}\);/g;
serverContent = serverContent.replace(registerMatch, `const user = await User.create({
            name,
            email: normalizedEmail,
            phone: phone || '9999999999',
            password
        });

        const token = jwt.sign({ id: user._id }, process.env.SESSION_SECRET || 'rivaansh_jwt_secret_key_2024', { expiresIn: '30d' });

        res.status(201).json({
            token,
            uid: user._id,
            name: user.name,
            email: user.email,
            isAdmin: user.isAdmin
        });`);

// 4. Swap requireAuth for authMiddleware in routes
serverContent = serverContent.replace(/requireAuth/g, "authMiddleware");


fs.writeFileSync('backend/server.js', serverContent);
console.log("✅ Modified server.js");
