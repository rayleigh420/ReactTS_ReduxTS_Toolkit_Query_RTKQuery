import { AnyAction, isRejected, isRejectedWithValue, Middleware, MiddlewareAPI } from "@reduxjs/toolkit";
import { toast } from "react-toastify";

export const rtkQueryErrorLogger: Middleware = (api: MiddlewareAPI) => (next) => (action: AnyAction) => {

    // isRejectedWithValue cua createAsyncThunk nen co the su dung de tim ra.
    // Nhung loi tu server moi chay vao day, cac loi thuc thi se khong bi rejected with value = true
    if (isRejected(action)) {
        toast.warn(action.error.message)
    }
    return next(action)
}