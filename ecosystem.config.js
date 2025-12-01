module.exports = {
  apps: [
    {
      name: 'app206',
      script: 'start.js',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '512M',
      node_args: '--max-old-space-size=512',
      env: {
        NODE_ENV: 'production',
        INTERNAL_PORT: 4206,
        BASE_PATH: '/app206',
        DB_HOST: 'localhost',
        DB_PORT: 3306,
        DB_USER: 'student206',
        DB_PASS: 'abc123',
        DB_NAME: 'notebook',
        LINUX_USER: 'student206',
        NEPTUN_CODE: 'IHUTSC',
        SESSION_SECRET: 'ihutsc_student206_secure_session_key'
      },
      env_development: {
        NODE_ENV: 'development',
        INTERNAL_PORT: 4206,
        BASE_PATH: '/app206',
        DB_HOST: 'localhost',
        DB_PORT: 3306,
        DB_USER: 'student206',
        DB_PASS: '',
        DB_NAME: 'notebook',
        LINUX_USER: 'student206',
        NEPTUN_CODE: 'IHUTSC',
        SESSION_SECRET: 'dev_secret_key'
      },
      env_staging: {
        NODE_ENV: 'staging',
        INTERNAL_PORT: 4207,
        BASE_ROUTE: '/app206-staging',
        DB_HOST: 'localhost',
        DB_PORT: 3306,
        DB_USER: 'student206',
        DB_PASS: '',
        DB_NAME: 'notebook',
        LINUX_USER: 'student206',
        NEPTUN_CODE: 'IHUTSC',
        SESSION_SECRET: 'staging_secret_key'
      },
      // Logging configuration
      log_file: './logs/app206-combined.log',
      out_file: './logs/app206-out.log',
      error_file: './logs/app206-error.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      
      // Process management
      min_uptime: '10s',
      max_restarts: 10,
      
      // Monitoring
      pmx: true,
      
      // Environment specific settings
      kill_timeout: 5000,
      listen_timeout: 3000,
      
      // Advanced PM2 features
      merge_logs: true,
      time: true
    }
  ],
  
  // Deployment configuration (optional)
  deploy: {
    production: {
      user: 'deploy',
      host: 'your-server.com',
      ref: 'origin/main',
      repo: 'https://github.com/MI804-png/webprogramming_with_lilla.git',
      path: '/var/www/techcorp-solutions',
      'post-deploy': 'npm ci && pm2 reload ecosystem.config.js --env production'
    }
  }
}