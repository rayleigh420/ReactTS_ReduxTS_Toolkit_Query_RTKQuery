import { apiSlice } from "../../api/apiSlice";
import { Todo } from "../../types/todoTypes";

export const extendedApiSlice = apiSlice.injectEndpoints({
    endpoints: builder => ({
        // Generic types theo thu tu la kieu resopone tra ve va agrument
        getTodo: builder.query<Todo[], void>({
            query: () => 'todos',
            providesTags: (result, error, arg) => [...(result?.map(({ id }) => ({ type: 'Todo' as const, id })) || []), { type: 'Todo' as const, id: 'LIST' }]
        }),
        addTodo: builder.mutation<Todo, Todo>({
            query: initialTodo => ({
                url: '/todos',
                method: 'POST',
                body: initialTodo
            }),
            invalidatesTags: [{ type: 'Todo', id: 'LIST' }]
        })
    })
})

export const { useGetTodoQuery, useAddTodoMutation } = extendedApiSlice


