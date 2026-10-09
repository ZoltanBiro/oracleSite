module.exports = {
  apps: [
    {
      name: 'personal-site',
      script: './app.js',
      instances: 1,
      exec_mode: 'fork', // single instance is fine for a 1 OCPU/1GB box
      watch: false,
      max_memory_restart: '400M', // guardrail given the tight 1GB instance
      env: {
        NODE_ENV: 'production',
      },
    },
  ],
};
