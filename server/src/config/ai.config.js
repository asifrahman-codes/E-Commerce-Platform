// import "./env.js";

// const aiConfig = {
//   enabled: process.env.AI_ENABLED === "true",
//   provider: process.env.AI_PROVIDER || "gemini",
//   apiKey: process.env.GEMINI_API_KEY || "",
//   model: process.env.GEMINI_MODEL || "",
// };

// export default aiConfig;


import "./env.js";

const aiConfig = {
  enabled: process.env.AI_ENABLED === "true",
  provider: process.env.AI_PROVIDER || "openrouter",
  apiKey: process.env.OPENROUTER_API_KEY || "",
  model: process.env.OPENROUTER_MODEL || "openrouter/free",
};

export default aiConfig;
