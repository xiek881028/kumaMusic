'use strict';

const Router = require('koa-router');
const axios = require('axios');

const router = module.exports = new Router();

const baseResponse = require('../public/baseResponse');

const getLrc = async id=>{
	let lrc;
	try {
		let data = await axios.request({
			url: `https://music.163.com/api/song/lyric`,
			params: {
				id,
				lv: -1, //作用未知，但删掉将不会返回歌词
			},
			headers: {
				Referer: 'http://music.163.com/',
			},
		});
		lrc = data.data.lrc.lyric;
	} catch (err) {
		lrc = '';
	}
	return lrc;
}

const getUrl = async id=>{
	let url;
	try {
		let data = await axios.request({
			url: `http://music.163.com/api/song/enhance/player/url`,
			params: {
				ids: `[${id}]`,
				br: 320 * 1000,
			},
			headers: {
				Referer: 'http://music.163.com/',
			},
		});
		url = data.data.data[0].url;
	} catch (err) {
		url = '';
	}
	return url;
}

router
	.prefix('/wy')
	//获取网易云音乐列表
	.get('/list', async (ctx, next) => {
		let query = ctx.request.query;
		let _response = {};
		let _data = {};
		let getArtists = (artists)=>{
			return artists.map((_item) => {
				return _item.name;
			}).join('/');
		};
		/*
			查询列表所需参数
			s 查询key
			offset 歌曲列表偏移量
			limit 单页获取数据数量
			total 不传返回total数量会错误
			type 功能未知 测试必须为1 否则没有返回数据
		*/
		query.s = query.key;
		query.offset = (+query.page - 1) * query.limit;
		query.type = 1;
		query.total = true;
		try {
			_response = await axios.request({
				url: 'http://music.163.com/api/cloudsearch/pc',
				method: 'post',
				params: query,
				headers: {
					Referer: 'http://music.163.com/',
				// 	Cookie: 'appver=1.5.0.75771;',
				// 	'Content-type': 'application/x-www-form-urlencoded',
				// Host: 'music.163.com',
				},
			});
		} catch (err) {
			_response.status = err.response.status;
			_response.statusText = err.response.statusText;
		}
		_data.key = query.key;
		_data.list = [];
		// _data.demo = _response.data.result;
		if (_response.data.result && _response.data.result.songCount != 0) {
			_data.count = _response.data.result.songCount;
			_response.data.result.songs.map(item => {
				let artists = getArtists(item.ar);
				_data.list.push({
					name: item.name,
					album: item.al.name,
					duration: Math.ceil(item.duration/1000),
					artists,
					canPlay: item.privilege.st == 0,
					id: `${item.id}|${item.al.picUrl + `?param=130y130`}|${item.name}|${artists}`,
					source: 'WY',
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
				id: 歌曲在所在平台的id (网易id = 歌曲id + 专辑图片地址 + 歌曲名称 + 艺术家名称)
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
	//获取网易云音乐专辑图片
	.get('/pic', async (ctx, next) => {
		let ids = ctx.request.query.id.split('|');
		let hasId = ids.length === 4;
		/*
			查询专辑图片所需参数
			id 歌曲id
		*/
		let dataJson = {
			flag: hasId,
			code: hasId ? 200 : 404,
			message: hasId ? 'success' : `havn't id`,
		};
		if(ids[1]){
			dataJson.data = {
				picUrl: ids[1],
			};
		}
		baseResponse(ctx, dataJson.code, dataJson);
	})
	//获取网易云音乐歌词信息
	.get('/lrc', async (ctx, next) => {
		let ids = ctx.request.query.id.split('|');
		let hasId = ids.length === 4;
		/*
			查询歌词所需参数
			id 歌曲id
		*/
		let dataJson = {
			flag: hasId,
			code: hasId ? 200 : 404,
			message: hasId ? 'success' : `havn't id`,
		};
		if(hasId){
			dataJson.data = {
				lrc: await getLrc(ids[0]),
			};
		}
		baseResponse(ctx, dataJson.code, dataJson);
	})
	//获取网易云音乐歌曲播放地址
	.get('/url', async (ctx, next) => {
		let ids = ctx.request.query.id.split('|');
		let hasId = ids.length === 4;
		/*
			查询播放地址所需参数
			id 歌曲id
		*/
		let dataJson = {
			flag: hasId,
			code: hasId ? 200 : 404,
			message: hasId ? 'success' : `havn't id`,
		};
		if(hasId){
			dataJson.data = {
				// url: `http://music.163.com/song/media/outer/url?id=${ids[0]}.mp3`
				url: await getUrl(ids[0]),
			};
		}
		baseResponse(ctx, dataJson.code, dataJson);
	})
	//获取网易云音乐全部信息
	.get('/details', async (ctx, next) => {
		let ids = ctx.request.query.id.split('|');
		let hasId = ids.length === 4;
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
			pic: ids[1],
			lrc: await getLrc(ids[0]),
			// url: `http://music.163.com/song/media/outer/url?id=${ids[0]}.mp3`,
			url: await getUrl(ids[0]),
			name: ids[2],
			artists: ids[3],
		};
		baseResponse(ctx, dataJson.code, dataJson);
	})
	;
