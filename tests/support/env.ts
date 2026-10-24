import { existsSync } from 'node:fs';
import { loadEnvFile } from 'node:process';

// Carrega o .env aqui (e não no config) porque este arquivo é importado antes de qualquer leitura das variáveis.
if (existsSync('.env')) loadEnvFile('.env');

export const BASE_URL = process.env.BASE_URL ?? 'http://localhost:5173';
export const API_URL = process.env.API_URL ?? 'http://localhost:3000';
