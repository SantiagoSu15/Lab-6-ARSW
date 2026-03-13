import { Navigate } from 'react-router-dom'


function PrivateRoute({ component }) {
    const token = localStorage.getItem('token')
    return token ? component : <Navigate to="/login" />
}

export default PrivateRoute