import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    cartItems: localStorage.getItem("cartItems") ? JSON.parse(localStorage.getItem("cartItems")) : [],
};

const getItemId = (item) => item.productId || item._id;

const cartSlice = createSlice({ 
    name: "cart",
    initialState, 
    reducers: {
        addToCart: (state, action) => {
            const item = action.payload;
            const itemId = getItemId(item);
            const existItem = state.cartItems.find((x) => getItemId(x) === itemId);
            if (existItem) {
                state.cartItems = state.cartItems.map((x) =>
                    getItemId(x) === itemId ? item : x);
            } else {
                state.cartItems = [...state.cartItems, item];
            }
            localStorage.setItem("cartItems", JSON.stringify(state.cartItems));
        },
        removeFromCart: (state, action) => {
            const itemId = action.payload;
            state.cartItems = state.cartItems.filter((x) => getItemId(x) !== itemId);
            localStorage.setItem("cartItems", JSON.stringify(state.cartItems));
        },
            clearCart: (state) => {
            state.cartItems = [];
            localStorage.removeItem("cartItems");
        } 
    },
});

export const { addToCart, removeFromCart, clearCart } = cartSlice.actions;
export default cartSlice.reducer;
