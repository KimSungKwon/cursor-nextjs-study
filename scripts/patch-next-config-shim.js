/**
 * Next.js 16에서 제거된 next/config를 Storybook 8.6.14가 resolve할 수 있도록 심을 생성한다.
 */
const fs = require("fs");
const path = require("path");

const nextDir = path.join(__dirname, "..", "node_modules", "next");
const configJs = path.join(nextDir, "config.js");
const configDts = path.join(nextDir, "config.d.ts");

if (!fs.existsSync(nextDir)) {
  console.warn("[patch-next-config-shim] next 패키지가 없어 건너뜁니다.");
  process.exit(0);
}

const js = `/** Storybook 8.6.14 + Next.js 16 호환 심 */
function getConfig() {
  return {
    publicRuntimeConfig: {},
    serverRuntimeConfig: {},
  };
}

module.exports = getConfig;
module.exports.default = getConfig;
module.exports.setConfig = function setConfig() {};
`;

const dts = `declare function getConfig(): {
  publicRuntimeConfig: Record<string, unknown>;
  serverRuntimeConfig: Record<string, unknown>;
};

export default getConfig;
export declare function setConfig(configValue: unknown): void;
`;

fs.writeFileSync(configJs, js, "utf8");
fs.writeFileSync(configDts, dts, "utf8");
console.log("[patch-next-config-shim] next/config 심 생성 완료");
