import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render } from '@testing-library/react'
import BlueprintCanvas from '../src/components/BlueprintCanvas.jsx'

describe('BlueprintCanvas', () => {
  let mockContext
  let canvasSpy

  beforeEach(() => {
    mockContext = {
      canvas: { width: 520, height: 360 },
      fillRect: vi.fn(),
      clearRect: vi.fn(),
      beginPath: vi.fn(),
      moveTo: vi.fn(),
      lineTo: vi.fn(),
      stroke: vi.fn(),
      arc: vi.fn(),
      fill: vi.fn(),
      strokeRect: vi.fn(),
      closePath: vi.fn(),
      save: vi.fn(),
      restore: vi.fn(),
      setTransform: vi.fn(),
      translate: vi.fn(),
      scale: vi.fn(),
      rotate: vi.fn(),
      transform: vi.fn(),
      drawImage: vi.fn(),
      fillText: vi.fn(),
      measureText: () => ({ width: 0 }),
      putImageData: vi.fn(),
      createLinearGradient: () => ({ addColorStop: vi.fn() }),
      createPattern: () => ({}),
      createRadialGradient: () => ({ addColorStop: vi.fn() }),
      getImageData: () => ({}),
      getLineDash: () => [],
      setLineDash: vi.fn(),
    }

    canvasSpy = vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(mockContext)
  })

  afterEach(() => {
    canvasSpy.mockRestore()
  })

  it('renderiza un elemento canvas en el documento', () => {
    const { container } = render(<BlueprintCanvas points={[]} />)
    const canvas = container.querySelector('canvas')
    
    expect(canvas).toBeInTheDocument()
    expect(canvas).toHaveAttribute('width', '520')
    expect(canvas).toHaveAttribute('height', '360')
  })

  it('llama getContext cuando monta el componente', () => {
    render(<BlueprintCanvas points={[]} />)
    expect(canvasSpy).toHaveBeenCalledWith('2d')
  })

  it('limpia y dibuja el fondo del canvas', () => {
    render(<BlueprintCanvas points={[]} />)
    
    expect(mockContext.clearRect).toHaveBeenCalledWith(0, 0, 520, 360)
    expect(mockContext.fillRect).toHaveBeenCalledWith(0, 0, 520, 360)
  })

  it('dibuja la grilla correctamente', () => {
    render(<BlueprintCanvas points={[]} width={520} height={360} />)
    
    expect(mockContext.beginPath).toHaveBeenCalled()
    expect(mockContext.moveTo).toHaveBeenCalled()
    expect(mockContext.lineTo).toHaveBeenCalled()
    expect(mockContext.stroke).toHaveBeenCalled()
  })

  it('dibuja los puntos en el canvas', () => {
    const points = [
      { x: 10, y: 10 },
      { x: 50, y: 60 },
      { x: 100, y: 150 },
    ]
    
    render(<BlueprintCanvas points={points} />)
    
    expect(mockContext.arc).toHaveBeenCalledTimes(3)
    expect(mockContext.arc).toHaveBeenCalledWith(10, 10, 4, 0, Math.PI * 2)
    expect(mockContext.arc).toHaveBeenCalledWith(50, 60, 4, 0, Math.PI * 2)
    expect(mockContext.arc).toHaveBeenCalledWith(100, 150, 4, 0, Math.PI * 2)
  })

  it('dibuja líneas conectando los puntos', () => {
    const points = [
      { x: 10, y: 10 },
      { x: 50, y: 60 },
    ]
    
    render(<BlueprintCanvas points={points} />)
    
    expect(mockContext.moveTo).toHaveBeenCalledWith(10, 10)
    expect(mockContext.lineTo).toHaveBeenCalledWith(50, 60)
  })

  it('no dibuja líneas si hay menos de 2 puntos', () => {
    const { rerender } = render(<BlueprintCanvas points={[]} />)
    
    const callCount = mockContext.moveTo.mock.calls.length
    
    rerender(<BlueprintCanvas points={[{ x: 20, y: 20 }]} />)
    
    const newCount = mockContext.moveTo.mock.calls.length
    expect(newCount).toBe(callCount)
  })

  it('aplica estilos correctos al canvas', () => {
    const { container } = render(<BlueprintCanvas points={[]} width={520} height={360} />)
    const canvas = container.querySelector('canvas')
    
    expect(canvas).toHaveStyle('border-radius: 12px')
    expect(canvas).toHaveStyle('width: 100%')
    expect(canvas).toHaveStyle('max-width: 520px')
  })

  it('actualiza el canvas cuando los puntos cambian', () => {
    const { rerender } = render(<BlueprintCanvas points={[{ x: 10, y: 10 }]} />)
    
    const initialArcCalls = mockContext.arc.mock.calls.length
    
    rerender(<BlueprintCanvas points={[{ x: 10, y: 10 }, { x: 50, y: 60 }]} />)
    

    const newArcCalls = mockContext.arc.mock.calls.length
    expect(newArcCalls).toBeGreaterThan(initialArcCalls)
  })
})
