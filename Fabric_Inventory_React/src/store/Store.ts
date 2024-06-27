import { configureStore } from "@reduxjs/toolkit";
import ReceiptItemsSlice from "./ReceiptItemsSlice";
import {  TypedUseSelectorHook, useSelector } from "react-redux";
import DeliveryItemsSlice from "./DeliveryItemsSlice";

export const Store = configureStore({
    reducer: {
        receiptItems: ReceiptItemsSlice,
        deliveryItems: DeliveryItemsSlice
    },
});

export type RootState = ReturnType<typeof Store.getState>;
export const useTypedSelector: TypedUseSelectorHook<RootState> = useSelector;
