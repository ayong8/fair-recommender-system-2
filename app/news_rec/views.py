from rest_framework.views import APIView
from rest_framework.response import Response

import pandas as pd
import numpy as np

class LoadData(APIView):
    def get(self, request, format=None):
        df_user_info = pd.read_csv('./app/static/data/df_user_info.csv')
        df_user_stat = pd.read_csv('./app/static/data/df_user_stat.csv')
        df_actual = pd.read_csv('./app/static/data/df_actual_sample.csv')
        df_pred = pd.read_csv('./app/static/data/df_pred_sample.csv')

        user_id = 460523 # 10237
        user_info = df_user_info.loc[df_user_info['userID']==user_id]
        user_stat = df_user_stat.loc[df_user_stat['userID']==user_id]
        df_actual_user = df_actual.loc[df_actual['userID']==user_id]
        df_pred_user = df_pred.loc[df_pred['userID']==user_id]

        df_actual_others = df_actual
        df_pred_others = df_pred
        
        cats_actual = _convert_to_categories(df_actual_user)
        cats_pred = _convert_to_categories(df_pred_user)

        cats_actual_others = _convert_to_categories(df_actual_others)
        cats_pred_others = _convert_to_categories(df_pred_others)

        # print('user_info: ', user_info)
        # print('cats_actual: ', cats_actual)
        
        return Response({
            'userInfo': user_info.to_dict(orient='records'),
            'userStat': user_stat.to_dict(orient='records'),
            'catsActualUser': cats_actual,
            'catsPredUser': cats_pred,
            'catsActualOthers': cats_actual_others,
            'catsPredOthers': cats_pred_others,
        })
    
def _convert_to_categories(df_articles):
    num_all_articles = df_articles.shape[0]
    categories = []
    for cat_name, articles in df_articles.groupby('category'):
        articles = articles.dropna()
        num_articles = articles.shape[0]
        
        categories.append({
            'name': cat_name,
            'articles': articles.to_dict(orient='records'),
            'size': num_articles,
            'ratio': np.round(num_articles / num_all_articles, 15)
        })

    print([ len(cat['articles']) for cat in categories ])
    categories = sorted(categories, key=lambda x: len(x['articles']), reverse=True)
    print([ len(cat['articles']) for cat in categories ])

    return categories