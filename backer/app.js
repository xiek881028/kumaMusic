const path = require('path');

const Koa = require('koa');
const body = require('koa-body');
const log4js = require('log4js');
const pkg = require('./package.json');
const controllers = require('./controllers');

const app = new Koa();

log4js.configure({
	appenders: {
		console: { type: 'console' },
		dateFile: {
			type: 'dateFile',
			filename: path.join('logs', `${app.env}.log`),
			options: { keepFileExt: true },
			pattern: '.yyyyMMdd',
			layout: {
				type: 'pattern',
				pattern: '%d{yyyy-MM-dd hh:mm:ss.SSS}  %p [%x{name}, %z : %m',
				tokens: {
					name: pkg.name,
				},
			},
		},
	},
	categories: {
		default: { appenders: ['console', 'dateFile'], level: app.env === 'development' && 'debug' || 'info' },
	},
	disableClustering: true,
});

app.context.logger = log4js.getLogger();

app
	.use(body())
	.use(controllers.routes(), controllers.allowedMethods())
	.use(async ctx => {
		ctx.response.status = 404;
		ctx.response.body = {
			flag: false,
			message: '404 not found',
		};
	})
	;

app.listen(20040, () => app.context.logger.info(`${pkg.name} is running ${20040}.`));
