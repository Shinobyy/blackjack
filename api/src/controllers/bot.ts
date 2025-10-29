import { type Request, type Response, type NextFunction } from 'express';
import BotService from '../services/bot.ts';

const botService = new BotService();

export const getBots = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const bots = await botService.findAll();
        res.status(200).json({
            success: true,
            data: bots
        });
    } catch (error) {
        next(error);
    }
};

export const getBotById = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        
        if (!id) {
            return res.status(400).json({
                success: false,
                message: 'ID requis'
            });
        }

        const bot = await botService.findById(id);

        if (!bot) {
            return res.status(404).json({
                success: false,
                message: 'Bot non trouvé'
            });
        }

        res.status(200).json({
            success: true,
            data: bot
        });
    } catch (error) {
        next(error);
    }
};

export const getBotByUsername = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { username } = req.params;
        
        if (!username) {
            return res.status(400).json({
                success: false,
                message: 'Username requis'
            });
        }

        const bot = await botService.findByUsername(username);

        if (!bot) {
            return res.status(404).json({
                success: false,
                message: 'Bot non trouvé'
            });
        }

        res.status(200).json({
            success: true,
            data: bot
        });
    } catch (error) {
        next(error);
    }
};

export const countBots = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const count = await botService.count();
        res.status(200).json({
            success: true,
            data: { count }
        });
    } catch (error) {
        next(error);
    }
};

export const createBot = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { username } = req.body;

        if (!username) {
            return res.status(400).json({
                success: false,
                message: 'username est requis'
            });
        }

        const bot = await botService.create({ username });

        res.status(201).json({
            success: true,
            data: bot,
            message: 'Bot créé avec succès'
        });
    } catch (error) {
        next(error);
    }
};

export const updateBot = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const { username } = req.body;

        if (!id) {
            return res.status(400).json({
                success: false,
                message: 'ID requis'
            });
        }

        if (!username) {
            return res.status(400).json({
                success: false,
                message: 'username est requis'
            });
        }

        const bot = await botService.updateById(id, { username });

        if (!bot) {
            return res.status(404).json({
                success: false,
                message: 'Bot non trouvé'
            });
        }

        res.status(200).json({
            success: true,
            data: bot,
            message: 'Bot mis à jour avec succès'
        });
    } catch (error) {
        next(error);
    }
};

export const deleteBot = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        
        if (!id) {
            return res.status(400).json({
                success: false,
                message: 'ID requis'
            });
        }

        const bot = await botService.deleteById(id);

        if (!bot) {
            return res.status(404).json({
                success: false,
                message: 'Bot non trouvé'
            });
        }

        res.status(200).json({
            success: true,
            data: bot,
            message: 'Bot supprimé avec succès'
        });
    } catch (error) {
        next(error);
    }
};