<template>
	<view class="item" ref="item" v-cloak>
		<view class="item__wrapper" :class="{ 'is-fixed': fixedHeight }">
			<view class="item__info">
				<image mode="widthFix" :src="data.avatar" class="item__avatar" />
				<view class="item__name">{{ index }}. {{ data.name }}</view>
				<view class="item__date">{{ data.dob }}</view>
			</view>
			<view v-if="fixedHeight">
				<view class="item__text">E-mail: {{ data.email }}</view>
				<view class="item__text">Phone: {{ data.phone }}</view>
				<view class="item__text">City: {{ data.address.city }}</view>
				<view class="item__text">Street: {{ data.address.street }}</view>
			</view>
			<view v-else>
				<view class="item__paragraph">{{ data.paragraph }}</view>
				<image mode="widthFix" :src="defferImgSrc" :style="{ width: data.img.width }" class="item__img" @load="imgload"/>
				<image mode="widthFix" :src="data.img.src" :style="{ width: data.img.width }" class="item__img" @load="imgload" />
			</view>
		</view>
	</view>
</template>

<script>
	/* eslint-disable no-console */
	// import ResizeObserverMixins from "../vir-list/ResizeObserver-Mixins.js"
	import faker from 'faker';
	export default {
		// mixins: [ResizeObserverMixins],
		name: 'item',
		props: {
			index: {
				type: Number,
				default: 0,
			},
			data: {
				type: Object,
				default: () => ({}),
			},
			fixedHeight: {
				type: Boolean,
				default: true,
			},
		},
		data() {
			return {
				defferImgSrc: '',
				height: 198
			};
		},
		created() {
			// 模拟图片加载时间
			if (this.data.img.isDeffer) {
				this.defferImgSrc = this.data.img.src;
			} else {
				setTimeout(() => {
					this.defferImgSrc = this.data.img.src;
					this.data.img.isDeffer = true;
				}, faker.random.number({
					min: 0,
					max: 0
				}));
			}
		},
		methods: {
			imgload(){
				// this.geiHeight('imgload')
			},
			async geiHeight(str = 'mounted') {
				await this.$nextTick();
				setTimeout(() => {
					let query = uni.createSelectorQuery();
					// #ifndef MP-ALIPAY || MP-DINGTALK
					query = query.in(this) // 支付宝小程序不支持in(this),而字节跳动小程序必须写in(this), 否则都取不到值
					// #endif
					query.select('.item').fields({
						size: true
					}, size => {
						this.height = size.height
						// console.log('index',this.index,str,this.height);
						this.$emit('size-change', this.index);
					}).exec()
				}, 20)
			}
		},
		mounted() {
			if (this.fixedHeight) return;
			// this.geiHeight('mounted')
		}
	};
</script>

<style scoped lang="scss">
	.item {
		// padding: 11px 20px;
		width: 100%;

		&.is-fixed {

			&__name,
			&__date,
			&__text,
			&__paragraph {
				white-space: nowrap;
				text-overflow: ellipsis;
				overflow: hidden;
			}
		}

		&__wrapper {
			padding: 20px;
			padding-top: 0;
			background-color: #fff;
			border: 1px solid #eaeaea;
			border-radius: 5px;
		}

		&__info {
			padding: 20px 0 20px 60px;
			position: relative;
		}

		&__avatar {
			position: absolute;
			top: 0;
			bottom: 0;
			left: 0;
			margin: auto 0;
			width: 50px;
			height: 50px;
			background-color: #eaeaea;
			border-radius: 100%;
			overflow: hidden;
		}

		&__name,
		&__date,
		&__text,
		&__paragraph {
			margin-bottom: 4px;
			max-width: 100%;
			font-weight: bold;
			font-size: 12px;
		}

		&__text,
		&__paragraph {
			font-weight: normal;
		}

		&__img {
			margin-top: 10px;
			max-width: 100% !important;
			border-radius: 5px;
		}
	}
</style>
