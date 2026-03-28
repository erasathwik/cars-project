import app from './api/index.js';

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Backend server is running on http://localhost:${PORT}`);
});
