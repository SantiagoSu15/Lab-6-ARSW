# Lab 6 – React Client for Blueprints (Redux + Axios + JWT)

 Modernización del frontend de Blueprints con **React + Vite**, **Redux Toolkit**, **Axios** (interceptores + JWT), **React Router** y pruebas con **Vitest + Testing Library**.

**Autores:** Juan Rangel & Santiago Suarez

---

## Objetivos de aprendizaje

- Diseñar una SPA en React aplicando **componetización** y **Redux (reducers/slices)**.
- Consumir APIs REST de Blueprints con **Axios** y manejar **estados de carga/errores**.
- Integrar **autenticación JWT** con interceptores y rutas protegidas.
- Aplicar buenas prácticas: estructura de carpetas, `.env`, linters, testing, CI.

---

## Requisitos previos

- Backend de Blueprints corriendo (Labs 3, 4 y 5).
- Node.js 18+ y npm.
- docker desktop
---

## Cómo arrancar

**Manera Principal**

```
  docker compose build
```
```
  docker compose up
```

Para levantar Back + front + DB 


Abre `http://localhost:5173`

---

## Variables de entorno

```env
VITE_API_BASE_URL=http://localhost:8080
VITE_USE_MOCK=true   # true = mock en memoria | false = API real
```

---

## Estructura del proyecto

```
blueprints-react-lab/
├─ src/
│  ├─ components/
│  │  └─ BlueprintCanvas.jsx
│  ├─ features/blueprints/
│  │  └─ blueprintsSlice.js
│  ├─ pages/
│  │  ├─ BlueprintsPage.jsx
│  │  ├─ BlueprintDetailPage.jsx
│  │  ├─ LoginPage.jsx
│  │  └─ NotFound.jsx
│  ├─ services/
│  │  ├─ apiClient.js      # axios + interceptores JWT
│  │  └─ apimock.js        # datos en memoria
│  ├─ Util/
│  │  └─ PrivateRoute.jsx
│  ├─ store/index.js
│  ├─ App.jsx
│  ├─ main.jsx
│  └─ styles.css
├─ tests/
│  ├─ BlueprintCanvas.test.jsx
│  ├─ BlueprintForm.test.jsx
│  ├─ BlueprintsPage.test.jsx
│  ├─ blueprintsSlice.test.jsx
│  └─ setup.js
├─ .github/workflows/ci.yml
├─ .env.example
├─ vite.config.js
├─ package.json
└─ README.md
```

---

## Requerimientos implementados

### 1. Canvas (lienzo)

Se implementó el componente `BlueprintCanvas` con dimensiones `520×360`. Dibuja los puntos y los segmentos de recta del blueprint seleccionado usando la API de Canvas de HTML5.


---

### 2. Listar los planos de un autor

Desde `BlueprintsPage` el usuario ingresa el nombre de un autor y se consultan sus blueprints. Los resultados se muestran en una tabla con:

- Nombre del plano
- Número de puntos
- Botón `Open` para abrirlo

El total de puntos del autor se calcula con `useMemo` sobre los items cargados.

---

### 3. Seleccionar un plano y graficarlo

Al hacer clic en `Open`:

1. Se navega a `/blueprints/:author/:name` (ruta protegida).
2. Se despacha `fetchBlueprint` para cargar los puntos.
3. `BlueprintDetailPage` muestra el nombre en un campo de texto y dibuja los segmentos en el SVG/canvas.

---

### 4. Servicios: `apimock` y `apiclient`

Se implementaron dos servicios con la **misma interfaz**:

| Metodo | `apimock` | `apiclient` |
|---|---|---|
| `getAll` | datos en memoria  | `GET /blueprints` |
| `getByAuthor` | filtra por autor | `GET /blueprints/{author}` |
| `getByAuthorAndName` | busca por autor + nombre | `GET /blueprints/{author}/{name}` |
| `create` | push al array | `POST /blueprints` |
| `addPointToBlueprint` | - | `PUT /blueprints/{author}/{name}/points` |
| `deleteBlueprint` | - | `DELETE /blueprints/{author}/{name}` |


El cambio entre uno y otro se hace con **una sola variable** en `.env`:

```env
VITE_USE_MOCK=true   # mock
VITE_USE_MOCK=false  # API real
```

La selección ocurre directamente en `blueprintsSlice.js`:

```js
const blueprintsService =
  import.meta.env.VITE_USE_MOCK === 'true' ? apimock : blueprintsApi
```

---

### 5. Interfaz con React

- El nombre del plano actual se muestra desde el estado global de Redux (`state.blueprints.current`).
- No se manipula el DOM directamente; todo se maneja mediante componentes, props y Redux.

---

### 6. Estilos

