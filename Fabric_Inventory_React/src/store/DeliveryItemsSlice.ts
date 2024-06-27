import { PayloadAction, createSlice } from "@reduxjs/toolkit";

interface Detail {
    dia: number;
    rolls : number;
    weight :string;
}

interface DeliveryItem {
    color_id : number;
    details: Detail[];
}

interface UpdateData {
    color_id: number;
    dia: number;
    roll?: number;
    weight?: string;
}

interface UpdateColor {
    index: number;
    color_id: number;
}

const initialState: DeliveryItem[] = [];


const DeliveryItemsSlice = createSlice({
    name: 'DeliveryItemsSlice',
    initialState: initialState,
    reducers:{
        add(state, action: PayloadAction<DeliveryItem>) {
            state.push(action.payload);
        },
        remove(state, action: PayloadAction<number>) {
            return state.filter(
                (_,index) => !(index === action.payload)
            );
        },
        clear() {
            return [];
        },
        update(state, action: PayloadAction<UpdateData>) {
            return state.map((s) => {
                if (s.color_id === action.payload.color_id) {
                    const updatedDetails = s.details.map((detail) => {
                        if (detail.dia === action.payload.dia) {
                            return {
                                ...detail,
                                rolls:
                                    action.payload.roll !== undefined
                                        ? action.payload.roll
                                        : detail.rolls,
                                weight:
                                    action.payload.weight !== undefined
                                        ? action.payload.weight
                                        : detail.weight,
                            };
                        }
                        return detail;
                    });
                    return { ...s, details: updatedDetails };
                }
                return s;
            });
        },
        updateColor(state, action: PayloadAction<UpdateColor>) {
            return state.map((s, index) => {
                if (index === action.payload.index) {
                    return {
                        ...s,
                        color_id: action.payload.color_id,
                    };
                }
                return s;
            });
        },
    }
})

export const { add, remove, clear, update, updateColor } = DeliveryItemsSlice.actions;
export default DeliveryItemsSlice.reducer;
