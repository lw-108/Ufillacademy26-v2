/**
 * Resolves once the loading screen has finished exiting. Entrance
 * animations (hero) await this so they play in front of the user instead of
 * behind the loader.
 */
let resolveReady: () => void = () => {}

export const appReady: Promise<void> = new Promise<void>((resolve) => {
  resolveReady = resolve
})

export const markAppReady = () => resolveReady()
