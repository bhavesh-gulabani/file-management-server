import express from 'express';
import * as dotenv from 'dotenv';
import cors from 'cors';

import userRouter from './routes/user.routes.js';
import fileUploadRouter from './routes/file-upload.routes.js';
import connectDB from './mongodb/connect.js';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/v1/users', userRouter);
app.use('/api/v1/files', fileUploadRouter);

const startServer = async () => {
  try {
    connectDB(process.env.MONGODB_URL);

    app.listen(8080, () => console.log('Server has started on port 8080'));
  } catch (error) {
    console.log(error);
  }
};

startServer();
