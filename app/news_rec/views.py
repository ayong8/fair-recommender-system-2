from rest_framework.views import APIView
from rest_framework.response import Response

import pandas as pd
import numpy as np
from scipy.stats import entropy as kl
from scipy.spatial.distance import jensenshannon
import pickle, ast, os

data_dir = './app/static/data'
measures = {
    'diversity': ['stereotype', 'popularity_bias'],
    'personalization': ['miscalibration', 'filter_bubble']
}

class LoadData(APIView):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.load_static_data()

    def load_static_data(self):
        self.df_users = pd.read_csv(os.path.join(data_dir, 'df_user_info.csv'))
        self.df_user_stat = pd.read_csv(os.path.join(data_dir, 'df_user_stat.csv'))
        self.df_actual = pd.read_csv(os.path.join(data_dir, 'df_actual_sample.csv'))
        self.df_pred = pd.read_csv(os.path.join(data_dir, 'df_pred_sample.csv'))
        self.user_ids = pickle.load(open(os.path.join(data_dir, 'user_ids_all.pkl'), 'rb'))
        self.actual_uvs = pickle.load(open(os.path.join(data_dir, 'actual_uvs_all.pkl'), 'rb'))
        self.pred_uvs = pickle.load(open(os.path.join(data_dir, 'pred_uvs_all.pkl'), 'rb'))
        [ self.actual_arith_mean_uv, _, 
            self.pred_arith_mean_uv, _ ] = pickle.load(open(os.path.join(data_dir, 'mean_uvs_all.pkl'), 'rb'))
        self.categories = pd.read_csv(os.path.join(data_dir, 'categories.txt'), \
                            sep='|', header=None, names=['da', 'en'])['en'].tolist()

    def get(self, request, format=None):
        user_id = 460523  # Default user ID
        user_data = load_user_data(user_id, self.df_users, self.df_user_stat, self.df_actual, 
                                   self.df_pred, self.user_ids, self.actual_uvs, self.pred_uvs, 
                                   self.actual_arith_mean_uv, self.pred_arith_mean_uv, self.categories)

        # Compute user-level measures
        user_level_measures = calc_user_level_measures(user_data['cats_actual'], user_data['cats_pred'], user_data['cats_pred_others'])
        user_dict = {
            **user_data['user_info_dict'],
            **user_data['user_stat_dict'],
            **user_level_measures
        }

        return Response({
            'users': self.df_users.to_dict(orient='records'),
            'user': user_dict,
            'catsActualUser': user_data['cats_actual'],
            'catsPredUser': user_data['cats_pred'],
            'catsActualOthers': user_data['cats_actual_others'],
            'catsPredOthers': user_data['cats_pred_others'],
        })

    def post(self, request, format=None):
        user_id = int(request.data.get('user_id'))
        if not user_id:
            return Response({"error": "user_id is required"}, status=400)

        user_data = load_user_data(user_id, self.df_users, self.df_user_stat, self.df_actual, 
                                   self.df_pred, self.user_ids, self.actual_uvs, self.pred_uvs, 
                                   self.actual_arith_mean_uv, self.pred_arith_mean_uv, self.categories)

        # Compute user-level measures
        user_level_measures = calc_user_level_measures(user_data['cats_actual'], user_data['cats_pred'], user_data['cats_pred_others'])
        user_dict = {
            **user_data['user_info_dict'],
            **user_data['user_stat_dict'],
            **user_level_measures
        }

        return Response({
            'user': user_dict,
            'catsActualUser': user_data['cats_actual'],
            'catsPredUser': user_data['cats_pred'],
            'catsActualOthers': user_data['cats_actual_others'],
            'catsPredOthers': user_data['cats_pred_others'],
        })
    

