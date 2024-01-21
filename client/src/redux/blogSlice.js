import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import Api from "./API.js";

const initialState = {
  isError: false,
  isSuccess: false,
  isLoading: false,
  user: {},
  profile: "",
};
export const creatBlogThunk = createAsyncThunk(
  "blog/create",
  async (data) => {
    const user = JSON.parse(localStorage.getItem("userInfo"));
    const config = {
      headers: {
        "Content-type": "multipart/form-data",
        Authorization: `Bearer ${user.accessToken}`,
      },
    };
    return await Api.post(`blog/create/`, data, config)
      .then((res) => {
        return res;
      })
      .catch((err) => {
        return err.response;
      });
  }
);



export default blogSlice.reducer;