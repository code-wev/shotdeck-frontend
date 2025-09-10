import { base_url } from "@/utils/utils";
import { createApi } from "@reduxjs/toolkit/query/react";
import { fetchBaseQuery } from "@reduxjs/toolkit/query";

export const usersApi = createApi({
  reducerPath: 'usersApi',
  baseQuery: fetchBaseQuery({ baseUrl: base_url }),
  endpoints: (builder) => ({
    getUsers: builder.query({
      query: () => '/user/getUser' 
    }),
  getSingleUser: builder.query({
  query: (token) => ({
    url: '/user/single-user',
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  }),
})

  })
});

export const { useGetUsersQuery, useGetSingleUserQuery } = usersApi;





