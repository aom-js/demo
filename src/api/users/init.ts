const { USERS_API_HOST, USERS_API_PORT } = process.env;

if (!(USERS_API_HOST && USERS_API_PORT)) {
  throw new Error(".env variables required: USERS_API_PORT, USERS_API_HOST");
}

export const url = USERS_API_HOST;

export const settings = {
  url,
  port: +USERS_API_PORT,
  env: { USERS_API_HOST, USERS_API_PORT },
};
