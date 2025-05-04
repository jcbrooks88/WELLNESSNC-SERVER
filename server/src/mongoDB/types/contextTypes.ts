import { Request, Response } from "express";
import { UserPayload } from "./userTypes.js";

export interface GraphQLContext {
  req: Request;
  res: Response;
  user?: UserPayload | null;
}
