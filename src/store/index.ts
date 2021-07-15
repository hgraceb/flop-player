import { createStore, Store } from 'vuex'
import { State, state } from '@/store/state'
import { Getters, getters } from '@/store/getters'

type VuexStore = Omit<Store<State>, 'getters'> & {
  getters: {
    [K in keyof Getters]: ReturnType<Getters[K]>
  }
}

export const store: VuexStore = createStore({
  state,
  getters
})
