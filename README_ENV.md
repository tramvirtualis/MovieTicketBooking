# Environment Variables Setup

## Frontend Configuration

1. Copy `.env.example` to `.env`:
   ```bash
   cd frontend
   cp .env.example .env
   ```

2. Update `.env` with your configuration:
   ```env
   VITE_API_BASE_URL=http://localhost:8080/api
   VITE_WS_URL=ws://localhost:8080/ws
   ```

   For production, update to your production URLs:
   ```env
   VITE_API_BASE_URL=https://your-api-domain.com/api
   VITE_WS_URL=wss://your-api-domain.com/ws
   ```

## Backend Configuration

1. Copy `.env.example` to `.env`:
   ```bash
   cd backend
   cp .env.example .env
   ```

2. Update `.env` with your actual values:
   ```env
   # Database
   DB_URL=jdbc:mysql://localhost:3306/movieticketbooking?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=Asia/Ho_Chi_Minh&createDatabaseIfNotExist=true
   DB_USERNAME=root
   DB_PASSWORD=your_password

   # Mail
   MAIL_USERNAME=your_email@gmail.com
   MAIL_PASSWORD=your_app_password

   # JWT
   JWT_SECRET=your_secret_key_here

   # Cloudinary
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret

   # Payment Gateways
   ZALOPAY_APP_ID=your_app_id
   ZALOPAY_KEY1=your_key1
   ZALOPAY_KEY2=your_key2
   MOMO_PARTNER_CODE=your_partner_code
   MOMO_ACCESS_KEY=your_access_key
   MOMO_SECRET_KEY=your_secret_key

   # Google OAuth
   GOOGLE_CLIENT_ID=your_client_id
   GOOGLE_CLIENT_SECRET=your_client_secret
   ```

3. The `application.properties` file will automatically read from environment variables. If an environment variable is not set, it will use the default value specified in `application.properties`.

## Deployment Notes

- **Never commit `.env` files** - They are already in `.gitignore`
- Always use `.env.example` as a template
- For production deployments, set environment variables in your hosting platform (Heroku, AWS, etc.)
- For Docker deployments, use environment variables in `docker-compose.yml` or pass them as arguments

