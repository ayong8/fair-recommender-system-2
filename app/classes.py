import pandas as pd
import numpy as np
from scipy.spatial import distance
from collections import Counter
from scipy.optimize import minimize
import os, ast

import util
# from util import _encode_entries, _encode_entries_from_actual

class User:
    def __init__(self, id, user_info_dict, user_stat_dict, df_actual_user, df_pred_user, 
                 actual_uv, pred_uv, df_actual_others, df_pred_others, 
                 actual_mean_uv, pred_mean_uv, explanations):
        self.id = id
        self.user_info_dict = user_info_dict
        self.user_stat_dict = user_stat_dict
        self.df_actual_user = df_actual_user
        self.df_pred_user = df_pred_user
        self.actual_uv = actual_uv
        self.pred_uv = pred_uv
        self.df_actual_others = df_actual_others
        self.df_pred_others = df_pred_others
        self.actual_mean_uv = actual_mean_uv
        self.pred_mean_uv = pred_mean_uv
        self.explanations = explanations

        # All algorithms
        self.algo_eff_list = ['miscalibration', 'filterBubble', 'popularityBias', 'stereotype']
        self._algo_effs = None
        self.algo_eff_weights = {algo_eff: 0.25 for algo_eff in self.algo_eff_list}
        self.algo_eff_value_alignment = {
            algo_eff: self.algo_effs[algo_eff]['valueAlignment'] # initialize this as 'neutral'
            for algo_eff in self.algo_eff_list
        }
        self.personalization_preference = 0.5

        # Category-level variables
        self.category_names = []
        self.cats_actual = []
        self.cats_pred = []
        self.cats_actual_others = []
        self.cats_pred_others = []

        # Topic-level variablees
        self.df_topics_actual = []
        self.df_topics_pred = []

        # Item-level variables
        self.df_items_actual = []
        self.df_items_pred = []
        
        self.topic_preferences_on_pred = {}
        self.category_preferences_on_pred = {}
        self.major_category_names = []
        self.minor_category_names = []
        self.user_level_measures = []

    @property
    def algo_effs(self):
        if self._algo_effs is None:
            self._algo_effs = self.calc_algo_effs()
        return self._algo_effs
    
    def calc_algo_effs(self):
        algo_effs_dict = {}
        for algo_eff in self.algo_eff_list:
            algo_effs_dict[algo_eff] = {
                'weight': 0.25,
                'perceivedValueScore': None, # None or float
                'valueAlignment': 'neutral',  # value or neutral or harm
                'explanation': self.explanations[util.to_camel_case(algo_eff)]['explanation']
            }
        return algo_effs_dict

    def get_all_user_categories(self, category_names):
        measures = {
            'diversity': ['stereotype', 'popularityBias'],
            'personalization': ['miscalibration', 'filterBubble']
        }

        entry_measure_dict = {}
        for entry_i, cat in enumerate(category_names):
            entry_name = category_names[entry_i]
            entry_measure_dict[entry_name] = self.calc_cat_measures(
                    self.actual_uv[entry_i],
                    self.pred_uv[entry_i],
                    self.actual_mean_uv[entry_i],
                    self.pred_mean_uv[entry_i]
                )
            
        df_cat_measures = pd.DataFrame.from_dict(entry_measure_dict).transpose()
        df_entry_measures_normed = (df_cat_measures - df_cat_measures.min()) / (df_cat_measures.max() - df_cat_measures.min())
        df_cat_measures['diversity'] = df_entry_measures_normed[measures['diversity']].mean(axis=1)
        df_cat_measures['personalization'] = df_entry_measures_normed[measures['personalization']].mean(axis=1)
        df_cat_measures['bipolar'] = df_cat_measures['diversity'] - df_cat_measures['personalization']

        top_entries_dict = self.find_top_entries(df_cat_measures, by='separate_score')
        cat_measures = df_cat_measures.transpose().to_dict(orient='dict')
        
        self.cats_actual = self.get_categories(self.df_actual_user, cat_measures, top_entries_dict)
        self.cats_pred = self.get_categories(self.df_pred_user, cat_measures, top_entries_dict, is_cats_pred=True)
        self.cats_actual_others = self.get_categories(self.df_actual_others, cat_measures, top_entries_dict)
        self.cats_pred_others = self.get_categories(self.df_pred_others, cat_measures, top_entries_dict, is_cats_pred=True)

        self.find_common_categories()
        
        self.major_category_names = self.get_major_entry_names(self.cats_actual)
        self.minor_category_names = self.get_minor_entry_names(self.cats_actual)

    def find_common_categories(self):
        actual_names = {cat['name'] for cat in self.cats_actual}
        pred_names = {cat['name'] for cat in self.cats_pred}
        common_names = actual_names.intersection(pred_names)
        for cat in self.cats_pred:
            if cat['name'] in common_names:
                cat['isCommonWithinMe'] = True
        
        for cat in self.cats_actual:
            if cat['name'] in common_names:
                cat['isCommonWithinMe'] = True
        
        pred_others_names = {cat['name'] for cat in self.cats_pred_others}
        common_pred_names = pred_names.intersection(pred_others_names)
        
        for cat in self.cats_pred:
            if cat['name'] in common_pred_names:
                cat['isCommonBtnMeAndOthers'] = True
        
        for cat in self.cats_pred_others:
            if cat['name'] in common_pred_names:
                cat['isCommonBtnMeAndOthers'] = True

    def get_categories(self, df_interactions, entry_measures, top_entries_dict, is_cats_pred=False):
        num_all_items = df_interactions.shape[0]
        item_info_to_export = ['itemID', 'topics']
        num_major_cats = 2
        num_minor_cats = 2
        small_cats_thres = 0.15

        categories = []
        for cat_idx, (cat, c_items) in enumerate(df_interactions.groupby('category')):
            c_items = c_items[item_info_to_export]
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
                    # 'size': num_num_items_in_c_t,
                    'ratio': round(num_num_items_in_c_t / num_items_in_c, 3)
                })

            # Sort topics by its size and mark ranking
            topics = sorted(topics, key=lambda x: len(x['items']), reverse=True)
            topics = self._encode_entries(topics, num_major_cats, num_minor_cats, small_cats_thres)

            categories.append({
                'id': cat_idx,
                'name': cat,
                # 'isTopDiversity': True if cat in(top_entries_dict['isTopDiversity']) else False,
                # 'isTopPersonalization': True if cat in(top_entries_dict['isTopPersonalization']) else False,
                'items': c_items.to_dict(orient='records'),
                'topics': topics,
                'measures': entry_measures[cat],
                # 'size': num_items_in_c,
                'ratio': round(num_items_in_c / num_all_items, 15),
                'isCommonWithinMe': False,
                'isCommonBtnMeAndOthers': False,
                'isOnlyInActual': False,
                'isOnlyInPredOthers': False
            })

        # Sort categories by its size
        categories = sorted(categories, key=lambda x: x['ratio'], reverse=True)
         # encode major/minor categories within each set (actualUser, predUser, predOthers)
        if is_cats_pred:
            # Encode major/minor categories from a user's actual preference
            categories = self._encode_entries(categories, num_major_cats, num_minor_cats, small_cats_thres)
            categories = self._encode_entries_from_actual(categories, self.cats_actual)
        else:
            # For actual categories (and others), use the original encoding
            categories = self._encode_entries(categories, num_major_cats, num_minor_cats, small_cats_thres)
            categories = self._encode_entries_from_actual(categories, categories)

        return categories
    
    def update_all_categories(self, category_names):
        measures = {
            'diversity': ['stereotype', 'popularityBias'],
            'personalization': ['miscalibration', 'filterBubble']
        }

        entry_measure_dict = {}
        for entry_i, cat in enumerate(category_names):
            entry_name = category_names[entry_i]
            actual_uv = next((cat['ratio'] for cat in self.cats_actual if cat['name'] == entry_name), 0)
            pred_uv = next((cat['ratio'] for cat in self.cats_pred if cat['name'] == entry_name), 0)

            entry_measure_dict[entry_name] = self.calc_cat_measures(
                    actual_uv,
                    pred_uv,
                    self.actual_mean_uv[entry_i],
                    self.pred_mean_uv[entry_i]
                )
            
        print('entry_measure_dict: ', entry_measure_dict)
        df_cat_measures = pd.DataFrame.from_dict(entry_measure_dict).transpose()
        df_entry_measures_normed = (df_cat_measures - df_cat_measures.min()) / (df_cat_measures.max() - df_cat_measures.min())
        df_cat_measures['diversity'] = df_entry_measures_normed[measures['diversity']].mean(axis=1)
        df_cat_measures['personalization'] = df_entry_measures_normed[measures['personalization']].mean(axis=1)
        df_cat_measures['bipolar'] = df_cat_measures['diversity'] - df_cat_measures['personalization']
        cat_measures = df_cat_measures.transpose().to_dict(orient='dict')
        
        self.cats_actual = self.update_cat_measures(self.cats_actual, cat_measures)
        self.cats_pred = self.update_cat_measures(self.cats_pred, cat_measures)
        self.cats_pred_others = self.update_cat_measures(self.cats_pred_others, cat_measures)

    
    def update_cat_measures(self, cats, cat_measures):
        for cat in cats:
            cat['measures'] = cat_measures[cat['name']]
        return cats
                
    def get_items(self, df_user_data):
        df_items = df_user_data.copy()
        df_items.loc[:,'final_score'] = df_items['score']
        df_items.loc[:, 'change'] = 'no change'
        
        df_items.loc[:,'topics'] = df_items['topics'].apply(lambda x: x.replace("' '", "', '"))
        df_items.loc[:,'topics'] = df_items['topics'].apply(lambda x: ast.literal_eval(x))    
            
        df_items = df_items.fillna(0)
        # df_items.to_csv(os.path.join(data_dir, 'df_items.csv'))

        return df_items
    
    def get_topics(self, df_items):
        df_topics = df_items.copy()
        df_topics = df_topics.explode('topics')
        
        total_items = len(df_items)
        df_topics = df_topics.groupby('topics').agg({
            'itemID': lambda x: len(x) / total_items,
            'category': lambda x: list(Counter(x).items())
        }).reset_index()
        df_topics.columns = ['name', 'score', 'categories']

        return df_topics
    
    def rank_items(self, personalization_preference=0.5):
        # Create a copy of the original DataFrame
        df_updated_items_pred = self.df_items_pred.copy()
        
        # Optimize weights and update scores
        self.algo_eff_weights = optimize_weights(self.algo_eff_weights, self.algo_eff_value_alignment, personalization_preference)
        print('algorithmic effect weights: ', self.algo_eff_weights)
        print('algorithmic effect value alignment: ', self.algo_eff_value_alignment)
        
        print("final score before: ", self.df_items_pred['final_score'].values)
        df_updated_items_pred['final_score'] = self.df_items_pred.apply(
            lambda item: self.calculate_item_score(item), axis=1)
        print("final score after: ", df_updated_items_pred['final_score'].values)
        
        # Sort both DataFrames by final_score
        df_updated_items_pred = df_updated_items_pred.sort_values(
            by='final_score', 
            ascending=False
        ).reset_index(drop=True)
        
        return df_updated_items_pred, self.algo_eff_weights
    
    def calc_cat_measures(self, entry_actual, entry_pred, entry_actual_mean, entry_pred_mean):
            ST = compute_stereotype_for_entry(entry_actual, entry_pred, entry_actual_mean, entry_pred_mean)
            MC = compute_miscalibration_for_entry(entry_actual, entry_pred)
            FB = compute_pref_amplification(entry_actual, entry_pred)
            PB = compute_popularity_lift_for_entry(entry_actual, entry_pred, entry_pred_mean)

            return {
                'actual': entry_actual,
                'pred': entry_pred,
                'miscalibration': float(MC),
                'filterBubble': np.clip(np.sign(FB) * normalize_score(abs(FB), 0, 1), -1, 1),
                'stereotype': float(ST),
                'popularityBias': float(PB)
            }
    
    def calculate_item_score(self, item):
        total_relevance = self.df_topics_pred['score'].sum()
        if total_relevance == 0:
            print(f"Warning: Item {item['id']} has no topic relevance")
            return 0  # or some default score

        # Topic-level effects (popularity bias and user preference)
        popularity_bias_score = 0
        topic_preference_scores = []
        for _, topic in self.df_topics_pred.iterrows():
            pred_score = topic['score']
            actual_topic = self.df_topics_actual[self.df_topics_actual['name'] == topic['name']]
            actual_score = actual_topic['score'].values[0] if not actual_topic.empty else 0
            pop_bias = 0 if actual_score == 0 else compute_popularity_lift_for_entry(actual_score, pred_score, pred_score)
            popularity_bias_score += pop_bias * (pred_score / total_relevance)
            topic_preference_scores.append(self.topic_preferences_on_pred[topic['name']])
            if topic['name'] == 'City life':
                print('toppppppic: ', self.topic_preferences_on_pred[topic['name']])
        mean_topic_preference_score = np.mean(topic_preference_scores)

        # Category-level effects (miscalibration and user preference)
        item_cat_name = item['category']
        cat_actual = next((cat for cat in self.cats_actual if cat['name'] == item_cat_name), None)
        cat_pred = next((cat for cat in self.cats_pred if cat['name'] == item_cat_name), None)
        if cat_actual:
            miscalibration_score = compute_miscalibration_for_entry(cat_actual['ratio'], cat_pred['ratio'])
        else:
            print(f"Warning: Category {cat_pred['name']} not found in cats_actual")
            miscalibration_score = 0
        category_preference_score = self.category_preferences_on_pred[item_cat_name]

        # User-level effects (stereotype and filter bubble)
        stereotype_score = compute_stereotype_for_user(
            [cat['ratio'] for cat in self.cats_actual],
            [cat['ratio'] for cat in self.cats_pred],
            [0.5] * len(self.cats_actual),
            [0.5] * len(self.cats_pred)
        )

        FB_measures_dict = self.compute_filter_bubble_for_user(self.major_category_names, self.minor_category_names)
        filter_bubble_score = FB_measures_dict['filterBubble']

        # Normalize and align scores
        normalized_scores = {
            'miscalibration': 1 - normalize_score(miscalibration_score, 0, 1),
            'popularityBias': align_popularity_bias(normalize_score(popularity_bias_score, 0, 10)),
            'stereotype': normalize_score(stereotype_score, -1, 1),
            'filterBubble': np.sign(filter_bubble_score) * normalize_score(abs(filter_bubble_score), 0, 1),
            'topic_preference': mean_topic_preference_score,
            'category_preference': category_preference_score
        }
        
        # Compute final score
        algorithmic_score = sum(self.algo_eff_weights[effect] * normalized_scores[effect] for effect in self.algo_eff_weights)
        preference_score = (normalized_scores['topic_preference'] + normalized_scores['category_preference']) / 2
        prediction_score = item['score']

        print(f"Algorithmic score components for item {item['itemID']}:")
        for effect in self.algo_eff_weights:
            print(f"  {effect}: {self.algo_eff_weights[effect]} * {normalized_scores[effect]} = {self.algo_eff_weights[effect] * normalized_scores[effect]}")
        
        final_score = 0.6 * algorithmic_score + 0.3 * preference_score + 0.1 * prediction_score
        print(f"Final score components for item {item['itemID']}: algorithmic={algorithmic_score}, preference={preference_score}, prediction={prediction_score}")

        if item['itemID'] == 9777492:
            print('mean_topic_preference_score: ', mean_topic_preference_score, final_score)
            print('pppreference_score: ', preference_score, final_score)
        
        return final_score

    def calc_user_level_measures(self):
        # Major categories are identified based on a user's actual preferences
        major_cats_in_actual = [cat for cat in self.cats_actual if cat['isMajor'] == True]
        minor_cats_in_actual = [cat for cat in self.cats_actual if cat['isMinor'] == True]
        major_cat_names = [cat['name'] for cat in major_cats_in_actual]
        minor_cat_names = [cat['name'] for cat in minor_cats_in_actual]

        FB_measures_dict = self.compute_filter_bubble_for_user(major_cat_names, minor_cat_names)
        ST_measures_dict = self.compute_stereotype_for_user()

        self.user_level_measures = {
            **FB_measures_dict,
            **ST_measures_dict
        }

    def compute_topic_preferences_on_pred(self, df_topics):
        self.topic_preferences_on_pred = dict(zip(df_topics['name'], df_topics['score']))

        total_pref = sum(self.topic_preferences_on_pred.values())
        if total_pref > 0:
            for topic_name in self.topic_preferences_on_pred:
                self.topic_preferences_on_pred[topic_name] /= total_pref
        else:
            print("Warning: Unable to compute meaningful topic preferences.")
            equal_pref = 1.0 / len(df_topics)
            self.topic_preferences_on_pred = {topic_name: equal_pref for topic_name in df_topics['name']}

        return self.topic_preferences_on_pred

    def compute_filter_bubble_for_user(self, major_cat_names, minor_cat_names):        
        # Compute major preference amplification
        major_pref_amps = []
        for cat_name in major_cat_names:
            entry_actual = next((cat['ratio'] for cat in self.cats_actual if cat['name'] == cat_name), 0)
            entry_pred = next((cat['ratio'] for cat in self.cats_pred if cat['name'] == cat_name), 0)
            major_pref_amps.append(compute_pref_amplification(entry_actual, entry_pred))
        
        # Compute major preference deamplification
        minor_pref_deamps = []
        for cat_name in minor_cat_names:
            entry_actual = next((cat['ratio'] for cat in self.cats_actual if cat['name'] == cat_name), 0)
            entry_pred = next((cat['ratio'] for cat in self.cats_pred if cat['name'] == cat_name), 0)
            minor_pref_deamps.append(-compute_pref_amplification(entry_actual, entry_pred))

        # Compute filter bubble as the sum of major-pref amplification and minor-pref deamplification
        major_pref_amp = np.mean(major_pref_amps) if major_pref_amps else 0
        minor_pref_deamp = np.mean(minor_pref_deamps) if minor_pref_deamps else 0
        filter_bubble = major_pref_amp + minor_pref_deamp
        
        return {
            'filterBubble': filter_bubble, 
            'major_pref_amp': major_pref_amp, 
            'minor_pref_deamp': minor_pref_deamp
        }

    def compute_stereotype_for_user(self):
        stereotype = distance.jensenshannon(self.actual_mean_uv, self.actual_uv) - distance.jensenshannon(self.pred_mean_uv, self.pred_uv)
        return {'stereotype': stereotype}
    
    def compute_miscalibration_for_entry(entry_actual, entry_pred):
        return np.abs(entry_actual - entry_pred)
    
    def update_user_preference(self, preference_type, id, new_preference):
        """
        Update user's preference for a topic or category.
        
        :param user: User object
        :param preference_type: 'topic' or 'category'
        :param id: ID of the topic or category
        :param new_preference: New preference value (between 0 and 1)
        """
        if preference_type == 'topic':
            self.topic_preferences_on_pred[id] = new_preference
        elif preference_type == 'category':
            self.category_preferences_on_pred[id] = new_preference
        else:
            raise ValueError("preference_type must be 'topic' or 'category'")

    # Find the top and last-k entries
    # Identified based on 
    #     1) combined score (bipolar), 
    #     2) individual scores (diversity and personalization score)
    #  or 3) frequency
    def find_top_entries(self, df_entry_measures, by='bipolar_score'):
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
        
    def _encode_entries(self, entries, num_major_cats, num_minor_cats, small_cats_thres):
        num_entries = len(entries)
        num_major_cats = 2
        num_minor_cats = 2
        small_cats_thres = 0.15

        for rank, e_dict in enumerate(entries):
            entries[rank] = self._encode_major_entries(e_dict, rank, num_major_cats)
            entries[rank] = self._encode_minor_entries(e_dict, num_entries, rank, num_minor_cats)
            entries[rank] = self._encode_small_entries(e_dict, small_cats_thres)
            
        return entries

    def _encode_entries_from_actual(self, categories, categories_actual):
        for cat in categories:
            cat_actual = next((cat_actual for cat_actual in categories_actual if cat_actual['name'] == cat['name']), None)
            if cat_actual:
                cat['isMajorInActual'] = cat_actual.get('isMajor', False)
                cat['isMinorInActual'] = cat_actual.get('isMinor', False)
            else:
                cat['isMajorInActual'] = False
                cat['isMinorInActual'] = False
        return categories

    '''
        Input: entry dict
        Based on the entry ratio, pick and mark the top-k as major categories
    '''
    def _encode_major_entries(self, entry, rank, num_major_cats):
        # topics are sorted by its size, so their indices indicate the ranking
        if rank < num_major_cats:
            entry['isMajor'] = True
        else:
            entry['isMajor'] = False

        return entry

    '''
        Input: entry dict
        Based on the entry ratio, pick and mark the last-k as minor categories
    '''
    def _encode_minor_entries(self, entry, num_entries, rank, num_minor_cats):
        # topics are sorted by its size, so their indices indicate the ranking
        if rank > num_entries-1-num_minor_cats:
            entry['isMinor'] = True
            self.minor_category_names.append(entry['name'])
        else:
            entry['isMinor'] = False

        return entry


    def _encode_small_entries(self, entry, small_cat_thres):
        # topics are sorted by its size, so their indices indicate the ranking
        if small_cat_thres != None:
            entry['isSmall'] = True if entry['ratio'] < small_cat_thres else False

        return entry

    def get_major_entry_names(self, entries):
            return [ entry['name'] if entry['isMajor'] else None for entry in entries ]
    
    def get_minor_entry_names(self, entries):
            return [ entry['name'] if entry['isMinor'] else None for entry in entries ]

    def find_common_categories(self):
        # Find common categories by name and set 'isCommonWithinMe' and 'isCommonBtnMeAndOthers'
        actual_names = {cat['name'] for cat in self.cats_actual}
        pred_names = {cat['name'] for cat in self.cats_pred}  # Get names from cats_pred
        pred_others_names = {cat['name'] for cat in self.cats_pred_others}  # Get names from cats_pred_others
        common_names_in_me = actual_names.intersection(pred_names)  # Find common names
        
        for cat in self.cats_pred:
            if cat['name'] in common_names_in_me:  # Check against common names
                cat['isCommonWithinMe'] = True
            else:
                cat['isOnlyInActual'] = True
        
        for cat in self.cats_actual:
            if cat['name'] in common_names_in_me:  # Check against common names
                cat['isCommonWithinMe'] = True
            else:
                cat['isOnlyInActual'] = True
        
        # Find common categories in cats_pred and cats_pred_others
        common_names_in_pred = pred_names.intersection(pred_others_names)  # Find common names
        
        for cat in self.cats_pred:
            if cat['name'] in common_names_in_pred:  # Check against common names
                cat['isCommonBtnMeAndOthers'] = True
            else:
                cat['isOnlyInPredOthers'] = True
        
        for cat in self.cats_pred_others:  # Save isCommonBtnMeAndOthers in cats_pred_others as well
            if cat['name'] in common_names_in_pred:  # Check against common names
                cat['isCommonBtnMeAndOthers'] = True
            else:
                cat['isOnlyInPredOthers'] = True

