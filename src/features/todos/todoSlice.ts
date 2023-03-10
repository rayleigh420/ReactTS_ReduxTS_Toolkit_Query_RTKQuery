import { apiSlice } from "../../api/apiSlice";
import { Todo } from "../../types/todoTypes";

export const extendedApiSlice = apiSlice.injectEndpoints({
    endpoints: builder => ({
        // Generic types theo thu tu la kieu resopone tra ve va agrument
        getTodo: builder.query<Todo[], void>({
            query: () => 'todos'
        })
    })
})

export const { useGetTodoQuery } = extendedApiSlice


