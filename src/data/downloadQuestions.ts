import knowledgeQuestions from './downloadQuestions/knowledge.json'
import minecraftQuestions from './downloadQuestions/minecraft.json'
import type { DownloadQuestion } from '@/types/downloadQuestion'

export const downloadQuestionGroups = {
  knowledge: knowledgeQuestions as DownloadQuestion[],
  minecraft: minecraftQuestions as DownloadQuestion[],
}

export const downloadQuestions: DownloadQuestion[] = Object.values(downloadQuestionGroups).flat()
