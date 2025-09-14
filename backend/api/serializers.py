# serializers.py
from rest_framework import serializers
from .models import Trip, EldLog

class TripSerializer(serializers.ModelSerializer):
    class Meta:
        model = Trip
        fields = '__all__'

class EldLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = EldLog
        fields = '__all__'