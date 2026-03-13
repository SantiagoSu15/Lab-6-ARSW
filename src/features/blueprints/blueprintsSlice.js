import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { createSelector } from '@reduxjs/toolkit'
import { blueprintsApi } from '../../services/apiClient.js'
import apimock from '../../services/apimock.js'

const blueprintsService =
  import.meta.env.VITE_USE_MOCK === 'true' ? apimock : blueprintsApi




export const fetchAuthors = createAsyncThunk('blueprints/fetchAuthors', async () => {
  const  data  = await blueprintsService.getAll()
  const authors = [...new Set(data.map((bp) => bp.author))]
  return authors
})

export const fetchByAuthor = createAsyncThunk('blueprints/fetchByAuthor', async (author) => {
  const  data  = await blueprintsService.getByAuthor(author).catch((error) => {
    throw new Error(error.response.data.message)
  })
  return { author, items: data }
})

export const fetchBlueprint = createAsyncThunk('blueprints/fetchBlueprint',async ({ author, name }) => {
  const  data   = await blueprintsService.getByAuthorAndBluePoint(author, name)
    return data
  },
)

export const createBlueprint = createAsyncThunk('blueprints/createBlueprint', async (blueprintRequest) => {
  const  data   = await blueprintsService.createBlueprint(blueprintRequest)
  return data
})

export const addPointToBlueprint = createAsyncThunk('blueprints/addPointToBlueprint', async ({author, bName, pointRequest}) => {
  const  data   = await blueprintsService.addPointToBlueprint(author, bName, pointRequest)
  return data
})

export const deleteBlueprint = createAsyncThunk('blueprints/deleteBlueprint', async ({author, bName}) => {
  const  data   = await blueprintsService.deleteBlueprint(author, bName)
  return data
})




const slice = createSlice({
  name: 'blueprints',
  initialState: {
    authors: [],
    byAuthor: {},
    current: null,
    status: 'idle',
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // autor
      .addCase(fetchAuthors.pending, (s) => {
        s.status = 'loading'
        s.error = null
      })
      .addCase(fetchAuthors.fulfilled, (s, a) => {
        s.status = 'succeeded'
        s.authors = a.payload
      })
      .addCase(fetchAuthors.rejected, (s, a) => {
        s.status = 'failed'
        s.error = a.error.message
      })
      //por autor
      .addCase(fetchByAuthor.fulfilled, (s, a) => {
        s.byAuthor[a.payload.author] = a.payload.items
      })
      .addCase(fetchByAuthor.rejected, (s, a) => {
        s.status = 'failed'
        s.error = a.error.message
      })
      .addCase(fetchByAuthor.pending, (s) => {
        s.status = 'loading'
        s.error = null
      })
      //por blueprint
      .addCase(fetchBlueprint.fulfilled, (s, a) => {
        s.current = a.payload
      })

      .addCase(fetchBlueprint.rejected, (s, a) => {
        s.status = 'failed'
        s.error = a.error.message
      })
      .addCase(fetchBlueprint.pending, (s) => {
        s.status = 'loading'
        s.error = null
      })
      //crear blueprint
      .addCase(createBlueprint.fulfilled, (s, a) => {
        const bp = a.payload
        if (s.byAuthor[bp.author]) s.byAuthor[bp.author].push(bp)
      })
      .addCase(createBlueprint.rejected, (s, a) => {
        s.status = 'failed'
        s.error = a.error.message
      })
      .addCase(createBlueprint.pending, (s) => {
        s.status = 'loading'
        s.error = null
      })
      //agregar punto a blueprint
      .addCase(addPointToBlueprint.fulfilled, (s, a) => {
        const bp = a.payload
        if (s.byAuthor[bp.author]) s.byAuthor[bp.author].push(bp)
      })
      .addCase(addPointToBlueprint.rejected, (s, a) => {
        s.status = 'failed'
        s.error = a.error.message
      })
      .addCase(addPointToBlueprint.pending, (s) => {
        s.status = 'loading'
        s.error = null
      })
      //eliminar blueprint
      .addCase(deleteBlueprint.fulfilled, (s, a) => {
        const bp = a.payload
        if (s.byAuthor[bp.author]) s.byAuthor[bp.author] = s.byAuthor[bp.author].filter((item) => item.name !== bp.name)
        
      })
      .addCase(deleteBlueprint.rejected, (s, a) => {
        s.status = 'failed'
        s.error = a.error.message
      })
      .addCase(deleteBlueprint.pending, (s) => {
        s.status = 'loading'
        s.error = null
      })
  },
})


const inputSelector = (state) => state.blueprints.byAuthor



export const top5Blueprints = createSelector( [inputSelector], (byAuthor)=>{
    const allBlueprints = Object.values(byAuthor).flat()
    allBlueprints.sort((a, b) => (b.points?.length || 0) - (a.points?.length || 0))
    return allBlueprints.slice(0, 5)
})



export default slice.reducer
