"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isCorsOriginAllowed = exports.allowedCorsOrigins = void 0;
const env_1 = require("./env");
const normalizeOrigin = (value) => value.trim().replace(/\/+$/, "");
const parseOrigins = (value) => {
    if (!value) {
        return [];
    }
    return value
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean)
        .map(normalizeOrigin);
};
exports.allowedCorsOrigins = Array.from(new Set([...parseOrigins(env_1.env.FRONTEND_URL), ...parseOrigins(env_1.env.FRONTEND_URLS)]));
const isCorsOriginAllowed = (origin) => {
    if (!origin) {
        return true;
    }
    return exports.allowedCorsOrigins.includes(normalizeOrigin(origin));
};
exports.isCorsOriginAllowed = isCorsOriginAllowed;
