import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { SavedEndpointsState } from '@/types'

export const useSavedEndpointsStore = create<SavedEndpointsState>()(
  persist(
    (set) => ({
      endpoints: [],
      addEndpoint: (name: string, curlCmd: string) =>
        set((state) => ({
          endpoints: [...state.endpoints, { id: Date.now(), name, curlCmd }],
        })),
      deleteEndpoint: (id: number) =>
        set((state) => ({
          endpoints: state.endpoints.filter((e) => e.id !== id),
        })),
    }),
    {
      name: 'savedEndpoints',
    }
  )
)
