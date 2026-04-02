import { useSavedEndpointsStore } from '@/store/useSavedEndpointsStore'

export function useSavedEndpoints() {
  const endpoints = useSavedEndpointsStore((state) => state.endpoints)
  const addEndpoint = useSavedEndpointsStore((state) => state.addEndpoint)
  const deleteEndpoint = useSavedEndpointsStore((state) => state.deleteEndpoint)

  return { endpoints, addEndpoint, deleteEndpoint }
}
