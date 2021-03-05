<!-- tab组件: <me-tabs v-model="tabIndex" :tabs="tabs" @change="tabChange"></me-tabs> -->
<template>
	<view class="me-tabs" :class="{'tabs-fixed': fixed}" :style="{height: tabHeightVal}">
		<scroll-view v-if="tabs.length" :id="viewId" :scroll-left="scrollLeft" scroll-x scroll-with-animation
		 :scroll-animation-duration="300">
			<view class="tabs-item tabs-flex">
				<!-- tab -->
				<view class="tab-item" :style="{padding:`0 ${gap}px`,height: tabHeightVal, 'line-height':tabHeightVal}" v-for="(tab, i) in tabs"
				 :class="[{'active': value===i},'tab-item-'+i]" :key="i" @click="tabClick(i)">
					{{getTabName(tab)}}
				</view>
				<!-- 下划线 -->
				<view v-if="showLine" class="tabs-line" :style="{left:lineLeft + 'px'}"></view>
			</view>
		</scroll-view>
	</view>
</template>

<script>
	export default {
		props: {
			tabs: { // 支持格式: ['全部', '待付款'] 或 [{name:'全部'}, {name:'待付款'}]
				type: Array,
				default () {
					return []
				}
			},
			nameKey: { // 取name的字段
				type: String,
				default: 'name'
			},
			value: { // 当前显示的下标 (使用v-model语法糖: 1.props需为value; 2.需回调input事件)
				type: [String, Number],
				default: 0
			},
			fixed: Boolean, // 是否悬浮,默认false
			gap: { // 每个tab的间隔
				type: Number,
				default: 8
			},
			height: { // 高度,单位rpx
				type: Number,
				default: 64
			},
			showLine: {
				type: Boolean,
				default: false
			}
		},
		data() {
			return {
				viewId: 'id_' + Math.random().toString(36).substr(2, 16),
				scrollLeft: 0,
				lineLeft: 26
			}
		},
		computed: {
			tabHeightPx() {
				return uni.upx2px(this.height)
			},
			tabHeightVal() {
				return this.tabHeightPx + 'px'
			}
		},
		watch: {
			tabs(n, o) {
				this.tabLeftList = null;
				this.scrollCenter(); // 水平滚动到中间
			},
			value(n) {
				this.scrollCenter(); // 水平滚动到中间
			}
		},
		methods: {
			getTabName(tab) {
				return typeof tab === "object" ? tab[this.nameKey] : tab
			},
			tabClick(i) {
				if (this.value != i) {
					this.$emit("input", i);
					this.$emit("change", i);
				}
			},
			async scrollCenter() {
				if (!this.warpWidth) { // tabs容器的宽度
					let rect = await this.initWarpRect()
					this.warpWidth = rect ? rect.width : uni.getSystemInfoSync().windowWidth; // 某些情况下取不到宽度,暂时取屏幕宽度
				}
				if (!this.tabWidthPxList) {
					const tabsRects = await this.initTabsRect();
					if (tabsRects && tabsRects.length > 0) {
						this.tabWidthPxList = []
						for (let i = 0; i < tabsRects.length; i++) {
							this.tabWidthPxList[this.tabs[i][this.nameKey]] = tabsRects[i].width;
						}
					}
				}

				if (!this.tabLeftList) {
					this.tabLeftList = []
					let total = 0
					let cell = 0
					for (let i = 0; i < this.tabs.length; i++) {
						cell = this.tabWidthPxList[this.tabs[i][this.nameKey]];
						this.tabLeftList[i] = total + cell / 2;
						total += cell;
					}
				}

				this.lineLeft = this.tabLeftList[this.value]
				let diff = this.tabLeftList[this.value] - this.warpWidth / 2 // 如果超过tabs容器的一半,则滚动差值
				this.scrollLeft = diff;
				// #ifdef MP-TOUTIAO
				this.scrollTimer && clearTimeout(this.scrollTimer)
				this.scrollTimer = setTimeout(() => { // 字节跳动小程序,需延时再次设置scrollLeft,否则tab切换跨度较大时不生效
					this.scrollLeft = Math.ceil(diff)
				}, 400)
				// #endif
			},
			initWarpRect() {
				return new Promise(resolve => {
					setTimeout(() => { // 延时确保dom已渲染, 不使用$nextclick
						let query = uni.createSelectorQuery();
						// #ifndef MP-ALIPAY
						query = query.in(this) // 支付宝小程序不支持in(this),而字节跳动小程序必须写in(this), 否则都取不到值
						// #endif
						query.select('#' + this.viewId).boundingClientRect(data => {
							resolve(data)
						}).exec();
					}, 20)
				})
			},
			initTabsRect() {
				return new Promise(resolve => {
					setTimeout(() => { // 延时确保dom已渲染, 不使用$nextclick
						let query = uni.createSelectorQuery();
						// #ifndef MP-ALIPAY
						query = query.in(this) // 支付宝小程序不支持in(this),而字节跳动小程序必须写in(this), 否则都取不到值
						// #endif
						for (let i = 0; i < this.tabs.length; i++) {
							query.select(`.tab-item-${i}`).boundingClientRect();
						}
						query.exec(data => {
							resolve(data)
						})
					}, 20)
				})
			}
		},
		mounted() {
			this.scrollCenter() // 滚动到当前下标
		}
	}
</script>

<style lang="scss">
	.me-tabs {
		position: relative;
		font-size: 32rpx;
		background-color: #fff;
		// border-bottom: 1rpx solid #eee;
		box-sizing: border-box;
		overflow-y: hidden;
		background-color: #fff;

		&.tabs-fixed {
			z-index: 990;
			position: fixed;
			top: var(--window-top);
			left: 0;
			width: 100%;
		}

		.tabs-item {
			position: relative;
			white-space: nowrap;
			padding-bottom: 30rpx; // 撑开高度,再配合me-tabs的overflow-y: hidden,以达到隐藏滚动条的目的
			box-sizing: border-box;

			.tab-item {
				position: relative;
				text-align: center;
				box-sizing: border-box;
				color: #666666;

				&.active {
					font-weight: bold;
					color: #e54c45;
					font-size: 36rpx;
				}
			}
		}

		// 平分的方式显示item
		.tabs-flex {
			display: flex;

			.tab-item {
				// flex: 1;
			}
		}

		// 居左显示item,支持水平滑动
		.tabs-scroll {
			.tab-item {
				display: inline-block;
			}
		}

		// 选中tab的线
		.tabs-line {
			z-index: 1;
			position: absolute;
			bottom: 30rpx; // 至少与.tabs-item的padding-bottom一致,才能保证在底部边缘
			width: 30rpx;
			height: 6rpx;
			transform: translateX(-50%);
			border-radius: 4rpx;
			background: #e54c45;
			transition: left .3s;
		}
	}
</style>
