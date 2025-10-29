import { type Request, type Response, type NextFunction } from 'express';
import TournamentService from '../services/tournament.ts';

const tournamentService = new TournamentService();

export const getTournaments = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const tournaments = await tournamentService.findAll();
        res.status(200).json({
            success: true,
            data: tournaments
        });
    } catch (error) {
        next(error);
    }
};

export const getTournamentById = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        
        if (!id) {
            return res.status(400).json({
                success: false,
                message: 'ID requis'
            });
        }

        const tournament = await tournamentService.findById(id);

        if (!tournament) {
            return res.status(404).json({
                success: false,
                message: 'Tournoi non trouvé'
            });
        }

        res.status(200).json({
            success: true,
            data: tournament
        });
    } catch (error) {
        next(error);
    }
};

export const getTournamentsByUserId = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { userId } = req.params;
        
        if (!userId) {
            return res.status(400).json({
                success: false,
                message: 'User ID requis'
            });
        }

        const tournaments = await tournamentService.findByUserId(userId);

        res.status(200).json({
            success: true,
            data: tournaments
        });
    } catch (error) {
        next(error);
    }
};

export const getActiveTournamentsByUserId = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { userId } = req.params;
        
        if (!userId) {
            return res.status(400).json({
                success: false,
                message: 'User ID requis'
            });
        }

        const tournaments = await tournamentService.findActiveByUserId(userId);

        res.status(200).json({
            success: true,
            data: tournaments
        });
    } catch (error) {
        next(error);
    }
};

export const createTournament = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { user_id, active } = req.body;

        if (!user_id) {
            return res.status(400).json({
                success: false,
                message: 'user_id est requis'
            });
        }

        const tournament = await tournamentService.create({
            user_id,
            active
        });

        res.status(201).json({
            success: true,
            data: tournament,
            message: 'Tournoi créé avec succès'
        });
    } catch (error) {
        next(error);
    }
};

export const updateTournament = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const { user_id, active } = req.body;

        if (!id) {
            return res.status(400).json({
                success: false,
                message: 'ID requis'
            });
        }

        const tournament = await tournamentService.updateById(id, {
            user_id,
            active
        });

        if (!tournament) {
            return res.status(404).json({
                success: false,
                message: 'Tournoi non trouvé'
            });
        }

        res.status(200).json({
            success: true,
            data: tournament,
            message: 'Tournoi mis à jour avec succès'
        });
    } catch (error) {
        next(error);
    }
};

export const deleteTournament = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        
        if (!id) {
            return res.status(400).json({
                success: false,
                message: 'ID requis'
            });
        }

        const tournament = await tournamentService.deleteById(id);

        if (!tournament) {
            return res.status(404).json({
                success: false,
                message: 'Tournoi non trouvé'
            });
        }

        res.status(200).json({
            success: true,
            data: tournament,
            message: 'Tournoi supprimé avec succès'
        });
    } catch (error) {
        next(error);
    }
};

export const deleteTournamentsByUserId = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { userId } = req.params;
        
        if (!userId) {
            return res.status(400).json({
                success: false,
                message: 'User ID requis'
            });
        }

        const count = await tournamentService.deleteByUserId(userId);

        res.status(200).json({
            success: true,
            data: { deletedCount: count },
            message: `${count} tournoi(s) supprimé(s) avec succès`
        });
    } catch (error) {
        next(error);
    }
};