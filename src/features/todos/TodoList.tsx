import { faTrash } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import axios from "axios"
import { useCallback, useEffect, useState } from "react"
import { useAppDispatch, useAppSelector } from "../../app/hooks"
import { RootState } from "../../app/store"
import { Todo } from "../../types/todoTypes"
import AddTodoForm from "./AddTodoForm"
import { useDeleteTodoMutation, useGetTodoQuery, usePrefetch, useUpdateTodoMutation } from "./todoSlice"

const TodoList = () => {

    const prefetchTodoNextPage = usePrefetch('getTodo')


    const [page, setPage] = useState<number>(1)
    // Refetch function force RTK query fetch all data again
    // Config them refetchOnMouseOrArgChange: fetch lai data theo dieu kien them vao
    // RefechOnMouseFocus: khi focus vao trang thi se fetch
    // RefetchOnReConnect: khi co mang hay mat mang se fetch
    // Viec fetch lai data se fetch vao cache chu khong phai goi lai hook nen se khong co hieu ung loading //
    // Voi polling thi no se goi lai hook nen se co hieu ung loading
    const { data: todos, isFetching, isError, isSuccess, error, refetch } = useGetTodoQuery(page, {
        pollingInterval: 50000000 // 
    })
    const [udpateTodo, updateTodoResult] = useUpdateTodoMutation()
    const [deleteTodo, deleteTodoResult] = useDeleteTodoMutation()

    const prefetchPage = useCallback(() => {
        prefetchTodoNextPage(page + 1)
    }, [page, prefetchTodoNextPage])

    const changeComplete = (todo: Todo) => {
        // dispatch(udpateTodo(todo))
        udpateTodo(todo)
    }

    const deleteTodos = (todo: Todo) => {
        // dispatch(deleteTodo(todo))
        deleteTodo(todo)
    }

    let content;
    if (isFetching) {
        content = <p>Loading</p>
    } else if (isSuccess) {
        content = todos.ids.map((id) => {
            const todo = todos.entities[id]!
            return (
                <article key={todo.id}>
                    <div className="todo">
                        <input
                            type="checkbox"
                            checked={todo.completed}
                            id={String(todo.id)}
                            onChange={() =>
                                changeComplete({ ...todo, completed: !todo.completed })
                            }
                        />
                        <label htmlFor={String(todo.id)}>{todo.title}</label>
                    </div>
                    <button className="trash">
                        <FontAwesomeIcon icon={faTrash} onClick={() => deleteTodos(todo)} />
                    </button>
                </article>
            );
        });
    } else if (isError) {
        content = <p>Error</p>
    }

    return (
        <main>
            <h1>Todo List</h1>
            <AddTodoForm page={page} setPage={setPage} />
            {content}
            <button onClick={refetch}>Refetch</button>
            <div className="page">
                <button onClick={() => setPage(prev => prev - 1)} disabled={page == 1}>Prev</button>
                <button onClick={() => setPage(prev => prev + 1)} disabled={page == 3} onMouseEnter={prefetchPage}>Next</button>
            </div>
        </main>
    )
}

export default TodoList