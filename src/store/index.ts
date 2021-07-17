import { CommitOptions, createStore, Store } from 'vuex'
import { State, state } from '@/store/state'
import { Getters, getters } from '@/store/getters'
import { Mutations, mutations } from '@/store/mutations'

export type VuexStore = Omit<Store<State>, 'getters' | 'commit'> & {
  getters: {
    [K in keyof Getters]: ReturnType<Getters[K]>
  }
} & {
  commit<K extends keyof Mutations, P extends Parameters<Mutations[K]>[1]> (
    key: K,
    payload: P,
    options?: CommitOptions
  ): ReturnType<Mutations[K]>
}

export const store: VuexStore = createStore({
  state,
  getters,
  mutations
})
