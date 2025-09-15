# views.py
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Trip, EldLog
from .serializers import TripSerializer, EldLogSerializer
from .hos_calculator import HOSCalculator
import googlemaps
from django.conf import settings
import math
from datetime import datetime, timedelta


class TripViewSet(viewsets.ModelViewSet):
    queryset = Trip.objects.all()
    serializer_class = TripSerializer

    @action(detail=False, methods=['post'])
    def calculate_route(self, request):
        # Extract trip data from request
        current_location = request.data.get('current_location')
        pickup_location = request.data.get('pickup_location')
        dropoff_location = request.data.get('dropoff_location')
        current_cycle_used = request.data.get('current_cycle_used')

        # Validate required fields
        if not all([current_location, pickup_location, dropoff_location, current_cycle_used]):
            return Response(
                {'error': 'Missing required fields: current_location, pickup_location, dropoff_location, current_cycle_used'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            current_cycle_used = float(current_cycle_used)
        except (ValueError, TypeError):
            return Response(
                {'error': 'current_cycle_used must be a number'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Initialize Google Maps client
        if not hasattr(settings, 'GOOGLE_MAPS_API_KEY') or not settings.GOOGLE_MAPS_API_KEY:
            return Response(
                {'error': 'Google Maps API key not configured'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

        try:
            gmaps = googlemaps.Client(key=settings.GOOGLE_MAPS_API_KEY)

            # Calculate route
            directions_result = gmaps.directions(
                current_location,
                dropoff_location,
                waypoints=[pickup_location] if pickup_location != current_location else [],
                mode="driving"
            )

            # Check if we got a valid response
            if not directions_result:
                return Response(
                    {'error': 'No route found for the given locations'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Extract route information across all legs
            legs = directions_result[0]['legs']
            distance_meters = sum(leg['distance']['value'] for leg in legs if 'distance' in leg)
            duration_seconds = sum(leg['duration']['value'] for leg in legs if 'duration' in leg)

            distance_miles = distance_meters / 1609.34 if distance_meters else 0
            duration_hours = duration_seconds / 3600 if duration_seconds else 0

            # Collect per-leg info (hardened against missing fields)
            legs_info = []
            for leg in legs:
                legs_info.append({
                    'start': leg.get('start_address', 'Unknown'),
                    'end': leg.get('end_address', 'Unknown'),
                    'distance_miles': leg['distance']['value'] / 1609.34 if 'distance' in leg else 0,
                    'duration_hours': leg['duration']['value'] / 3600 if 'duration' in leg else 0,
                })

            # Calculate HOS compliance
            hos_calculator = HOSCalculator(current_cycle_used)
            trip_plan = hos_calculator.plan_trip(distance_miles)

            # Create trip record
            trip = Trip.objects.create(
                current_location=current_location,
                pickup_location=pickup_location,
                dropoff_location=dropoff_location,
                current_cycle_used=current_cycle_used,
                total_distance=distance_miles,
                estimated_drive_time=duration_hours,
                total_trip_time=trip_plan['total_trip_time']
            )

            # Generate ELD logs
            eld_logs = self.generate_eld_logs(trip, trip_plan)

            # Prepare response data
            response_data = {
                'trip': TripSerializer(trip).data,
                'route_info': {
                    # Backward-compatible keys
                    'distance': distance_miles,
                    'duration': duration_hours,
                    # New explicit keys
                    'total_distance': distance_miles,
                    'total_duration': duration_hours,
                    'legs': legs_info,
                    'breaks': trip_plan['breaks'],
                    'fuel_stops': trip_plan['fuel_stops'],
                    'overnight_rests': trip_plan.get('overnight_rests', 0),
                    'feasible': trip_plan['feasible']
                },
                'eld_logs': EldLogSerializer(eld_logs, many=True).data
            }

            return Response(response_data)

        except googlemaps.exceptions.ApiError as e:
            return Response(
                {'error': f'Google Maps API error: {str(e)}'},
                status=status.HTTP_400_BAD_REQUEST
            )
        except googlemaps.exceptions.HTTPError as e:
            return Response(
                {'error': f'Network error: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
        except Exception as e:
            return Response(
                {'error': f'Unexpected error: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def generate_eld_logs(self, trip, trip_plan):
        # Simplified ELD log generation
        logs = []

        # For simplicity, one log per day of trip
        days = max(1, math.ceil(trip_plan['total_trip_time'] / 24))

        for day in range(days):
            log = EldLog.objects.create(
                trip=trip,
                log_date=datetime.now().date() + timedelta(days=day),
                total_miles=int(trip.total_distance / days) if days > 1 else int(trip.total_distance),
                off_duty=[0] * 24,  # Placeholder
                sleeper_berth=[0] * 24,  # Placeholder
                driving=[0] * 24,  # Placeholder
                on_duty=[0] * 24,  # Placeholder
                remarks=f"Day {day+1} of trip from {trip.current_location} to {trip.dropoff_location}"
            )
            logs.append(log)

        return logs