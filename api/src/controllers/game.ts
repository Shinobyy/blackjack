import { type Request, type Response, type NextFunction } from 'express';
import GameService from '../services/game.ts';

const gameService = new GameService();

export const getGames = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await gameService.findAll();

    if (!(result as any).cursor || !(result as any).cursor.firstBatch) {
      return res.json([]);
    }

    res.json((result as any).cursor.firstBatch || []);
  } catch (error) {
    next(error);
  }
};

export const getGameById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ message: 'ID is required' });
    }
    const result = await gameService.findById(id);
    if ((result as any).cursor.firstBatch && (result as any).cursor.firstBatch.length > 0) {
      res.json((result as any).cursor.firstBatch[0]);
    } else {
      res.status(404).json({ message: 'Game not found' });
    }
  } catch (error) {
    next(error);
  }
};

export const createGame = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = req.body;
    const result = await gameService.create(data);
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
};

export const updateGame = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ message: 'ID is required' });
    }
    const data = req.body;
    const result = await gameService.updateById(id, data);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

export const deleteGame = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ message: 'ID is required' });
    }
    const result = await gameService.deleteById(id);
    res.json(result);
  } catch (error) {
    next(error);
  }
};