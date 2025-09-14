# ELD Log Generator

A full-stack application for generating FMCSA-compliant ELD logs based on trip details.

## Features

- Calculate routes and driving times using Google Maps API
- Generate FMCSA-compliant ELD logs with proper formatting
- HOS (Hours of Service) compliance checking
- Interactive map display with route visualization
- Automatic SECRET_KEY generation for Django
- Responsive design for mobile and desktop
- Real-time route calculations with waypoints
- Fuel stop calculations (every 1000 miles)
- Break requirements based on FMCSA regulations
- Overnight rest calculations for long trips

## Prerequisites

- Python 3.8+
- Node.js 14+
- Google Maps API key with Directions API enabled
- Google Cloud Platform account

## Setup

### Backend (Django)

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Create a virtual environment and activate it:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. Install Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Set up environment variables:
   - The application will automatically create a `.env` file with a secure SECRET_KEY on first run
   - Edit the `.env` file to add your Google Maps API key:
     ```
     GOOGLE_MAPS_API_KEY=your_actual_google_maps_api_key_here
     DEBUG=True
     ```

5. Run database migrations:
   ```bash
   python manage.py makemigrations
   python manage.py migrate
   ```

6. Start the Django development server:
   ```bash
   python manage.py runserver
   ```
   The backend will be available at http://localhost:8000

### Frontend (React)

1. Navigate to the frontend directory (in a new terminal):
   ```bash
   cd frontend
   ```

2. Install Node.js dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   - Create a `.env` file in the frontend directory
   - Add your Google Maps API key:
     ```
     REACT_APP_GOOGLE_MAPS_API_KEY=your_actual_google_maps_api_key_here
     ```

4. Start the React development server:
   ```bash
   npm start
   ```
   The frontend will be available at http://localhost:3000

## Google Maps API Setup

1. Create a Google Cloud Platform account at https://console.cloud.google.com/
2. Create a new project or select an existing one
3. Enable the following APIs:
   - Maps JavaScript API
   - Directions API
   - Geocoding API (optional, for better address handling)
4. Create an API key in the Credentials section
5. Restrict the API key to only the necessary APIs and HTTP referrers if needed
6. Add the API key to both the backend and frontend `.env` files

## Usage

1. Open your browser and navigate to http://localhost:3000
2. Enter trip details:
   - Current location (starting point)
   - Pickup location (optional waypoint)
   - Dropoff location (destination)
   - Current cycle used (hours already worked in the current 70-hour/8-day cycle)
3. Click "Calculate Route & ELD Logs"
4. View the generated:
   - Interactive map with the route displayed
   - Trip details (distance, duration, breaks required)
   - Fuel stop calculations
   - Overnight rest requirements (if applicable)
   - FMCSA-compliant ELD logs with proper grid formatting

## Project Structure

```
eld-log-generator/
├── backend/                 # Django API
│   ├── api/                # Main application
│   │   ├── models.py       # Database models (Trip, EldLog)
│   │   ├── views.py        # API endpoints
│   │   ├── serializers.py  # Data serializers
│   │   ├── hos_calculator.py # HOS compliance logic
│   │   └── urls.py         # API URL routing
│   ├── eldbackend/         # Django project settings
│   │   ├── settings.py     # Project configuration
│   │   ├── urls.py         # Main URL routing
│   │   └── wsgi.py         # WSGI configuration
│   ├── manage.py           # Django management script
│   ├── requirements.txt    # Python dependencies
│   └── .env               # Environment variables
├── frontend/              # React application
│   ├── src/
│   │   ├── components/    # React components
│   │   │   ├── TripForm.js # Input form component
│   │   │   ├── RouteMap.js # Google Maps integration
│   │   │   └── EldLogs.js # ELD log display component
│   │   ├── services/      # API communication
│   │   │   └── api.js     # Axios API calls
│   │   ├── styles/        # CSS styles
│   │   │   └── App.css    # Main stylesheet
│   │   ├── App.js         # Main React component
│   │   └── index.js       # React entry point
│   ├── public/            # Static files
│   ├── package.json       # Node.js dependencies
│   └── .env              # Environment variables
└── README.md             # This file
```

## API Endpoints

- `POST /api/trips/calculate_route/` - Calculate route and generate ELD logs
- `GET /api/trips/` - List all trips
- `GET /api/trips/{id}/` - Get specific trip details
- `GET /api/trips/{id}/eld_logs/` - Get ELD logs for a specific trip

## HOS Compliance Features

The application implements FMCSA Hours of Service regulations including:

- 70-hour/8-day limit tracking
- 14-hour driving window enforcement
- 11-hour driving limit
- 30-minute break requirement after 8 hours of driving
- Sleeper berth provision calculations
- Adverse driving conditions exception (placeholder)
- Short-haul exceptions (placeholder)

## Deployment

### Backend Deployment
The Django backend can be deployed to:
- Heroku
- Railway
- DigitalOcean App Platform
- AWS Elastic Beanstalk

### Frontend Deployment
The React frontend can be deployed to:
- Vercel
- Netlify
- GitHub Pages
- AWS S3 + CloudFront

### Production Considerations
1. Set `DEBUG=False` in production
2. Use a proper database (PostgreSQL recommended)
3. Set secure, unique `SECRET_KEY` in production (not the auto-generated one)
4. Configure proper CORS settings for your domain
5. Set up HTTPS for secure communications
6. Monitor API usage for Google Maps to avoid exceeding quotas
7. Implement proper error handling and logging
8. Set up database backups

## Troubleshooting

### Common Issues
1. "No such table" error: Run `python manage.py migrate`
2. Google Maps not loading: Check your API key and ensure required APIs are enabled
3. Module not found errors: Reinstall dependencies with `pip install -r requirements.txt` or `npm install`
4. CORS errors: Check that the frontend URL is included in CORS settings in `settings.py`
5. Environment variables not loading: Ensure `.env` files are in the correct directories

### Getting Help
If you encounter issues:
1. Check that all dependencies are installed correctly
2. Verify your Google Maps API key is correct and has the necessary APIs enabled
3. Ensure all environment variables are set properly
4. Check the browser console for frontend errors
5. Check the Django console for backend errors
6. Review the network tab in browser dev tools to see API responses

## License

This project is for educational and demonstration purposes. Please ensure compliance with Google Maps API terms of service and FMCSA regulations when using in production.

## Disclaimer

This application is a demonstration tool and should not be used for actual ELD compliance without proper validation and certification. Always verify HOS calculations with official FMCSA guidelines and consult with legal experts before using for commercial purposes.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## Support

For questions or issues with this application, please check the troubleshooting section above or create an issue in the project repository.