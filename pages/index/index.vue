<template>
	<view class="home">
		<view class="swiper_tabs">
			<me-tabs v-model="tabIndex" showLine :tabs="tabs" @change="tabChange"></me-tabs>
		</view>
		<swiper class="me-swiper" :current="tabIndex" @change="swiperChange">
			<swiper-item v-for="(tab,i) in tabs" :key="i" v-show="(tabIndex -1 <= i) && (i <= tabIndex +1)">
				<mescroll-item :i="i" :tabs="tabs" :index="tabIndex"></mescroll-item>
			</swiper-item>
		</swiper>
		<view class="me-bottom"></view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				tabIndex: 0,
				tabs: [{
						"name": "NBA",
						"type": "1"
					},
					{
						"name": "英超",
						"type": "2"
					},
					{
						"name": "中超",
						"type": "3"
					},
					{
						"name": "CBA",
						"type": "4"
					},
					{
						"name": "电竞",
						"type": "5"
					},
					{
						"name": "西甲",
						"type": "6"
					},
					{
						"name": "意甲",
						"type": "7"
					},
					{
						"name": "德甲",
						"type": "8"
					},
					{
						"name": "法甲",
						"type": "9"
					},
					{
						"name": "欧冠",
						"type": "10"
					},
					{
						"name": "世界杯",
						"type": "11"
					},
					{
						"name": "欧洲杯",
						"type": "12"
					}
				]
			}
		},
		methods: {
			swiperChange(e) {
				const {
					current
				} = e.detail
				this.tabIndex = current
			},
			tabChange(index) {
				this.tabIndex = index
			}
		},
	}
</script>
<style>
	page{
		height: 100%;
	}
</style>
<style lang="scss" scoped>
	.home{
		overflow: hidden;
		display: flex;
		flex-direction: column;
		height: 100%;
		.swiper_tabs{
			margin-top: 50px;
		}
		.me-swiper {
			flex: 1;
			height: 100%;
			overflow: hidden;
		}
		.me-bottom{
			width: 100%;
			height: 100px;
			background-color: red;
		}
	}
	
</style>
