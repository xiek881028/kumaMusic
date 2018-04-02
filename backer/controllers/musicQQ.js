'use strict';

const Router = require('koa-router');
const axios = require('axios');

const router = module.exports = new Router();

const baseResponse = require('../public/baseResponse');

const getLrc = async id=>{
	let lrc;
	try {
		let data = await axios.request({
			url: `https://c.y.qq.com/lyric/fcgi-bin/fcg_query_lyric_new.fcg`,
			params: {
				//尚不知道如何返回json数据
				format: 'jsonp',
				callback: 'aaa',
				songmid: id,
				g_tk: '5381',
				nobase64: 1,
			},
			headers: {
				Referer: 'http://y.qq.com/',
			},
		});
		data.data = data.data.replace(/(\)){1}$/, '').replace(/^(aaa\(){1}/, '');
		lrc = JSON.parse(data.data).lyric;
	} catch (err) {
		lrc = '';
	}
	return lrc;
}

const getUrl = async (ids, infoFlag=false)=>{
	let url;
	if(ids[0] != 0){
		try {
			let data = await axios.request({
				url: `https://c.y.qq.com/v8/fcg-bin/fcg_play_single_song.fcg`,
				params: {
					format: 'json',
					songmid: ids[2],
				},
				headers: {
					Referer: 'http://y.qq.com/',
				},
			});
			if(infoFlag){
				url = {};
				url.url = `http://${data.data.url[ids[0]]}`;
				url.name = data.data.data[0].title;
				url.artists = data.data.data[0].singer.map((_item) => {
					return _item.name;
				}).join('/');
			}else{
				url = `http://${data.data.url[ids[0]]}`;
			}
		} catch (err) {
			url = '';
		}
	}else{
		url = '';
	}
	return url;
}

router
	.prefix('/qq')
	//获取qq音乐列表
	.get('/list', async (ctx, next) => {
		let query = ctx.request.query;
		let _response = {};
		let _data = {};
		/*
			qq所需参数
			new_json 影响返回json结构
			format 返回格式
			aggr 合并同一个歌手演唱同名歌曲，即一个歌手在列表里只出现一次
			cr 作用未知 删除后会减少部分返回数据
			p 歌曲列表页码
			n 歌曲单页返回条数
			w 搜索关键key
		*/
		try {
			_response = await axios.request({
				url: `https://c.y.qq.com/soso/fcgi-bin/client_search_cp`,
				params: {
					new_json: 1,
					format: 'json',
					aggr: 1,
					cr: 1,
					p: query.page,
					n: query.limit,
					w: encodeURI(query.key),
				},
				headers: {
					Referer: 'http://y.qq.com/',
				},
			});
		} catch (err) {
			_response.status = err.response.status;
			_response.statusText = err.response.statusText;
		}
		_data.key = query.key;
		_data.list = [];
		_data.count = _response.data.data.song.totalnum;
		// _data.demo = _response.data.data.song;
		if(_data.count != 0){
			_response.data.data.song.list.map(item=>{
				_data.list.push({
					name: item.title,
					album: item.album.title,
					duration: item.interval,
					artists: item.singer.map((_item) => {
						return _item.name;
					}).join('/'),
					id: `${item.id}|${item.album.id}|${item.mid}`,
					canPlay: item.id != 0 && item.album.id != 0,
					source: 'QQ'
				});
			});
		}
		/*
			统一输出格式
			｛
				name: 歌曲名称
				album: 歌曲专辑名称
				duration: 歌曲时长(毫秒)
				artists: 艺术家名称
				id: 歌曲在所在平台的id (QQ音乐id = 歌曲id + 歌曲专辑id + mid)
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
	//获取QQ音乐专辑图片
	.get('/pic', async (ctx, next) => {
		let ids = ctx.request.query.id.split('|');
		let hasId = ids.length === 3;
		/*
			查询专辑图片所需参数
			id 歌曲id
		*/
		let dataJson = {
			flag: hasId,
			code: hasId ? 200 : 404,
			message: hasId ? 'success' : `havn't id`,
		};
		if(hasId){
			dataJson.data = {
				picUrl: `http://imgcache.qq.com/music/photo/album_300/${ids[1]%100}/300_albumpic_${ids[1]}_0.jpg`,
			};
		}
		baseResponse(ctx, dataJson.code, dataJson);
	})
	//获取QQ音乐歌词信息
	.get('/lrc', async (ctx, next) => {
		let ids = ctx.request.query.id.split('|');
		let hasId = ids.length === 3;
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
			lrc: await getLrc(ids[2]),
		};
		baseResponse(ctx, dataJson.code, dataJson);
	})
	//获取QQ音乐歌曲播放地址
	.get('/url', async (ctx, next) => {
		let ids = ctx.request.query.id.split('|');
		let hasId = ids.length === 3;
		/*
			查询播放地址所需参数
			id 歌曲id
		*/
		let dataJson = {
			flag: hasId,
			code: hasId ? 200 : 404,
			message: hasId ? 'success' : `havn't id`,
		};
		dataJson.data = {
			url: await getUrl(ids, false),
		};
		baseResponse(ctx, dataJson.code, dataJson);
	})
	//获取QQ音乐全部信息
	.get('/details', async (ctx, next) => {
		let ids = ctx.request.query.id.split('|');
		let hasId = ids.length === 3;
		/*
			查询details所需参数
			id 歌曲id
		*/
		let dataJson = {
			flag: hasId,
			code: hasId ? 200 : 404,
			message: hasId ? 'success' : `havn't id`,
		};
		let infoData = await getUrl(ids, true);
		dataJson.data = {
			pic: `http://imgcache.qq.com/music/photo/album_300/${ids[1]%100}/300_albumpic_${ids[1]}_0.jpg`,
			lrc: await getLrc(ids[2]),
			url: infoData.url,
			name: infoData.name,
			artists: infoData.artists,
		};
		baseResponse(ctx, dataJson.code, dataJson);
	})
	;
