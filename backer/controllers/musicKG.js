'use strict';

const Router = require('koa-router');
const axios = require('axios');

const router = module.exports = new Router();

const baseResponse = require('../public/baseResponse');

const getKugoInfo = async(id, mode='all')=>{
	let ids = id.split('|');
	let returnData;
	let data = await axios.request({
		url: 'http://www.kugou.com/yy/index.php',
		params: {
			r: 'play/getdata',
			hash: ids[0],
			album_id: ids[1],
		},
		headers: {
			Referer: 'http://www.kugou.com',
			Host: 'www.kugou.com',
		},
	});
	let _data = data.data.data;
	if(mode == 'pic'){
		returnData = {
			pic: _data.img,
		};
	}else if(mode == 'lrc'){
		returnData = {
			lrc: _data.lyrics,
		};
	}else if(mode == 'url'){
		returnData = {
			url: _data.play_url,
		};
	}else{
		returnData = {
			pic: _data.img,
			lrc: _data.lyrics,
			url: _data.play_url,
			name: _data.song_name,
			artists: _data.author_name,
		};
	}
	return returnData;
}

router
	.prefix('/kg')
	//获取酷狗音乐列表
	.get('/list', async (ctx, next) => {
		let query = ctx.request.query;
		let _response = {};
		let _data = {};
		/*
			查询列表所需参数
			keyword 查询key
			page 歌曲列表页码
			pagesize 单页获取数据数量
			iscorrection 未知，删掉或值不为1将不返回数据
			platform 平台，删掉会减少部分数据
		*/
		try {
			_response = await axios.request({
				url: 'http://songsearch.kugou.com/song_search_v2',
				params: {
					keyword: query.key,
					page: query.page,
					pagesize: query.limit,
					iscorrection: 1,
					platform: 'WebFilter',
				},
				headers: {
					Referer: 'http://www.kugou.com/yy/html/search.html',
					Host: 'songsearch.kugou.com',
				},
			});
		} catch (err) {
			_response.status = err.response.status;
			_response.statusText = err.response.statusText;
		}
		_data.key = query.key;
		_data.list = [];
		// _data.demo = _response.data.data.lists;
		if (_response.data.data && _response.data.data.total != 0) {
			_data.count = _response.data.data.total;
			_response.data.data.lists.map(item => {
				_data.list.push({
					name: item.SongName,
					album: item.AlbumName,
					duration: item.Duration,
					artists: item.SingerName,
					id: `${item.FileHash}|${item.AlbumID}`,
					source: 'KG',
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
				id: 歌曲在所在平台的id (酷狗id = 歌曲Hash + 专辑id)
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
	//获取酷狗音乐专辑图片
	.get('/pic', async (ctx, next) => {
		let id = ctx.request.query.id;
		let hasId = id.split('|').length === 2;
		/*
			查询专辑图片所需参数
			id 歌曲id
		*/
		let dataJson = {
			flag: hasId,
			code: hasId ? 200 : 404,
			message: hasId ? 'success' : `havn't id`,
		};
		dataJson.data = await getKugoInfo(id, 'pic');
		baseResponse(ctx, dataJson.code, dataJson);
	})
	//获取酷狗音乐歌词信息
	.get('/lrc', async (ctx, next) => {
		let id = ctx.request.query.id;
		let hasId = id.split('|').length === 2;
		/*
			查询歌词所需参数
			id 歌曲id
		*/
		let dataJson = {
			flag: hasId,
			code: hasId ? 200 : 404,
			message: hasId ? 'success' : `havn't id`,
		};
		dataJson.data = await getKugoInfo(id, 'lrc');
		baseResponse(ctx, dataJson.code, dataJson);
	})
	//获取酷狗音乐歌曲播放地址
	.get('/url', async (ctx, next) => {
		let id = ctx.request.query.id;
		let hasId = id.split('|').length === 2;
		/*
			查询地址所需参数
			id 歌曲id
		*/
		let dataJson = {
			flag: hasId,
			code: hasId ? 200 : 404,
			message: hasId ? 'success' : `havn't id`,
		};
		dataJson.data = await getKugoInfo(id, 'url');
		baseResponse(ctx, dataJson.code, dataJson);
	})
	//获取酷狗音乐全部信息
	.get('/details', async (ctx, next) => {
		let id = ctx.request.query.id;
		let hasId = id.split('|').length === 2;
		/*
			查询details所需参数
			id 歌曲id
		*/
		let dataJson = {
			flag: hasId,
			code: hasId ? 200 : 404,
			message: hasId ? 'success' : `havn't id`,
		};
		dataJson.data = await getKugoInfo(id);
		baseResponse(ctx, dataJson.code, dataJson);
	})
	;
