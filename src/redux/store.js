import { configureStore } from '@reduxjs/toolkit';
import { shotApi } from './api/shot';
import {usersApi} from './api/users'
import { setupListeners } from '@reduxjs/toolkit/query';

export const store = configureStore({
  reducer: {
    [shotApi.reducerPath]: shotApi.reducer,
    [usersApi.reducerPath]: usersApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(shotApi.middleware).concat(usersApi.middleware),
});

setupListeners(store.dispatch);
