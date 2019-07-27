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
      host: 'ec2-3-17-65-28.us-east-2.compute.amazonaws.com', // careful, this seems to change upon logout of AWS?
      key: '~/.ssh/birthdays.pem',
      ref: 'origin/master',
      repo: 'git@github.com:emjobson/birthday-reminders.git',
      path: '/home/ubuntu/birthday-reminders', // will save contents of entire repo to this path --> this isn't a method of selecting which part of repo to clone
      'post-deploy':
        'npm install --prefix ./backend && pm2 startOrRestart ./backend/ecosystem.config.js' // verified that these work, cmd is run from top level of repository
    }
  }
};
