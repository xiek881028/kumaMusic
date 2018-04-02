/*!
* BaseDetails
* create: 2018-3-27
* since: 0.0.1
*/

<template lang="pug">
	div(is="BaseLayout")
		div(is="BaseTips" :show="tipsShow" :time="tipsTime" @cb="tipsCallback" @afterLeave="tipsAfterLeave") {{tipsText}}
		.audioBox.hidden
			audio(:src="url" controls="false" preload="true" ref="audio" @canplay="canplay" @play="play" @pause="pause" @ended="ended" @error="error" @waiting="waiting" @loadedmetadata="loadedmetadata" @timeupdate="timeupdate")
		.detailsBox
			.gobackBox(v-if="canGoback")
				a(href="javascript:;" @click="goback")
					i.fa.fa-angle-left
					| 返回
			.lrcBox
				//- .lrcSvgBg(v-if="isPc")
				//- 	svg(version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:ev="http://www.w3.org/2001/xml-events" baseProfile="full" width="100%" height="100%")
				//- 		filter#blur
				//- 			feGaussianBlur(stdDeviation="20")
				//- 		image(x="0" y="0" width="100%" height="100%" filter="url(#blur)" preserveAspectRatio="none" externalResourcesRequired="true" href="http://p1.music.126.net/OzLcwLmUSdoFvsxthLv3nA==/109951162820238045.jpg?param=130y130")
				//- .lrcBg(v-else ref="lrcBg")
				.lrcBg(ref="lrcBg" :class="{blur: toBlur}")
				.lrcContentBox(ref="scrollBox")
					.scrollBox(:class="{pcLrc: isPc}")
						//- div(v-for="(item, index) in lrcInfo" :key="'info'+index") {{item}}
						.lrcLine(v-for="(item, key, index) in lrcJson" :key="'lrc' + index" :class="{active: key == lrcActive}" :ref="'lrc' + key") {{item}}
			.consoleBox
				.infoBox
					img(src="../../images/music_placeholder_60_60.png" ref="pic")
					.info
						.name {{name}}
						.artists {{artists}}
				.barBox
					.barInfo
						.startTime {{_nowTime}}
						.allTime {{_endTime}}
					.barTouchBox(ref="barConsole" @touchmove="barTouchMove('touch', $event)" @touchend="barClick('touch', $event)" @mousedown="barMouseDown('mouse', $event)")
						.bar
							.nowBar(ref="nowBar")
								a.barBtn.fa.fa-circle(:class="{show: barBtnshow}")
									i.fa.fa-spinner
				.btnBox
					a.play(@click="clickPlay")
						i.fa(:class="[isPlay ? 'fa-pause' : 'fa-play' ]" :style="{marginRight: isPlay ? 0 : '-.7rem' }")
					.right
						a.download(@click="download" href="javascript:;")
							i.fa.fa-download
							span 下载
						a.volume(@click="clickVolume" href="javascript:;" v-if="isPc")
							i.fa(:class="[volume ? 'fa-volume-up' : 'fa-volume-off']")

</template>