- Se usaron estilos personalizados en `styles.css` con clases como `.card`, `.btn`, `.input`, `.grid`.
- Tabla de blueprints con bordes y padding consistentes.
- Banner de error en rojo con botón de reintento.

---

### 7. Pruebas unitarias

Pruebas implementadas con **Vitest + Testing Library**:

| Archivo | Qué valida |
|---|---|
| `BlueprintCanvas.test.jsx` | Render del canvas, llamada a `getContext`, dibujo de puntos |
| `BlueprintForm.test.jsx` | Render de campos, envío de formulario, manejo de JSON inválido |
| `blueprintsSlice.test.jsx` | Estado inicial, ciclo pending/fulfilled/rejected, selector `top5Blueprints` |
| `BlueprintsPage.test.jsx` | Render, dispatch de acciones, tabla, totales, manejo de errores |

```bash
npm test              # todas las pruebas
npm run test:ui       # modo interactivo
npm test -- BlueprintCanvas.test.jsx  # archivo específico
```


---

## Implementacion 

### Redux avanzado

- Estados `loading / error / succeeded` por thunk, visibles en la UI.
- Selector memoizado `top5Blueprints` con `createSelector` que ordena blueprints por cantidad de puntos y retorna los 5 primeros.


**Codigo ejmplo**
```
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

```

---

### Rutas protegidas

Se creó el componente `<PrivateRoute>` que redirige a `/login` si no hay token en `localStorage`:

```jsx
function PrivateRoute({ component }) {
  const token = localStorage.getItem('token')
  return token ? component : <Navigate to="/login" />
}
```

La ruta de detalle esta protegida:

```jsx
<Route path="/blueprints/:author/:name"
  element={<PrivateRoute component={<BlueprintDetailPage />} />} />
```

Para el mock, el `LoginPage` guarda un token falso: `localStorage.setItem('token', 'mock-token-123')`.

---

### Errores y Retry

Si `fetchByAuthor` falla, se muestra un banner rojo con el mensaje de error y un botón **Reintentar** que vuelve a despachar el thunk con el mismo autor:

```jsx
{status === 'failed' && error && (
  <div style={{ background: '#7f1d1d', color: '#fca5a5', ... }}>
    <span>{error}</span>
    <button onClick={retry}>Reintentar</button>
  </div>
)}
```

---

### CI / Lint / Format

Se configuró **GitHub Actions** en `.github/workflows/ci.yml` que corre en cada push o PR a `main`:

1. `npm ci` — instala dependencias
2. `npm run lint` — ESLint
3. `npm run test` — Vitest
4. `npm run build` — build de producción con Vite



---

## Seguridad JWT

### Interceptores Axios (`apiClient.js`)

- **Request:** agrega Authorization: Bearer <token> si hay token en localStorage.
- **Response:** si el servidor responde 401, limpia el token automáticamente.

### Backend- Docker compose

Se agrego al docker-compose la ruta de GHCR y se agrego la DB 

```
services:
  web:
    build: .
    ports:
      - '5173:4173'
    environment:
      - VITE_API_BASE_URL=http://backend:8080/api
    depends_on:
      - backend
  backend:
    image: ghcr.io/santiagosu15/lab-5-arsw:latest
    ports:
      - '8080:8080'
    environment:
    - VITE_API_BASE_URL=http://backend:8080
    - SPRING_DATASOURCE_URL=jdbc:postgresql://java_DB:5432/blueprints
    - SPRING_DATASOURCE_USERNAME=postgres
    - SPRING_DATASOURCE_PASSWORD=postgres
    depends_on:
      - java_DB


  java_DB:
    image: postgres:13.3
    ports:
      - '5432:5432'
    environment:
      - POSTGRES_PASSWORD=postgres
      - POSTGRES_USER=postgres
      - POSTGRES_DB=blueprints
```

Adicional a esto dado que se uso GHCR se realizo un pipeline en el lab 5
para poder hacer push y guardar la imagen del docker-compose del lab anterior

```
name: Docker Compose CI + Push to GHCR

on:
  push:
    branches: ["main"]
  pull_request:
    branches: ["main"]

jobs:
  docker:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout repo
        uses: actions/checkout@v4

      - name: Log in to GitHub Container Registry
        run: echo "${{ secrets.GHCR_PAT }}" | docker login ghcr.io -u ${{ github.actor }} --password-stdin

      - name: Build Docker images
        run: docker compose build

      - name: Start services
        run: docker compose up -d

      - name: Push Docker images to GHCR
        run: docker compose push

      - name: Stop containers
        run: docker compose down

```

Y por ultimo tmb en el back se configuro CORS 


```
 public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOrigins(Arrays.asList("http://localhost:5173"));
        config.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(Arrays.asList("*"));
        config.setAllowCredentials(true);
        
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }

```

