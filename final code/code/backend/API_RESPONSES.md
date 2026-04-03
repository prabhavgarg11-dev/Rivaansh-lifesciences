# 📡 API RESPONSE EXAMPLES

## GET /api/products

### Request
```
GET http://localhost:5000/api/products
```

### Response (Status 200)
```json
[
  {
    "id": 1,
    "name": "Vitamin C 1000mg Tablets",
    "price": 299,
    "originalPrice": 399,
    "badge": "Popular",
    "prescriptionRequired": false,
    "category": "vitamins",
    "image": "https://images.unsplash.com/photo-1587854692152-cbe660dbde0e?w=400&h=400&fit=crop",
    "description": "High-potency vitamin C supplement for immune support and antioxidant protection. Safe for daily use.",
    "composition": "Ascorbic Acid (Vitamin C) 1000mg, Cellulose, Magnesium Stearate",
    "rating": 4.8,
    "reviews": 156
  },
  {
    "id": 2,
    "name": "Multivitamin Adult Formula",
    "price": 449,
    "originalPrice": 599,
    "badge": "Best Seller",
    "prescriptionRequired": false,
    "category": "vitamins",
    "image": "https://images.unsplash.com/photo-1584308666744-24d5f400f905?w=400&h=400&fit=crop",
    "description": "Complete multivitamin with 25 essential nutrients for overall health and wellness.",
    "composition": "Vitamin A, B-Complex, Vitamin C, Vitamin D3, Vitamin E, Zinc, Iron, Calcium, Magnesium, and 15+ other minerals",
    "rating": 4.7,
    "reviews": 342
  },
  {
    "id": 3,
    "name": "Omega-3 Fish Oil 1000mg",
    "price": 549,
    "originalPrice": 699,
    "badge": null,
    "prescriptionRequired": false,
    "category": "supplements",
    "image": "https://images.unsplash.com/photo-1598103442097-8b74394b95c6?w=400&h=400&fit=crop",
    "description": "Pure fish oil with EPA and DHA for heart, brain, and joint health. Molecularly distilled.",
    "composition": "Fish Oil 1000mg (containing EPA 300mg, DHA 200mg per capsule), Soft Gelatin Capsule, Tocopherol",
    "rating": 4.9,
    "reviews": 289
  },
  {
    "id": 4,
    "name": "Aspirin 75mg (Cardioprotective)",
    "price": 199,
    "originalPrice": null,
    "badge": null,
    "prescriptionRequired": true,
    "category": "medicines",
    "image": "https://images.unsplash.com/photo-1587854692152-cbe660dbde0e?w=400&h=400&fit=crop",
    "description": "Low-dose aspirin for cardiovascular protection. Consult doctor before use.",
    "composition": "Acetylsalicylic Acid (Aspirin) 75mg, Microcrystalline Cellulose, Croscarmellose Sodium",
    "rating": 4.6,
    "reviews": 428
  },
  {
    "id": 5,
    "name": "Metformin 500mg (Diabetes)",
    "price": 279,
    "originalPrice": null,
    "badge": "Prescription",
    "prescriptionRequired": true,
    "category": "medicines",
    "image": "https://images.unsplash.com/photo-1587854692152-cbe660dbde0e?w=400&h=400&fit=crop",
    "description": "Antidiabetic medication for blood sugar management. Requires valid prescription.",
    "composition": "Metformin Hydrochloride 500mg, Magnesium Stearate, Sodium Carboxymethyl Cellulose",
    "rating": 4.5,
    "reviews": 867
  },
  {
    "id": 6,
    "name": "Calcium + Vitamin D3 Tablet",
    "price": 399,
    "originalPrice": 499,
    "badge": "Trending",
    "prescriptionRequired": false,
    "category": "vitamins",
    "image": "https://images.unsplash.com/photo-1584308666744-24d5f400f905?w=400&h=400&fit=crop",
    "description": "Calcium and Vitamin D3 for strong bones and teeth. Perfect for all ages.",
    "composition": "Calcium Carbonate 500mg, Cholecalciferol (Vitamin D3) 400IU per tablet, Cellulose, Magnesium Stearate",
    "rating": 4.8,
    "reviews": 512
  },
  {
    "id": 7,
    "name": "Probiotic Supplement (30 Billion CFU)",
    "price": 599,
    "originalPrice": 799,
    "badge": null,
    "prescriptionRequired": false,
    "category": "supplements",
    "image": "https://images.unsplash.com/photo-1587854692152-cbe660dbde0e?w=400&h=400&fit=crop",
    "description": "Multi-strain probiotic for digestive health. Supports gut microbiome balance.",
    "composition": "Lactobacillus acidophilus, Bifidobacterium longum, Lactobacillus rhamnosus (30 Billion CFU), Inulin, Vegetable Capsule",
    "rating": 4.7,
    "reviews": 234
  },
  {
    "id": 8,
    "name": "Iron Supplement 65mg (Anaemia)",
    "price": 349,
    "originalPrice": 449,
    "badge": null,
    "prescriptionRequired": false,
    "category": "vitamins",
    "image": "https://images.unsplash.com/photo-1598103442097-8b74394b95c6?w=400&h=400&fit=crop",
    "description": "Ferrous Sulfate supplement for iron deficiency and anaemia management with Vitamin C.",
    "composition": "Ferrous Sulfate 65mg (equivalent to Iron 20mg), Ascorbic Acid 100mg, Cellulose, Magnesium Stearate",
    "rating": 4.6,
    "reviews": 178
  }
]
```

