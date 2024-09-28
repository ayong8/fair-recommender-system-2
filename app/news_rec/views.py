from rest_framework.views import APIView
from rest_framework.response import Response

import pandas as pd
import numpy as np
from scipy.stats import entropy as kl
from scipy.spatial.distance import jensenshannon
import pickle, ast, os

measures = {
    'diversity': ['stereotype', 'popularity_bias'],
    'personalization': ['miscalibration', 'filter_bubble']
}

class LoadData(APIView):
    def get(self, request, format=None):
        data_dir = './app/static/data'
        df_user_info = pd.read_csv(os.path.join(data_dir, 'df_user_info.csv'))
        df_user_stat = pd.read_csv(os.path.join(data_dir, 'df_user_stat.csv'))
        df_actual = pd.read_csv(os.path.join(data_dir, 'df_actual_sample.csv'))
        df_pred = pd.read_csv(os.path.join(data_dir, 'df_pred_sample.csv'))
        user_ids = pickle.load(open(os.path.join(data_dir, 'user_ids_all.pkl'), 'rb'))

        actual_uvs = pickle.load(open(os.path.join(data_dir, 'actual_uvs_all.pkl'), 'rb'))
        pred_uvs = pickle.load(open(os.path.join(data_dir, 'pred_uvs_all.pkl'), 'rb'))
        [ actual_arith_mean_uv, _, 
            pred_arith_mean_uv, _ ] = pickle.load(open(os.path.join(data_dir, 'mean_uvs_all.pkl'), 'rb'))
        categories = pd.read_csv(os.path.join(data_dir, 'categories.txt'), \
                            sep='|', header=None, names=['da', 'en'])['en'].tolist()

        user_id = 460523 # 10237
        user_idx = np.where(user_ids == 460523)[0]
        user_info = df_user_info.loc[df_user_info['userID']==user_id]
        user_stat = df_user_stat.loc[df_user_stat['userID']==user_id]
        df_actual_user = df_actual.loc[df_actual['userID']==user_id]
        df_pred_user = df_pred.loc[df_pred['userID']==user_id]
        actual_uv = np.round(actual_uvs[user_idx].flatten(), 3)
        pred_uv = np.round(pred_uvs[user_idx].flatten(), 3)

        df_actual_others = df_actual
        df_pred_others = df_pred
        actual_mean_uv = actual_arith_mean_uv
        pred_mean_uv = pred_arith_mean_uv

        cat_measures, top_entries_dict = calc_uv_and_measures_for_user_entries(
            user_id,
            categories,
            actual_uv, 
            pred_uv, 
            actual_mean_uv,
            pred_mean_uv
        )

        print('cat_measures: ', cat_measures)
        
        cats_actual = _convert_to_categories(df_actual_user, cat_measures, top_entries_dict)
        cats_pred = _convert_to_categories(df_pred_user, cat_measures, top_entries_dict)

        cats_actual_others = _convert_to_categories(df_actual_others, cat_measures, top_entries_dict)
        cats_pred_others = _convert_to_categories(df_pred_others, cat_measures, top_entries_dict)

        # print('user_info: ', user_info)
        # print('cats_actual: ', cats_actual)
        
        return Response({
            # 'selectedUserId': 
            'userInfo': user_info.to_dict(orient='records'),
            'userStat': user_stat.to_dict(orient='records'),
            'catsActualUser': cats_actual,
            'catsPredUser': cats_pred,
            'catsActualOthers': cats_actual_others,
            'catsPredOthers': cats_pred_others,
        })
    
def calc_uv_and_measures_for_user_entries(
    user_id,
    categories,
    actual_uv, 
    pred_uv, 
    actual_arith_mean_uv,
    pred_arith_mean_uv
):    
    entry_measure_dict = {}
    for entry_i, cat in enumerate(categories):
        entry_name = categories[entry_i]
        entry_actual = actual_uv[entry_i]
        entry_pred = pred_uv[entry_i]
        entry_actual_mean = actual_arith_mean_uv[entry_i]
        entry_pred_mean = pred_arith_mean_uv[entry_i]

        # print('mean: ', entry_actual_mean_uv, entry_pred_mean_uv)
        ST = compute_stereotype_for_entry(entry_actual, entry_pred, entry_actual_mean, entry_pred_mean)
        MC = compute_miscalibration_for_entry(entry_actual, entry_pred)
        FB = compute_pref_amplification(entry_actual, entry_pred)
        PB = compute_popularity_lift_for_entry(entry_actual, entry_pred_mean)
        # PB = 0
        print('pred_uv: ', entry_name, entry_actual, entry_pred, ST, MC, FB, PB)
    
        entry_measure_dict[entry_name] = {
            'miscalibration': float(MC),
            'filter_bubble': float(FB),
            'stereotype': float(ST),
            'popularity_bias': float(PB)
        }

    df_cat_measures = pd.DataFrame.from_dict(entry_measure_dict).transpose()
    df_cat_measures_normed = (df_cat_measures - df_cat_measures.min()) / (df_cat_measures.max() - df_cat_measures.min())
    df_cat_measures['diversity'] = df_cat_measures_normed[measures['diversity']].mean(axis=1)
    df_cat_measures['personalization'] = df_cat_measures_normed[measures['personalization']].mean(axis=1)
    df_cat_measures['bipolar'] = df_cat_measures['diversity'] - df_cat_measures['personalization']
    top_entries_dict = find_prominent_entries(df_cat_measures)
    entry_measures_dict = df_cat_measures.transpose().to_dict(orient='dict')
    
    return entry_measures_dict, top_entries_dict

