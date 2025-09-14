# hos_calculator.py
from datetime import datetime, timedelta
import math

class HOSCalculator:
    def __init__(self, current_cycle_used):
        self.current_cycle_used = current_cycle_used  # Hours already used in current cycle
        self.driving_window_start = None
        self.driving_hours_used = 0
        self.on_duty_hours_used = 0
        
    def calculate_breaks(self, total_drive_time):
        """Calculate required breaks based on driving time"""
        breaks = []
        
        # 30-minute break required after 8 hours of driving
        if total_drive_time > 8:
            breaks.append({
                'type': '30_min_break',
                'after_hours': 8,
                'duration': 0.5
            })
            
        return breaks
    
    def calculate_available_drive_time(self):
        """Calculate available drive time based on current cycle"""
        # 70-hour/8-day rule
        available_weekly_hours = 70 - self.current_cycle_used
        
        # 14-hour driving window limit
        available_daily_drive_time = min(11, available_weekly_hours)
        
        return {
            'daily_drive_time': available_daily_drive_time,
            'weekly_on_duty': available_weekly_hours
        }
    
    def plan_trip(self, distance_miles, avg_speed_mph=50):
        """Plan a trip with required breaks and stops"""
        # Calculate driving time
        drive_time_hours = distance_miles / avg_speed_mph
        
        # Calculate required breaks
        breaks = self.calculate_breaks(drive_time_hours)
        
        # Calculate total trip time (driving + breaks + 1 hour for pickup/dropoff)
        total_trip_time = drive_time_hours + sum(break_time['duration'] for break_time in breaks) + 1
        
        # Check if trip is feasible with current HOS
        available_time = self.calculate_available_drive_time()
        
        overnight_rests = 0
        if drive_time_hours > available_time['daily_drive_time']:
            # Trip requires overnight rest
            days_required = math.ceil(drive_time_hours / 11)
            overnight_rests = days_required - 1
            total_trip_time += overnight_rests * 10  # Add 10 hours off duty for each overnight
            
        # Calculate fuel stops (every 1000 miles)
        fuel_stops = math.floor(distance_miles / 1000)
        total_trip_time += fuel_stops * 0.5  # 30 minutes per fuel stop
        
        return {
            'drive_time': drive_time_hours,
            'total_trip_time': total_trip_time,
            'breaks': breaks,
            'fuel_stops': fuel_stops,
            'overnight_rests': overnight_rests,
            'feasible': drive_time_hours <= available_time['weekly_on_duty']
        }