import { IRaspRulesBL, RulesResponse } from "./IRaspRulesBL";
import { IRaspRulesRepository } from "../repositories/IRaspRulesRepository";
import { config } from "../core/config/index";
import { logger } from "../core/utils/logger";

export class RaspRulesBL implements IRaspRulesBL {
  private repository: IRaspRulesRepository;

  constructor(repository: IRaspRulesRepository) {
    this.repository = repository;
  }

  async getRulesAndPatches(): Promise<RulesResponse> {
    let rulesBundle = await this.repository.getRulesFromKV(config.rulesKvKey);

    if (!rulesBundle) {
      logger.info("No RASP-specific rules found, falling back to WAF rules");
      rulesBundle = await this.repository.getRulesFromKV(config.fallbackKvKey);
    }

    if (!rulesBundle) {
      logger.warn("No rules found in KV store");
      rulesBundle = { version: "0.0.0", rules: [] };
    }

    const virtualPatches = await this.repository.getActiveVirtualPatches();

    return {
      version: rulesBundle.version,
      rules: rulesBundle.rules,
      virtualPatches,
    };
  }
}
