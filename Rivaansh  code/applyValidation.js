const fs = require('fs');

let serverContent = fs.readFileSync('backend/server.js', 'utf8');

// 1. Import express-validator at the top
if (!serverContent.includes("const { body, validationResult } = require('express-validator');")) {
    serverContent = serverContent.replace("const express = require('express');", "const express = require('express');\nconst { body, validationResult } = require('express-validator');");
}

const validationCheckContent = `        const errors = validationResult(req);
        if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

`;

// 2. /api/users/register
const registerOld = "app.post('/api/users/register', async (req, res, next) => {\n    try {";
const registerNew = `app.post('/api/users/register', [
    body('email').trim().isEmail().normalizeEmail().withMessage('Valid email is required'),
    body('name').trim().escape().notEmpty().withMessage('Name is required'),
    body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
], async (req, res, next) => {\n    try {\n${validationCheckContent}`;
serverContent = serverContent.replace(registerOld, registerNew);

// 3. /api/users/login
const loginOld = "app.post('/api/users/login', async (req, res, next) => {\n    try {";
const loginNew = `app.post('/api/users/login', [
    body('email').trim().isEmail().normalizeEmail().withMessage('Valid email is required'),
    body('password').notEmpty().withMessage('Password is required')
], async (req, res, next) => {\n    try {\n${validationCheckContent}`;
serverContent = serverContent.replace(loginOld, loginNew);

// 4. /api/prescriptions
const rxOld = "app.post('/api/prescriptions', async (req, res, next) => {\n    try {";
const rxNew = `app.post('/api/prescriptions', [
    body('productId').trim().notEmpty().withMessage('Product ID required'),
    body('fileName').trim().notEmpty().withMessage('File name required'),
    body('comment').optional().trim().escape()
], async (req, res, next) => {\n    try {\n${validationCheckContent}`;
serverContent = serverContent.replace(rxOld, rxNew);

// 5. /api/orders
const orderOld = "app.post('/api/orders', async (req, res, next) => {\n    try {";
const orderNew = `app.post('/api/orders', [
    body('products').isArray().withMessage('Products must be an array'),
    body('totalAmount').isNumeric().withMessage('Total amount must be numeric'),
    body('address').optional().trim().escape()
], async (req, res, next) => {\n    try {\n${validationCheckContent}`;
serverContent = serverContent.replace(orderOld, orderNew);


fs.writeFileSync('backend/server.js', serverContent);
console.log("✅ Updated validation routes");
