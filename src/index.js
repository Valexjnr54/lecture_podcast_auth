// src/server.ts
const app = require('./app');

const port = process.env.PORT || 5473;

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});