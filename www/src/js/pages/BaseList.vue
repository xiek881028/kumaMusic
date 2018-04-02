/*!
* BaseList
* create: 2017-12-06
* since: 0.0.1
*/

<template lang="pug">
	.listBox(is="BaseLayout")
		.topFixed
			form.searchBox(@submit.prevent="toSubmit")
				a.goback(href="javascript:;" @click="goback" v-if="canGoback")
					i.fa.fa-angle-left
					| 返回
				.inputBox(is="BaseInput" :searchKey='inputKey' @input="search")
				button.button.button-primary.button-small(type="submit") 搜索
			ul.tabTitle
				li(v-for="(item, index) in platform" :key="item.name" @click="activeTab(index, item.name)" :class="{active: activeIndex == index}")
					| {{item.chn}}
		.contentBox(is="swiper" :options="swiperOption" ref="swiper")
			.slide(is="swiperSlide" v-for="(item, platformIndex) in platform" :key="item.name")
				.scrollBox(ref="scrollBox")
					.dataList(v-if="isEmpty(item.name) == 2")
						.songList
							//- router-link(:to="{name: 'details', params: {id: song.id, platform: item.name}}")
							a(v-for="(song, index) in catchPlatform(item.name+'Data').list" :key="index" :class="{isDisabled: song.canPlay == false}" href="javascript:;" @click="routerLink(song, item.name)")
								.infoBox
									.songBox
										.name.ellipsis
											p {{song.name}}
										.info.ellipsis
											p {{song.artists}}{{hasAlbum(song.album)}}
									.iconBox(v-if="song.canPlay != false")
										i.play.fa.fa-play-circle-o
						.getMore(v-show="hasMore(item.name)")
							a(href="javascript:;" @click="getMore" v-show="!isLoading") 点击加载更多
							i.fa.fa-spinner(v-show="isLoading")
					.emptyList(v-else-if="isEmpty(item.name) == 1")
						.yan (｡・`ω´･)
						.warning 空空如也
					.loadList(v-else-if="isEmpty(item.name) == 0")
						i.fa.fa-spinner
					.errList(v-else)
						.yan (｡・`ω´･)
						.warning 服务器返回错误
						button.button.button-primary.button-small.tryAgain(@click="tryAgain") 再试一次
		.BottomFixed
		div(is="BaseTips" :show="tipsShow" time="3000" @cb="tipsCallback" @afterLeave="tipsAfterLeave") {{tipsText}}
</template>

