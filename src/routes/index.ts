import { Router, Request, Response } from 'express';
import { getExample } from '../controllers';
const router: Router = Router();

router.get('/', (req: Request, res: Response) => {
    res.send('API server is running!');
});

router.use('/example', getExample); // Use the controller function for the route

export default router; // Use default export