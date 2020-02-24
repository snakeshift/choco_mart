export const loading = {
    namespaced: true,
    state: {
      isLoading: false
    },
    getters: {
      isLoading(state) {
        return state.isLoading;
      }
    },
    mutations: {
      setIsLoading(state, isLoading) {
        state.isLoading = isLoading
      }
    },
    actions: {
  
    }
  }