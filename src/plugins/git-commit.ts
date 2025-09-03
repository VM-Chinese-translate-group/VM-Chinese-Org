import { execSync } from 'child_process'
import type { Plugin } from 'vite'

export default function gitCommitPlugin(): Plugin {
  return {
    name: 'vite-plugin-git-commit',
    config() {
      const commitHash = execSync('git rev-parse --short HEAD').toString().trim()
      return {
        define: {
          'import.meta.env.VITE_GIT_COMMIT': JSON.stringify(commitHash),
        },
      }
    },
  }
}
