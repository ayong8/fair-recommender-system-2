from rest_framework.views import APIView
from rest_framework.response import Response

import pandas as pd
import numpy as np
from scipy.stats import entropy as kl
from scipy.spatial.distance import jensenshannon
import pickle, ast, os, json

from ..classes import User
import util
from django.conf import settings

data_dir = './app/static/data'
measures = {
    'diversity': ['stereotype', 'popularityBias'],
    'personalization': ['miscalibration', 'filterBubble']
}

class BaseUserView(APIView):
    def update_session_user(self, request, user):
        """Helper method to update user data in session"""
        session_data = {
            'df_items_actual': user.df_items_actual.to_dict(),
            'df_items_pred': user.df_items_pred.to_dict(),
            'df_topics_actual': user.df_topics_actual.to_dict(),
            'df_topics_pred': user.df_topics_pred.to_dict(),
            'topic_preferences_on_pred': user.topic_preferences_on_pred,
            'category_preferences_on_pred': user.category_preferences_on_pred,
            'algo_effs': user.algo_effs,
            'algo_eff_weights': user.algo_eff_weights,
            'personalization_preference': user.personalization_preference,
            'cats_actual': user.cats_actual,
            'cats_pred': user.cats_pred,
            'cats_pred_others': user.cats_pred_others,
        }
        request.session['user_data'] = session_data
        request.session.modified = True

    def update_user_from_session(self, request, user):
        """Helper method to update user from session data"""
        user_data = request.session.get('user_data', {})
        
        # Update preferences
        user.df_items_actual = pd.DataFrame.from_dict(user_data.get('df_items_actual', user.get_items(user.df_actual_user)))
        user.df_items_pred = pd.DataFrame.from_dict(user_data.get('df_items_pred', user.get_items(user.df_pred_user)))
        user.df_topics_actual = pd.DataFrame.from_dict(user_data.get('df_topics_actual', user.get_topics(user.df_items_actual)))
        user.df_topics_pred = pd.DataFrame.from_dict(user_data.get('df_topics_pred', user.get_topics(user.df_items_pred)))
        user.topic_preferences_on_pred = user_data.get('topic_preferences_on_pred', {})
        user.category_preferences_on_pred = user_data.get('category_preferences_on_pred', {})
        user.personalization_preference = user_data.get('personalization_preference')
        user.cats_actual = user_data.get('cats_actual')
        user.cats_pred = user_data.get('cats_pred')
        user.cats_pred_others = user_data.get('cats_pred_others')

        # Update algorithm effectiveness values
        stored_algo_effs = user_data.get('algo_effs', {})
        for algo_name, values in stored_algo_effs.items():
            if algo_name in user.algo_effs:
                user.algo_effs[algo_name].update(values)
        
        return user

class LoadData(BaseUserView):
    '''
        Variables and data across all users and application setting
    '''
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.load_static_data()
        self.algo_eff_list = ['miscalibration', 'filterBubble', 'stereotype', 'popularityBias']
        self._algo_effs = None  # Initialize as None
        self.topk = 20

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

    def post(self, request, format=None):
        user_id = int(request.data.get('user_id'))
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

        # Rank items using the DataFrame
        df_ranked_items, updated_algo_eff_weights = user.rank_items(personalization_preference=user.personalization_preference)
        print("Initial Ranking:")
        for _, item in df_ranked_items.iterrows():
            print(f"{item['itemID']}: Final Score = {round(item['final_score'], 4)}, Category = {item['category']}")

        # user.update_user_preference('category', 'sport', 0.9)
        user.update_user_preference('topic', "City life", 0.8)
        
        # Algorithm effects after update
        print('Updated Algorithm Effectiveness Weights:')
        rounded_algo_eff_weights = {k: round(v, 2) for k, v in updated_algo_eff_weights.items()}
        df_updated_ranked_items, updated_algo_eff_weights = user.rank_items(personalization_preference=user.personalization_preference)
        util.update_ranking_changes(df_ranked_items, df_updated_ranked_items)
        df_updated_ranked_items.to_csv((os.path.join(data_dir, 'df_item_ranked_after.csv')), index=False)
        
        # Ensure session is initialized
        if not request.session.session_key:
            request.session.create()

        self.update_session_user(request, user)
        request.session.save()

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
            'algoEffs': user.algo_effs,
            'items': user.df_items_pred.to_dict(orient='records'),
            'categoryPreferencesOnPred': user.category_preferences_on_pred,
            'topicPreferencesOnPred': user.topic_preferences_on_pred,
        })

    # def post(self, request, format=None):
    #     user_id = int(request.data.get('user_id'))
    #     if not user_id:
    #         return Response({"error": "user_id is required"}, status=400)
    #     user = self.get_user(user_id)
    #     user.get_all_user_categories(self.category_names)
    #     user.calc_user_level_measures()

    #     # Get unique items and topics
    #     df_items_pred = self.get_items(user.df_pred_user)
    #     df_topics = self.get_topics(df_items)

    #     return Response({
    #         'user': {
    #             **user.user_info_dict,
    #             **user.user_stat_dict,
    #             **user.user_level_measures
    #         },
    #         'catsActualUser': user.cats_actual,
    #         'catsPredUser': user.cats_pred,
    #         'catsActualOthers': user.cats_actual_others,
    #         'catsPredOthers': user.cats_pred_others,
    #         'algoEffs': self.algo_effs,
    #         'items': df_items.to_dict(orient='records')
    #     })

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
            pred_mean_uv=self.pred_arith_mean_uv,
            explanations = self.explanations
        )

        return user

