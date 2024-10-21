

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