<script>
import BaseInput from './components/BaseInput.vue';
import BaseLayout from './components/BaseLayout.vue';
import BaseTips from './components/BaseTips.vue';
import {swiper, swiperSlide} from 'vue-awesome-swiper';
import {browser} from '../public';
export default {
	components: {
		BaseLayout,
		swiper,
		swiperSlide,
		BaseInput,
		BaseTips,
	},
	data() {
		return {
			limit: 20,
			swiperOption: {
				//触发标签页切换滑动角度
				touchAngle: 30,
				//触发标签页切换滑动距离
				threshold: 50,
				initialSlide: this.mathIndex(),
			},
			activeIndex: this.mathIndex(),
			activePlatform: this.$route.query.platform,
			platform: [
				{name: 'wy', chn: '网易'},
				{name: 'qq', chn: 'QQ'},
				{name: 'bd', chn: '百度'},
				{name: 'xm', chn: '虾米'},
				{name: 'kg', chn: '酷狗'},
			],
			wyData: {},
			qqData: {},
			bdData: {},
			xmData: {},
			kgData: {},
			key: this.$route.query.key,
			inputKey: this.$route.query.key,
			isLoading: false,
			tipsText: '',
			tipsShow: false,
			canGoback: browser().qq,
			gobackDisabled: false,
		}
	},
	computed: {//计算属性
	},
	methods: {
		mathIndex() {
			let arr = ['wy', 'qq', 'bd', 'xm', 'kg'];
			for(let i=0, max=arr.length; i<max; i++){
				if(this.$route.query.platform == arr[i]){
					return i;
				}
			}
			return 0;
		},
		catchPlatform(name) {
			return this[name];
		},
		hasAlbum(album) {
			let str = '';
			if(!/^[\s]*$/.test(album)){
				str = ` - ${album}`;
			};
			return str;
		},
		hasMore(name) {
			let data = this.catchPlatform(`${name}Data`);
			let returnFlag = false;
			if(data.count && data.list.length < data.count){
				returnFlag = true;
			}
			return returnFlag;
		},
		getMore() {
			this.isLoading = true;
			this.getList(this.key, this.activePlatform, this.catchPlatform(`${this.activePlatform}Data`).page + 1)
			.then(()=>{
				this.isLoading = false;
			})
			.catch(()=>{
				this.isLoading = false;
			})
			;
		},
		getList(key, platform, page=1) {
			let _platform = platform ? platform : this.activePlatform;
			return new Promise((resolve, reject)=>{
				axios({
					url: `http://api.music.bagazhu.com/${_platform}/list`,
					params: {
						key,
						page,
						limit: this.limit,
					},
				})
				.then(res=>{
					resolve(res);
					if(res.data.flag){
						let jsonData = this[`${_platform}Data`];
						if(jsonData.list == undefined){
							jsonData = res.data.data;
						}else{
							jsonData.list.push(...res.data.data.list);
						}
						if(res.data.data.list.length < this.limit){
							jsonData.count = res.data.data.list.length;
						}else{
							jsonData.count = res.data.data.count;
						}
						jsonData.page = page;
						this[`${_platform}Data`] = jsonData;
						// new BScroll(this.$refs.scrollBox[index], {
						// 	//支持pc鼠标滚动
						// 	mouseWheel: true,
						// 	//阻止事件冒泡
						// 	stopPropagation: true,
						// });
					}else{
						this.$set(this[`${this.activePlatform}Data`], 'err', true);
					}
				})
				.catch(err=>{
					this.$set(this[`${this.activePlatform}Data`], 'err', true);
					reject(err);
				})
				;
			});
		},
		activeTab(index) {
			this.activeIndex = index;
			this.$refs.swiper.swiper.slideTo(index);
			// this.getData(this.activeIndex);
		},
		getData(platform) {
			let dataJson = this[`${this.activePlatform}Data`];
			if(!dataJson.list){
				this.getList(this.key, platform);
			}
		},
		search(val) {
			this.inputKey = val;
		},
		isEmpty(name) {
			let data = this.catchPlatform(`${name}Data`);
			//returnFlag 0：加载中 1：无数据 2：有数据 3：加载错误
			let returnFlag = 2;
			if(data.err){
				returnFlag = 3;
			}else if(data.list == undefined || data.count == undefined){
				returnFlag = 0;
			}else if(data.list != undefined && !data.list.length){
				returnFlag = 1;
			}
			return returnFlag;
		},
		toSubmit() {
			if(/^[\s]*$/.test(this.inputKey)){
				this.tipsText = '搜索词不能为空';
				this.tipsShow = true;
				return;
			}
			this.wyData = {};
			this.qqData = {};
			this.bdData = {};
			this.xmData = {};
			this.kgData = {};
			if(this.key == this.inputKey){
				this.key = this.inputKey;
				this.getData();
			}else{
				this.$router.replace({name: 'list', query: {
						key: this.inputKey,
						platform: this.activePlatform,
					}
				}, ()=>{
					this.key = this.inputKey;
					this.getData();
				});
			}
		},
		tipsCallback(cb) {
			this.tipsShow = false;
		},
		tipsAfterLeave() {
			this.tipsText = '';
		},
		tryAgain() {
			this[`${this.activePlatform}Data`] = {};
			this.getList(this.key);
		},
		routerLink(song, platform) {
			if(song.canPlay != false){
				this.$router.push({name: 'details', params: {id: song.id, platform}});
			}else{
				this.tipsText = '抱歉，音乐不支持试听与下载';
				this.tipsShow = true;
			}
		},
		goback() {
			if(this.gobackDisabled)return;
			this.gobackDisabled = true;
			this.$router.go(-1);
		},
	},
	mounted() {
		this.$refs.swiper.swiper
		.on('slideChange', ()=>{
			this.activeIndex = this.$refs.swiper.swiper.activeIndex;
			this.activePlatform = this.platform[this.activeIndex].name;
			this.$router.replace({name: 'list', query: {
					key: this.key,
					platform: this.activePlatform,
				}
			}, ()=>{
				this.getData(this.activePlatform);
			});
		})
		;
		this.getList(this.key);
	},
}
</script>

