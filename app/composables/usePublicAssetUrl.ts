export function usePublicAssetUrl(path: string) {
  const { app } = useRuntimeConfig()
  const baseURL = app.baseURL.endsWith('/') ? app.baseURL : `${app.baseURL}/`

  return `${baseURL}${path.replace(/^\/+/, '')}`
}
