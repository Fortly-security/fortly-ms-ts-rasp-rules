import { RaspRule, VirtualPatch } from "../repositories/IRaspRulesRepository";

export interface RulesResponse {
  version: string;
  rules: RaspRule[];
  virtualPatches: VirtualPatch[];
}

export interface IRaspRulesBL {
  getRulesAndPatches(): Promise<RulesResponse>;
}
