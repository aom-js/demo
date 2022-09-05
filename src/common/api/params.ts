/* параметрический блок для обработки идентификаторов mongoDB */
export class MongoID {
  static regexp = "[0-9a-fA-F]{24}";

  static param = (param) => `:${param}(${MongoID.regexp})`;

  static schema = {
    type: "string",
    minLength: 24,
    maxLength: 24,
    pattern: `^${MongoID.regexp}$`,
  };
}
