# serializers.py
from rest_framework import serializers
from .models import Trip, EldLog


class TripSerializer(serializers.ModelSerializer):
    # Backward compatibility aliases
    distance = serializers.FloatField(source='total_distance', read_only=True)
    duration = serializers.FloatField(source='estimated_drive_time', read_only=True)

    class Meta:
        model = Trip
        fields = [
            'id',
            'current_location',
            'pickup_location',
            'dropoff_location',
            'current_cycle_used',
            'total_distance',
            'estimated_drive_time',
            'total_trip_time',
            'distance',   # alias
            'duration'    # alias
        ]


class EldLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = EldLog
        fields = '__all__'
