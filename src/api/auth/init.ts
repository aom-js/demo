const { AUTH_API_HOST, AUTH_API_PORT } = process.env;

if (!(AUTH_API_HOST && AUTH_API_PORT)) {
  throw new Error(".env variables required: AUTH_API_PORT, AUTH_API_HOST");
}

export const url = AUTH_API_HOST;

export const settings = {
  url,
  port: +AUTH_API_PORT,
  env: { AUTH_API_HOST, AUTH_API_PORT },
};
