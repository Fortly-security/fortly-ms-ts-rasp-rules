import { RaspRulesBL } from "../../domain/RaspRulesBL";
import { IRaspRulesRepository, RulesBundle, VirtualPatch } from "../../repositories/IRaspRulesRepository";

const mockRepository: jest.Mocked<IRaspRulesRepository> = {
  getRulesFromKV: jest.fn(),
  getActiveVirtualPatches: jest.fn(),
};

describe("RaspRulesBL", () => {
  let bl: RaspRulesBL;

  beforeEach(() => {
    bl = new RaspRulesBL(mockRepository);
    jest.clearAllMocks();
  });

  const raspRulesBundle: RulesBundle = {
    version: "1.2.0",
    rules: [
      { id: "r1", category: "sqli", pattern: "' OR 1=1", severity: "high", description: "SQL injection" },
      { id: "r2", category: "xss", pattern: "<script>", severity: "medium", description: "XSS attack" },
    ],
  };

  const wafRulesBundle: RulesBundle = {
    version: "1.0.0",
    rules: [
      { id: "w1", category: "waf-sqli", pattern: "SELECT.*FROM", severity: "high", description: "WAF SQL" },
    ],
  };

  const mockVirtualPatches: VirtualPatch[] = [
    {
      id: "vp1",
      vulnId: "CVE-2024-001",
      method: "POST",
      pathPattern: "/api/users",
      paramName: "email",
      blockPattern: ".*<script>.*",
      expiresAt: null,
    },
  ];

  it("should return RASP rules and virtual patches when RASP rules exist", async () => {
    mockRepository.getRulesFromKV.mockResolvedValueOnce(raspRulesBundle);
    mockRepository.getActiveVirtualPatches.mockResolvedValue(mockVirtualPatches);

    const result = await bl.getRulesAndPatches();

    expect(result.version).toBe("1.2.0");
    expect(result.rules).toHaveLength(2);
    expect(result.virtualPatches).toHaveLength(1);
    expect(mockRepository.getRulesFromKV).toHaveBeenCalledWith("rules/rasp/latest");
  });

  it("should fall back to WAF rules when no RASP rules exist", async () => {
    mockRepository.getRulesFromKV
      .mockResolvedValueOnce(null) // RASP key returns null
      .mockResolvedValueOnce(wafRulesBundle); // WAF fallback
    mockRepository.getActiveVirtualPatches.mockResolvedValue([]);

    const result = await bl.getRulesAndPatches();

    expect(result.version).toBe("1.0.0");
    expect(result.rules).toHaveLength(1);
    expect(result.rules[0].category).toBe("waf-sqli");
    expect(mockRepository.getRulesFromKV).toHaveBeenCalledTimes(2);
    expect(mockRepository.getRulesFromKV).toHaveBeenNthCalledWith(1, "rules/rasp/latest");
    expect(mockRepository.getRulesFromKV).toHaveBeenNthCalledWith(2, "rules/waf/latest");
  });

  it("should return empty rules when neither RASP nor WAF rules exist", async () => {
    mockRepository.getRulesFromKV.mockResolvedValue(null);
    mockRepository.getActiveVirtualPatches.mockResolvedValue([]);

    const result = await bl.getRulesAndPatches();

    expect(result.version).toBe("0.0.0");
    expect(result.rules).toHaveLength(0);
    expect(result.virtualPatches).toHaveLength(0);
  });

  it("should return empty virtual patches when none are active", async () => {
    mockRepository.getRulesFromKV.mockResolvedValueOnce(raspRulesBundle);
    mockRepository.getActiveVirtualPatches.mockResolvedValue([]);

    const result = await bl.getRulesAndPatches();

    expect(result.virtualPatches).toHaveLength(0);
    expect(result.rules).toHaveLength(2);
  });

  it("should return multiple virtual patches", async () => {
    const multiplePatches: VirtualPatch[] = [
      ...mockVirtualPatches,
      {
        id: "vp2",
        vulnId: "CVE-2024-002",
        method: "GET",
        pathPattern: "/api/admin",
        paramName: "id",
        blockPattern: ".*UNION.*SELECT.*",
        expiresAt: "2025-12-31T23:59:59Z",
      },
    ];
    mockRepository.getRulesFromKV.mockResolvedValueOnce(raspRulesBundle);
    mockRepository.getActiveVirtualPatches.mockResolvedValue(multiplePatches);

    const result = await bl.getRulesAndPatches();

    expect(result.virtualPatches).toHaveLength(2);
    expect(result.virtualPatches[0].vulnId).toBe("CVE-2024-001");
    expect(result.virtualPatches[1].vulnId).toBe("CVE-2024-002");
  });

  it("should propagate repository errors", async () => {
    mockRepository.getRulesFromKV.mockRejectedValue(new Error("KV unavailable"));

    await expect(bl.getRulesAndPatches()).rejects.toThrow("KV unavailable");
  });
});