def load_user_data(
    user_id, 
    df_users, 
    df_user_stat, 
    df_actual, 
    df_pred, 
    user_ids, 
    actual_uvs, 
    pred_uvs, 
    actual_arith_mean_uv, 
    pred_arith_mean_uv, 
    categories
):
    user_idx = np.where(user_ids == user_id)[0]
    user_info_dict = df_users.loc[df_users['userID']==user_id].to_dict(orient='records')[0]
    user_stat_dict = df_user_stat.loc[df_user_stat['userID']==user_id].to_dict(orient='records')[0]
    df_actual_user = df_actual.loc[df_actual['userID']==user_id]
    df_pred_user = df_pred.loc[df_pred['userID']==user_id]
    actual_uv = np.round(actual_uvs[user_idx].flatten(), 3)
    pred_uv = np.round(pred_uvs[user_idx].flatten(), 3)

    df_actual_others = df_actual
    df_pred_others = df_pred
    actual_mean_uv = actual_arith_mean_uv
    pred_mean_uv = pred_arith_mean_uv

    # Compute category-level measures
    df_cat_measures = calc_cat_level_measures(
        user_id, 
        categories, 
        actual_uv, 
        pred_uv, 
        actual_mean_uv, 
        pred_mean_uv
    )

    top_entries_dict = find_top_entries(df_cat_measures, by='separate_score')
    cat_measures = df_cat_measures.transpose().to_dict(orient='dict')
    
    cats_actual = _convert_to_categories(df_actual_user, cat_measures, top_entries_dict)
    cats_pred = _convert_to_categories(df_pred_user, cat_measures, top_entries_dict)
    cats_actual_others = _convert_to_categories(df_actual_others, cat_measures, top_entries_dict)
    cats_pred_others = _convert_to_categories(df_pred_others, cat_measures, top_entries_dict)

    return {
        'user_info_dict': user_info_dict,
        'user_stat_dict': user_stat_dict,
        'df_actual_user': df_actual_user,
        'df_pred_user': df_pred_user,
        'actual_uv': actual_uv,
        'pred_uv': pred_uv,
        'df_actual_others': df_actual_others,
        'df_pred_others': df_pred_others,
        'actual_mean_uv': actual_mean_uv,
        'pred_mean_uv': pred_mean_uv,
        'cats_actual': cats_actual,
        'cats_pred': cats_pred,
        'cats_actual_others': cats_actual_others,
        'cats_pred_others': cats_pred_others
    }
    
def calc_cat_level_measures(
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
            'actual': entry_actual,
            'pred': entry_pred,
            'miscalibration': float(MC),
            'filter_bubble': float(FB),
            'stereotype': float(ST),
            'popularity_bias': float(PB)
        }

    df_entry_measures = pd.DataFrame.from_dict(entry_measure_dict).transpose()
    df_entry_measures_normed = (df_entry_measures - df_entry_measures.min()) / (df_entry_measures.max() - df_entry_measures.min())
    print(df_entry_measures_normed.to_csv(os.path.join(data_dir, 'df_entry_measures.csv')))
    df_entry_measures['diversity'] = df_entry_measures_normed[measures['diversity']].mean(axis=1)
    df_entry_measures['personalization'] = df_entry_measures_normed[measures['personalization']].mean(axis=1)
    df_entry_measures['bipolar'] = df_entry_measures['diversity'] - df_entry_measures['personalization']
    
    return df_entry_measures

def calc_user_level_measures(cats_actual, cats_pred, cats_pred_others):
    # Major categories are identified based on a user's actual preferences
    major_cats_in_actual = [ cat for cat in cats_actual if cat['isMajor'] == True ]
    minor_cats_in_actual = [ cat for cat in cats_actual if cat['isMinor'] == True ]
    major_cat_names = [ cat['name'] for cat in major_cats_in_actual ]
    minor_cat_names = [ cat['name'] for cat in minor_cats_in_actual ]

    FB_measures_dict = compute_filter_bubble_for_user(cats_actual, cats_pred, major_cat_names, minor_cat_names)
    ST_measures_dict = compute_stereotype_for_user(cats_actual, cats_pred, cats_pred_others, major_cat_names, minor_cat_names)

    return {
        **FB_measures_dict,
        **ST_measures_dict
    }

