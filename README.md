# Bitfest_2025_Preli
# Chllenge 2

```markdown
# Recipe Management API Documentation

A RESTful API for managing recipes, ingredients, and recipe recommendations using an LLM-based chatbot.

## Base URL
```
http://localhost:3000
```

## Endpoints

### Database Health Check
- Route: `/`
- Method: `GET`
- Response: `{ "hello": "world" }`

### Ingredients Management

#### Get All Ingredients
- Route: `/ingredients`
- Method: `GET`
- Sample Response:
```json
[
  {
    "_id": "123",
    "name": "Sugar",
    "quantity": "500",
    "unit": "g",
    "expiryDate": "2024-12-31T00:00:00.000Z"
  }
]
```

#### Add Ingredient(s)
- Route: `/ingredients`
- Method: `POST`
- Supports both single ingredient and bulk insertion
- Sample Payload (Single):
```json
{
  "name": "Sugar",
  "quantity": "500",
  "unit": "g",
  "expiryDate": "2024-12-31"
}
```

#### Update Ingredient
- Route: `/ingredients/:id`
- Method: `PUT`
- Sample Payload:
```json
{
  "quantity": "750"
}
```

### Recipe Management

#### Get All Recipes
- Route: `/recipes`
- Method: `GET`
- Sample Response:
```json
[
  {
    "_id": "123",
    "name": "Chocolate Cake",
    "ingredients": ["flour", "sugar", "cocoa powder"],
    "instructions": "Mix all ingredients...",
    "taste": "sweet",
    "cuisine": "dessert",
    "prepTime": 60
  }
]
```

#### Add Recipe
- Route: `/recipes`
- Method: `POST`
- Sample Payload:
```json
{
  "name": "Chocolate Cake",
  "ingredients": ["flour", "sugar", "cocoa powder"],
  "instructions": "Mix all ingredients...",
  "taste": "sweet",
  "cuisine": "dessert",
  "prepTime": 60
}
```

#### Parse Recipe File
- Route: `/recipes/parse-file`
- Method: `POST`
- Sample Payload:
```json
{
  "filePath": "./data/my_fav_recipes.txt"
}
```

### Chatbot Integration

#### Get Recipe Recommendations
- Route: `/chat`
- Method: `POST`
- Sample Payload:
```json
{
  "message": "I want something sweet"
}
```
- Sample Response:
```json
{
  "reply": "Based on your preference for something sweet..."
}
```

## Error Responses
All endpoints return appropriate HTTP status codes:
- 200: Success
- 400: Bad Request
- 404: Not Found
- 500: Internal Server Error

## Testing
Run the test suite using:
```bash
node test/test-api.js
```
```

