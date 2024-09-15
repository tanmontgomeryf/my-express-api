import express from "express";
import helmet from "helmet";
import "dotenv/config";

import { PORT } from "./config";
import api from "./api";

const app = express();
app.use(express.json());
app.use(helmet());

app.use("/api/v1/", api);

app.listen(PORT, () => {
  console.log(`Listening on http://localhost:${PORT}/`);
});
