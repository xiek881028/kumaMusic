'use strict';

const Router = require('koa-router');
const axios = require('axios');

const router = module.exports = new Router();

const baseResponse = require('../public/baseResponse');

const getLrc = async url=>{
	let lrc;
	try {
		let data = await axios.request({url});
		lrc = data.data.replace(/(\<){1}[\d]+(\>){1}/g, '');
	} catch (err) {
		lrc = '';
	}
	return lrc;
}

router
	.prefix('/xm')
	//获取虾米音乐列表
	.get('/list', async (ctx, next) => {
		let query = ctx.request.query;
		let _response = {};
		let _data = {};
		/*
			查询列表所需参数
			app_key 作用未知 必传
			key 查询key
			page 歌曲列表页码
			limit 单页获取数据数量
			r 作用未知 必传
		*/
		try {
			_response = await axios.request({
				url: 'http://api.xiami.com/web',
				params: {
					app_key: 1,
					key: query.key,
					page: query.page,
					limit: query.limit,
					r: 'search/songs',
				},
				headers: {
					Referer: 'http://h.xiami.com/',
					Host: 'api.xiami.com',
				},
			});
		} catch (err) {
			_response.status = err.response.status;
			_response.statusText = err.response.statusText;
		}
		_data.key = query.key;
		_data.list = [];
		// _data.demo = _response.data.data;
		if (_response.data.data && _response.data.data.total != 0) {
			_data.count = _response.data.data.total;
			_response.data.data.songs.map(item => {
				_data.list.push({
					name: item.song_name,
					album: item.album_name,
					duration: '',
					artists: item.artist_name,
					id: `${item.album_logo}|${item.lyric}|${item.listen_file}|${item.song_name}|${item.artist_name}`,
					canPlay: item.listen_file != '',
					source: 'XM',
				});
			});
		} else {
			_data.count = 0;
		}
		/*
			统一输出格式
			｛
				name: 歌曲名称
				album: 歌曲专辑名称
				duration: 歌曲时长(秒)
				artists: 艺术家名称
				id: 歌曲在所在平台的id (虾米id = 图片 + 歌词 + 链接 + 歌曲名称 + 艺术家名称)
				source: 歌曲来源平台
			｝
		*/
		baseResponse(ctx, _response.status, {
			flag: _response.status == 200,
			code: _response.status,
			message: _response.statusText,
			data: _data,
		});
	})
	//获取虾米音乐专辑图片
	.get('/pic', async (ctx, next) => {
		let ids = ctx.request.query.id.split('|');
		let hasId = ids.length === 5;
		/*
			查询专辑图片所需参数
			id 歌曲id
		*/
		let dataJson = {
			flag: hasId,
			code: hasId ? 200 : 404,
			message: hasId ? 'success' : `havn't id`,
		};
		dataJson.data = {
			pic: ids[0],
		};
		baseResponse(ctx, dataJson.code, dataJson);
	})
	//获取虾米音乐歌词信息
	.get('/lrc', async (ctx, next) => {
		let ids = ctx.request.query.id.split('|');
		let hasId = ids.length === 5;
		/*
			查询歌词所需参数
			id 歌曲id
		*/
		let dataJson = {
			flag: hasId,
			code: hasId ? 200 : 404,
			message: hasId ? 'success' : `havn't id`,
		};
		dataJson.data = {
			lrc: await getLrc(ids[1]),
		};
		baseResponse(ctx, dataJson.code, dataJson);
	})
	//获取虾米音乐歌曲播放地址
	.get('/url', async (ctx, next) => {
		let ids = ctx.request.query.id.split('|');
		let hasId = ids.length === 5;
		/*
			查询地址所需参数
			id 歌曲id
		*/
		let dataJson = {
			flag: hasId,
			code: hasId ? 200 : 404,
			message: hasId ? 'success' : `havn't id`,
		};
		dataJson.data = {
			url: ids[2],
		};
		baseResponse(ctx, dataJson.code, dataJson);
	})
	//获取虾米音乐全部信息
	.get('/details', async (ctx, next) => {
		let ids = ctx.request.query.id.split('|');
		let hasId = ids.length === 5;
		/*
			查询details所需参数
			id 歌曲id
		*/
		let dataJson = {
			flag: hasId,
			code: hasId ? 200 : 404,
			message: hasId ? 'success' : `havn't id`,
		};
		dataJson.data = {
			pic: ids[0],
			lrc: await getLrc(ids[1]),
			url: ids[2],
			name: ids[3],
			artists: ids[4],
		};
		baseResponse(ctx, dataJson.code, dataJson);
	})
	;
