import { describe, it, expect, vi, beforeEach } from 'vitest'
import { configureStore } from '@reduxjs/toolkit'
import reducer, {
  fetchAuthors,
  fetchByAuthor,
  fetchBlueprint,
  createBlueprint,
  addPointToBlueprint,
  deleteBlueprint,
  top5Blueprints,
} from '../src/features/blueprints/blueprintsSlice.js'

describe('blueprints slice - estado y reducers', () => {
  it('debe inicializar el estado correctamente', () => {
    const state = reducer(undefined, { type: '@@INIT' })
    expect(state).toEqual({
      authors: [],
      byAuthor: {},
      current: null,
      status: 'idle',
      error: null,
    })
  })

  it('debe manejar fetchAuthors.pending', () => {
    const initialState = {
      authors: [],
      byAuthor: {},
      current: null,
      status: 'idle',
      error: null,
    }

    const state = reducer(initialState, { type: fetchAuthors.pending.type })

    expect(state.status).toBe('loading')
    expect(state.error).toBeNull()
  })

  it('debe manejar fetchAuthors.fulfilled', () => {
    const initialState = {
      authors: [],
      byAuthor: {},
      current: null,
      status: 'loading',
      error: null,
    }

    const authors = ['john', 'jane', 'bob']
    const state = reducer(initialState, {
      type: fetchAuthors.fulfilled.type,
      payload: authors,
    })

    expect(state.status).toBe('succeeded')
    expect(state.authors).toEqual(authors)
  })

  it('debe manejar fetchAuthors.rejected', () => {
    const initialState = {
      authors: [],
      byAuthor: {},
      current: null,
      status: 'loading',
      error: null,
    }

    const state = reducer(initialState, {
      type: fetchAuthors.rejected.type,
      error: { message: 'Network error' },
    })

    expect(state.status).toBe('failed')
    expect(state.error).toBe('Network error')
  })

  it('debe manejar fetchByAuthor.pending', () => {
    const initialState = {
      authors: [],
      byAuthor: {},
      current: null,
      status: 'idle',
      error: null,
    }

    const state = reducer(initialState, { type: fetchByAuthor.pending.type })

    expect(state.status).toBe('loading')
    expect(state.error).toBeNull()
  })

  it('debe manejar fetchByAuthor.fulfilled', () => {
    const initialState = {
      authors: ['john'],
      byAuthor: {},
      current: null,
      status: 'loading',
      error: null,
    }

    const blueprints = [
      { author: 'john', name: 'house', points: [{ x: 10, y: 20 }] },
      { author: 'john', name: 'building', points: [{ x: 30, y: 40 }] },
    ]

    const state = reducer(initialState, {
      type: fetchByAuthor.fulfilled.type,
      payload: { author: 'john', items: blueprints },
    })

    expect(state.byAuthor['john']).toEqual(blueprints)
    expect(state.byAuthor['john'].length).toBe(2)
  })

  it('debe manejar fetchByAuthor.rejected', () => {
    const initialState = {
      authors: [],
      byAuthor: {},
      current: null,
      status: 'loading',
      error: null,
    }

    const state = reducer(initialState, {
      type: fetchByAuthor.rejected.type,
      error: { message: 'Author not found' },
    })

    expect(state.status).toBe('failed')
    expect(state.error).toBe('Author not found')
  })

  it('debe manejar fetchBlueprint.pending', () => {
    const initialState = {
      authors: [],
      byAuthor: {},
      current: null,
      status: 'idle',
      error: null,
    }

    const state = reducer(initialState, { type: fetchBlueprint.pending.type })

    expect(state.status).toBe('loading')
    expect(state.error).toBeNull()
  })

  it('debe manejar fetchBlueprint.fulfilled', () => {
    const initialState = {
      authors: [],
      byAuthor: {},
      current: null,
      status: 'loading',
      error: null,
    }

    const blueprint = { author: 'john', name: 'house', points: [{ x: 10, y: 20 }] }

    const state = reducer(initialState, {
      type: fetchBlueprint.fulfilled.type,
      payload: blueprint,
    })

    expect(state.current).toEqual(blueprint)
    expect(state.status).toBe('succeeded')
  })

  it('debe manejar fetchBlueprint.rejected', () => {
    const initialState = {
      authors: [],
      byAuthor: {},
      current: null,
      status: 'loading',
      error: null,
    }

    const state = reducer(initialState, {
      type: fetchBlueprint.rejected.type,
      error: { message: 'Blueprint not found' },
    })

    expect(state.status).toBe('failed')
    expect(state.error).toBe('Blueprint not found')
  })

  it('debe manejar createBlueprint.pending', () => {
    const initialState = {
      authors: [],
      byAuthor: {},
      current: null,
      status: 'idle',
      error: null,
    }

    const state = reducer(initialState, { type: createBlueprint.pending.type })

    expect(state.status).toBe('loading')
    expect(state.error).toBeNull()
  })

  it('debe manejar createBlueprint.fulfilled', () => {
    const initialState = {
      authors: [],
      byAuthor: { john: [{ name: 'house', points: [] }] },
      current: null,
      status: 'loading',
      error: null,
    }

    const newBlueprint = { author: 'john', name: 'building', points: [{ x: 50, y: 60 }] }

    const state = reducer(initialState, {
      type: createBlueprint.fulfilled.type,
      payload: newBlueprint,
    })

    expect(state.byAuthor['john']).toContainEqual(newBlueprint)
    expect(state.byAuthor['john'].length).toBe(2)
  })

  it('debe manejar createBlueprint.rejected', () => {
    const initialState = {
      authors: [],
      byAuthor: {},
      current: null,
      status: 'loading',
      error: null,
    }

    const state = reducer(initialState, {
      type: createBlueprint.rejected.type,
      error: { message: 'Create failed' },
    })

    expect(state.status).toBe('failed')
    expect(state.error).toBe('Create failed')
  })

  it('debe manejar deleteBlueprint.pending', () => {
    const initialState = {
      authors: [],
      byAuthor: {},
      current: null,
      status: 'idle',
      error: null,
    }

    const state = reducer(initialState, { type: deleteBlueprint.pending.type })

    expect(state.status).toBe('loading')
    expect(state.error).toBeNull()
  })

  it('debe manejar deleteBlueprint.fulfilled', () => {
    const initialState = {
      authors: [],
      byAuthor: {
        john: [
          { author: 'john', name: 'house', points: [{ x: 10, y: 20 }] },
          { author: 'john', name: 'building', points: [{ x: 30, y: 40 }] },
        ],
      },
      current: null,
      status: 'loading',
      error: null,
    }

    const deletedBlueprint = { author: 'john', name: 'house' }

    const state = reducer(initialState, {
      type: deleteBlueprint.fulfilled.type,
      payload: deletedBlueprint,
    })

    expect(state.byAuthor['john'].length).toBe(1)
    expect(state.byAuthor['john'][0].name).toBe('building')
  })

  it('debe manejar deleteBlueprint.rejected', () => {
    const initialState = {
      authors: [],
      byAuthor: {},
      current: null,
      status: 'loading',
      error: null,
    }

    const state = reducer(initialState, {
      type: deleteBlueprint.rejected.type,
      error: { message: 'Delete failed' },
    })

    expect(state.status).toBe('failed')
    expect(state.error).toBe('Delete failed')
  })
})

