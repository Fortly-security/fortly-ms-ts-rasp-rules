import { RaspRulesController } from "./controller/RaspRulesController";
import { RaspRulesBL } from "./domain/RaspRulesBL";
import { RaspRulesD1 } from "./repositories/RaspRulesD1";
import { logger } from "./core/utils/logger";

export const index = async (event: any, env?: any) => {
  const repository = new RaspRulesD1(env!.KV_RULES, env!.DB_VIRTUAL_PATCHES);
  const bl = new RaspRulesBL(repository);
  const controller = new RaspRulesController(bl);

  logger.info("Incoming request", { path: event.path, method: event.httpMethod });
  return controller.handle(event);
};
