import { createEntityAdapter, EntityState } from "@reduxjs/toolkit";
import { apiSlice } from "../../api/apiSlice";
import { Todo } from "../../types/todoTypes";

const todosAdapter = createEntityAdapter<Todo>({
    sortComparer: (a, b) => b.id! - a.id!
})

const initialState = todosAdapter.getInitialState()

export const extendedApiSlice = apiSlice.injectEndpoints({
    endpoints: builder => ({
        // Generic types theo thu tu la kieu resoponse tra ve va agrument
        getTodo: builder.query<EntityState<Todo>, void>({
            query: () => 'todos',
            // transformResponse: (res: Todo[]) => res.sort((a: Required<Todo>, b: Required<Todo>) => b.id - a.id),
            // transformResponse: (res: Todo[]) => res.sort((a: Todo, b: Todo) => b.id! - a.id!),
            transformResponse: (res: Todo[]) => todosAdapter.setAll(initialState, res),
            // providesTags: (result, error, arg) => [...(result?.map(({ id }) => ({ type: 'Todo' as const, id })) || []), { type: 'Todo' as const, id: 'LIST' }]
            providesTags: (result, error, arg) => [...(result?.ids.map(id => ({ type: 'Todo' as const, id })) || []), { type: 'Todo' as const, id: 'LIST' }]
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
            async onQueryStarted(initialTodo, { dispatch, queryFulfilled }) {
                const patchResult = dispatch(
                    extendedApiSlice.util.updateQueryData('getTodo', undefined, (draft) => {
                        draft.entities[initialTodo.id!] = initialTodo
                    })
                )
                try {
                    await queryFulfilled
                } catch {
                    // Nếu như có quá nhiều request cùng lúc dùng để mutate thì việc xảy ra error rất dễ gây mấy đồng bộ
                    // Việc sử dụng undo là không an toàn, do đó có thể re fetch lại data chính xác ở database hoặc server
                    // dispatch(api.util.invalidateTags([type: 'Todo', id: initialTodo.id])) // gọi lại getTodo()
                    patchResult.undo()
                }
            },
            // invalidatesTags: (result, error, arg) => [{ type: 'Todo', id: arg.id }]
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


