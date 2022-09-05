/* инициализация базовых директорий */
import fs from "fs-extra";

function initDirectory(ENV_DIR: string): void {
  if (!process.env[ENV_DIR]) {
    throw new Error(`${ENV_DIR} not available in process.env`);
  }

  if (!fs.existsSync(ENV_DIR)) {
    fs.mkdirSync(process.env[ENV_DIR], { recursive: true });
  }
}

initDirectory("FILES_DIR");
initDirectory("LOGS_DIR");
initDirectory("TMP_DIR");
