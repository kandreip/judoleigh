# JudoLeigh Application

A full-stack application for managing Judo training sessions and members.

## Features

- Member management
- Training session scheduling
- Attendance tracking
- Payment status monitoring

## Tech Stack

- Frontend: React.js
- Backend: Node.js
- Database: MySQL
- Server: Nginx
- Process Manager: PM2

## Prerequisites

- Node.js (v14 or higher)
- MySQL (v5.7 or higher)
- Nginx
- PM2

## Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/judoleigh.git
cd judoleigh
```

2. Install dependencies:
```bash
npm run install-all
```

3. Set up environment variables:
Create a `.env` file in the server directory with the following variables:
```
DB_HOST=localhost
DB_USER=your_mysql_user
DB_PASSWORD=your_mysql_password
DB_NAME=judoleigh
JWT_SECRET=your_jwt_secret
```

4. Set up the database:
```bash
mysql -u root -p < server/database/schema.sql
```

5. Start the development server:
```bash
# Start backend
cd server
npm start

# Start frontend (in a new terminal)
cd client
npm start
```

## Deployment

The application can be deployed using the provided `deploy.sh` script:

```bash
chmod +x deploy.sh
sudo ./deploy.sh
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Contact

Your Name - [@yourtwitter](https://twitter.com/yourtwitter)

Project Link: [https://github.com/yourusername/judoleigh](https://github.com/yourusername/judoleigh) "# judoleigh" 
