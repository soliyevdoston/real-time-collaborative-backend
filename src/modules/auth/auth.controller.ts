import { Request, Response } from "express";
import { env } from "../../shared/config/env";
import { HttpError } from "../../shared/errors/http-error";
import { authService } from "./auth.service";

const REFRESH_COOKIE = "refreshToken";
const isProduction = env.NODE_ENV === "production";

const refreshCookieBaseOptions = {
  httpOnly: true,
  secure: isProduction,
  sameSite: isProduction ? ("none" as const) : ("lax" as const),
  path: "/api/auth",
};

const setRefreshCookie = (res: Response, refreshToken: string): void => {
  res.cookie(REFRESH_COOKIE, refreshToken, {
    ...refreshCookieBaseOptions,
    maxAge: env.REFRESH_TOKEN_TTL_DAYS * 24 * 60 * 60 * 1000,
  });
};

const clearRefreshCookie = (res: Response): void => {
  res.clearCookie(REFRESH_COOKIE, {
    ...refreshCookieBaseOptions,
  });
};

export const authController = {
  async register(req: Request, res: Response): Promise<void> {
    const session = await authService.register(req.body);
    setRefreshCookie(res, session.refreshToken);

    res.status(201).json({
      user: session.user,
      accessToken: session.accessToken,
    });
  },

  async login(req: Request, res: Response): Promise<void> {
    const session = await authService.login(req.body);
    setRefreshCookie(res, session.refreshToken);

    res.status(200).json({
      user: session.user,
      accessToken: session.accessToken,
    });
  },

  async refresh(req: Request, res: Response): Promise<void> {
    const refreshToken = req.cookies[REFRESH_COOKIE] as string | undefined;
    if (!refreshToken) {
      throw new HttpError(401, "Yangilash tokeni topilmadi");
    }

    const session = await authService.refresh(refreshToken);
    setRefreshCookie(res, session.refreshToken);

    res.status(200).json({
      user: session.user,
      accessToken: session.accessToken,
    });
  },

  async logout(req: Request, res: Response): Promise<void> {
    const refreshToken = req.cookies[REFRESH_COOKIE] as string | undefined;

    if (refreshToken) {
      await authService.revokeRefreshToken(refreshToken);
    }

    clearRefreshCookie(res);
    res.status(200).json({ message: "Tizimdan chiqildi" });
  },

  async me(req: Request, res: Response): Promise<void> {
    if (!req.user) {
      throw new HttpError(401, "Autentifikatsiya talab qilinadi");
    }

    const user = await authService.me(req.user.id);
    res.status(200).json({ user });
  },

  async updateProfile(req: Request, res: Response): Promise<void> {
    if (!req.user) {
      throw new HttpError(401, "Autentifikatsiya talab qilinadi");
    }

    const user = await authService.updateProfile(req.user.id, req.body);
    res.status(200).json({ user });
  },

  async uploadAvatar(req: Request, res: Response): Promise<void> {
    if (!req.user) {
      throw new HttpError(401, "Autentifikatsiya talab qilinadi");
    }

    if (!req.file) {
      throw new HttpError(400, "Avatar rasmi topilmadi");
    }

    const avatarPath = "/uploads/avatars/" + req.file.filename;
    const avatarUrl = env.BACKEND_PUBLIC_URL.replace(/\/$/, "") + avatarPath;
    const user = await authService.updateAvatar(req.user.id, avatarUrl);

    res.status(200).json({ user });
  },
};
