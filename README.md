# Off-Grid Community Management System

An offline-capable Flask and Vanilla JS application for managing battery rentals, water sales, and internet access in off-grid communities.

## Features

- Battery rental tracking with individual unit management
- Water sales monitoring
- Internet access management
- Customer management with photo ID support
- Offline-first design
- Cross-platform compatibility

## Technology Stack

- Backend: Flask (Python)
- Frontend: Vanilla JavaScript
- Database: PostgreSQL
- Storage: Local file system with binary storage for photos

## Installation

1. Clone the repository
```bash
git clone [repository-url]
cd [repository-name]
```

2. Install Python dependencies
```bash
pip install -r requirements.txt
```

3. Set up environment variables
```bash
# Create a .env file with the following variables
DATABASE_URL=postgresql://[username]:[password]@[host]:[port]/[database]
SESSION_SECRET=[your-secret-key]
```

4. Initialize the database
```bash
flask db upgrade
```

5. Run the application
```bash
python main.py
```

The application will be available at `http://localhost:5000`

## Project Structure

```
.
├── app/
│   ├── static/
│   │   ├── css/
│   │   ├── js/
│   │   └── images/
│   ├── __init__.py
│   ├── models.py
│   └── routes.py
├── instance/
├── .gitignore
├── README.md
├── main.py
└── requirements.txt
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
