import { PayloadAction, createSlice } from "@reduxjs/toolkit";

interface ReceiptItem {
    color_id: number;
    dia: number;
    rolls: number;
    weight: string;
}

const initialState: ReceiptItem[] = [];

export const ReceiptItemsSlice = createSlice({
    name: "ReceiptItemsSlice",
    initialState: initialState,
    reducers: {
        add(state, action: PayloadAction<ReceiptItem>) {
            const index = state.findIndex(
                (s) =>
                    s.color_id === action.payload.color_id &&
                    s.dia === action.payload.dia
            );
            if (index === -1) {
                state.push(action.payload);
            } else {
                return state.map((s) => {
                    if (s.color_id === action.payload.color_id) {
                        return {
                            color_id: s.color_id,
                            dia: s.dia,
                            rolls: s.rolls + action.payload.rolls,
                            weight: (
                                parseFloat(s.weight) +
                                parseFloat(action.payload.weight)
                            ).toString(),
                        };
                    } else {
                        return s;
                    }
                });
            }
        },
        remove(state, action: PayloadAction<ReceiptItem>) {
            return state.filter(
                (s) =>
                    !(
                        s.color_id === action.payload.color_id &&
                        s.dia === action.payload.dia
                    )
            );
        },
        clear(){
            return [];
        }
    },
});

export const { add, remove, clear } = ReceiptItemsSlice.actions;
export default ReceiptItemsSlice.reducer;
