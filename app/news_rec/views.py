from rest_framework.views import APIView
from rest_framework.response import Response

import pandas as pd
import numpy as np
from scipy.stats import entropy as kl
from scipy.spatial.distance import jensenshannon
import pickle, ast, os, json

from ..classes import User
import util

data_dir = './app/static/data'
measures = {
    'diversity': ['stereotype', 'popularity_bias'],
    'personalization': ['miscalibration', 'filter_bubble']
}

class LoadData(APIView):
    '''
        Variables and data across all users and application setting
    '''
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.load_static_data()
        self.algo_eff_list = ['miscalibration', 'filterBubble', 'stereotype', 'popularityBias']
        self._algo_effs = None  # Initialize as None

    @property
    def algo_effs(self):
        if self._algo_effs is None:
            self._algo_effs = self.calc_algo_effs()
        return self._algo_effs

    def load_static_data(self):
        self.df_users = pd.read_csv(os.path.join(data_dir, 'df_user_info.csv'))
        self.df_user_stat = pd.read_csv(os.path.join(data_dir, 'df_user_stat.csv'))
        self.df_actual_all = pd.read_csv(os.path.join(data_dir, 'df_actual_sample.csv'))
        self.df_pred_all = pd.read_csv(os.path.join(data_dir, 'df_pred_sample.csv'))
        self.user_ids = pickle.load(open(os.path.join(data_dir, 'user_ids_all.pkl'), 'rb'))
        self.actual_uvs = pickle.load(open(os.path.join(data_dir, 'actual_uvs_all.pkl'), 'rb'))
        self.pred_uvs = pickle.load(open(os.path.join(data_dir, 'pred_uvs_all.pkl'), 'rb'))
        [ self.actual_arith_mean_uv, _, 
            self.pred_arith_mean_uv, _ ] = pickle.load(open(os.path.join(data_dir, 'mean_uvs_all.pkl'), 'rb'))
        self.category_names = pd.read_csv(os.path.join(data_dir, 'categories.txt'), \
                            sep='|', header=None, names=['da', 'en'])['en'].tolist()
        self.explanations = json.load(open(os.path.join(data_dir, 'explanations.json'), 'rb'))

    def get(self, request, format=None):
        user_id = 460523
        user = self.get_user(user_id)
        user.get_all_user_categories(self.category_names)
        user.calc_user_level_measures()

        # Get unique items and topics
        user.df_items_actual = user.get_items(user.df_actual_user)
        user.df_items_pred = user.get_items(user.df_pred_user)
        user.df_topics_actual = user.get_topics(user.df_items_actual)
        user.df_topics_pred = user.get_topics(user.df_items_pred)
        user.topic_preferences_on_pred = user.compute_topic_preferences_on_pred(user.df_topics_pred)
        user.category_preferences_on_pred = dict(zip(self.category_names, user.pred_uv))

        print('user.topic_preferences_on_pred: ', user.topic_preferences_on_pred)
        print('user.category_preferences_on_pred: ', user.category_preferences_on_pred)

        user.df_items_pred.to_csv((os.path.join(data_dir, 'df_item_ranked_before.csv')), index=False)
        # Rank items using the DataFrame
        df_ranked_items, updated_algo_eff_weights = user.rank_items(personalization_preference=0.9)
        print("Initial Ranking:")
        for _, item in df_ranked_items.iterrows():
            print(f"{item['itemID']}: Final Score = {item['final_score']}")
        print('updated_algo_eff_weights: ', updated_algo_eff_weights)
        df_ranked_items.to_csv((os.path.join(data_dir, 'df_item_ranked_after.csv')), index=False)
        # Experiment preference change
        # update_user_preference(user, 'topic', 'exhibition', 0.9)
        # update_user_preference(user, 'category', "entertainment", 0.8)
        # ranked_items = rank_items(user, items, categories, topics, personalization_preference=0.6)

        return Response({
            'users': self.df_users.to_dict(orient='records'),
            'user': {
                **user.user_info_dict,
                **user.user_stat_dict,
                **user.user_level_measures
            },
            'catsActualUser': user.cats_actual,
            'catsPredUser': user.cats_pred,
            'catsActualOthers': user.cats_actual_others,
            'catsPredOthers': user.cats_pred_others,
            'algoEffs': self.algo_effs,
            'items': user.df_items_pred.to_dict(orient='records')
        })

    def post(self, request, format=None):
        user_id = int(request.data.get('user_id'))
        if not user_id:
            return Response({"error": "user_id is required"}, status=400)
        user = self.get_user(user_id)
        user.get_all_user_categories(self.category_names)
        user.calc_user_level_measures()

        # Get unique items and topics
        df_items_pred = self.get_items(user.df_pred_user)
        df_topics = self.get_topics(df_items)

        return Response({
            'user': {
                **user.user_info_dict,
                **user.user_stat_dict,
                **user.user_level_measures
            },
            'catsActualUser': user.cats_actual,
            'catsPredUser': user.cats_pred,
            'catsActualOthers': user.cats_actual_others,
            'catsPredOthers': user.cats_pred_others,
            'algoEffs': self.algo_effs,
            'items': df_items.to_dict(orient='records')
        })

    def calc_algo_effs(self):
        algo_effs_dict = {}
        for algo_eff in self.algo_eff_list:
            algo_effs_dict[algo_eff] = {
                'valueAlignment': 'value',  # value or harm
                'explanation': self.explanations[algo_eff]['explanation']
            }
        return algo_effs_dict

    def get_user(self, user_id):
        user_idx = np.where(self.user_ids == user_id)[0]
        user = User(
            id=user_id,
            user_info_dict=self.df_users.loc[self.df_users['userID']==user_id].to_dict(orient='records')[0],
            user_stat_dict=self.df_user_stat.loc[self.df_user_stat['userID']==user_id].to_dict(orient='records')[0],
            df_actual_user=self.df_actual_all.loc[self.df_actual_all['userID']==user_id],
            df_pred_user=self.df_pred_all.loc[self.df_pred_all['userID']==user_id],
            actual_uv=np.round(self.actual_uvs[user_idx].flatten(), 3),
            pred_uv=np.round(self.pred_uvs[user_idx].flatten(), 3),
            df_actual_others=self.df_actual_all,
            df_pred_others=self.df_pred_all,
            actual_mean_uv=self.actual_arith_mean_uv,
            pred_mean_uv=self.pred_arith_mean_uv
        )

        return user

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


