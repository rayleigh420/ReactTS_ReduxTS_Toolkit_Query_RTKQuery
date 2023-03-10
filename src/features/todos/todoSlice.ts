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
        getTodo: builder.query<EntityState<Todo>, number>({
            query: (page = 1) => {

                return {
                    url: 'todos',
                    headers: {
                        RTK_Query_Header: 'RTK_Query_Duy'
                    },
                    params: {
                        _page: page,
                        _limit: 20,
                        _sort: 'id',
                        _order: "desc",
                        first_name: 'Le',
                        'last-name': 'Duy'
                    }
                }
            },
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
            async onQueryStarted(initialTodo, { dispatch, queryFulfilled }) {
                try {
                    const { data: addTodo } = await queryFulfilled
                    const patchResult = dispatch(
                        extendedApiSlice.util.updateQueryData('getTodo', 1, (draft) => {
                            draft.entities[addTodo.id!] = addTodo
                            draft.ids.unshift(addTodo.id!)
                        })
                    )
                } catch { }
            }
            // invalidatesTags: [{ type: 'Todo', id: 'LIST' }]
        }),
        updateTodo: builder.mutation<Todo, Todo>({
            query: initialTodo => ({
                url: `/todos/${initialTodo.id}`,
                method: 'PUT',
                body: initialTodo
            }),
            async onQueryStarted(initialTodo, { dispatch, queryFulfilled }) {
                const patchResult = dispatch(
                    extendedApiSlice.util.updateQueryData('getTodo', 1, (draft) => {
                        draft.entities[initialTodo.id!] = initialTodo
                    })
                )
                try {
                    await queryFulfilled
                } catch {
                    // N???u nh?? c?? qu?? nhi???u request c??ng l??c d??ng ????? mutate th?? vi???c x???y ra error r???t d??? g??y m???y ?????ng b???
                    // Vi???c s??? d???ng undo l?? kh??ng an to??n, do ???? c?? th??? re fetch l???i data ch??nh x??c ??? database ho???c server
                    // dispatch(api.util.invalidateTags([type: 'Todo', id: initialTodo.id])) // g???i l???i getTodo()
                    patchResult.undo()
                }
            },
            // async onQueryStarted(initialTodo, { dispatch, queryFulfilled }) {
            //     try {
            //         const { data: updateTodo } = await queryFulfilled
            //         const patchResult = dispatch(
            //             extendedApiSlice.util.updateQueryData('getTodo', undefined, (draft) => {
            //                 draft.entities[updateTodo.id!] = updateTodo
            //             })
            //         )
            //         console.log(patchResult)
            //     } catch { }
            // },
            // invalidatesTags: (result, error, arg) => [{ type: 'Todo', id: arg.id }]
        }),
        deleteTodo: builder.mutation<Todo, Todo>({
            query: ({ id }) => ({
                url: `todos/${id}`,
                method: 'DELETE',
                body: { id }
            }),
            async onQueryStarted({ id }, { dispatch, queryFulfilled }) {
                const patchResult = dispatch(
                    extendedApiSlice.util.updateQueryData('getTodo', 1, (draft) => {
                        delete draft.entities[id!]
                        const index = draft.ids.indexOf(id!)
                        draft.ids.splice(index, 1)
                    })
                )
                try {
                    await queryFulfilled
                } catch {
                    patchResult.undo()
                }
            }
            // invalidatesTags: (result, error, arg) => [{ type: 'Todo', id: arg.id }]
        }),
        errorTodo: builder.mutation<void, void>({
            query: () => {
                throw Error('Error Todo')
            }
        })
    })
})

// Note:

// G???i th???i gian g???i request ?????n server l?? s (cho b???t c??? request n??o)

// Update: Ng?????i d??ng ch??? s gi??y ?????u ti??n ????? g???i request update v??? cho server. Sau ???? server g???i k???t qu??? v???
// N???u k???t qu??? th??nh c??ng th?? invalidatesTag ti???p t???c trigger ????? refetch l???i d??? li???u v?? ta s??? ch??? th??m s gi??y n???a
// T???ng th???i gian ch??? m??n h??nh: (tr???i nghi???m ch???): 2.s gi??y

// Optimistic: C???p nh???t d??? li???u cache tr?????c khi send request, v?? m??n h??nh UI s??? c???p nh???t ngay l???p t???c.
// N???u sau khi call api v?? th???y l???i ho???c d??? li???u tr??? v??? kh??ng kh???p v???i d??? ??o??n th?? s??? undo l???i cache ban ?????u.
// Kh??ng c???n g???i endpoint fetch l???i d??? li???u. C?? ngh??a ng?????i d??ng th???y m??n h??nh update ngay l???p t???c. Th???i gian ch??? l?? 0

// Pessimistic: C???p nh???t d??? li???u cache sau khi send request. T???c l?? s??? ?????i k???t qu??? t??? server
// N???u sau khi call api v?? th???y l???i th?? ta handle v?? hi???n l??n cho ng?????i d??ng
// Kh??ng c???n g???i endpoint fetch l???i d??? li???u. C?? ngh??a ng?????i th???y m??n h??nh update sau s gi??y. Th???i gian n??y l?? th???i gian g???i request ????? update.

export const { useGetTodoQuery, useAddTodoMutation, useUpdateTodoMutation, useDeleteTodoMutation, useErrorTodoMutation, usePrefetch } = extendedApiSlice


