import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Provider } from 'react-redux'
import { configureStore, createSlice } from '@reduxjs/toolkit'
import BlueprintsPage from '../src/pages/BlueprintsPage.jsx'
import {
  fetchAuthors,
  fetchByAuthor,
  fetchBlueprint,
} from '../src/features/blueprints/blueprintsSlice.js'

// Mock de acciones async para testing sin backend
vi.mock('../src/features/blueprints/blueprintsSlice.js', async () => {
  const actual = await vi.importActual('../src/features/blueprints/blueprintsSlice.js')
  
  return {
    ...actual,
    fetchAuthors: vi.fn(() => ({ type: 'blueprints/fetchAuthors' })),
    fetchByAuthor: vi.fn((author) => ({ 
      type: 'blueprints/fetchByAuthor', 
      payload: author,
      unwrap: () => Promise.resolve({ author, items: [] })
    })),
    fetchBlueprint: vi.fn((payload) => ({ 
      type: 'blueprints/fetchBlueprint', 
      payload 
    })),
  }
})

function makeStore(preloaded = {}) {
  const blueprintsSlice = createSlice({
    name: 'blueprints',
    initialState: {
      authors: [],
      byAuthor: {},
      current: null,
      status: 'idle',
      error: null,
      ...preloaded,
    },
    reducers: {
      setAuthors: (s, a) => { s.authors = a.payload },
      setByAuthor: (s, a) => { s.byAuthor[a.payload.author] = a.payload.items },
      setCurrent: (s, a) => { s.current = a.payload },
      setStatus: (s, a) => { s.status = a.payload },
    },
  })

  return configureStore({ 
    reducer: { blueprints: blueprintsSlice.reducer },
    middleware: (getDefaultMiddleware) => getDefaultMiddleware(),
  })
}

describe('BlueprintsPage - Render y estructura', () => {
  it('renderiza el titulo y campos correctamente', () => {
    const store = makeStore()
    render(
      <Provider store={store}>
        <BlueprintsPage />
      </Provider>,
    )

    expect(screen.getByText(/Blueprints/i)).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/Author/i)).toBeInTheDocument()
    expect(screen.getByText(/Get blueprints/i)).toBeInTheDocument()
    expect(screen.getByText(/Results/i)).toBeInTheDocument()
    expect(screen.getByText(/Current blueprint/i)).toBeInTheDocument()
  })

  it('renderiza el canvas en la sección de blueprint actual', () => {
    const store = makeStore()
    const { container } = render(
      <Provider store={store}>
        <BlueprintsPage />
      </Provider>,
    )

    const canvas = container.querySelector('canvas')
    expect(canvas).toBeInTheDocument()
  })

  it('muestra "Sin resultados" cuando no hay blueprints', () => {
    const store = makeStore({
      byAuthor: {},
      status: 'idle',
    })

    render(
      <Provider store={store}>
        <BlueprintsPage />
      </Provider>,
    )

    expect(screen.getByText(/Sin resultados/i)).toBeInTheDocument()
  })

  it('muestra mensaje de carga cuando status es loading', () => {
    const store = makeStore({
      status: 'loading',
    })

    render(
      <Provider store={store}>
        <BlueprintsPage />
      </Provider>,
    )

    expect(screen.getByText(/Cargando/i)).toBeInTheDocument()
  })
})

describe('BlueprintsPage - Interacciones con inputs', () => {
  it('actualiza el valor del input de autor cuando el usuario escribe', async () => {
    const user = userEvent.setup()
    const store = makeStore()

    render(
      <Provider store={store}>
        <BlueprintsPage />
      </Provider>,
    )

    const input = screen.getByPlaceholderText(/Author/i)
    await user.type(input, 'john.doe')

    expect(input).toHaveValue('john.doe')
  })

  it('limpia el input después de buscar', async () => {
    const user = userEvent.setup()
    const store = makeStore()

    render(
      <Provider store={store}>
        <BlueprintsPage />
      </Provider>,
    )

    const input = screen.getByPlaceholderText(/Author/i)
    await user.type(input, 'john')
    await user.click(screen.getByText(/Get blueprints/i))

    expect(input).toHaveValue('john')
  })
})