describe('blueprints slice - selectores', () => {
  it('top5Blueprints debe retornar máximo 5 blueprints ordenados por cantidad de puntos', () => {
    const state = {
      blueprints: {
        authors: [],
        byAuthor: {
          john: [
            { author: 'john', name: 'bp1', points: [1, 2, 3] },
            { author: 'john', name: 'bp2', points: [1, 2] },
          ],
          jane: [
            { author: 'jane', name: 'bp3', points: [1, 2, 3, 4, 5] },
            { author: 'jane', name: 'bp4', points: [1] },
            { author: 'jane', name: 'bp5', points: [1, 2, 3, 4] },
          ],
        },
        current: null,
        status: 'idle',
        error: null,
      },
    }

    const top5 = top5Blueprints(state)

    expect(top5.length).toBeLessThanOrEqual(5)
    expect(top5[0].points.length).toBeGreaterThanOrEqual(top5[1]?.points?.length || 0)
  })
})

describe('blueprints slice - integración con store', () => {
  let store

  beforeEach(() => {
    store = configureStore({
      reducer: {
        blueprints: reducer,
      },
    })
  })

  it('debe retornar el estado inicial del store', () => {
    const state = store.getState()

    expect(state.blueprints).toEqual({
      authors: [],
      byAuthor: {},
      current: null,
      status: 'idle',
      error: null,
    })
  })

  it('debe actualizar el estado cuando se dispatchea fetchAuthors.fulfilled', () => {
    const authors = ['john', 'jane']

    store.dispatch({
      type: fetchAuthors.fulfilled.type,
      payload: authors,
    })

    const state = store.getState()
    expect(state.blueprints.authors).toEqual(authors)
    expect(state.blueprints.status).toBe('succeeded')
  })

  it('debe actualizar el estado cuando se dispatchea fetchByAuthor.fulfilled', () => {
    const blueprints = [
      { author: 'john', name: 'house', points: [{ x: 10, y: 20 }] },
      { author: 'john', name: 'building', points: [{ x: 30, y: 40 }] },
    ]

    store.dispatch({
      type: fetchByAuthor.fulfilled.type,
      payload: { author: 'john', items: blueprints },
    })

    const state = store.getState()
    expect(state.blueprints.byAuthor['john']).toEqual(blueprints)
  })

  it('debe manejar múltiples autores en byAuthor', () => {
    const johnBlueprints = [{ author: 'john', name: 'house', points: [] }]
    const janeBlueprints = [{ author: 'jane', name: 'office', points: [] }]

    store.dispatch({
      type: fetchByAuthor.fulfilled.type,
      payload: { author: 'john', items: johnBlueprints },
    })

    store.dispatch({
      type: fetchByAuthor.fulfilled.type,
      payload: { author: 'jane', items: janeBlueprints },
    })

    const state = store.getState()
    expect(state.blueprints.byAuthor['john']).toEqual(johnBlueprints)
    expect(state.blueprints.byAuthor['jane']).toEqual(janeBlueprints)
  })

  it('debe actualizar el blueprint actual cuando se dispatchea fetchBlueprint.fulfilled', () => {
    const blueprint = { author: 'john', name: 'house', points: [{ x: 10, y: 20 }] }

    store.dispatch({
      type: fetchBlueprint.fulfilled.type,
      payload: blueprint,
    })

    const state = store.getState()
    expect(state.blueprints.current).toEqual(blueprint)
  })

  it('debe manejar errores correctamente', () => {
    store.dispatch({
      type: fetchAuthors.pending.type,
    })

    let state = store.getState()
    expect(state.blueprints.status).toBe('loading')

    store.dispatch({
      type: fetchAuthors.rejected.type,
      error: { message: 'Network error' },
    })

    state = store.getState()
    expect(state.blueprints.status).toBe('failed')
    expect(state.blueprints.error).toBe('Network error')
  })
})
