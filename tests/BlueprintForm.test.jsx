import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import BlueprintForm from '../src/components/BlueprintForm.jsx'

describe('BlueprintForm', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renderiza el formulario con todos los campos', () => {
    const onSubmit = vi.fn()
    render(<BlueprintForm onSubmit={onSubmit} />)

    expect(screen.getByLabelText(/Autor/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Nombre/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Puntos/i)).toBeInTheDocument()
    expect(screen.getByText(/Guardar/i)).toBeInTheDocument()
  })

  it('tiene valores por defecto en los campos', () => {
    const onSubmit = vi.fn()
    render(<BlueprintForm onSubmit={onSubmit} />)

    const authorInput = screen.getByDisplayValue('')
    expect(screen.getByLabelText(/Nombre/i)).toHaveValue('')
    expect(screen.getByLabelText(/Puntos/i)).toHaveValue('[{"x":10,"y":10},{"x":40,"y":60}]')
  })

  it('actualiza el campo de autor cuando el usuario escribe', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    render(<BlueprintForm onSubmit={onSubmit} />)

    const authorInput = screen.getByPlaceholderText('juan.perez')
    await user.type(authorInput, 'john.doe')

    expect(authorInput).toHaveValue('john.doe')
  })

  it('actualiza el campo de nombre cuando el usuario escribe', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    render(<BlueprintForm onSubmit={onSubmit} />)

    const nameInput = screen.getByPlaceholderText('mi-dibujo')
    await user.type(nameInput, 'house-design')

    expect(nameInput).toHaveValue('house-design')
  })

  it('actualiza el campo de puntos JSON cuando el usuario escribe', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    render(<BlueprintForm onSubmit={onSubmit} />)

    const pointsInput = screen.getByLabelText(/Puntos/i)
    await user.clear(pointsInput)
    await user.type(pointsInput, '[{"x":1,"y":2}]')

    expect(pointsInput).toHaveValue('[{"x":1,"y":2}]')
  })

  it('envía el formulario con puntos parseados correctamente', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    render(<BlueprintForm onSubmit={onSubmit} />)

    await user.type(screen.getByPlaceholderText('juan.perez'), 'john')
    await user.type(screen.getByPlaceholderText('mi-dibujo'), 'house')
    
    const pointsInput = screen.getByLabelText(/Puntos/i)
    await user.clear(pointsInput)
    await user.type(pointsInput, '[{"x":1,"y":2},{"x":3,"y":4}]')

    await user.click(screen.getByText(/Guardar/i))

    expect(onSubmit).toHaveBeenCalledWith({
      author: 'john',
      name: 'house',
      points: [
        { x: 1, y: 2 },
        { x: 3, y: 4 },
      ],
    })
    expect(onSubmit).toHaveBeenCalledTimes(1)
  })

  it('maneja JSON inválido mostrando alert', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {})

    render(<BlueprintForm onSubmit={onSubmit} />)

    const pointsInput = screen.getByLabelText(/Puntos/i)
    await user.clear(pointsInput)
    await user.type(pointsInput, 'invalid json {]')

    await user.click(screen.getByText(/Guardar/i))

    expect(alertSpy).toHaveBeenCalledWith('JSON de puntos inválido')
    expect(onSubmit).not.toHaveBeenCalled()

    alertSpy.mockRestore()
  })

  it('previene el envío por defecto del formulario', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    const { container } = render(<BlueprintForm onSubmit={onSubmit} />)

    const form = container.querySelector('form')
    const submitEvent = new Event('submit', { bubbles: true, cancelable: true })
    const preventDefaultSpy = vi.spyOn(submitEvent, 'preventDefault')

    form.dispatchEvent(submitEvent)

    expect(preventDefaultSpy).toHaveBeenCalled()
  })

  it('envía con múltiples puntos en JSON válido', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    render(<BlueprintForm onSubmit={onSubmit} />)

    const complexJSON = '[{"x":10,"y":20},{"x":30,"y":40},{"x":50,"y":60},{"x":70,"y":80}]'

    await user.type(screen.getByPlaceholderText('juan.perez'), 'architect')
    await user.type(screen.getByPlaceholderText('mi-dibujo'), 'building-v1')

    const pointsInput = screen.getByLabelText(/Puntos/i)
    await user.clear(pointsInput)
    await user.type(pointsInput, complexJSON)

    await user.click(screen.getByText(/Guardar/i))

    expect(onSubmit).toHaveBeenCalledWith({
      author: 'architect',
      name: 'building-v1',
      points: [
        { x: 10, y: 20 },
        { x: 30, y: 40 },
        { x: 50, y: 60 },
        { x: 70, y: 80 },
      ],
    })
  })

  it('el botón tiene la clase correcta', () => {
    const onSubmit = vi.fn()
    render(<BlueprintForm onSubmit={onSubmit} />)

    const button = screen.getByText(/Guardar/i)
    expect(button).toHaveClass('btn', 'primary')
  })

  it('los campos de entrada tienen la clase correcta', () => {
    const onSubmit = vi.fn()
    render(<BlueprintForm onSubmit={onSubmit} />)

    const authorInput = screen.getByPlaceholderText('juan.perez')
    const nameInput = screen.getByPlaceholderText('mi-dibujo')
    const pointsInput = screen.getByLabelText(/Puntos/i)

    expect(authorInput).toHaveClass('input')
    expect(nameInput).toHaveClass('input')
    expect(pointsInput).toHaveClass('input')
  })
})
