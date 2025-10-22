import { inject, provide, type InjectionKey } from 'vue'
import type { HeroContactControlsBindings } from '~/composables/useHeroContactControls'

export const heroContactControlsInjectionKey: InjectionKey<HeroContactControlsBindings> = Symbol('heroContactControls')

export const provideHeroContactControls = (controls: HeroContactControlsBindings) => {
  provide(heroContactControlsInjectionKey, controls)
}

export const useHeroContactControlsContext = () => {
  const controls = inject(heroContactControlsInjectionKey)
  if (!controls) {
    throw new Error('useHeroContactControlsContext must be used after provideHeroContactControls')
  }
  return controls
}
