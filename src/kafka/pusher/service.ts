import { logger } from "config";
import Pusher from "./index";

Pusher.service()
  .then(() => logger.info("pusher started", Pusher.topic))
  .catch(console.error);

export default Pusher;
