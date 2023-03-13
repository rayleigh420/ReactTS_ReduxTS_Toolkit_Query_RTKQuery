import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

export const apiSlice = createApi({
    reducerPath: 'api',
    baseQuery: fetchBaseQuery({
        baseUrl: 'http://localhost:3500', prepareHeaders(headers, api) {
            headers.set("Authorization", 'Bearer JWT_Token')
            return headers
        },
    }),
    tagTypes: ['Todo'],
    endpoints: builder => ({})
})