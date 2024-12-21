// test/test-api.js
const axios = require("axios");
const fs = require("fs").promises;
const assert = require("assert");

const API_URL = "http://localhost:3000";

async function runTests() {
  try {
    console.log("Starting API tests...\n");

    // Test 1: Database Connection
    console.log("1. Testing Database Connection...");
    const homeResponse = await axios.get(`${API_URL}/`);
    assert(homeResponse.status === 200);
    console.log("✅ Database connection successful\n");

    // Test 2: Ingredient Management
    console.log("2. Testing Ingredient Management...");

    // Add ingredients
    const ingredientsData = JSON.parse(
      await fs.readFile("./test/test-ingredients.json", "utf8")
    );
    const addIngredientsResponse = await axios.post(
      `${API_URL}/ingredients`,
      ingredientsData
    );
    assert(addIngredientsResponse.status === 200);
    console.log("✅ Added ingredients successfully");

    // Get ingredients
    const getIngredientsResponse = await axios.get(`${API_URL}/ingredients`);
    assert(getIngredientsResponse.status === 200);
    assert(getIngredientsResponse.data.length > 0);
    console.log("✅ Retrieved ingredients successfully");

    // Update ingredient
    const ingredientId = getIngredientsResponse.data[0]._id;
    const updateResponse = await axios.put(
      `${API_URL}/ingredients/${ingredientId}`,
      {
        quantity: "750",
      }
    );
    assert(updateResponse.status === 200);
    console.log("✅ Updated ingredient successfully\n");

    // Test 3: Recipe Management
    console.log("3. Testing Recipe Management...");

    // Add recipes
    const recipesData = JSON.parse(
      await fs.readFile("./test/test-recipes.json", "utf8")
    );
    const addRecipesResponse = await axios.post(
      `${API_URL}/recipes`,
      recipesData[0]
    );
    assert(addRecipesResponse.status === 200);
    console.log("✅ Added recipe successfully");

    // Parse recipe file
    const parseFileResponse = await axios.post(
      `${API_URL}/recipes/parse-file`,
      {
        filePath: "./data/my_fav_recipes.txt",
      }
    );
    assert(parseFileResponse.status === 200);
    console.log("✅ Parsed recipe file successfully");

    // Get recipes
    const getRecipesResponse = await axios.get(`${API_URL}/recipes`);
    assert(getRecipesResponse.status === 200);
    assert(getRecipesResponse.data.length > 0);
    console.log("✅ Retrieved recipes successfully\n");

    // Test 4: Chatbot Integration
    console.log("4. Testing Chatbot Integration...");

    // Test different chat scenarios
    const chatScenarios = [
      "I want something sweet",
      "What can I make with chicken?",
      "I want a quick meal",
    ];

    for (const message of chatScenarios) {
      const chatResponse = await axios.post(`${API_URL}/chat`, { message });
      assert(chatResponse.status === 200);
      assert(chatResponse.data.reply);
      console.log(`✅ Chat response received for: "${message}"`);
    }

    console.log("\nAll tests completed successfully! 🎉");
  } catch (error) {
    console.error("Test failed:", error.message);
    if (error.response) {
      console.error("Response data:", error.response.data);
    }
    process.exit(1);
  }
}

// Run the tests
runTests();