# class Topic:
#     def __init__(self, id, name):
#         self.id = id
#         self.name = name
#         self.actual = 0
#         self.pred = 0
#         self.categories = set()

# class Category:
#     def __init__(self, id, name, actual=0, pred=0):
#         self.id = id
#         self.name = name
#         self.topics = set()
#         self.actual = max(actual, 0.0001)
#         self.pred = max(pred, 0.0001)

# class Item:
#     def __init__(self, id, name):
#         self.id = id
#         self.name = name
#         self.topics = {}  # Dictionary of topic_id: relevance_score
#         self.actual = 0
#         self.pred = 0
#         self.final_score = 0

#     def set_topics(self, topic_names, topics):
#         self.topics = {next(topic.id for topic in topics.values() if topic.name == name): 1 for name in topic_names}

#     def set_actual(self, value):
#         self.actual = value

#     def set_pred(self, value):
#         self.pred = value

def initialize_topics(topic_names):
    return {i: Topic(i, name) for i, name in enumerate(topic_names)}

def initialize_items(item_data, topics):
    items = []
    for id, name, topic_names, actual, pred in item_data:
        item = Item(id, name)
        item.set_topics(topic_names, topics)
        item.set_actual(actual)
        item.set_pred(pred)
        items.append(item)
    return items

