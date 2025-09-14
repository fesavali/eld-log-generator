# models.py
from django.db import models

class Trip(models.Model):
    current_location = models.CharField(max_length=255)
    pickup_location = models.CharField(max_length=255)
    dropoff_location = models.CharField(max_length=255)
    current_cycle_used = models.DecimalField(max_digits=4, decimal_places=1)
    created_at = models.DateTimeField(auto_now_add=True)
    
    # Calculated fields
    total_distance = models.DecimalField(max_digits=8, decimal_places=2, null=True)
    estimated_drive_time = models.DecimalField(max_digits=5, decimal_places=2, null=True)
    total_trip_time = models.DecimalField(max_digits=5, decimal_places=2, null=True)

class EldLog(models.Model):
    trip = models.ForeignKey(Trip, on_delete=models.CASCADE)
    log_date = models.DateField()
    driver_name = models.CharField(max_length=255, default="Felix Savali")
    carrier_name = models.CharField(max_length=255, default="DHL Carrier")
    vehicle_number = models.CharField(max_length=50, default="TRK-1234")
    total_miles = models.IntegerField()
    
    # Duty status in minutes for each hour (0-23)
    off_duty = models.JSONField(default=list)
    sleeper_berth = models.JSONField(default=list)
    driving = models.JSONField(default=list)
    on_duty = models.JSONField(default=list)
    
    remarks = models.TextField(blank=True)