# Find the top and last-k entries
# Identified based on 
#     1) combined score (bipolar), 
#     2) individual scores (diversity and personalization score)
#  or 3) frequency
def find_top_entries(df_entry_measures, by='bipolar_score'):
    by = 'bipolar_score' # 'bipolar' or 'individual'
    df_bipolar_sorted = df_entry_measures['bipolar'].sort_values(ascending=False)
    df_diversity_sorted = df_entry_measures['diversity'].sort_values(ascending=False)
    df_personalization_sorted = df_entry_measures['personalization'].sort_values(ascending=False)

    if by == 'bipolar_score':
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
    return  (entry_pred - entry_actual) / (entry_actual) if entry_actual != 0 else 0

def compute_pref_penetration(entry_actual, entry_pred, entry_pred_others):
    e = -0.001
    dev_from_actual = entry_actual - entry_pred_others
    dev_from_pred = entry_pred - entry_pred_others
    if dev_from_actual == 0:
        dev_from_actual += e
    if dev_from_pred == 0:
        dev_from_pred += e
    return  dev_from_actual / dev_from_pred

def compute_miscalibration_for_entry(entry_actual, entry_pred):
    return np.abs(entry_actual - entry_pred)

def compute_stereotype_for_entry(entry_actual, entry_pred, entry_actual_mean, entry_pred_mean):
    return (entry_actual_mean - entry_actual) \
        - (entry_pred_mean - entry_pred)

def compute_popularity_lift_for_entry(entry_actual, entry_pred_mean):
    if entry_actual == 0:
        entry_actual += 0.0001
    return np.round(entry_pred_mean / entry_actual, 3)

def compute_filter_bubble_for_user(cats_actual, cats_pred, major_cat_names, minor_cat_names):
    # Compute major preference amplification
    major_pref_amps = []
    for cat_name in major_cat_names:
        entry_actual = [ cat['ratio'] for cat in cats_actual if cat['name'] == cat_name ][0]
        entry_pred = [ cat['ratio'] for cat in cats_pred if cat['name'] == cat_name ][0]
        major_pref_amps.append(compute_pref_amplification(entry_actual, entry_pred))
    
    # Compute major preference deamplification
    minor_pref_deamps = []
    for cat_name in minor_cat_names:
        entry_actual = [ cat['ratio'] for cat in cats_actual if cat['name'] == cat_name ][0]
        entry_pred = [ cat['ratio'] for cat in cats_pred if cat['name'] == cat_name ][0]
        minor_pref_deamps.append(-compute_pref_amplification(entry_actual, entry_pred))

    # Compute filter bubble as the sum of major-pref amplification and minor-pref deamplification
    major_pref_amp = np.mean(major_pref_amps)
    minor_pref_deamp = np.mean(minor_pref_deamps)
    filter_bubble = major_pref_amp + minor_pref_deamp
    
    return {
        'filter_bubble': filter_bubble, 
        'major_pref_amp': major_pref_amp, 
        'minor_pref_deamp': minor_pref_deamp
    }

def compute_stereotype_for_user(actual_uv, pred_uv, actual_arith_mean_uv, pred_arith_mean_uv):
    return jensenshannon(actual_arith_mean_uv, actual_uv) - jensenshannon(pred_arith_mean_uv, pred_uv)


