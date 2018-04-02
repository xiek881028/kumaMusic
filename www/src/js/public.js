module.exports = {
	browser() {
		let u = navigator.userAgent;
		return {
			mobile: !!u.match(/AppleWebKit.*Mobile.*/),
			iPhone: u.indexOf('iPhone') > -1,
			iPad: u.indexOf('iPad') > -1,
			wechart: u.indexOf('MicroMessenger') > -1,
			qq: !!u.match(/\sQQ/),

		};
	},
};
