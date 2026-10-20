import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // 킷(src/meerkit)은 라우트·서비스 화면(src/app)을 import 하지 않습니다.
  {
    files: ["src/meerkit/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        { patterns: [{ group: ["@/app/*", "**/app/*"], message: "킷은 src/app(라우트·서비스)을 import 하지 않습니다." }] },
      ],
    },
  },
  // 킷 밖에서는 킷 내부 파일 대신 공개 API(@/meerkit)만 사용합니다.
  {
    files: ["src/app/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        { patterns: [{ group: ["@/meerkit/*"], message: "킷은 '@/meerkit'(index.ts)에서만 import 하세요." }] },
      ],
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
