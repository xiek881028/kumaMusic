'use strict';

const Router = require('koa-router');
const axios = require('axios');

const router = module.exports = new Router();

const baseResponse = require('../public/baseResponse');

const getBaiDuInfo = async(id, mode='all')=>{
	let ids = id.split('|');
	let returnData;
	let data = await axios.request({
		url: 'http://musicapi.qianqian.com/v1/restserver/ting',
		params: {
			method: 'baidu.ting.song.play',
			songid: id,
		},
	});
	let _data = data.data;
	if(mode == 'pic'){
		returnData = {
			pic: _data.songinfo.pic_radio.length ? _data.songinfo.pic_radio : _data.songinfo.pic_premium,
		};
	}else if(mode == 'lrc'){
		returnData = {
			lrc: await getLrc(_data.songinfo.lrclink),
		};
	}else if(mode == 'url'){
		returnData = {
			url: _data.bitrate.file_link.replace(/^(http){1}[\s\S]*(com){1}/, 'https://gss0.bdstatic.com/y0s1hSulBw92lNKgpU_Z2jR7b2w6buu'),
		};
	}else{
		returnData = {
			pic: _data.songinfo.pic_radio.length ? _data.songinfo.pic_radio : _data.songinfo.pic_premium,
			lrc: await getLrc(_data.songinfo.lrclink),
			url: _data.bitrate.file_link.replace(/^(http){1}[\s\S]*(com){1}/, 'https://gss0.bdstatic.com/y0s1hSulBw92lNKgpU_Z2jR7b2w6buu'),
			name: _data.songinfo.title,
			artists: _data.songinfo.author,
		};
	}
	return returnData;
}

const getLrc = async(url)=>{
	let lrc;
	try {
		let data = await axios.request({url});
		lrc = data.data;
	} catch (err) {
		lrc = '';
	}
	return lrc;
}

router
	.prefix('/bd')
	//获取百度音乐列表
	.get('/list', async (ctx, next) => {
		let query = ctx.request.query;
		let _response = {};
		let _data = {};
		/*
			查询列表所需参数
			query 查询key
			page_no 歌曲列表页码
			page_size 单页获取数据数量
			method 查询方式 通过这个返回不同查询数据
			from 平台，删掉会减少部分数据
		*/
		try {
			_response = await axios.request({
				url: 'http://musicapi.qianqian.com/v1/restserver/ting',
				params: {
					query: query.key,
					page_no: query.page,
					page_size: query.limit,
					method: 'baidu.ting.search.merge',
					from: 'qianqianmini',
				},
				headers: {
					Referer: 'http://music.baidu.com',
					Host: 'music.baidu.com',
				},
			});
		} catch (err) {
			_response.status = err.response.status;
			_response.statusText = err.response.statusText;
		}
		_data.key = query.key;
		// _data.demo = _response.data.result.song_info;
		_data.list = [];
		if (_response.data.result && _response.data.result.song_info && _response.data.result.song_info.total != 0) {
			_data.count = _response.data.result.song_info.total;
			_response.data.result.song_info.song_list.map(item => {
				_data.list.push({
					name: item.title,
					album: item.album_title,
					duration: '',
					artists: item.author,
					id: `${item.song_id}`,
					source: 'BD',
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
				id: 歌曲在所在平台的id (百度id = 歌曲Hash + 专辑id)
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
	//获取百度音乐专辑图片
	.get('/pic', async (ctx, next) => {
		let id = ctx.request.query.id;
		let hasId = id !== undefined;
		/*
			查询专辑图片所需参数
			id 歌曲id
		*/
		let dataJson = {
			flag: hasId,
			code: hasId ? 200 : 404,
			message: hasId ? 'success' : `havn't id`,
		};
		dataJson.data = await getBaiDuInfo(id, 'pic');
		baseResponse(ctx, dataJson.code, dataJson);
	})
	//获取百度音乐歌词信息
	.get('/lrc', async (ctx, next) => {
		let id = ctx.request.query.id;
		let hasId = id !== undefined;
		/*
			查询歌词所需参数
			id 歌曲id
		*/
		let dataJson = {
			flag: hasId,
			code: hasId ? 200 : 404,
			message: hasId ? 'success' : `havn't id`,
		};
		dataJson.data = await getBaiDuInfo(id, 'lrc');
		baseResponse(ctx, dataJson.code, dataJson);
	})
	//获取百度音乐歌曲播放地址
	.get('/url', async (ctx, next) => {
		let id = ctx.request.query.id;
		let hasId = id !== undefined;
		/*
			查询地址所需参数
			id 歌曲id
		*/
		let dataJson = {
			flag: hasId,
			code: hasId ? 200 : 404,
			message: hasId ? 'success' : `havn't id`,
		};
		dataJson.data = await getBaiDuInfo(id, 'url');
		baseResponse(ctx, dataJson.code, dataJson);
	})
	//获取百度音乐全部信息
	.get('/details', async (ctx, next) => {
		let id = ctx.request.query.id;
		let hasId = id !== undefined;
		/*
			查询details所需参数
			id 歌曲id
		*/
		let dataJson = {
			flag: hasId,
			code: hasId ? 200 : 404,
			message: hasId ? 'success' : `havn't id`,
		};
		dataJson.data = await getBaiDuInfo(id);
		baseResponse(ctx, dataJson.code, dataJson);
	})
	;