def calculate_topic_values(topics, items):
    topic_actual_counts = {topic.id: 0 for topic in topics.values()}
    topic_pred_counts = {topic.id: 0 for topic in topics.values()}

    for item in items:
        for topic_id in item.topics:
            topic_actual_counts[topic_id] += item.actual
            topic_pred_counts[topic_id] += item.pred

    total_actual = sum(item.actual for item in items)
    total_pred = sum(item.pred for item in items)

    for topic in topics.values():
        topic.actual = topic_actual_counts[topic.id] / total_actual if total_actual > 0 else 0
        topic.pred = topic_pred_counts[topic.id] / total_pred if total_pred > 0 else 0
        topic.actual = max(topic.actual, 0.0001)
        topic.pred = max(topic.pred, 0.0001)

    return normalize_topic_values(topics)

def normalize_topic_values(topics):
    total_actual = sum(topic.actual for topic in topics.values())
    total_pred = sum(topic.pred for topic in topics.values())

    normalized_topics = {}
    for topic_id, topic in topics.items():
        normalized_topic = Topic(topic.id, topic.name)
        normalized_topic.actual = topic.actual / total_actual
        normalized_topic.pred = topic.pred / total_pred
        normalized_topic.categories = topic.categories.copy()
        normalized_topics[topic_id] = normalized_topic

    return normalized_topics

