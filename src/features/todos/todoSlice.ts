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
                        extendedApiSlice.util.updateQueryData('getTodo', undefined, (draft) => {
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
                    extendedApiSlice.util.updateQueryData('getTodo', undefined, (draft) => {
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

// Gọi thời gian gọi request đến server là s (cho bất cứ request nào)

// Update: Người dùng chờ s giây đầu tiên để gửi request update về cho server. Sau đó server gửi kết quả về
// Nếu kết quả thành công thì invalidatesTag tiếp tục trigger để refetch lại dữ liệu và ta sẽ chờ thêm s giây nữa
// Tổng thời gian chờ màn hình: (trải nghiệm chờ): 2.s giây

// Optimistic: Cập nhật dữ liệu cache trước khi send request, và màn hình UI sẽ cập nhật ngay lập tức.
// Nếu sau khi call api và thấy lỗi hoặc dữ liệu trả về không khớp với dự đoán thì sẽ undo lại cache ban đầu.
// Không cần gọi endpoint fetch lại dữ liệu. Có nghĩa người dùng thấy màn hình update ngay lập tức. Thời gian chờ là 0

// Pessimistic: Cập nhật dữ liệu cache sau khi send request. Tức là sẽ đợi kết quả tử server
// Nếu sau khi call api và thấy lỗi thì ta handle và hiện lên cho người dùng
// Không cần gọi endpoint fetch lại dữ liệu. Có nghĩa người thấy màn hình update sau s giây. Thời gian này là thời gian gửi request để update.

export const { useGetTodoQuery, useAddTodoMutation, useUpdateTodoMutation, useDeleteTodoMutation, useErrorTodoMutation } = extendedApiSlice