# Find the top and last-k entries
# By the combined score (bipolar) or individual scores (
def find_prominent_entries(df_cat_measures):
    score = 'bipolar' # 'bipolar' or 'individual'
    df_bipolar_sorted = df_cat_measures['bipolar'].sort_values(ascending=False)
    df_diversity_sorted = df_cat_measures['diversity'].sort_values(ascending=False)
    df_personalization_sorted = df_cat_measures['personalization'].sort_values(ascending=False)

    if score == 'bipolar':
        return {
            'isTopDiversity': df_bipolar_sorted[:2].index.tolist(),
            'isTopPersonalization': df_bipolar_sorted[-2:].index.tolist()
        }
    else:
        return {
            'isTopDiversity': df_diversity_sorted[:2].index.tolist(),
            'isTopPersonalization': df_personalization_sorted[:2].index.tolist()
        }
    
# Calculate serendipity measure as a filter bubble quantification
# Serendipity 1/|Q| * sum_all_items_in_Q ( (1-rel_P) * rel_Q )
# where P and Q are the set of recommended items
def compute_serendipity_for_entry(entry_actual, entry_pred):
    return (1 - entry_pred) * entry_actual

# def compute_major_category_dominance

def compute_pref_amplification(entry_actual, entry_pred):
    return (entry_actual) * (entry_pred - entry_actual)

def compute_miscalibration_for_entry(entry_actual, entry_pred):
    return np.abs(entry_actual - entry_pred)

def compute_stereotype_for_entry(entry_actual, entry_pred, entry_actual_mean, entry_pred_mean):
    return (entry_actual_mean - entry_actual) \
        - (entry_pred_mean - entry_pred)

def compute_popularity_lift_for_entry(entry_actual, entry_pred_mean):
    if entry_actual == 0:
        entry_actual += 0.0001
    return np.round(entry_pred_mean / entry_actual, 3)

'''
    Input: entries(topics or categories)
    Based on the entry ratio, pick and mark the top-k as major categories
'''
def _encode_major_categories(entries):
    # topics are sorted by its size, so their indices indicate the ranking
    num_major_cats = 2
    for rank, e_dict in enumerate(entries):
        if rank < num_major_cats:
            e_dict['is_major'] = True
        else:
            e_dict['is_major'] = False

    return entries

'''
    Input: entries(topics or categories)
    Based on the entry ratio, pick and mark the last-k as minor categories
'''
def _encode_minor_categories(entries):
    # topics are sorted by its size, so their indices indicate the ranking
    num_minor_cats = 2
    for rank, e_dict in enumerate(entries):
        if rank > len(entries)-1-num_minor_cats:
            e_dict['is_minor'] = True
        else:
            e_dict['is_minor'] = False

    return entries

def _convert_to_categories(df_interactions, entry_measures, top_entries_dict):
    num_all_items = df_interactions.shape[0]

    categories = []
    for cat, c_items in df_interactions.groupby('category'):
        c_items = c_items.dropna()
        num_items_in_c = c_items.shape[0]

        c_items['topics'] = c_items['topics'].apply(lambda x: x.replace("' '", "', '"))
        c_items['topics'] = c_items['topics'].apply(ast.literal_eval)
        c_items = c_items.explode('topics')

        # Group by topics within each category
        topics = []
        for topic, num_items_in_c_t in c_items.groupby(['topics']):
            num_num_items_in_c_t = num_items_in_c_t.shape[0]
            topics.append({
                'name': topic[0],
                'items': num_items_in_c_t.to_dict(orient='records'),
                'size': num_num_items_in_c_t,
                'ratio': np.round(num_num_items_in_c_t / num_items_in_c, 3)
            })

        # Sort topics by its size and mark ranking
        topics = sorted(topics, key=lambda x: len(x['items']), reverse=True)
        topics = _encode_major_categories(topics)
        topics = _encode_minor_categories(topics)
        # print('major: ', [ t['ratio'] if t['is_major']==True else None for t in topics ])
        # print('minor: ', [ t['ratio'] if t['is_minor']==True else None for t in topics ])

        categories.append({
            'name': cat,
            'isTopDiversity': True if cat in(top_entries_dict['isTopDiversity']) else False,
            'isTopPersonalization': True if cat in(top_entries_dict['isTopPersonalization']) else False,
            'items': c_items.to_dict(orient='records'),
            'size': num_items_in_c,
            'ratio': round(num_items_in_c / num_all_items, 15),
            'topics': topics,
            'measures': entry_measures[cat]
        })

    # Sort categories by its size
    categories = sorted(categories, key=lambda x: len(x['items']), reverse=True)
    categories = _encode_major_categories(categories)
    categories = _encode_minor_categories(categories)

    return categories