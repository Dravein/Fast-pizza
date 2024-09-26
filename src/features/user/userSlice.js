import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { getAddress } from "../../services/apiGeocoding";

function getPosition() {
  return new Promise(function (resolve, reject) {
    navigator.geolocation.getCurrentPosition(resolve, reject);
  });
}

// //Átlett téve a kód a Redux Thunk Middleware-be
// async function fetchAddress() {
//   // 1) We get the user's geolocation position
//   const positionObj = await getPosition();
//   const position = {
//     latitude: positionObj.coords.latitude,
//     longitude: positionObj.coords.longitude,
//   };

//   // 2) Then we use a reverse geocoding API to get a description of the user's address, so we can display it the order form, so that the user can correct it if wrong
//   const addressObj = await getAddress(position);
//   const address = `${addressObj?.locality}, ${addressObj?.city} ${addressObj?.postcode}, ${addressObj?.countryName}`;

//   // 3) Then we return an object with the data that we are interested in
//   return { position, address };
// }

//Action Creator Thunk MiddleWare-s
//Thunk middleware megcsinlása a fetchAddress()->(Ez lett a action creator funkció amit hívhatunk a kódba.) híváshoz.
export const fetchAddress = createAsyncThunk(
  //3 további action típust csinál (depending promise state, fulfilled state, rejected state ) extraReducers-be kell kezelni
  "user/fetchAddress", //Manuálisan nem használod de megkell adni, mert internal Redux ezt használja.
  async function () {
    // 1) We get the user's geolocation position
    const positionObj = await getPosition();
    const position = {
      latitude: positionObj.coords.latitude,
      longitude: positionObj.coords.longitude,
    };

    // 2) Then we use a reverse geocoding API to get a description of the user's address, so we can display it the order form, so that the user can correct it if wrong
    const addressObj = await getAddress(position);
    const address = `${addressObj?.locality}, ${addressObj?.city} ${addressObj?.postcode}, ${addressObj?.countryName}`;

    // 3) Then we return an object with the data that we are interested in
    //Payload of the fulfilled state
    return { position, address };
  },
);

const initialState = {
  username: "",
  status: "idle",
  position: {},
  address: "",
  error: "",
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    updateName(state, action) {
      state.username = action.payload;
    },
  },
  //Ezek a reducerek kezelik a MiddleWare által létrehozott funkciót
  extraReducers: (builder) =>
    builder
      //Amikor még nem érkezett response csak elküdtük. fetchAddress.pending
      .addCase(fetchAddress.pending, (state, action) => {
        state.status = "loading";
      })
      //Amikor a response sikeres.
      .addCase(fetchAddress.fulfilled, (state, action) => {
        //fetchAddress, Aszinkron funkcióból visszakapott értékek vannak benne, csak akkor ha fulfilled
        (state.position = action.payload.position),
          (state.address = action.payload.address),
          (state.status = "idle");
      })
      //Amikor hiba történik (Pl felhasználó elutasítja a hely felismerést.) action.error.message -> Alapból ide megy az Error.
      .addCase(fetchAddress.rejected, (state, action) => {
        (state.status = "error"),
          (state.error =
            "There was a problm getting your address. Make sure to fill this field.");
      }),
});

//Action Creator
export const { updateName } = userSlice.actions;
// console.log(`userSlice.reducer: ${userSlice.reducer}`);

export default userSlice.reducer;
