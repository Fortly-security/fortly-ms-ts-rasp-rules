export const logger = {
  info: (msg: string, meta?: any) => console.log(JSON.stringify({ level: "INFO", msg, ...meta })),
  warn: (msg: string, meta?: any) => console.warn(JSON.stringify({ level: "WARN", msg, ...meta })),
  error: (msg: string, meta?: any) => console.error(JSON.stringify({ level: "ERROR", msg, ...meta })),
  debug: (msg: string, meta?: any) => console.debug(JSON.stringify({ level: "DEBUG", msg, ...meta })),
  addContext: (_ctx: any) => {},
};
