import { env } from "./env";

const normalizeOrigin = (value: string): string => value.trim().replace(/\/+$/, "");

const parseOrigins = (value: string | undefined): string[] => {
  if (!value) {
    return [];
  }

  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean)
    .map(normalizeOrigin);
};

export const allowedCorsOrigins = Array.from(
  new Set([...parseOrigins(env.FRONTEND_URL), ...parseOrigins(env.FRONTEND_URLS)]),
);

export const isCorsOriginAllowed = (origin: string | undefined): boolean => {
  if (!origin) {
    return true;
  }

  return allowedCorsOrigins.includes(normalizeOrigin(origin));
};
