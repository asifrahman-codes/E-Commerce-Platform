import "./config/env.js";

import app from "./app.js";

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`
=========================================
🚀 Server Started Successfully
=========================================
Environment : ${process.env.NODE_ENV}
Port        : ${PORT}
=========================================
`);
});