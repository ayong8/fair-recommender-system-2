import pandas as pd
import numpy as np
from scipy.spatial import distance
import ast
import util

class User:
    def __init__(self, id, user_info_dict, user_stat_dict, df_actual_user, df_pred_user, 
                 actual_uv, pred_uv, df_actual_others, df_pred_others, 
                 actual_mean_uv, pred_mean_uv):
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

        # Category-level variables
        self.categories = [] # Unique categories
        self.cats_actual = []
        self.cats_pred = []
        self.cats_actual_others = []
        self.cats_pred_others = []
        
        self.topic_preferences = {}
        self.category_preferences = {}
        self.major_categories = []
        self.minor_categories = []
        self.user_level_measures = []

    def get_all_user_categories(self, categories):
        def calc_cat_measures(
            entry_actual, 
            entry_pred, 
            entry_actual_mean,
            entry_pred_mean
        ):    
            ST = compute_stereotype_for_entry(entry_actual, entry_pred, entry_actual_mean, entry_pred_mean)
            MC = compute_miscalibration_for_entry(entry_actual, entry_pred)
            FB = compute_pref_amplification(entry_actual, entry_pred)
            PB = compute_popularity_lift_for_entry(entry_actual, entry_pred_mean)
            print('measures: ', ST, MC, FB, PB)

            return {
                'actual': entry_actual,
                'pred': entry_pred,
                'miscalibration': float(MC),
                'filter_bubble': float(FB),
                'stereotype': float(ST),
                'popularity_bias': float(PB)
            }
        measures = {
            'diversity': ['stereotype', 'popularity_bias'],
            'personalization': ['miscalibration', 'filter_bubble']
        }

        entry_measure_dict = {}
        for entry_i, cat in enumerate(categories):
            entry_name = categories[entry_i]
            entry_measure_dict[entry_name] = calc_cat_measures(
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

        top_entries_dict = util.find_top_entries(df_cat_measures, by='separate_score')
        cat_measures = df_cat_measures.transpose().to_dict(orient='dict')
        
        self.cats_actual = self.get_categories(self.df_actual_user, cat_measures, top_entries_dict)
        self.cats_pred = self.get_categories(self.df_pred_user, cat_measures, top_entries_dict)
        self.cats_actual_others = self.get_categories(self.df_actual_others, cat_measures, top_entries_dict)
        self.cats_pred_others = self.get_categories(self.df_pred_others, cat_measures, top_entries_dict)

    def get_categories(self, df_interactions, entry_measures, top_entries_dict):
        num_all_items = df_interactions.shape[0]
        item_info_to_export = ['itemID', 'topics']
        num_major_cats = 2
        num_minor_cats = 2
        small_cats_thres = 0.15

        # # topic_names = list(set(df_actual['topics'].explode().unique()) | set(df_pred['topics'].explode().unique()))
        # user_topics = util.initialize_topics(topic_names)
        # actual_items = util.initialize_items(item_data, topics)
        # # pred_items = util.initialize_items(item_data, topics)

        categories = []
        for cat_idx, (cat, c_items) in enumerate(df_interactions.groupby('category')):
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
            topics = util._encode_entries(topics, num_major_cats, num_minor_cats, small_cats_thres)
            # print('major: ', [ t['ratio'] if t['isMajor']==True else None for t in topics ])
            # print('minor: ', [ t['ratio'] if t['isMinor']==True else None for t in topics ])

            categories.append({
                'id': cat_idx,
                'name': cat,
                'isTopDiversity': True if cat in(top_entries_dict['isTopDiversity']) else False,
                'isTopPersonalization': True if cat in(top_entries_dict['isTopPersonalization']) else False,
                'items': c_items.to_dict(orient='records'),
                'topics': topics,
                'measures': entry_measures[cat],
                'size': num_items_in_c,
                'ratio': round(num_items_in_c / num_all_items, 15)
            })

        # Sort categories by its size
        categories = sorted(categories, key=lambda x: x['ratio'], reverse=True)
        categories = util._encode_entries(categories, num_major_cats, num_minor_cats, small_cats_thres)

        return categories

    def calc_user_level_measures(self):
        # Major categories are identified based on a user's actual preferences
        major_cats_in_actual = [cat for cat in self.cats_actual if cat['isMajor'] == True]
        minor_cats_in_actual = [cat for cat in self.cats_actual if cat['isMinor'] == True]
        major_cat_names = [cat['name'] for cat in major_cats_in_actual]
        minor_cat_names = [cat['name'] for cat in minor_cats_in_actual]

        print('major_cat_names, minor_cat_names: ', major_cat_names, minor_cat_names)

        FB_measures_dict = self.compute_filter_bubble_for_user(major_cat_names, minor_cat_names)
        ST_measures_dict = self.compute_stereotype_for_user()

        self.user_level_measures = {
            **FB_measures_dict,
            **ST_measures_dict
        }

    def compute_filter_bubble_for_user(self, major_cat_names, minor_cat_names):
        # Compute major preference amplification
        major_pref_amps = []
        for cat_name in major_cat_names:
            entry_actual = [cat['ratio'] for cat in self.cats_actual if cat['name'] == cat_name][0]
            entry_pred = [cat['ratio'] for cat in self.cats_pred if cat['name'] == cat_name][0]
            major_pref_amps.append(compute_pref_amplification(entry_actual, entry_pred))
        
        # Compute major preference deamplification
        minor_pref_deamps = []
        for cat_name in minor_cat_names:
            entry_actual = [cat['ratio'] for cat in self.cats_actual if cat['name'] == cat_name][0]
            entry_pred = [cat['ratio'] for cat in self.cats_pred if cat['name'] == cat_name][0]
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

    def compute_stereotype_for_user(self):
        stereotype = distance.jensenshannon(self.actual_mean_uv, self.actual_uv) - distance.jensenshannon(self.pred_mean_uv, self.pred_uv)
        return {'stereotype': stereotype}

class Topic:
    def __init__(self, id, name):
        self.id = id
        self.name = name
        self.actual = 0
        self.pred = 0
        self.categories = set()

class Category:
    def __init__(self, id, name, actual=0, pred=0):
        self.id = id
        self.name = name
        self.topics = set()
        self.actual = max(actual, 0.0001)
        self.pred = max(pred, 0.0001)

class Item:
    def __init__(self, id, name):
        self.id = id
        self.name = name
        self.topics = {}  # Dictionary of topic_id: relevance_score
        self.actual = 0
        self.pred = 0
        self.final_score = 0

    def set_topics(self, topic_names, topics):
        self.topics = {next(topic.id for topic in topics.values() if topic.name == name): 1 for name in topic_names}

    def set_actual(self, value):
        self.actual = value

    def set_pred(self, value):
        self.pred = value

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

def compute_popularity_lift_for_entry(entry_actual, entry_pred_mean):
    if entry_actual == 0:
        entry_actual += 0.0001
    return np.round(entry_pred_mean / entry_actual, 3)

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

def optimize_weights(personalization_preference):
    def objective(weights):
        personalization_score = sum(weights[:2])  # miscalibration and filter_bubble
        diversity_score = sum(weights[2:])  # popularity_bias and stereotype
        return abs(personalization_score - personalization_preference) + abs(diversity_score - (1 - personalization_preference))

    constraints = (
        {'type': 'eq', 'fun': lambda w: sum(w) - 1},
        {'type': 'ineq', 'fun': lambda w: w}
    )

    initial_weights = [0.25, 0.25, 0.25, 0.25]
    result = minimize(objective, initial_weights, method='SLSQP', constraints=constraints)
    return dict(zip(['miscalibration', 'filter_bubble', 'popularity_bias', 'stereotype'], result.x))

def calculate_item_score(item, user, categories, topics, weights):
    total_relevance = sum(item.topics.values())
    if total_relevance == 0:
        print(f"Warning: Item {item.id} has no topic relevance")
        return 0  # or some default score

    # Topic-level effects (popularity bias and user preference)
    popularity_bias_score = 0
    topic_preference_score = 0
    for topic_id, relevance in item.topics.items():
        topic = topics[topic_id]
        if topic.actual == 0:
            print(f"Warning: Topic {topic_id} has zero actual probability")
            pop_bias = 0
        else:
            pop_bias = compute_popularity_lift_for_entry(topic.actual, topic.pred)
        popularity_bias_score += pop_bias * (relevance / total_relevance)
        
        topic_pref = user.topic_preferences.get(topic_id, 0.5)
        topic_preference_score += topic_pref * (relevance / total_relevance)

    # Category-level effects (miscalibration and user preference)
    miscalibration_score = 0
    category_preference_score = 0
    for topic_id, relevance in item.topics.items():
        topic = topics[topic_id]
        for cat in categories.values():
            miscalibration_score = compute_miscalibration_for_entry(cat.actual, cat.pred)
            category_preference_score = cat.actual

    # User-level effects (stereotype and filter bubble)
    stereotype_score = compute_stereotype_for_user(
        [cat.actual for cat in categories.values()],
        [cat.pred for cat in categories.values()],
        [0.5] * len(categories),
        [0.5] * len(categories)
    )
    
    cats_actual = [{'name': cat.name, 'ratio': cat.actual} for cat in categories.values()]
    cats_pred = [{'name': cat.name, 'ratio': cat.pred} for cat in categories.values()]
    filter_bubble_score = compute_filter_bubble_for_user(cats_actual, cats_pred, user.major_categories, user.minor_categories)
    
    # Normalize and align scores
    normalized_scores = {
        'miscalibration': 1 - normalize_score(miscalibration_score, 0, 1),
        'popularity_bias': align_popularity_bias(normalize_score(popularity_bias_score, 0, 10)),
        'stereotype': normalize_score(stereotype_score, -1, 1),
        'filter_bubble': 1 - normalize_score(filter_bubble_score, -5, 5),
        'topic_preference': normalize_score(topic_preference_score, 0, 1),
        'category_preference': normalize_score(category_preference_score, 0, 1)
    }
    
    print(f"Normalized scores for item {item.id}: {normalized_scores}")
    
    # Compute final score
    algorithmic_score = sum(weights[effect] * normalized_scores[effect] for effect in weights)
    preference_score = (normalized_scores['topic_preference'] + normalized_scores['category_preference']) / 2
    prediction_score = item.pred
    
    print(f"Weights: {weights}")
    print(f"Algorithmic score components for item {item.id}:")
    for effect in weights:
        print(f"  {effect}: {weights[effect]} * {normalized_scores[effect]} = {weights[effect] * normalized_scores[effect]}")
    
    final_score = 0.6 * algorithmic_score + 0.3 * preference_score + 0.1 * prediction_score
    print(f"Final score components for item {item.id}: algorithmic={algorithmic_score}, preference={preference_score}, prediction={prediction_score}")
    
    return final_score

def rank_items(user, items, categories, topics, personalization_preference=0.5):
    weights = optimize_weights(personalization_preference)
    
    for item in items:
        item.final_score = calculate_item_score(item, user, categories, topics, weights)

    return sorted(items, key=lambda x: x.final_score, reverse=True)

def update_user_preference(user, preference_type, id, new_preference):
    """
    Update user's preference for a topic or category.
    
    :param user: User object
    :param preference_type: 'topic' or 'category'
    :param id: ID of the topic or category
    :param new_preference: New preference value (between 0 and 1)
    """
    if preference_type == 'topic':
        user.topic_preferences[id] = new_preference
    elif preference_type == 'category':
        user.category_preferences[id] = new_preference
    else:
        raise ValueError("preference_type must be 'topic' or 'category'")