class UpdatePreferences(LoadData):
    def post(self, request, format=None):
        user_id = request.data.get('userID')
        topic_preferences = request.data.get('topicPreferences')
        category_preferences = request.data.get('categoryPreferences', {})
        cats_pred = request.data.get('catsPred')
        
        all_category_preferences = {
            cat: category_preferences.get(cat, 0.0) 
            for cat in self.category_names
        }
        print('category_preferences: ', category_preferences)
        
        # 1. Initialize user with that stored data
        user = self.get_user(user_id)
        user = self.update_user_from_session(request, user)
        user.pred_uv = np.array(list(all_category_preferences.values()))
        user.cats_pred = sorted(cats_pred, key=lambda x: x['ratio'], reverse=True)
        print('user.personalization_preference before: ', user.personalization_preference)
        
        user.update_all_categories(self.category_names)
        user.calc_user_level_measures()
        user.category_preferences_on_pred = dict(zip(self.category_names, user.pred_uv))
        df_ranked_items = user.df_items_pred
        print('user.personalization_preference after: ', user.personalization_preference)
        
        # 3. Recalculate rankings with updated values
        df_updated_ranked_items, _ = user.rank_items(
            personalization_preference=user.personalization_preference
        )

        user.df_items_pred = df_updated_ranked_items
        util.update_ranking_changes(df_ranked_items, df_updated_ranked_items)

        print('items after: ', user.df_items_pred['itemID'].values)
        print('weights/value after: ', user.algo_eff_weights, user.algo_eff_value_alignment)
        
        # 5. Store updated state back to session
        self.update_session_user(request, user)
        request.session.modified = True
        request.session.save()
        
        return Response({
            'updatedItems': user.df_items_pred.to_dict(orient='records'),
            'updatedCatsActual': user.cats_actual,
            'updatedCatsPred': user.cats_pred,
            'updatedCatsPredOthers': user.cats_pred_others
        })
    
class UpdateItemPreferences(LoadData):
    def post(self, request, format=None):
        user_id = request.data.get('userID')
        updated_items = request.data.get('updatedItems')
        # category_preferences = request.data.get('categoryPreferences', {})
        # cats_pred = request.data.get('catsPred')
        
        # all_category_preferences = {
        #     cat: category_preferences.get(cat, 0.0) 
        #     for cat in self.category_names
        # }
        # print('category_preferences: ', category_preferences)
        
        # 1. Initialize user with that stored data
        user = self.get_user(user_id)
        user = self.update_user_from_session(request, user)
        # user.pred_uv = np.array(list(all_category_preferences.values()))
        # user.cats_pred = sorted(cats_pred, key=lambda x: x['ratio'], reverse=True)
        print('user.personalization_preference before: ', user.personalization_preference)
        
        user.update_all_categories(self.category_names)
        user.calc_user_level_measures()
        user.category_preferences_on_pred = dict(zip(self.category_names, user.pred_uv))
        user.df_items_pred = pd.DataFrame.from_dict(updated_items)
        df_ranked_items = user.df_items_pred
        print('user.personalization_preference after: ', user.personalization_preference)
        
        # 3. Recalculate rankings with updated values
        df_updated_ranked_items, _ = user.rank_items(
            personalization_preference=user.personalization_preference
        )

        user.df_items_pred = df_updated_ranked_items
        util.update_ranking_changes(df_ranked_items, df_updated_ranked_items)

        print('items after: ', user.df_items_pred['itemID'].values)
        print('weights/value after: ', user.algo_eff_weights, user.algo_eff_value_alignment)
        
        # 5. Store updated state back to session
        self.update_session_user(request, user)
        request.session.modified = True
        request.session.save()
        
        return Response({
            'updatedItems': user.df_items_pred.to_dict(orient='records'),
            'updatedCatsActual': user.cats_actual,
            'updatedCatsPred': user.cats_pred,
            'updatedCatsPredOthers': user.cats_pred_others
        })

