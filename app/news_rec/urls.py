from django.urls import path
from . import views

app_name = "news_rec"
urlpatterns = [
    path('loadData/',
        view=views.LoadData.as_view(),
        name='load_data'
    ),
    path('updatePreferences/',
        view=views.UpdatePreferences.as_view(),
        name='update_preferences'
    ),
    path('updateItemPreferences/',
        view=views.UpdateItemPreferences.as_view(),
        name='update_item_preferences'
    ),
    path('updateBipolarValueAlignment/',
        view=views.UpdateBipolarValueAlignment.as_view(),
        name='update_bipolar_value_alignment'
    ),
    path('updateValueAlignment/',
        view=views.UpdateValueAlignment.as_view(),
        name='update_value_alignment'
    ),
]