import { faUpload } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { ChangeEvent, FormEvent, useState } from "react"
import { useAppDispatch } from "../../app/hooks"
// import { addTodo } from "./todoSlice"

const AddTodoForm = () => {
    const [newTodo, setNewTodo] = useState<string>('')
    const dispatch = useAppDispatch()

    const changeTodo = (e: ChangeEvent<HTMLInputElement>) => setNewTodo(e.target.value)

    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        // dispatch(addTodo({
        //     userID: 1,
        //     title: newTodo,
        //     completed: false
        // }))
        setNewTodo('')
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
        </form>
    )
}

export default AddTodoForm