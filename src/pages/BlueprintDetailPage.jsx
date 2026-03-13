import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'
import { fetchBlueprint } from '../features/blueprints/blueprintsSlice.js'

export default function BlueprintDetailPage() {
  const { author, name } = useParams()
  const dispatch = useDispatch()
  const bp = useSelector((s) => s.blueprints.current)
  const status = useSelector((s) => s.blueprints.status) 


  useEffect(() => {
    dispatch(fetchBlueprint({ author, name }))
  }, [author, name, dispatch])

  if (status === 'loading' || !bp)
    return (
      <div className="card">
        <p>Cargando...</p>
      </div>
    )

    if (status === 'failed')
      return (
        <div className="card">
          <p style={{ color: '#fca5a5' }}>Error al cargar el blueprint</p>
        </div>
      )

      
  const points = bp.points || []

  return (
    <div className="card">
      <h2 style={{ marginTop: 0 }}>{bp.name}</h2>
      <p><strong>Autor:</strong> {bp.author}</p>

      <div style={{ marginBottom: 12 }}>
        <label style={{ marginRight: 8 }}>Plano actual:</label>
        <input
          className="input"
          value={bp.name}
          readOnly
        />
      </div>

      <p><strong>Puntos:</strong> {points.length}</p>

      <svg
        width="400"
        height="300"
        style={{ background: '#0b1220', borderRadius: 12, display: 'block' }}
      >
        {points.map((p, i) => {
          if (i === 0) return null
          const prev = points[i - 1]
          return (
            <line
              key={`line-${i}`}
              x1={prev.x} y1={prev.y}
              x2={p.x}    y2={p.y}
              stroke="#38bdf8"
              strokeWidth={2}
            />
          )
        })}

        {points.map((p, i) => (
          <circle
            key={`point-${i}`}
            cx={p.x} cy={p.y}
            r="5"
            fill="#f472b6"
            stroke="#fff"
            strokeWidth={1}
          />
        ))}
      </svg>
    </div>
  )
}