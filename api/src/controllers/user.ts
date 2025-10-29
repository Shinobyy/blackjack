import { type Request, type Response, type NextFunction } from 'express';
import UserService from '../services/user.ts';

const userService = new UserService();

export const getUsers = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const users = await userService.findAll();
        res.status(200).json({
            success: true,
            data: users
        });
    } catch (error) {
        next(error);
    }
};

export const getUserById = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        
        if (!id) {
            return res.status(400).json({
                success: false,
                message: 'ID requis'
            });
        }

        const user = await userService.findById(id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Utilisateur non trouvé'
            });
        }

        res.status(200).json({
            success: true,
            data: user
        });
    } catch (error) {
        next(error);
    }
};

export const getUserBySessionId = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { sessionId } = req.params;
        
        if (!sessionId) {
            return res.status(400).json({
                success: false,
                message: 'Session ID requis'
            });
        }

        const user = await userService.findBySessionId(sessionId);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Utilisateur non trouvé'
            });
        }

        res.status(200).json({
            success: true,
            data: user
        });
    } catch (error) {
        next(error);
    }
};

export const createUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { session_id, username, max_profit } = req.body;

        if (!session_id || !username) {
            return res.status(400).json({
                success: false,
                message: 'session_id et username sont requis'
            });
        }

        const user = await userService.create({
            session_id,
            username,
            max_profit
        });

        res.status(201).json({
            success: true,
            data: user,
            message: 'Utilisateur créé avec succès'
        });
    } catch (error) {
        next(error);
    }
};

export const updateUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const { session_id, username, max_profit } = req.body;

        if (!id) {
            return res.status(400).json({
                success: false,
                message: 'ID requis'
            });
        }

        const user = await userService.updateById(id, {
            session_id,
            username,
            max_profit
        });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Utilisateur non trouvé'
            });
        }

        res.status(200).json({
            success: true,
            data: user,
            message: 'Utilisateur mis à jour avec succès'
        });
    } catch (error) {
        next(error);
    }
};

export const deleteUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        
        if (!id) {
            return res.status(400).json({
                success: false,
                message: 'ID requis'
            });
        }

        const user = await userService.deleteById(id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Utilisateur non trouvé'
            });
        }

        res.status(200).json({
            success: true,
            data: user,
            message: 'Utilisateur supprimé avec succès'
        });
    } catch (error) {
        next(error);
    }
};