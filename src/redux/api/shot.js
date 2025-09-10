import { base_url } from '@/utils/utils';
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const shotApi = createApi({
  reducerPath: 'shotApi',
  baseQuery: fetchBaseQuery({ baseUrl: base_url }),
  endpoints: (builder) => ({
    getShots: builder.query({
      query: (params) => {
   
        const searchParams = new URLSearchParams(params).toString();
        console.log(searchParams, 'searchparams');
        return `/shot?${searchParams}`;
        
      },
    }),

    postShots: builder.mutation({
      query: (shot) => ({
        url: '/shot', 
        method: 'POST',
        body: shot,
      }),
    }),

getRequestedShot:builder.query({
  query:(token)=>({url: '/shot/shot-request/',

   headers: {
      Authorization: `Bearer ${token}`,
    },

  })
}),
getOverview:builder.query({
  query:()=>({url:'/shot/overview'})
}),


getTrendingShot: builder.query({

  query:()=>({url:'/shot/treanding'})
}),
getShotById:builder.query({
  query:(token)=>({
    url:'/shot/shot-by-id',
     headers: {
      Authorization: `Bearer ${token}`,
    },
    
    
  })

}),
getMyShot:builder.query({
  query:(id)=>({

    url:`collection/single/${id}`

  })
}),
getMyShotSingle:builder.query({
  query:(id)=>({

    url:`collection/singleName/${id}`

  })
}),
getSetting:builder.query({

  query:()=>({
    url:'/shot/website'
  })
}),
getShotCount:builder.query({

  query:()=>({
    url:'/shot/shot-count'
  })
}),
getSingleShot:builder.query({

  query:(id)=>({
    url:`/shot/single-shot/${id}`
  })
})


  }),
});


export const { useGetShotsQuery, usePostShotsMutation, useGetRequestedShotQuery, useGetOverviewQuery, useGetTrendingShotQuery, useGetShotByIdQuery, useGetMyShotQuery,useGetMyShotSingleQuery, useGetSettingQuery, useGetShotCountQuery, useGetSingleShotQuery} = shotApi;