---

## GET /api/products/1

### Request
```
GET http://localhost:5000/api/products/1
```

### Response (Status 200)
```json
{
  "id": 1,
  "name": "Vitamin C 1000mg Tablets",
  "price": 299,
  "originalPrice": 399,
  "badge": "Popular",
  "prescriptionRequired": false,
  "category": "vitamins",
  "image": "https://images.unsplash.com/photo-1587854692152-cbe660dbde0e?w=400&h=400&fit=crop",
  "description": "High-potency vitamin C supplement for immune support and antioxidant protection. Safe for daily use.",
  "composition": "Ascorbic Acid (Vitamin C) 1000mg, Cellulose, Magnesium Stearate",
  "rating": 4.8,
  "reviews": 156
}
```

---

## GET /api/products/99 (Not Found)

### Response (Status 404)
```json
{
  "error": "Product not found"
}
```

---

## GET /api/products/category/vitamins

### Request
```
GET http://localhost:5000/api/products/category/vitamins
```

### Response (Status 200)
```json
[
  {
    "id": 1,
    "name": "Vitamin C 1000mg Tablets",
    "price": 299,
    ...
  },
  {
    "id": 2,
    "name": "Multivitamin Adult Formula",
    "price": 449,
    ...
  },
  {
    "id": 6,
    "name": "Calcium + Vitamin D3 Tablet",
    "price": 399,
    ...
  },
  {
    "id": 8,
    "name": "Iron Supplement 65mg (Anaemia)",
    "price": 349,
    ...
  }
]
```

---

## GET /api/products/category/medicines

### Response (Status 200)
```json
[
  {
    "id": 4,
    "name": "Aspirin 75mg (Cardioprotective)",
    "price": 199,
    "prescriptionRequired": true,
    ...
  },
  {
    "id": 5,
    "name": "Metformin 500mg (Diabetes)",
    "price": 279,
    "prescriptionRequired": true,
    ...
  }
]
```

---

## GET /api/products/category/supplements

### Response (Status 200)
```json
[
  {
    "id": 3,
    "name": "Omega-3 Fish Oil 1000mg",
    "price": 549,
    ...
  },
  {
    "id": 7,
    "name": "Probiotic Supplement (30 Billion CFU)",
    "price": 599,
    ...
  }
]
```

---

## GET /health

### Request
```
GET http://localhost:5000/health
```

### Response (Status 200)
```json
{
  "status": "OK",
  "message": "Server is running",
  "timestamp": "2025-04-01T10:30:45.123Z"
}
```

---

## GET /

### Request
```
GET http://localhost:5000/
```

### Response (Status 200)
```json
{
  "name": "Rivaansh Lifesciences Backend API",
  "version": "1.0.0",
  "message": "Server running successfully",
  "endpoints": {
    "GET /api/products": "Fetch all products",
    "GET /api/products/:id": "Fetch single product by ID",
    "GET /api/products/category/:category": "Fetch products by category",
    "GET /health": "Server health check"
  }
}
```

---

## Error Responses

### Invalid Route (Status 404)
```
GET http://localhost:5000/invalid/route
```

Response:
```json
{
  "success": false,
  "message": "Route not found",
  "path": "/invalid/route",
  "method": "GET"
}
```

### Server Error (Status 500)
```json
{
  "error": "Error fetching products",
  "message": "Connection failed"
}
```

---

## Frontend Usage Example

```javascript
// Fetch all products (as your frontend does)
const res = await fetch('http://localhost:5000/api/products');
const products = await res.json();
console.log(products); // Array of 8 products

// Fetch single product
const res = await fetch('http://localhost:5000/api/products/1');
const product = await res.json();
console.log(product); // Single product object

// Fetch by category
const res = await fetch('http://localhost:5000/api/products/category/vitamins');
const vitaminProducts = await res.json();
console.log(vitaminProducts); // Array of vitamin products
```

---

## CORS Headers Included

All responses include these headers:
```
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization
```

This allows your frontend to fetch from any origin/port.

---

## Summary

**All endpoints return JSON** - no HTML, no errors
**All response codes are correct** - 200 for success, 404 for not found, 500 for errors
**All products have required fields** - id, name, price, image, description, composition
**CORS is configured** - frontend can fetch without issues
