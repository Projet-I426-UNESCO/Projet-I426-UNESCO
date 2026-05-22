import scheduler from 'adonisjs-scheduler/services/main'

// command for tst : node ace scheduler:run
// command in production :node ace scheduler:work


scheduler.command('check:unesco').dailyAt('02:00')
