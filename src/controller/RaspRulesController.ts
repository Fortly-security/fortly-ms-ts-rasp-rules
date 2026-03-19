import { IRaspRulesBL } from "../domain/IRaspRulesBL";
import { ResponseWriter } from "../core/common/ResponseWriter";
import { logger } from "../core/utils/logger";

export class RaspRulesController {
  private bl: IRaspRulesBL;

  constructor(bl: IRaspRulesBL) {
    this.bl = bl;
  }

  async handle(event: any) {
    const method = event.httpMethod;

    if (method === "OPTIONS") {
      return ResponseWriter.success({});
    }

    if (method !== "GET") {
      return ResponseWriter.error("Method not allowed", 405);
    }

    try {
      const result = await this.bl.getRulesAndPatches();
      return ResponseWriter.success(result as any);
    } catch (error: any) {
      logger.error("Controller error", { error: error.message });
      return ResponseWriter.error(error.message, 500);
    }
  }
}
