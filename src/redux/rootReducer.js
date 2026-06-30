import { combineReducers } from "@reduxjs/toolkit";
import authReducer from "@/src/redux/slices/authSlice";
import profileReducer from "@/src/redux/slices/profileSlice";
import dashboardReducer from "@/src/redux/slices/dashboardSlice";
import distributorReducer from "@/src/redux/slices/distributorSlice";
import retailerReducer from "@/src/redux/slices/retailerSlice";
import fundRequestReducer from "@/src/redux/slices/fundRequestSlice";
import transactionReducer from "@/src/redux/slices/transactionSlice";
import walletReducer from "@/src/redux/slices/walletSlice";

const rootReducer = combineReducers({
  auth: authReducer,
  profile: profileReducer,
  dashboard: dashboardReducer,
  distributor: distributorReducer,
  retailer: retailerReducer,
  fundRequest: fundRequestReducer,
  transaction: transactionReducer,
  wallet: walletReducer,
});

export default rootReducer;
