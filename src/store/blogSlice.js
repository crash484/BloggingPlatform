import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'

// Async thunks for blog operations
export const fetchBlogs = createAsyncThunk(
    'blog/fetchBlogs',
    async (_, { rejectWithValue }) => {
        try {
            const response = await fetch('http://localhost:5000/api/blogs')
            const data = await response.json()
            if (!response.ok) throw new Error(data.message)
            return data
        } catch (error) {
            return rejectWithValue(error.message)
        }
    }
)

export const fetchBlogById = createAsyncThunk(
    'blog/fetchBlogById',
    async (blogId, { rejectWithValue }) => {
        try {
            const response = await fetch(`http://localhost:5000/api/blogs/${blogId}`)
            const data = await response.json()
            if (!response.ok) throw new Error(data.message)
            return data
        } catch (error) {
            return rejectWithValue(error.message)
        }
    }
)

export const createBlog = createAsyncThunk(
    'blog/createBlog',
    async (blogData, { rejectWithValue, getState }) => {
        try {
            const { token } = getState().auth
            const response = await fetch('http://localhost:5000/api/blogs', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(blogData)
            })
            const data = await response.json()
            if (!response.ok) throw new Error(data.message)
            return data
        } catch (error) {
            return rejectWithValue(error.message)
        }
    }
)

export const updateBlog = createAsyncThunk(
    'blog/updateBlog',
    async ({ blogId, blogData }, { rejectWithValue, getState }) => {
        try {
            const { token } = getState().auth
            const response = await fetch(`http://localhost:5000/api/blogs/${blogId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(blogData)
            })
            const data = await response.json()
            if (!response.ok) throw new Error(data.message)
            return data
        } catch (error) {
            return rejectWithValue(error.message)
        }
    }
)

export const deleteBlog = createAsyncThunk(
    'blog/deleteBlog',
    async (blogId, { rejectWithValue, getState }) => {
        try {
            const { token } = getState().auth
            const response = await fetch(`http://localhost:5000/api/blogs/${blogId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })
            if (!response.ok) {
                const data = await response.json()
                throw new Error(data.message)
            }
            return blogId
        } catch (error) {
            return rejectWithValue(error.message)
        }
    }
)

const initialState = {
    blogs: [],
    currentBlog: null,
    isLoading: false,
    error: null,
    isCreating: false,
    isUpdating: false,
    isDeleting: false
}

const blogSlice = createSlice({
    name: 'blog',
    initialState,
    reducers: {
        clearCurrentBlog: (state) => {
            state.currentBlog = null
        },
        clearError: (state) => {
            state.error = null
        },
        clearBlogs: (state) => {
            state.blogs = []
            state.currentBlog = null
        }
    },
    extraReducers: (builder) => {
        builder
            // Fetch blogs
            .addCase(fetchBlogs.pending, (state) => {
                state.isLoading = true
                state.error = null
            })
            .addCase(fetchBlogs.fulfilled, (state, action) => {
                state.isLoading = false
                state.blogs = action.payload
            })
            .addCase(fetchBlogs.rejected, (state, action) => {
                state.isLoading = false
                state.error = action.payload
            })
            // Fetch single blog
            .addCase(fetchBlogById.pending, (state) => {
                state.isLoading = true
                state.error = null
            })
            .addCase(fetchBlogById.fulfilled, (state, action) => {
                state.isLoading = false
                state.currentBlog = action.payload
            })
            .addCase(fetchBlogById.rejected, (state, action) => {
                state.isLoading = false
                state.error = action.payload
            })
            // Create blog
            .addCase(createBlog.pending, (state) => {
                state.isCreating = true
                state.error = null
            })
            .addCase(createBlog.fulfilled, (state, action) => {
                state.isCreating = false
                state.blogs.unshift(action.payload)
            })
            .addCase(createBlog.rejected, (state, action) => {
                state.isCreating = false
                state.error = action.payload
            })
            // Update blog
            .addCase(updateBlog.pending, (state) => {
                state.isUpdating = true
                state.error = null
            })
            .addCase(updateBlog.fulfilled, (state, action) => {
                state.isUpdating = false
                const index = state.blogs.findIndex(blog => blog._id === action.payload._id)
                if (index !== -1) {
                    state.blogs[index] = action.payload
                }
                if (state.currentBlog && state.currentBlog._id === action.payload._id) {
                    state.currentBlog = action.payload
                }
            })
            .addCase(updateBlog.rejected, (state, action) => {
                state.isUpdating = false
                state.error = action.payload
            })
            // Delete blog
            .addCase(deleteBlog.pending, (state) => {
                state.isDeleting = true
                state.error = null
            })
            .addCase(deleteBlog.fulfilled, (state, action) => {
                state.isDeleting = false
                state.blogs = state.blogs.filter(blog => blog._id !== action.payload)
                if (state.currentBlog && state.currentBlog._id === action.payload) {
                    state.currentBlog = null
                }
            })
            .addCase(deleteBlog.rejected, (state, action) => {
                state.isDeleting = false
                state.error = action.payload
            })
    }
})

export const { clearCurrentBlog, clearError, clearBlogs } = blogSlice.actions

export default blogSlice.reducer

// Selectors
export const selectAllBlogs = (state) => state.blog.blogs
export const selectCurrentBlog = (state) => state.blog.currentBlog
export const selectBlogLoading = (state) => state.blog.isLoading
export const selectBlogError = (state) => state.blog.error
export const selectIsCreating = (state) => state.blog.isCreating
export const selectIsUpdating = (state) => state.blog.isUpdating
export const selectIsDeleting = (state) => state.blog.isDeleting 