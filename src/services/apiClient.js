import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 8000,
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response && err.response.status === 401) {
      // Optionally redirect to login or clear token
      localStorage.removeItem('token')
    }
    return Promise.reject(err)
  },
)


const blueprintsApi = {
  getAll: async () => {
    const response = await api.get('/blueprints').catch((error) => {
      throw new Error(error.response.data.message)
    })
    return response.data
  },

  getByAuthor: async (author) => {
    const response = await api.get(`/blueprints/${author}`).catch((error) => {
      throw new Error(error.response.data.message)
    })
    return response.data
  },

  getByAuthorAndName : async (author, bName) => {
    const response = await api.get(`/blueprints/${author}/${bName}`).catch((error) => {
      throw new Error(error.response.data.message)
    })
    return response.data
  },

  create: async (blueprintRequest) => {
    const response = await api.post('/blueprints', blueprintRequest).catch((error) => {
      throw new Error(error.response.data.message)
    })
    return response.data
  },

  addPointToBlueprint: async (author, bName, pointRequest) => {
    const response = await api.put(`/blueprints/${author}/${bName}/points`, pointRequest).catch((error) => {
      throw new Error(error.response.data.message)
    })
    return response.data
  },
  deleteBlueprint: async (author, bName) => {
    const response = await api.delete(`/blueprints/${author}/${bName}`).catch((error) => {
      throw new Error(error.response.data.message)
    })
    return response.data
  }
}



export {api, blueprintsApi }

export default api
