const { ADMIN_API_HOST, ADMIN_API_PORT } = process.env;

if (!(ADMIN_API_HOST && ADMIN_API_PORT)) {
  throw new Error(".env variables required: ADMIN_API_PORT, ADMIN_API_HOST");
}

export const url = ADMIN_API_HOST;

export const settings = {
  url,
  port: +ADMIN_API_PORT,
  env: { ADMIN_API_HOST, ADMIN_API_PORT },
};
