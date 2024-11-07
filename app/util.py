import pandas as pd

def update_ranking_changes(df_ranked_items, df_updated_ranked_items):
    """
    Updates the ranking changes in df_updated_ranked_items based on the initial rankings in df_ranked_items.
    
    Parameters:
    - df_ranked_items: DataFrame containing the initial rankings.
    - df_updated_ranked_items: DataFrame containing the updated rankings.
    
    Returns:
    - DataFrame with an additional 'change' column indicating the ranking change.
    """
    for idx, item in df_updated_ranked_items.iterrows():
        item_id = item['itemID']
        updated_score = item['final_score']
        
        # Find the initial index and score in the already sorted original dataframe
        initial_idx = df_ranked_items.loc[df_ranked_items['itemID'] == item_id].index[0]
        initial_score = df_ranked_items.loc[initial_idx, 'final_score']
        updated_idx = idx

        # Calculate score change
        score_change = updated_score - initial_score

        if updated_idx < initial_idx:
            arrow = "↑"
            change = 'increased'
        elif updated_idx > initial_idx:
            arrow = "↓"
            change = 'decreased'
        else:
            arrow = "→"
            change = 'no change'

        df_updated_ranked_items.at[idx, 'change'] = change
        print(f"{item_id}: Final Score = {round(updated_score, 4)}, Category = {item['category']} {round(score_change, 4)}{arrow} from rank {initial_idx}")

    return df_updated_ranked_items

def to_camel_case(snake_str):
        """
        Convert a snake_case string to camelCase.
        Example: 'filterBubble' -> 'filterBubble'
                'popularityBias' -> 'popularityBias'
        """
        components = snake_str.split('_')
        # Join components, capitalizing all except the first one
        return components[0] + ''.join(x.title() for x in components[1:])