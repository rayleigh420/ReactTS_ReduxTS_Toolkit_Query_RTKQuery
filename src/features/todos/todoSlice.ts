import { AnyAction, AsyncThunk, createAsyncThunk, createEntityAdapter, createSlice, EntityState, isFulfilled, PayloadAction } from "@reduxjs/toolkit";
import axios from "axios";
import { RootState } from "../../app/store";
import { Todo } from "../../types/todoTypes";

type GenericAsyncThunk = AsyncThunk<unknown, unknown, any>

type PendingAction = ReturnType<GenericAsyncThunk['pending']>
type RejectedAction = ReturnType<GenericAsyncThunk['rejected']>
type FulfilledAction = ReturnType<GenericAsyncThunk['fulfilled']>

function isPendingAction(action: AnyAction): action is PendingAction {
    return action.type.endsWith('/pending')
}

function isFulfilledAction(action: AnyAction): action is FulfilledAction {
    return action.type.endsWith('/fulfilled')
}

function isRejectedAction(action: AnyAction): action is RejectedAction {
    return action.type.endsWith('/rejected')
}

const todosAdapter = createEntityAdapter<Required<Todo>>({
    sortComparer: (a, b) => b.id - a.id,
})
interface TodoState extends EntityState<Required<Todo>> {
    status: 'idle' | 'loading' | 'successed' | 'failed',
    error: null | string
}

const initialState: TodoState = todosAdapter.getInitialState({
    status: 'idle',
    error: null
})

const todo = createSlice({
    name: 'todos',
    initialState,
    reducers: {},
    extraReducers: (bulder) => {
        bulder
            .addCase(getTodo.fulfilled, (state, action) => {
                const todo = action.payload;
                todosAdapter.upsertMany(state, todo)
            })
            .addCase(addTodo.fulfilled, (state, action) => {
                const todo = action.payload;
                todosAdapter.addOne(state, todo)
            })
            .addCase(udpateTodo.fulfilled, (state, action) => {
                const todo = action.payload;
                todosAdapter.upsertOne(state, todo)
            })
            .addCase(deleteTodo.fulfilled, (state, action) => {
                const { id } = action.payload;
                todosAdapter.removeOne(state, id)
            })
            .addMatcher<PendingAction>(isPendingAction, (state) => {
                state.status = 'loading'
            })
            .addMatcher<FulfilledAction>(isFulfilledAction, (state) => {
                state.status = 'successed'
            })
            .addMatcher<RejectedAction>(isRejectedAction, (state, action) => {
                state.status = 'failed'
                state.error = action.payload as string
            })
    }
})

export const getTodo = createAsyncThunk('todos/getTodo', async () => {
    try {
        let result = await axios.get<Todo[]>('http://localhost:3500/todos');
        return result.data
    } catch (e: any) {
        return e.message
    }
})

export const addTodo = createAsyncThunk('todos/addTodo', async (todo: Todo, thunkAPI) => {
    try {
        let result = await axios.post<Todo>('http://localhost:3500/todos', todo);
        return result.data
    } catch (e: any) {
        return e.message
    }
})

export const udpateTodo = createAsyncThunk('todos/udpateTodo', async (todo: Todo) => {
    try {
        const { id } = todo;
        let result = await axios.put<Todo>(
            `http://localhost:3500/todos/${id}`,
            todo
        );
        return result.data;
    } catch (e: any) {
        return e.message;
    }
})

export const deleteTodo = createAsyncThunk('todos/deleteTodo', async (todo: Todo) => {
    try {
        const { id } = todo;
        let result = await axios.delete<Todo>(
            `http://localhost:3500/todos/${id}`
        );
        if (result?.status === 200) return todo;
        return `${result?.status}: ${result?.statusText}`;
    } catch (e: any) {
        return e.message;
    }
})

export const { selectAll: selectAllTodo } = todosAdapter.getSelectors(
    (state: RootState) => state.todo
)

export const getTodoStatus = (state: RootState) => state.todo.status
export const getTodoError = (state: RootState) => state.todo.error

// export const { fetchData } = todo.actions

export default todo.reducer

