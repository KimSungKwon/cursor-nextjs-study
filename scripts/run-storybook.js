/**
 * Next.js 16 + Storybook 8.6.14 호환 실행 래퍼
 * - next/config 제거 대응은 postinstall shim
 * - webpack 이중 인스턴스 방지를 위해 __NEXT_PRIVATE_RENDER_WORKER 설정
 */
const { spawn } = require("child_process");

const args = process.argv.slice(2);
const env = {
  ...process.env,
  __NEXT_PRIVATE_RENDER_WORKER: "1",
  STORYBOOK_DISABLE_TELEMETRY: "1",
};

const child = spawn("storybook", args, {
  stdio: "inherit",
  shell: true,
  env,
});

child.on("exit", (code) => {
  process.exit(code ?? 1);
});
