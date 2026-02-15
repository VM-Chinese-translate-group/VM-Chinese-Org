import { execSync } from 'child_process'
import type { Plugin } from 'vite'

export default function gitCommitPlugin(): Plugin {
  return {
    name: 'vite-plugin-git-commit',
    config() {
      const commitHash = execSync('git rev-parse --short HEAD').toString().trim()
      const branchName = execSync('git rev-parse --abbrev-ref HEAD').toString().trim()

      let repoPath = 'VM-Chinese-translate-group/VM-Chinese-Org'
      try {
        const remoteUrl = execSync('git remote get-url origin').toString().trim()
        repoPath = remoteUrl.replace(/.*github\.com[:/]/, '').replace(/\.git$/, '')
      } catch (e) {
        console.warn('无法获取 git remote url，将使用默认值')
      }

      return {
        define: {
          'import.meta.env.VITE_GIT_COMMIT': JSON.stringify(commitHash),
          'import.meta.env.VITE_GIT_BRANCH': JSON.stringify(branchName),
          'import.meta.env.VITE_GIT_REPO': JSON.stringify(repoPath),
        },
      }
    },
  }
}