def normalize_score(score, min_val, max_val):
    return (score - min_val) / (max_val - min_val)

def align_popularity_bias(score):
    return 1 - (1 / (1 + score))  # Higher score now means more diverse

def compute_popularity_lift_for_entry(entry_actual, entry_pred, entry_pred_mean):
    if entry_pred_mean == 0:
        entry_pred_mean += 0.0001
    if entry_actual == 0:
        entry_actual += 0.0001

    # Only consider lift if population mean is higher than actual
    if entry_pred_mean <= entry_actual or entry_pred <= entry_actual:
        # No lift needed or no lift occurred
        popularity_lift = 0.0
    else:
        # Calculate bounded lift
        lift_achieved = min(entry_pred, entry_pred_mean) - entry_actual
        lift_possible = entry_pred_mean - entry_actual
        popularity_lift = lift_achieved / lift_possible if lift_possible != 0 else 0.0

    return popularity_lift
    # Option 1: Log transformation
    # return np.round(np.log2(1 + entry_pred_mean / entry_actual), 3)
    
    # return (entry_pred_mean - entry_actual) / entry_pred_mean
    # Option 2: Sigmoid-like transformation
    # raw_ratio = entry_pred_mean / entry_actual
    # return np.round(2 / (1 + np.exp(-raw_ratio)) - 1, 3)

