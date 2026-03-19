import { IRaspRulesRepository, RulesBundle, VirtualPatch } from "./IRaspRulesRepository";

export class RaspRulesD1 implements IRaspRulesRepository {
  private kv: any;
  private db: any;

  constructor(kv: any, db: any) {
    this.kv = kv;
    this.db = db;
  }

  async getRulesFromKV(key: string): Promise<RulesBundle | null> {
    const value = await this.kv.get(key, { type: "json" });
    if (!value) return null;
    return value as RulesBundle;
  }

  async getActiveVirtualPatches(): Promise<VirtualPatch[]> {
    const result = await this.db
      .prepare(
        `SELECT id, vuln_id as vulnId, method, path_pattern as pathPattern, param_name as paramName, block_pattern as blockPattern, expires_at as expiresAt
         FROM virtual_patches
         WHERE active = 1 AND (expires_at IS NULL OR expires_at > datetime('now'))`
      )
      .all();

    return result?.results ?? [];
  }
}