class UpdateBipolarValueAlignment(LoadData):
    def post(self, request, format=None):
        user_id = request.data.get('userID')
        
        # 1. Initialize base user and update from session
        user = self.get_user(user_id)
        user = self.update_user_from_session(request, user)
        user.personalization_preference = 1 - request.data.get('bipolarScore')
        df_ranked_items = user.df_items_pred
        
        # 2. Update the specific algorithm effectiveness
        print('items before: ', user.df_items_pred['itemID'].values)
        print('weights/value before: ', user.algo_eff_weights, user.algo_eff_value_alignment)
        
        # 3. Recalculate rankings with updated values
        df_updated_ranked_items, updated_algo_eff_weights = user.rank_items(
            personalization_preference=user.personalization_preference
        )
        
        # 4. Update algorithm effect weights and items
        for algo_name, weight in updated_algo_eff_weights.items():
            if algo_name in user.algo_effs:
                user.algo_effs[algo_name]['weight'] = weight
                
        user.algo_eff_weights = updated_algo_eff_weights
        user.df_items_pred = df_updated_ranked_items
        util.update_ranking_changes(df_ranked_items, df_updated_ranked_items)

        print('items after: ', user.df_items_pred['itemID'].values)
        print('weights/value after: ', user.algo_eff_weights, user.algo_eff_value_alignment)
        
        # 5. Store updated state back to session
        self.update_session_user(request, user)
        request.session.modified = True
        request.session.save()
        
        return Response({
            'updatedItems': user.df_items_pred.to_dict(orient='records')
        })

class UpdateValueAlignment(LoadData):
    def post(self, request, format=None):
        user_id = request.data.get('userID')
        algo_eff_name = request.data.get('algoEffName')
        value_alignment = request.data.get('valueAlignment')
        
        # 1. Initialize base user and update from session
        user = self.get_user(user_id)
        user = self.update_user_from_session(request, user)
        df_ranked_items = user.df_items_pred
        
        # 2. Update the specific algorithm effectiveness
        if algo_eff_name in user.algo_effs:
            user.algo_effs[algo_eff_name]['valueAlignment'] = value_alignment
            user.algo_eff_value_alignment[algo_eff_name] = value_alignment

        print('items before: ', user.df_items_pred['itemID'].values)
        print('weights/value before: ', user.algo_eff_weights, user.algo_eff_value_alignment)
        
        # 3. Recalculate rankings with updated values
        df_updated_ranked_items, updated_algo_eff_weights = user.rank_items(
            personalization_preference=user.personalization_preference
        )
        
        # 4. Update algorithm effect weights and items
        for algo_name, weight in updated_algo_eff_weights.items():
            if algo_name in user.algo_effs:
                user.algo_effs[algo_name]['weight'] = weight
                
        user.algo_eff_weights = updated_algo_eff_weights
        user.df_items_pred = df_updated_ranked_items
        util.update_ranking_changes(df_ranked_items, df_updated_ranked_items)

        print('items after: ', user.df_items_pred['itemID'].values)
        print('weights/value after: ', user.algo_eff_weights, user.algo_eff_value_alignment)
        
        # 5. Store updated state back to session
        self.update_session_user(request, user)
        request.session.modified = True
        request.session.save()
        
        return Response({
            'updatedItems': user.df_items_pred.to_dict(orient='records')
        })


# def compute_major_category_dominance
# def compute_pref_amplification(entry_actual, entry_pred):
#     return  (entry_pred - entry_actual) / (entry_actual) if entry_actual != 0 else 0

# def compute_pref_penetration(entry_actual, entry_pred, entry_pred_others):
#     e = -0.001
#     dev_from_actual = entry_actual - entry_pred_others
#     dev_from_pred = entry_pred - entry_pred_others
#     if dev_from_actual == 0:
#         dev_from_actual += e
#     if dev_from_pred == 0:
#         dev_from_pred += e
#     return  dev_from_actual / dev_from_pred

# def compute_popularity_lift_for_entry(entry_actual, entry_pred_mean):
#     if entry_actual == 0:
#         entry_actual += 0.0001
#     return np.round(entry_pred_mean / entry_actual, 3)

# def compute_filter_bubble_for_user(cats_actual, cats_pred, major_cat_names, minor_cat_names):
#     # Compute major preference amplification
#     major_pref_amps = []
#     for cat_name in major_cat_names:
#         entry_actual = [ cat['ratio'] for cat in cats_actual if cat['name'] == cat_name ][0]
#         entry_pred = [ cat['ratio'] for cat in cats_pred if cat['name'] == cat_name ][0]
#         major_pref_amps.append(compute_pref_amplification(entry_actual, entry_pred))
    
#     # Compute major preference deamplification
#     minor_pref_deamps = []
#     for cat_name in minor_cat_names:
#         entry_actual = [ cat['ratio'] for cat in cats_actual if cat['name'] == cat_name ][0]
#         entry_pred = [ cat['ratio'] for cat in cats_pred if cat['name'] == cat_name ][0]
#         minor_pref_deamps.append(-compute_pref_amplification(entry_actual, entry_pred))

#     # Compute filter bubble as the sum of major-pref amplification and minor-pref deamplification
#     major_pref_amp = np.mean(major_pref_amps)
#     minor_pref_deamp = np.mean(minor_pref_deamps)
#     filter_bubble = major_pref_amp + minor_pref_deamp
    
#     return {
#         'filterBubble': filter_bubble, 
#         'major_pref_amp': major_pref_amp, 
#         'minor_pref_deamp': minor_pref_deamp
#     }

# def compute_stereotype_for_user(actual_uv, pred_uv, actual_arith_mean_uv, pred_arith_mean_uv):
#     return jensenshannon(actual_arith_mean_uv, actual_uv) - jensenshannon(pred_arith_mean_uv, pred_uv)


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
