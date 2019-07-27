module.exports = {
  apps: [
    {
      name: 'backend',
      script: './backend/src/index.js'
    }
  ],
  deploy: {
    production: {
      user: 'ubuntu',
      host: 'ec2-18-217-223-241.us-east-2.compute.amazonaws.com', // careful, this seems to change upon logout of AWS?
      key: '~/.ssh/birthdays.pem',
      ref: 'origin/master',
      repo: 'git@github.com:emjobson/birthday-reminders.git',
      path: '/home/ubuntu/birthday-reminders',
      'post-deploy': 'npm install && pm2 startOrRestart ecosystem.config.js'
    }
  }
};
