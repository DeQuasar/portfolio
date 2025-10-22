import { inject, provide, type InjectionKey, type Ref } from 'vue'

export const heroVisibilityInjectionKey: InjectionKey<Ref<boolean>> = Symbol('heroVisibility')

export const provideHeroVisibility = (state: Ref<boolean>) => {
  provide(heroVisibilityInjectionKey, state)
}

export const useHeroVisibility = () => {
  const state = inject(heroVisibilityInjectionKey)
  if (!state) {
    throw new Error('useHeroVisibility must be used after provideHeroVisibility')
  }
  return state
}
