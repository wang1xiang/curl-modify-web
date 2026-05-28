import { create } from 'zustand'
import type { AppState, ParsedCurl, Modifier, GeneratedRequest, RequestResult } from '@/types'

export const useAppStore = create<AppState>((set) => ({
  // Curl 输入和解析
  curlInput: '',
  parsed: null,
  bodyJson: null,
  modifiers: {},
  headerMods: {},

  // UI 状态
  headersExpanded: false,
  leftExpanded: true,
  rightExpanded: true,

  // 发送状态
  isSending: false,
  sendCount: 1,
  progress: { current: 0, total: 0 },
  results: [],

  // Actions
  setCurlInput: (input: string) => set({ curlInput: input }),

  setParsed: (parsed: ParsedCurl | null, bodyJson: Record<string, unknown> | null) =>
    set({ parsed, bodyJson, modifiers: {}, headerMods: parsed?.headers || {} }),

  setModifier: (path: string, modifier: Modifier) =>
    set((state) => ({
      modifiers: { ...state.modifiers, [path]: modifier },
    })),

  removeModifier: (path: string) =>
    set((state) => {
      const { [path]: _, ...rest } = state.modifiers
      return { modifiers: rest }
    }),

  setHeaderMod: (key: string, value: string) =>
    set((state) => ({
      headerMods: { ...state.headerMods, [key]: value },
    })),

  setHeadersExpanded: (expanded: boolean) => set({ headersExpanded: expanded }),
  setLeftExpanded: (expanded: boolean) => set({ leftExpanded: expanded }),
  setRightExpanded: (expanded: boolean) => set({ rightExpanded: expanded }),
  setIsSending: (sending: boolean) => set({ isSending: sending }),
  setSendCount: (count: number) => set({ sendCount: count }),
  setProgress: (current: number, total: number) => set({ progress: { current, total } }),

  addResult: (result: { request: GeneratedRequest; result?: RequestResult; isPreview: boolean }) =>
    set((state) => ({ results: [...state.results, result] })),

  clearResults: () => set({ results: [] }),

  reset: () =>
    set({
      curlInput: '',
      parsed: null,
      bodyJson: null,
      modifiers: {},
      headerMods: {},
      headersExpanded: false,
      isSending: false,
      sendCount: 1,
      progress: { current: 0, total: 0 },
      results: [],
    }),
}))
