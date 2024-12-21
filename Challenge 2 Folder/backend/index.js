// index.js
const fs = require("fs").promises; // Using promises version for async operations
const path = require("path");
require("dotenv").config();
const fastify = require("fastify")({ logger: true });
const mongoose = require("mongoose");
const { GoogleGenerativeAI } = require("@google/generative-ai");

// Initialize Google AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Register plugins
fastify.register(require("@fastify/cors"));
fastify.register(require("@fastify/sensible"));

// Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Ingredient Schema
const ingredientSchema = new mongoose.Schema({
  name: { type: String, required: true },
  quantity: String,
  unit: String,
  expiryDate: Date,
});

const Ingredient = mongoose.model("Ingredient", ingredientSchema);

// Recipe Schema
const recipeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  ingredients: [String],
  instructions: String,
  taste: String,
  cuisine: String,
  prepTime: Number,
});

const Recipe = mongoose.model("Recipe", recipeSchema);

// ... (previous code remains the same until ingredient routes)

// Ingredient routes
fastify.get("/ingredients", async (request, reply) => {
  try {
    const ingredients = await Ingredient.find();
    return ingredients;
  } catch (err) {
    reply.code(500).send(err);
  }
});

// Get single ingredient by ID
fastify.get("/ingredients/:id", async (request, reply) => {
  try {
    const { id } = request.params;
    const ingredient = await Ingredient.findById(id);

    if (!ingredient) {
      reply.code(404).send({
        statusCode: 404,
        error: "Not Found",
        message: "Ingredient not found",
      });
      return;
    }

    return ingredient;
  } catch (err) {
    reply.code(500).send({
      statusCode: 500,
      error: "Internal Server Error",
      message: err.message,
    });
  }
});
// ... (previous code remains the same)

// Ingredient routes
fastify.put("/ingredients/:id", async (request, reply) => {
  try {
    const { id } = request.params;
    const updateData = request.body;

    const ingredient = await Ingredient.findByIdAndUpdate(
      id,
      updateData,
      { new: true } // This option returns the updated document
    );

    if (!ingredient) {
      reply.code(404).send({
        statusCode: 404,
        error: "Not Found",
        message: "Ingredient not found",
      });
      return;
    }

    return ingredient;
  } catch (err) {
    reply.code(500).send({
      statusCode: 500,
      error: "Internal Server Error",
      message: err.message,
    });
  }
});

fastify.post("/recipes/parse-file", async (request, reply) => {
  try {
    const { filePath } = request.body;

    // Validate file path
    if (!filePath) {
      reply.code(400).send({
        statusCode: 400,
        error: "Bad Request",
        message: "File path is required",
      });
      return;
    }

    // Read file content
    const absolutePath = path.resolve(filePath);
    const fileContent = await fs.readFile(absolutePath, "utf8");

    // Parse the file content
    // This is a basic example - modify the parsing logic according to your file format
    const recipes = fileContent.split("\n\n").map((recipeText) => {
      const lines = recipeText.trim().split("\n");
      const name = lines[0];
      const ingredients = [];
      const instructions = [];
      let currentSection = null;

      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (line.toLowerCase() === "ingredients:") {
          currentSection = "ingredients";
        } else if (line.toLowerCase() === "instructions:") {
          currentSection = "instructions";
        } else if (line && currentSection === "ingredients") {
          ingredients.push(line);
        } else if (line && currentSection === "instructions") {
          instructions.push(line);
        }
      }

      return {
        name,
        ingredients,
        instructions: instructions.join("\n"),
        // You can add default values for other fields
        taste: "",
        cuisine: "",
        prepTime: 0,
      };
    });

    // Save recipes to database
    const savedRecipes = await Recipe.insertMany(recipes);

    return {
      message: `Successfully parsed and saved ${savedRecipes.length} recipes`,
      recipes: savedRecipes,
    };
  } catch (err) {
    console.error("Error parsing recipe file:", err);
    reply.code(500).send({
      statusCode: 500,
      error: "Internal Server Error",
      message: err.message,
    });
  }
});

// Single ingredient addition
fastify.post("/ingredients", async (request, reply) => {
  try {
    const ingredientData = request.body;

    // Check if the data is an array
    if (Array.isArray(ingredientData)) {
      // Handle bulk insert
      const ingredients = await Ingredient.insertMany(ingredientData);
      return ingredients;
    } else {
      // Handle single insert
      const ingredient = new Ingredient(ingredientData);
      const result = await ingredient.save();
      return result;
    }
  } catch (err) {
    reply.code(500).send(err);
  }
});

// ... (rest of the code remains the same)

// Chat route
fastify.post("/chat", async (request, reply) => {
  try {
    const userMessage = request.body.message;

    // Get all recipes and ingredients from database
    const recipes = await Recipe.find();
    const ingredients = await Ingredient.find();

    // Create context from recipes and available ingredients
    const recipeContext = recipes
      .map(
        (recipe) =>
          `Recipe: ${recipe.name}\nIngredients: ${recipe.ingredients.join(
            ", "
          )}\nTaste: ${recipe.taste}\nCuisine: ${recipe.cuisine}\nPrep Time: ${
            recipe.prepTime
          } minutes`
      )
      .join("\n\n");

    const availableIngredients = ingredients.map((ing) => ing.name).join(", ");

    // Create prompt
    const prompt = `
      You are a helpful cooking assistant. Based on the following recipes and available ingredients, suggest appropriate recipes.
      
      Available Ingredients:
      ${availableIngredients}

      Available Recipes:
      ${recipeContext}

      User Request: ${userMessage}

      Please suggest appropriate recipes from the available ones, considering the available ingredients, and explain why they match the user's request.
    `;

    // Get Gemini model
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    // Generate response
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    return { reply: text };
  } catch (err) {
    console.error("Chat error:", err);
    reply.code(500).send({ error: err.message });
  }
});

// Recipe routes
fastify.get("/", async (request, reply) => {
  return { hello: "world" };
});

fastify.post("/recipes", async (request, reply) => {
  try {
    const recipe = new Recipe(request.body);
    const result = await recipe.save();
    return result;
  } catch (err) {
    reply.code(500).send(err);
  }
});

fastify.get("/recipes", async (request, reply) => {
  try {
    const recipes = await Recipe.find();
    return recipes;
  } catch (err) {
    reply.code(500).send(err);
  }
});

// Start server
const start = async () => {
  try {
    await fastify.listen({ port: 3000, host: "0.0.0.0" });
    console.log(`Server is running on port 3000`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
