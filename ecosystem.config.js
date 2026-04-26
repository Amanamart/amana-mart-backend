module.exports = {
  apps: [
    {
      name: 'amanamart-backend',
      script: 'npm',
      args: 'start',
      cwd: './',
      env: {
        NODE_ENV: 'production',
        PORT: 5000
      }
    },
    {
      name: 'amanamart-frontend',
      script: 'npm',
      args: 'start',
      cwd: './amanamart-frontend',
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      }
    }
  ]
};
