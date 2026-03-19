export interface RaspRule {
  id: string;
  category: string;
  pattern: string;
  severity: string;
  description: string;
}

export interface RulesBundle {
  version: string;
  rules: RaspRule[];
}

export interface VirtualPatch {
  id: string;
  vulnId: string;
  method: string;
  pathPattern: string;
  paramName: string;
  blockPattern: string;
  expiresAt: string | null;
}

export interface IRaspRulesRepository {
  getRulesFromKV(key: string): Promise<RulesBundle | null>;
  getActiveVirtualPatches(): Promise<VirtualPatch[]>;
}
