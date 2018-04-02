module.exports = (ctx, status=200, body='') => {
	//单个域名跨域在这里改 泛域名跨域修改nginx
	// ctx.set({
	// 	'Access-Control-Allow-Origin': 'http://music.bagazhu.com',
	// });
	ctx.response.status = status;
	ctx.response.body = body;
};
