import { configureStore } from "@reduxjs/toolkit";
import ReceiptItemsSlice from "./ReceiptItemsSlice";
import {  TypedUseSelectorHook, useSelector } from "react-redux";

export const Store = configureStore({
    reducer: {
        receiptItems: ReceiptItemsSlice,
    },
});

export type RootState = ReturnType<typeof Store.getState>;
export const useTypedSelector: TypedUseSelectorHook<RootState> = useSelector;
