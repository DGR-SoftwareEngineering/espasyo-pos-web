export type RuntimeConfig = {
  processEnv: Record<string, string | undefined>;
  serverRuntime?: Record<string, unknown>;
};

let _config: RuntimeConfig | null = null;

export function setRuntimeConfig(cfg: RuntimeConfig) {
  _config = cfg;
}

export function getRuntimeConfig(): RuntimeConfig {
  if (_config) return _config;

  return {
    processEnv: process.env as Record<string, string | undefined>,
    serverRuntime: undefined,
  };
}
