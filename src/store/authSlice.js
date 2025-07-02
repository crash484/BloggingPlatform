import { createSlice } from '@reduxjs/toolkit'

const initialState = {
    user: null,
    token: null,
    isLoading: false,
    error: null,
}

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        setCredentials: (state, action) => {
            const { user, token } = action.payload
            state.user = user
            state.token = token
            // Save to localStorage when credentials are set
            localStorage.setItem('authUser', JSON.stringify(user))
            localStorage.setItem('authToken', token)
        },
        logout: (state) => {
            state.user = null
            state.token = null
            // Clear localStorage on logout
            localStorage.removeItem('authUser')
            localStorage.removeItem('authToken')
        },
        clearSession: (state) => {
            // For session expiration or token invalidation
            state.user = null
            state.token = null
            state.error = "Session expired. Please login again."
            // Clear localStorage on session end
            localStorage.removeItem('authUser')
            localStorage.removeItem('authToken')
        },
        setLoading: (state, action) => {
            state.isLoading = action.payload
        },
        setError: (state, action) => {
            state.error = action.payload
        },
        clearError: (state) => {
            state.error = null
        },
    },
})

export const { setCredentials, logout, clearSession, setLoading, setError, clearError } = authSlice.actions

export default authSlice.reducer

export const selectCurrentUser = (state) => state.auth.user
export const selectCurrentToken = (state) => state.auth.token