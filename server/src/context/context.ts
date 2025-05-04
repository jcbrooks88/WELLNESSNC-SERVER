import { authenticate } from '../utils/auth.js';
import { Request, Response } from 'express';

interface ContextParams {
  req: Request;
  res: Response;
}

export const context = async ({ req, res }: ContextParams) => {
  if (!req || !req.headers) {
    console.warn('No request object found in context');
    return { req, res, user: null };
  }

  const user = authenticate(req);
  return { req, res, user };
};
