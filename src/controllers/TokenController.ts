import { Request, Response } from "express";
import type { User } from "@prisma/client";
import { prismaClient } from "../database/prismaClient";
import { VerifyHash } from "../utils/bycript";
import bycript from "bcrypt";
import jwt from "jsonwebtoken";

class TokenController {
  async store(req: Request, res: Response) {
    const { email, password }: User = req.body;

    if (!email || !password) {
      return res.status(401).json({
        message: "Credenciais invalidas",
      });
    }
    const user = await prismaClient.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(401).json({
        message: "Usuario não existe",
      });
    }

    if (!(await VerifyHash(password, user?.password))) {
      return res.status(401).json({ message: "Senha invalida" });
    }

    const { id } = user;
    const secret = process.env.TOKEN_SECRET as string;
    const token = jwt.sign({ id, email }, secret, {
      expiresIn: process.env.TOKEN_EXP,
    });
    return res.json({ token: token });
  }
}

export default new TokenController().store;
