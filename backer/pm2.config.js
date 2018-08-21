module.exports = {
	apps : [
		{
			"name": "com.bagazhu.music",
			"script": "./app.js",
			"cwd": "./", // 当前工作路径
			"watch": [ // 监控变化的目录，一旦变化，自动重启
				"app.js",
				"controllers/",
			],
			"ignore_watch": [ // 从监控目录中排除
				"node_modules",
				"logs",
			],
			"watch_options": {
				"followSymlinks": false
			},
			"error_file": "./logs/app-out.log", // 错误日志路径
			"out_file": "./logs/app-out.log", // 普通日志路径
			"env": {
				"NODE_ENV": "development"
			}
		}
	]
}
