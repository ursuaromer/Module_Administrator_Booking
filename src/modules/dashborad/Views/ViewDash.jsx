import React from 'react'
import { useAuth } from '../../auth/context/AuthContext'

const ViewDash = () => {
    const { user, role, token, isAuthenticated } = useAuth()

    return (
        <div style={{ padding: 16 }}>
            <h2>Dashboard</h2>
            <div style={{ marginTop: 12 }}>
                <div><strong>Autenticado:</strong> {String(isAuthenticated)}</div>
                <div><strong>Role:</strong> {role || '(sin role)'}</div>
                <div><strong>Token:</strong> {token ? `${token.slice(0, 16)}...` : '(sin token)'}</div>
            </div>

            <div style={{ marginTop: 16 }}>
                <h3>Usuario</h3>
                {user ? (
                    <pre style={{ background: '#f6f6f6', padding: 12, borderRadius: 8, overflow: 'auto' }}>
                        {JSON.stringify(user, null, 2)}
                    </pre>
                ) : (
                    <div>(sin usuario en sesión)</div>
                )}
            </div>
        </div>
    )
}

export default ViewDash
