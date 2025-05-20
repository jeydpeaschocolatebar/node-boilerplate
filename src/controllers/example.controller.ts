import { Request, Response } from 'express';

const getExample = (req: Request, res: Response) => {
    res.status(200).json({
        message: 'Example endpoint here',
        data: {
            exampleKey: 'exampleValue'
        }
    });
};

export {
    getExample
    // Add more controller functions as needed
    // e.g., createExample, updateExample, deleteExample
};
