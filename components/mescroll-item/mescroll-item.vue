<template>
	<view>
		<mescroll-uni ref="mescrollRef" @init="mescrollInit" :down="downOption" @down="downCallback"
		 :up="upOption" @up="upCallback" @emptyclick="emptyClick" @scroll="handleScroll" :scrollRunwayEnd="scrollRunwayEnd">
			<!-- 数据列表 -->
			<view class="height-dynamic__scroll-runway" ref="scrollRunway" :style="`transform: translate(0, ${scrollRunwayEnd}px)`"></view>
			<item class="height-dynamic__item" v-for="item in visibleData" :key="item.index" v-if="item && Object.keys(item).length != 0" :data="item" :index="item.index" ref="items"
			 :style="`transform: translate(0, ${cachedScrollY[item.index] || item.index * ESTIMATED_HEIGHT}px)`" @size-change="handleSizeChange"></item>
		</mescroll-uni>
	</view>
</template>

<script>
	import {
		fetchData
	} from '../../helper.js';
	import ResizeObserver from 'resize-observer-polyfill';
	import MescrollMixin from "@/components/mescroll-uni/mescroll-mixins.js";
	import MescrollMoreItemMixin from "@/components/mescroll-uni/mixins/mescroll-more-item.js";
	import VirMixin from '@/components/vir-list/vir-mixins.js'
	const BUFFER_SIZE = 3;
	const ESTIMATED_HEIGHT = 150;
	import {
		http
	} from '../../api/services/http.js'
	export default {
		mixins: [MescrollMixin, MescrollMoreItemMixin, VirMixin],
		props:{
			i: Number, // 每个tab页的专属下标 (除了支付宝小程序必须在这里定义, 其他平台都可不用写, 因为已在MescrollMoreItemMixin定义)
			index: { // 当前tab的下标 (除了支付宝小程序必须在这里定义, 其他平台都可不用写, 因为已在MescrollMoreItemMixin定义)
				type: Number,
				default () {
					return 0
				}
			},
			tabs: { // 为了请求数据,演示用,可根据自己的项目判断是否要传
				type: Array,
				default () {
					return []
				}
			}
		}
	}
</script>

<style lang="scss" scoped>
	.height-dynamic {
		// margin: 0;
		// padding: 0;
		// overflow-x: hidden;
		// overflow-y: scroll;
		// -webkit-overflow-scrolling: touch;
		width: 100%;
		height: 100%;
		// position: absolute;
		contain: layout;
		// will-change: transform;
		// background-color: #eee;

		&__item {
			position: absolute;
			contain: layout;
			will-change: transform;
		}

		&__scroll-runway {
			position: absolute;
			width: 1px;
			height: 1px;
			transition: transform 0.2s;
		}
	}
</style>
