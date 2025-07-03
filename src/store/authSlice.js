import { createSlice } from '@reduxjs/toolkit'

const initialState = {
    user: null,
    token: null,
    isLoading: false,
    isInitialized: false, // Track if auth state has been restored from localStorage
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
            state.isInitialized = true
            // Save to localStorage when credentials are set
            localStorage.setItem('authUser', JSON.stringify(user))
            localStorage.setItem('authToken', token)
        },
        setInitialized: (state) => {
            state.isInitialized = true
        },
        logout: (state) => {
            state.user = null
            state.token = null
            state.isInitialized = true
            // Clear localStorage on logout
            localStorage.removeItem('authUser')
            localStorage.removeItem('authToken')
        },
        clearSession: (state) => {
            // For session expiration or token invalidation
            state.user = null
            state.token = null
            state.isInitialized = true
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

export const { setCredentials, setInitialized, logout, clearSession, setLoading, setError, clearError } = authSlice.actions

export default authSlice.reducer

export const selectCurrentUser = (state) => state.auth.user
export const selectCurrentToken = (state) => state.auth.token
export const selectIsInitialized = (state) => state.auth.isInitialized