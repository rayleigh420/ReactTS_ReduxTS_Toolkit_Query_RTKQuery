import { faUpload } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { ChangeEvent, Dispatch, FormEvent, SetStateAction, useState } from "react"
import { useAppDispatch } from "../../app/hooks"
import { useAddTodoMutation, useErrorTodoMutation, usePrefetch } from "./todoSlice"
// import { addTodo } from "./todoSlice"

interface AddTodoFormProps {
    page: number,
    setPage: Dispatch<SetStateAction<number>>
}

const AddTodoForm = ({ page, setPage }: AddTodoFormProps) => {
    const [newTodo, setNewTodo] = useState<string>('')
    const dispatch = useAppDispatch()

    const [addTodo, { isLoading, isSuccess }] = useAddTodoMutation()
    const [errorTodo] = useErrorTodoMutation()

    const changeTodo = (e: ChangeEvent<HTMLInputElement>) => setNewTodo(e.target.value)

    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (newTodo.length > 0) {
            addTodo({
                userID: 1,
                title: newTodo,
                completed: false
            })
            setNewTodo('')
            if (page != 1)
                setPage(1)
        }
    }

    const handleErrorTodo = () => {
        errorTodo()
    }

    return (
        <form onSubmit={handleSubmit}>
            <label htmlFor="new-todo">Enter a new todo item</label>
            <div className="new-todo">
                <input
                    type="text"
                    id="new-todo"
                    placeholder="Enter new todo"
                    value={newTodo}
                    onChange={changeTodo}
                />
            </div>
            <button className="submit">
                <FontAwesomeIcon icon={faUpload} />
            </button>
            <button onClick={handleErrorTodo}>Error</button>
        </form>
    )
}

export default AddTodoForm