<script>
import BaseLayout from './components/BaseLayout.vue';
import BaseTips from './components/BaseTips.vue';
import {browser} from '../public';
export default {
	components: {
		BaseLayout,
		BaseTips,
	},
	data() {
		return {
			tipsText: '',
			tipsShow: false,
			tipsTime: 1000 * 60 *60 *24,
			platform: this.$route.params.platform,
			id: this.$route.params.id,
			url: '',
			pic: '',
			lrc: '',
			name: '',
			artists: '',
			nowTime: 0,
			endTime: 0,
			time: null,
			setBar: null,
			audio: null,
			isPlay: !browser().mobile,
			isPc: !browser().mobile,
			canDownload: !(browser().wechart),
			canGoback: browser().qq,
			isPhone: "ontouchmove" in document,
			errIndex: 0,
			listenErr: false,
			barBtnshow: false,
			volume: 1,
			toBlur: false,
			lrcJson: {},
			lrcActive: 0,
			scrollBox: null,
			touchScrollFlag: false,
			touchScrollTime: null,
			gobackDisabled: false,
			demo: navigator.userAgent,
			// lrcInfo: [],
		};
	},
	computed: {//计算属性
		_nowTime() {
			let sec = this.nowTime % 60;
			return `${Math.floor(this.nowTime/60)}:${sec < 10 ? `0${sec}` : sec}`;
		},
		_endTime() {
			let sec = this.endTime % 60;
			return `${Math.floor(this.endTime/60)}:${sec < 10 ? `0${sec}` : sec}`;
		},
	},
	methods: {
		getDetails(id) {
			axios({
				url: `http://api.music.bagazhu.com/${this.platform}/details`,
				params: {
					id,
				},
			})
			.then(res=>{
				if(res.data.flag){
					let data = res.data.data;
					this.url = data.url;
					this.pic = data.pic;
					this.lrc = data.lrc;
					this.name = data.name;
					this.artists = data.artists;
					if(data.url == '' || data.url == undefined){
						this.isPlay = false;
						this.tipsText = '抱歉，音乐不支持试听与下载';
						this.tipsShow = true;
					}
					let image = new Image();
					image.src = data.pic;
					image.onload = res=>{
						this.$refs.pic.src = data.pic;
						// if(!this.isPc){
						// 	this.$refs.lrcBg.style.backgroundImage = `url(${data.pic})`;
						// }
						this.$refs.lrcBg.style.backgroundImage = `url(${data.pic})`;
						setTimeout(()=>{
							this.toBlur = true;
						}, 400);
					};
					if(this.lrc == ''){
						this.lrc = '[00:00:00]此音乐没有歌词';
					}
					let lrcData = this.parseLyric(this.lrc);
					this.lrcJson = lrcData.lrc;
					// this.lrcInfo = lrcData.info;
					this.scrollBox = new BScroll(this.$refs.scrollBox, {
						//支持pc鼠标滚动
						mouseWheel: true,
						//阻止事件冒泡
						stopPropagation: true,
						probeType: 1,
					});
					this.scrollBox
					.on('scroll', ()=>{
						this.touchScrollEvent();
					});
					this.scrollBox
					.on('scrollStart', ()=>{
						this.touchScrollEvent();
					})
					;
				}
			})
			.catch(err=>{
				console.log(err);
				this.tipsText = '数据加载失败，请刷新页面重试';
				this.tipsShow = true;
			});
		},
		touchScrollEvent() {
			clearTimeout(this.touchScrollTime);
			this.touchScrollFlag = true;
			this.touchScrollTime = setTimeout(()=>{
				this.touchScrollFlag = false;
			}, 3000);
		},
		canplay() {
			this.barBtnshow = false;
			this.isPlay && this.audio.play();
		},
		loadedmetadata() {
			this.volume = this.audio.volume;
			this.setTime();
			this.listenErr = true;
		},
		play() {
			this.setTime();
			clearInterval(this.time);
			clearInterval(this.setBar);
			this.time = setInterval(()=>{
				this.setTime();
			}, 1000);
			this.setBar = setInterval(()=>{
				this.setBarPosition();
			}, 30);
		},
		pause() {
			clearInterval(this.time);
			clearTimeout(this.setBar);
		},
		ended() {
			clearInterval(this.time);
			this.nowTime = this.endTime;
			this.audio.currentTime = 0;
			this.audio.play();
		},
		clickPlay() {
			if(this.audio == null){
				this.loadedmetadata();
			};
			let state = this.isPlay;
			this.audio[state ? 'pause' : 'play']();
			this.isPlay = !state;
		},
		setBarPosition(barPosition) {
			this.$refs.nowBar.style.width = `${ barPosition === undefined ? ((this.audio.currentTime / this.audio.duration) * 100).toFixed(5) : barPosition }%`;
		},
		setTime(time) {
			this.nowTime = Math.ceil(time === undefined ? this.audio.currentTime : time);
			if(!this.endTime && !Number.isNaN(this.audio.duration)){
				this.endTime =  Math.floor(this.audio.duration);
			}
		},
		getBarPosition(mode, e) {
			let barPosition;
			let x;
			let x0;
			if(mode == 'touch'){
				x = e.changedTouches[0].pageX;
				x0 = this.$refs.barConsole.scrollWidth;
			}else{
				x = e.x;
				x0 = this.$refs.barConsole.scrollWidth;
			}
			if(x < 0){
				barPosition = 0;
			}else if(x > x0){
				barPosition = 1;
			}else{
				barPosition = x / x0;
			}
			return barPosition;
		},
		barClick(mode, e) {
			if(this.isPhone && mode == 'mouse')return;
			let barPosition = this.getBarPosition(mode, e);
			this.audio.pause();
			this.setBarPosition((barPosition * 100).toFixed(5));
			this.audio.currentTime = this.endTime * barPosition;
			this.setTime();
			this.isPlay && this.audio.play();
			if(this.lrcJson[this.nowTime] != undefined){
				this.lrcActive = this.nowTime;
				!this.touchScrollFlag && this.scrollBox != null && this.scrollBox.scrollToElement(this.$refs[`lrc${this.nowTime}`][0], 400, true, true);
			}else{
				let lrcArr = Object.keys(this.lrcJson);
				for(let i=0, max=lrcArr.length; i<max; i++){
					if(this.nowTime < +lrcArr[i]){
						this.lrcActive = +lrcArr[i - 1];
						!this.touchScrollFlag && this.scrollBox != null && this.scrollBox.scrollToElement(this.$refs[`lrc${lrcArr[i == 0 ? i : i - 1]}`][0], 400, true, true);
						break;
					}
				}
			}
		},
		barTouchMove(mode, e) {
			clearInterval(this.time);
			clearInterval(this.setBar);
			let barPosition = this.getBarPosition(mode, e);
			this.setBarPosition((barPosition * 100).toFixed(5));
			this.setTime(this.endTime * barPosition);
			return false;
		},
		barMouseMove(mode, e) {
			this.barTouchMove(mode, e);
			return false;
		},
		barMouseDown(mode, e) {
			if(this.isPhone)return;
			if(document.onmousemove == null){
				document.onmousemove = this.barMouseMove.bind(this, mode);
			}
			document.onmouseup = (e)=>{
				document.onmousemove = null;
				this.barClick(mode, e);
				document.onmouseup = null;
			};
		},
		error() {
			if(!this.listenErr)return;
			this.barBtnshow = true;
			if(this.errIndex < 2){
				this.errIndex += 1;
				this.$refs.audio.load();
			}else if(this.errIndex == 2){
				this.errIndex += 1;
				this.getDetails(this.id);
			}else{
				this.tipsText = '音乐加载失败，请刷新页面重试';
				this.tipsShow = true;
			}
		},
		waiting() {
			this.barBtnshow = true;
		},
		download() {
			if(this.canDownload){
				axios({
					url: `http://api.music.bagazhu.com/${this.platform}/url`,
					params: {
						id: this.id,
					},
				})
				.then(res=>{
					if(res.data.flag){
						if(res.data.data.url != ''){
							this.downloadHref(res.data.data.url);
						}else{
							this.tipsText = '抱歉，音乐不支持试听与下载';
							this.tipsShow = true;
						}
					}else{
						this.downloadHref(this.url);
					}
				})
				.catch(err=>{
					this.downloadHref(this.url);
				});
			}else{
				this.tipsTime = 3000;
				this.tipsText = '抱歉，当前浏览器不支持下载，请更换浏览器';
				this.tipsShow = true;
			}
			return false;
		},
		downloadHref(url, name='') {
			if(typeof url == 'object' && url instanceof Blob){
				url = URL.createObjectURL(url); // 创建blob地址
			}
			let aLink = document.createElement('a');
			aLink.href = url;
			aLink.target = "_blank";
			aLink.download = name;
			let event;
			if(window.MouseEvent){
				event = new MouseEvent('click');
			}else{
				event = document.createEvent('MouseEvents');
				event.initMouseEvent('click', true, false, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
			}
			aLink.dispatchEvent(event);
		},
		clickVolume() {
			this.volume = +!this.volume;
			this.audio.volume = this.volume;
		},
		parseLyric(lrc) {
			if(lrc === ''){
				return '';
			}
			let lyrics = lrc.split("\n");
			let lrcJson = {};
			lrcJson.lrc = {};
			// lrcJson.info = [];
			for(let i = 0; i < lyrics.length; i++){
				let lyric = decodeURIComponent(lyrics[i]);
				let timeReg = /\[\d*:\d*((\.|\:)\d*)*\]/g;
				let timeRegExpArr = lyric.match(timeReg);
				if(!timeRegExpArr){
					// let json = lyric.replace(/^[\d\D]*(:){1}/i, '').replace(/\]$/, '');
					// lrcJson.info.push(json);
					continue;
				}
				let clause = lyric.replace(timeReg, '');
				for(let k = 0, h = timeRegExpArr.length; k < h; k++) {
					let t = timeRegExpArr[k];
					let min = Number(String(t.match(/\[\d*/i)).slice(1)),
					sec = Number(String(t.match(/\:\d*/i)).slice(1));
					let time = min * 60 + sec;
					lrcJson.lrc[time] = clause;
				}
			}
			return lrcJson;
		},
		timeupdate() {
			let time = this.audio.currentTime|0;
			if(this.lrcJson[time] != undefined){
				this.lrcActive = time;
				!this.touchScrollFlag && this.scrollBox != null && this.scrollBox.scrollToElement(this.$refs[`lrc${time}`][0], 400, true, true);
			}else{
				let lrcArr = Object.keys(this.lrcJson);
				for(let i=0, max=lrcArr.length; i<max; i++){
					if(time < +lrcArr[i]){
						this.lrcActive = +lrcArr[i - 1];
						!this.touchScrollFlag && this.scrollBox != null && this.scrollBox.scrollToElement(this.$refs[`lrc${lrcArr[i == 0 ? i : i - 1]}`][0], 400, true, true);
						break;
					}
				}
			}
		},
		tipsCallback(cb) {
			this.tipsShow = false;
			this.tipsTime = 1000 * 60 *60 *24;
		},
		tipsAfterLeave() {
			this.tipsText = '';
		},
		goback() {
			if(this.gobackDisabled)return;
			this.gobackDisabled = true;
			this.$router.go(-1);
		},
	},
	mounted() {
		this.audio = this.$refs.audio;
		this.getDetails(this.id);
		// setTimeout(()=>{
		// 	this.$refs.audio.currentTime = 70;
		// }, 3000);
	},
	beforeDestroy() {
		this.pause();
	},
}
</script>

<style lang="scss" scoped>
.detailsBox{
	position: absolute;
	top: 0;
	bottom: 0;
	left: 0;
	right: 0;
	display: flex;
	justify-content: space-between;
	flex-direction: column;
	.gobackBox{
		a{
			padding: 0 1rem;
			color: #333;
			font-size: 1.2rem;
			line-height: 2.4rem;
			display: inline-block;
			i{
				font-size: 2rem;
				padding-right: .5rem;
				vertical-align: middle;
				margin-top: -.4rem;
			}
		}
	}
	.lrcBox{
		position: relative;
		flex: auto;
		// background: #2c3e50;
		background: #333;
		background-image: linear-gradient( 135deg, #414345 0%, #232526 100%);
		height: 0;
		overflow: hidden;
		.lrcBg{
			position: absolute;
			top: 0;
			bottom: 0;
			left: 0;
			right: 0;
			background-repeat: no-repeat;
			background-size: cover;
			opacity: .6;
			filter: blur(0px);
			transition: all 3s;
			&.blur{
				filter: blur(20px);
				transition: all 3s;
			}
		}
		.lrcSvgBg{
			position: absolute;
			top: 0;
			bottom: 0;
			left: 0;
			right: 0;
			opacity: .6;
		}
		.lrcContentBox{
			position: absolute;
			top: 0;
			bottom: 0;
			left: 0;
			right: 0;
			z-index: 2;
			.scrollBox{
				display: flex;
				flex-direction: column;
				align-items: center;
				font-size: 1.25rem;
				line-height: 2rem;
				&.pcLrc{
					font-size: 1.6rem;
					line-height: 3rem;
				}
				.lrcLine{
					color: #fff;
					min-height: 2rem;
					text-align: center;
					padding: 0 1rem;
					&:first-child{
						padding-top: 3rem;
					}
					&:last-child{
						padding-bottom: 3rem;
					}
					&.active{
						color: #1B9AF7;
					}
				}
			}
		}
	}
	.consoleBox{
		display: flex;
		justify-content: space-around;
		align-items: stretch;
		flex-direction: column;
		background-color: #CFD9DF;
		background-image: linear-gradient( 135deg, #FDFBFB 0%, #EBEDEE 100%);
		padding-top: 1rem;
		padding-bottom: 1rem;
		.infoBox{
			padding: 0 1.5rem;
			display: flex;
			align-items: center;
			img{
				width: 5rem;
				height: 5rem;
				margin-right: 1rem;
				box-sizing: border-box;
				border: 1px solid #dfe2e5;
			}
			.info{
				display: flex;
				justify-content: space-around;
				align-items: stretch;
				flex-direction: column;
				.name{
					font-size: 2rem;
					line-height: 2.4rem;
					max-height: 4.8rem;
					margin: .2rem 0;
					overflow: hidden;
				}
				.artists{
					font-size: 1.2rem;
					line-height: 1.6rem;
					height: 1.6rem;
					overflow: hidden;
				}
			}
		}
		.barBox{
			.barInfo{
				display: flex;
				justify-content: space-between;
				padding: 1rem 1.5rem 0;
			}
			.barTouchBox{
				padding-top: 1rem;
				padding-bottom: 1rem;
				cursor: pointer;
				.bar{
					height: .3rem;
					// background: #2c3e50;
					background: #333;
					background-image: linear-gradient( 90deg, #505050 0%, #333 100%);
					.nowBar{
						height: 100%;
						width: 0;
						background: #1B9AF7;
						background-image: linear-gradient( 90deg, #A1C4FD 0%, #1B9AF7 100%);
						position: relative;
						a.barBtn{
							display: flex;
							justify-content: center;
							align-items: center;
							font-size: 1.2rem;
							line-height: 1.2rem;
							color: #1B9AF7;
							position: absolute;
							top: 0;
							right: 0;
							margin-top: -.45rem;
							margin-right: -.6rem;
							z-index: 2;
							transform: scale3d(0, 0, 1);
							transition: all .3s ease-in-out;
							i{
								display: none;
							}
							&.show{
								transition: all .3s ease-in-out;
								transform: scale3d(1, 1, 1);
								@keyframes round{
									from{
										transform: scale3d(.7, .7, 1) rotate(0);
									}
									to{
										transform: scale3d(.7, .7, 1) rotate(360deg);
									}
								}
								i{
									display: block;
									font-size: 1rem;
									position: absolute;
									color: #fff;
									animation: round 2s;
									animation-timing-function: linear;
									animation-iteration-count: infinite;
									top: 0;
									right: 0;
								}
							}
						}
					}
				}
				&:hover{
					.bar .nowBar a.barBtn{
						transition: all .3s ease-in-out;
						transform: scale3d(1, 1, 1);
					}
				}
			}
		}
		.btnBox{
			display: flex;
			justify-content: space-between;
			align-items: center;
			padding: .5rem 1rem 0;
			a.play{
				cursor: pointer;
				font-size: 2.4rem;
				width: 5rem;
				height: 5rem;
				line-height: 5rem;
				text-align: center;
				border-radius: 3rem;
				// background: #2c3e50;
				background: #333;
				margin-left: 1rem;
				i{
					color: #fff;
				}
			}
			.right{
				display: flex;
				justify-content: center;
				// color: #2c3e50;
				a{
					padding: .5rem;
					margin: 0 .5rem;
					cursor: pointer;
					color: #333;
					font-size: 1.8rem;
					display: flex;
					align-items: center;
					&.download{
						span{
							font-size: 1.2rem;
							padding-left: .5rem;
						}
					}
					&.volume{
						margin-left: 1.5rem;
						width: 1.8rem;
						height: 1.8rem;
					}
				}
			}
		}
	}
}
</style>
