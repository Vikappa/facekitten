import { date } from "zod";

export function VercelLogger(string: string) {
    console.log(`[${new Date().toISOString()}] ${string}`);
} 