describe('BlueprintsPage - Dispatch de acciones Redux', () => {
  it('dispatchea fetchAuthors al montar el componente', () => {
    const store = makeStore()
    const dispatchSpy = vi.spyOn(store, 'dispatch')

    render(
      <Provider store={store}>
        <BlueprintsPage />
      </Provider>,
    )

    expect(dispatchSpy).toHaveBeenCalled()
    dispatchSpy.mockRestore()
  })

  it('dispatchea fetchByAuthor cuando se hace click en Get blueprints', async () => {
    const user = userEvent.setup()
    const store = makeStore()

    render(
      <Provider store={store}>
        <BlueprintsPage />
      </Provider>,
    )

    const input = screen.getByPlaceholderText(/Author/i)
    await user.type(input, 'john')
    await user.click(screen.getByText(/Get blueprints/i))

    expect(fetchByAuthor).toHaveBeenCalledWith('john')
  })

  it('no dispatchea fetchByAuthor si el input está vacío', async () => {
    const user = userEvent.setup()
    const store = makeStore()

    vi.clearAllMocks()

    const { rerender } = render(
      <Provider store={store}>
        <BlueprintsPage />
      </Provider>,
    )

    await user.click(screen.getByText(/Get blueprints/i))

    expect(fetchByAuthor).not.toHaveBeenCalled()
  })

  it('dispatchea fetchBlueprint cuando se abre un blueprint', async () => {
    const user = userEvent.setup()
    const blueprints = [
      { author: 'john', name: 'house', points: [{ x: 10, y: 20 }] },
      { author: 'john', name: 'building', points: [{ x: 30, y: 40 }] },
    ]
    const store = makeStore({
      byAuthor: { john: blueprints },
    })

    vi.clearAllMocks()

    render(
      <Provider store={store}>
        <BlueprintsPage />
      </Provider>,
    )

    const openButtons = screen.getAllByText(/Open/i)
    await user.click(openButtons[0])

    expect(fetchBlueprint).toHaveBeenCalledWith({
      author: 'john',
      name: 'house',
    })
  })
})

describe('BlueprintsPage - Visualización de blueprints', () => {
  it('renderiza tabla con blueprints cuando hay datos', () => {
    const blueprints = [
      { author: 'john', name: 'house', points: [{ x: 10, y: 20 }] },
      { author: 'john', name: 'building', points: [{ x: 30, y: 40 }, { x: 50, y: 60 }] },
    ]
    const store = makeStore({
      byAuthor: { john: blueprints },
    })

    const { container } = render(
      <Provider store={store}>
        <BlueprintsPage />
      </Provider>,
    )

    expect(container.querySelector('table')).toBeInTheDocument()
    expect(screen.getByText(/house/i)).toBeInTheDocument()
    expect(screen.getByText(/building/i)).toBeInTheDocument()
  })

  it('muestra el nombre del autor en la sección de blueprints', () => {
    const blueprints = [
      { author: 'john', name: 'house', points: [] },
    ]
    const store = makeStore({
      byAuthor: { john: blueprints },
    })

    render(
      <Provider store={store}>
        <BlueprintsPage />
      </Provider>,
    )
    
    expect(screen.getByText(/Results/i)).toBeInTheDocument()
  })

  it('calcula correctamente el total de puntos', () => {
    const blueprints = [
      { author: 'john', name: 'house', points: [1, 2, 3] },
      { author: 'john', name: 'building', points: [1, 2, 3, 4] },
    ]
    const store = makeStore({
      byAuthor: { john: blueprints },
    })

    render(
      <Provider store={store}>
        <BlueprintsPage />
      </Provider>,
    )

    expect(screen.getByText(/Total user points: 7/i)).toBeInTheDocument()
  })

  it('muestra el nombre del blueprint actual', () => {
    const currentBlueprint = { author: 'john', name: 'my-house', points: [] }
    const store = makeStore({
      current: currentBlueprint,
    })

    render(
      <Provider store={store}>
        <BlueprintsPage />
      </Provider>,
    )

    expect(screen.getByText(/Current blueprint: my-house/i)).toBeInTheDocument()
  })

  it('muestra un guión cuando no hay blueprint actual', () => {
    const store = makeStore({
      current: null,
    })

    render(
      <Provider store={store}>
        <BlueprintsPage />
      </Provider>,
    )

    expect(screen.getByText(/Current blueprint: —/i)).toBeInTheDocument()
  })
})

describe('BlueprintsPage - Manejo de errores', () => {
  it('muestra alerta cuando hay error al obtener blueprints', async () => {
    const user = userEvent.setup()
    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {})
    const store = makeStore()

    // Mock fetchByAuthor para que lance error
    fetchByAuthor.mockImplementationOnce(() => ({
      type: 'blueprints/fetchByAuthor',
      unwrap: () => Promise.reject(new Error('Author not found')),
    }))

    render(
      <Provider store={store}>
        <BlueprintsPage />
      </Provider>,
    )

    const input = screen.getByPlaceholderText(/Author/i)
    await user.type(input, 'invalid-author')
    await user.click(screen.getByText(/Get blueprints/i))

    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalledWith('Author not found')
    })

    alertSpy.mockRestore()
  })
})

describe('BlueprintsPage - Integración completa', () => {
  it('flujo completo: cargar autores, obtener blueprints y abrir uno', async () => {
    const user = userEvent.setup()
    const blueprints = [
      { author: 'john', name: 'house', points: [{ x: 10, y: 20 }] },
    ]
    const store = makeStore({
      byAuthor: { john: blueprints },
    })

    vi.clearAllMocks()

    render(
      <Provider store={store}>
        <BlueprintsPage />
      </Provider>,
    )

    // Verificar que fetchAuthors se llamó al montar
    expect(fetchAuthors).toHaveBeenCalled()

    // El blueprint debe aparecer en la tabla
    expect(screen.getByText(/house/i)).toBeInTheDocument()

    // Hacer click en abrir
    const openButton = screen.getByText(/Open/i)
    await user.click(openButton)

    // Verificar que fetchBlueprint se llamó
    expect(fetchBlueprint).toHaveBeenCalledWith({
      author: 'john',
      name: 'house',
    })
  })
})