<style lang="scss" scoped>
@import '../../css/swiper.min.css';
a{
	color: inherit;
	&:hover,
	&:focus{
		text-decoration: none;
	}
}
@keyframes round{
	from{
		transform: rotate(0);
	}
	to{
		transform: rotate(360deg);
	}
}
.listBox{
	// background-image: linear-gradient( 135deg, #CFD9DF 0%, #E2EBF0 50%) !important;
	.topFixed{
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		height: 6.5rem;
		z-index: 10;
		// background-color: #fbfcfd;
		background-image: linear-gradient( 135deg, #CFD9DF 0%, #E2EBF0 100%);
		.searchBox{
			margin: .5rem;
			display: flex;
			max-width: 50rem;
			.inputBox{
				flex: 1;
			}
			.goback{
				line-height: 2.5rem;
				margin-right: .5rem;
				i{
					padding-right: .5rem;
				}
			}
		}
		.tabTitle{
			display: flex;
			justify-content: space-around;
			font-size: 1.2rem;
			line-height: 3rem;
			height:3rem;
			background: #fff;
			box-shadow: 0 1px 8px rgba(0, 0, 0, .2);
			overflow: hidden;
			li{
				padding: 0 1.5rem;
				cursor: pointer;
				flex: auto;
				text-align: center;
				// border-bottom: 2px solid transparent;
				&.active{
					border-bottom: 2px solid #1B9AF7;
				}
			}
			@media (min-width: 767px) {
				justify-content: flex-start;
				li{
				flex: 0 1 auto,
				}
			}
		}
	}
	.contentBox{
		position: fixed;
		top: 6.5rem;
		left: 0;
		right: 0;
		bottom: 0;
		z-index: 8;
		.slide{
			.scrollBox{
				height: 100%;
				.dataList{
					height: 100%;
					overflow: auto;
					.songList{
						a{
						display: block;
						&.isDisabled{
							opacity: .6;
						}
							.infoBox{
								display: flex;
								justify-content: space-between;
								align-items: stretch;
								padding: .5rem 0;
								margin: 0 1rem;
								border-bottom: 1px solid rgba(0, 0, 0, .1);
								.songBox{
									flex: auto;
									width: 0;
									.name{
										font-size: 1.5rem;
										line-height: 2.5rem;
									}
									.info{
										font-size: 1rem;
										line-height: 1.5rem;
									}
									p{
										display: inline;
									}
								}
								.iconBox{
									display: flex;
									align-items: center;
									padding-left: 1rem;
									i{
										font-size: 2rem;
										// color: #2c3e50;
										color: #333;
									}
								}
							}
						}
					}
					.getMore{
						height: 3.6rem;
						overflow: hidden;
						display: flex;
						justify-content: center;
						align-items: center;
						a{
							font-size: 1.2rem;
							display: block;
							width: 100%;
							height: 100%;
							line-height: 3.6rem;
							text-align: center;
							color: #507daf;

						}
						i{
							font-size: 2rem;
							animation: round 2s;
							animation-timing-function: linear;
							animation-iteration-count: infinite;
							// color: #2c3e50;
							color: #333;
						}
					}
				}
				.loadList{
					height: 100%;
					overflow: auto;
					display: flex;
					flex-direction: column;
					justify-content: center;
					align-items: center;
					i{
						font-size: 3rem;
						animation: round 2s;
						animation-timing-function: linear;
						animation-iteration-count: infinite;
						// color: #2c3e50;
						color: #333;
					}
				}
				.emptyList,
				.errList{
					height: 100%;
					overflow: auto;
					display: flex;
					flex-direction: column;
					justify-content: center;
					align-items: center;
					.yan{
						font-size: 1.2rem;
					}
					.warning{
						font-size: 1.5rem;
						padding-top: .8rem;
					}
					button.tryAgain{
						margin-top: 1rem;
					}
				}
			}
		}
	}
}
</style>