def compute_miscalibration_for_entry(entry_actual, entry_pred):
    return np.abs(entry_actual - entry_pred)

def compute_stereotype_for_user(actual_uv, pred_uv, actual_arith_mean_uv, pred_arith_mean_uv):
    return distance.jensenshannon(actual_arith_mean_uv, actual_uv) - distance.jensenshannon(pred_arith_mean_uv, pred_uv)

def compute_stereotype_for_entry(entry_actual, entry_pred, entry_actual_mean, entry_pred_mean):
    return (entry_actual_mean - entry_actual) \
        - (entry_pred_mean - entry_pred)

# Calculate serendipity measure as a filter bubble quantification
# Serendipity 1/|Q| * sum_all_items_in_Q ( (1-rel_P) * rel_Q )
# where P and Q are the set of recommended items
def compute_serendipity_for_entry(entry_actual, entry_pred):
    return (1 - entry_pred) * entry_actual

def compute_miscalibration_for_entry(entry_actual, entry_pred):
    return np.abs(entry_actual - entry_pred)

def compute_pref_amplification(entry_actual, entry_pred):
    if entry_actual == 0:
        entry_actual += 0.0001
    if entry_pred == 0:
        entry_pred += 0.0001
    return np.log(entry_pred / entry_actual)

def optimize_weights(algo_eff_weights, algo_eff_value_alignment, personalization_preference):
    algo_effs = list(algo_eff_weights.keys())
    algo_weights = list(algo_eff_weights.values())

    def objective(weights):
        personalization_score = sum(weights[:2])  # miscalibration and filter_bubble
        diversity_score = sum(weights[2:])  # popularity_bias and stereotype
        weight_diff = sum((w - algo_eff_weights[effect])**2 for w, effect in zip(weights, algo_effs))

        return abs(personalization_score - personalization_preference) + \
               abs(diversity_score - (1 - personalization_preference)) + \
               weight_diff

    # Base constraints
    constraints = [
        {'type': 'eq', 'fun': lambda w: sum(w) - 1},  # weights sum to 1
        {'type': 'ineq', 'fun': lambda w: w}  # all weights non-negative
    ]
    
    # Add value alignment constraints
    for i, effect in enumerate(algo_effs):
        alignment = algo_eff_value_alignment[effect]
        if alignment == 'harm':
            # For harmful effects, weight should be less than 0.25
            constraints.append({
                'type': 'ineq',
                'fun': lambda w, idx=i: 0.075 - w[idx]
            })
        elif alignment == 'value':
            # For valuable effects, weight should be greater than 0.25
            constraints.append({
                'type': 'ineq',
                'fun': lambda w, idx=i: w[idx] - 0.35
            })

    result = minimize(objective, algo_weights, method='SLSQP', constraints=constraints)
    return dict(zip(algo_effs, result.x))


