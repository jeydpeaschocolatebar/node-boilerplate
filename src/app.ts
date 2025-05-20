import dotenv from 'dotenv';
import express, { NextFunction, Request, Response } from 'express';

import routes from './routes/index';

dotenv.config();

const PORT = process.env.PORT || 3000; // Always use process.env.PORT else default to 3000

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies
app.use('/api', routes);

// Error handling middleware
app.use((err: Error, req: Request, res: Response, _: NextFunction) => {
    console.error(err.stack); // Log the error stack
    res.status(500).send('Something broke!'); // Send a generic error response
});

app.listen(PORT, () => {
    console.log(`Server is running on port http://localhost:${PORT}/`);
});