def compute_stereotype_for_user(cats_actual, cats_pred, cats_pred_others, major_cat_names, minor_cat_names):
    # Compute major preference amplification
    major_pref_penetrations = []
    for cat_name in major_cat_names:
        entry_actual = [ cat['ratio'] for cat in cats_actual if cat['name'] == cat_name ][0]
        entry_pred = [ cat['ratio'] for cat in cats_pred if cat['name'] == cat_name ][0]
        entry_pred_others = [ cat['ratio'] for cat in cats_pred_others if cat['name'] == cat_name ][0]
        major_pref_penetrations.append(compute_pref_penetration(entry_actual, entry_pred, entry_pred_others))
    
    # Compute major preference deamplification
    minor_pref_penetrations = []
    for cat_name in minor_cat_names:
        entry_actual = [ cat['ratio'] for cat in cats_actual if cat['name'] == cat_name ][0]
        entry_pred = [ cat['ratio'] for cat in cats_pred if cat['name'] == cat_name ][0]
        entry_pred_others = [ cat['ratio'] for cat in cats_pred_others if cat['name'] == cat_name ][0]
        minor_pref_penetrations.append(compute_pref_penetration(entry_actual, entry_pred, entry_pred_others))
    
    # Compute filter bubble as the sum of major-pref amplification and minor-pref deamplification
    major_pref_penetration = np.mean(major_pref_penetrations)
    minor_pref_penetration = np.mean(minor_pref_penetrations)
    stereotype = np.mean(major_pref_penetration + minor_pref_penetration)

    return {
        'stereotype': stereotype,
        'major_pref_penetration': major_pref_penetration,
        'minor_pref_penetration': minor_pref_penetration
    }

def _encode_entries(entries, num_major_cats, num_minor_cats, small_cats_thres):
    num_entries = len(entries)
    num_major_cats = 2
    num_minor_cats = 2
    small_cats_thres = 0.15

    for rank, e_dict in enumerate(entries):
        entries[rank] = _encode_major_entries(e_dict, rank, num_major_cats)
        entries[rank] = _encode_minor_entries(e_dict, num_entries, rank, num_minor_cats)
        entries[rank] = _encode_small_entries(e_dict, small_cats_thres)
    return entries

'''
    Input: entry dict
    Based on the entry ratio, pick and mark the top-k as major categories
'''
def _encode_major_entries(e_dict, rank, num_major_cats):
    # topics are sorted by its size, so their indices indicate the ranking
    if rank < num_major_cats:
        e_dict['isMajor'] = True
    else:
        e_dict['isMajor'] = False

    return e_dict

'''
    Input: entry dict
    Based on the entry ratio, pick and mark the last-k as minor categories
'''
def _encode_minor_entries(e_dict, num_entries, rank, num_minor_cats):
    # topics are sorted by its size, so their indices indicate the ranking
    if rank > num_entries-1-num_minor_cats:
        e_dict['isMinor'] = True
    else:
        e_dict['isMinor'] = False

    return e_dict


def _encode_small_entries(e_dict, small_cat_thres):
    # topics are sorted by its size, so their indices indicate the ranking
    if small_cat_thres != None:
        e_dict['isSmall'] = True if e_dict['ratio'] < small_cat_thres else False

    return e_dict


def _convert_to_categories(df_interactions, entry_measures, top_entries_dict):
    num_all_items = df_interactions.shape[0]
    item_info_to_export = ['itemID', 'topics']
    num_major_cats = 2
    num_minor_cats = 2
    small_cats_thres = 0.15

    categories = []
    for cat, c_items in df_interactions.groupby('category'):
        c_items = c_items[item_info_to_export]
        c_items = c_items.dropna()
        num_items_in_c = c_items.shape[0]
        # print('num_items_in_c / num_all_items: ', num_items_in_c, num_all_items)

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
                'ratio': round(num_num_items_in_c_t / num_items_in_c, 3)
            })

        # Sort topics by its size and mark ranking
        topics = sorted(topics, key=lambda x: len(x['items']), reverse=True)
        topics = _encode_entries(topics, num_major_cats, num_minor_cats, small_cats_thres)
        # print('major: ', [ t['ratio'] if t['isMajor']==True else None for t in topics ])
        # print('minor: ', [ t['ratio'] if t['isMinor']==True else None for t in topics ])

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
    categories = sorted(categories, key=lambda x: x['ratio'], reverse=True)
    categories = _encode_entries(categories, num_major_cats, num_minor_cats, small_cats_thres)

    return categories