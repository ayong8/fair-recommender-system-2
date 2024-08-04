from django.urls import path
from . import views

app_name = "news_rec"
urlpatterns = [
    path('loadData/',
        view=views.LoadData.as_view(),
        name='load_data'
    ),
]