# def compute_filter_bubble_for_user(cats_actual, cats_pred, cats_pred_others, major_cat_names, minor_cat_names):
#     # Compute major preference amplification
#     major_pref_penetrations = []
#     for cat_name in major_cat_names:
#         entry_actual = [ cat['ratio'] for cat in cats_actual if cat['name'] == cat_name ][0]
#         entry_pred = [ cat['ratio'] for cat in cats_pred if cat['name'] == cat_name ][0]
#         entry_pred_others = [ cat['ratio'] for cat in cats_pred_others if cat['name'] == cat_name ][0]
#         major_pref_penetrations.append(compute_pref_penetration(entry_actual, entry_pred, entry_pred_others))
    
#     # Compute major preference deamplification
#     minor_pref_penetrations = []
#     for cat_name in minor_cat_names:
#         entry_actual = [ cat['ratio'] for cat in cats_actual if cat['name'] == cat_name ][0]
#         entry_pred = [ cat['ratio'] for cat in cats_pred if cat['name'] == cat_name ][0]
#         entry_pred_others = [ cat['ratio'] for cat in cats_pred_others if cat['name'] == cat_name ][0]
#         minor_pref_penetrations.append(compute_pref_penetration(entry_actual, entry_pred, entry_pred_others))
    
#     # Compute filter bubble as the sum of major-pref amplification and minor-pref deamplification
#     major_pref_penetration = np.mean(major_pref_penetrations)
#     minor_pref_penetration = np.mean(minor_pref_penetrations)
#     stereotype = np.mean(major_pref_penetration + minor_pref_penetration)

#     return {
#         'stereotype': stereotype,
#         'major_pref_penetration': major_pref_penetration,
#         'minor_pref_penetration': minor_pref_penetration
#     }

# def compute_miscalibration_for_entry(entry_actual, entry_pred):
#     return np.abs(entry_actual - entry_pred)

# def normalize_score(score, min_val, max_val):
#     return (score - min_val) / (max_val - min_val)

# def align_popularity_bias(score):
#     return 1 - (1 / (1 + score))  # Higher score now means more diverse
