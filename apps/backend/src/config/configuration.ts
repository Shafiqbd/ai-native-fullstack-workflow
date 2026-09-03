/**
 * Typed application configuration.
 *
 * Loaded once through ConfigModule.forRoot({ load: [configuration] })
 * and consumed via ConfigService. Environment access stays in this
 * file; the rest of the application reads configuration exclusively
 * through ConfigService.
 */
export interface AppConfig {
  /** Port the HTTP server listens on. */
  port: number;
  /** Frontend origin allowed by the CORS policy. */
  frontendUrl: string;
  /** PostgreSQL connection string; absent means the API runs without persistence. */
  databaseUrl?: string;
}

export default function configuration(): AppConfig {
  return {
    port: Number(process.env.PORT ?? 3001),
    frontendUrl: process.env.FRONTEND_URL ?? 'http://localhost:3000',
    ...(process.env.DATABASE_URL ? { databaseUrl: process.env.DATABASE_URL } : {}),
  };
}
