import { apiSlice } from "../../api/apiSlice";
import { Todo } from "../../types/todoTypes";

export const extendedApiSlice = apiSlice.injectEndpoints({
    endpoints: builder => ({
        // Generic types theo thu tu la kieu resopone tra ve va agrument
        getTodo: builder.query<Todo[], void>({
            query: () => 'todos',
            transformResponse: (res: Todo[]) => res.sort((a: Required<Todo>, b: Required<Todo>) => b.id - a.id),
            providesTags: (result, error, arg) => [...(result?.map(({ id }) => ({ type: 'Todo' as const, id })) || []), { type: 'Todo' as const, id: 'LIST' }]
        }),
        addTodo: builder.mutation<Todo, Todo>({
            query: initialTodo => ({
                url: '/todos',
                method: 'POST',
                body: initialTodo
            }),
            invalidatesTags: [{ type: 'Todo', id: 'LIST' }]
        }),
        updateTodo: builder.mutation<Todo, Todo>({
            query: initialTodo => ({
                url: `/todos/${initialTodo.id}`,
                method: 'PUT',
                body: initialTodo
            }),
            invalidatesTags: (result, error, arg) => [{ type: 'Todo', id: arg.id }]
        }),
        deleteTodo: builder.mutation<Todo, Todo>({
            query: ({ id }) => ({
                url: `todos/${id}`,
                method: 'DELETE',
                body: { id }
            }),
            invalidatesTags: (result, error, arg) => [{ type: 'Todo', id: arg.id }]
        })
    })
})

export const { useGetTodoQuery, useAddTodoMutation, useUpdateTodoMutation, useDeleteTodoMutation } = extendedApiSlice


