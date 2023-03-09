import { faTrash } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import axios from "axios"
import { useEffect } from "react"
import { useAppDispatch, useAppSelector } from "../../app/hooks"
import { RootState } from "../../app/store"
import { Todo } from "../../types/todoTypes"
import AddTodoForm from "./AddTodoForm"
import { deleteTodo, getTodo, getTodoError, getTodoStatus, selectAllTodo, udpateTodo } from "./todoSlice"

const TodoList = () => {

    const todos = useAppSelector((state: RootState) => selectAllTodo(state))
    const status = useAppSelector(getTodoStatus)
    const error = useAppSelector(getTodoError)

    const dispatch = useAppDispatch()

    useEffect(() => {
        // const getData = async () => {
        //     let result = await axios.get('http://localhost:3500/todos')
        //     console.log(result.data)
        //     dispatch(fetchData(result.data))
        // }

        // getData()

        if (status == 'idle') {
            dispatch(getTodo())
        }
    }, [status, dispatch])

    const changeComplete = (todo: Todo) => {
        dispatch(udpateTodo(todo))
    }

    const deleteTodos = (todo: Todo) => {
        dispatch(deleteTodo(todo))
    }

    let content;
    if (status == 'loading') {
        content = <p>Loading</p>
    } else if (status == 'successed') {
        content = todos.map((todo) => {
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
    } else if (status == 'failed') {
        content = <p>{error}</p>
    }

    return (
        <main>
            <h1>Todo List</h1>
            <AddTodoForm />
            {content}
        </main>
    )
}

export default TodoList