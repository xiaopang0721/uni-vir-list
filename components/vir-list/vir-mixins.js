const BUFFER_SIZE = 3;
const ESTIMATED_HEIGHT = 198;
import {
	http
} from '../../api/services/http.js'
const VirMixin = {
	data() {
		return {
			downOption: {
				auto: false // 不自动加载 (mixin已处理第一个tab触发downCallback)
			},
			upOption: {
				auto: false, // 不自动加载
				page: {
					num: 0, // 当前页码,默认0,回调之前会加1,即callback(page)会从1开始
					size: 10 // 每页数据的数量
				},
				noMoreSize: 1, //如果列表已无数据,可设置列表的总数量要大于半页才显示无更多数据;避免列表数据过少(比如只有一条数据),显示无更多数据会不好看; 默认5
				empty: {
					tip: '~ 空空如也 ~', // 提示
					btnText: '去看看'
				},
				// toTop:{
				// 	src:''
				// },
				textNoMore: '没有更多了',
				onScroll: true
			},
			ESTIMATED_HEIGHT,
			anchorItem: {
				index: 0,
				offset: 0
			},
			//列表长度
			listData: [],
			//可见列表长度
			visibleData: [],
			//第一个锚点index
			firstAttachedItem: 0,
			// 最后一个锚点index
			lastAttachedItem: 0,
			// 上次滚动的位置
			lastScrollTop: 0,
			//缓存滚动位置
			cachedScrollY: [],
			//缓存的高度
			cachedHeight: [],
			revising: false,
			curstart: 0,
			curend: 0
		}
	},
	computed: {
		scrollRunwayEnd() {
			const maxScrollY = this.cachedHeight.reduce((sum, h) => (sum += h || ESTIMATED_HEIGHT), 0);
			const currentAverageH = maxScrollY / this.cachedHeight.length;
			if (isNaN(currentAverageH)) {
				return this.listData.length * ESTIMATED_HEIGHT;
			} else {
				return maxScrollY + (this.listData.length - this.cachedHeight.length) * currentAverageH;
			}
		},
		VISIBLE_COUNT() {
			// console.log('VISIBLE_COUNT from mixins');
			return Math.ceil(this.mescroll.bodyHeight / ESTIMATED_HEIGHT);
		}
	},
	methods: {
		/*下拉刷新的回调 */
		downCallback() {
			// 这里加载你想下拉刷新的数据, 比如刷新轮播数据
			// loadSwiper();
			// 下拉刷新的回调,默认重置上拉加载列表为第一页 (自动执行 page.num=1, 再触发upCallback方法 )
			this.mescroll.resetUpScroll();
		},
		init() {
			this.anchorItem = {
					index: 0,
					offset: 0
				},
				//列表长度
				this.listData = [],
				//可见列表长度
				this.visibleData = [],
				//第一个锚点index
				this.firstAttachedItem = 0,
				// 最后一个锚点index
				this.lastAttachedItem = 0,
				// 上次滚动的位置
				this.lastScrollTop = 0,
				//缓存滚动位置
				this.cachedScrollY = [],
				//缓存的高度
				this.cachedHeight = [],
				this.revising = false,
				this.curstart = 0,
				this.curend = 0
		},
		/*上拉加载的回调: 其中page.num:当前页 从1开始, page.size:每页数据条数,默认10 */
		upCallback(page) {
			console.log('upCallback', page.num);
			uni.showLoading({
			    title: '数据加载中',
				mask:true
			});
			let t = page.num > 1 ? 1000 : 1000;
			http(t).then(data => {
				if (page.num == 1) this.init();
				// 给每个 item 打上序号标记
				for (let i = 0; i < data.length; i++) {
					const item = data[i];
					item.index = this.listData.length;
					this.listData.push(item);
				}
				uni.hideLoading();
				this.mescroll.endSuccess(data.length, data.length == 10)
				this.updateVisibleData();
			}).catch((e) => {
				//联网失败, 结束加载
				console.log('加载出错', e);
				this.mescroll.endErr();
				uni.hideLoading();
			})

		},
		emptyClick() {

		},
		handleSizeChange(index) {
			if (this.curstart <= index && index < this.curend) {
				this.calItemScrollY();
			}
		},
		handleScroll() {
			// if (this.revising) return;
			// console.log('scrollTop',this.mescroll.scrollTop);
			const delta = this.mescroll.scrollTop - this.lastScrollTop;
			this.lastScrollTop = this.mescroll.scrollTop;
			this.updateAnchorItem(delta);
			this.updateVisibleData();
		},
		updateAnchorItem(delta) {
			const lastIndex = this.anchorItem.index;
			const lastOffset = this.anchorItem.offset;
			delta += lastOffset;

			let index = lastIndex;
			if (delta >= 0) {
				while (index < this.listData.length && delta > (this.cachedHeight[index] || ESTIMATED_HEIGHT)) {
					if (!this.cachedHeight[index]) {
						this.$set(this.cachedHeight, index, ESTIMATED_HEIGHT);
					}
					delta -= this.cachedHeight[index];
					index++;
				}
				if (index >= this.listData.length) {
					this.anchorItem = {
						index: this.listData.length - 1,
						offset: 0
					};
				} else {
					this.anchorItem = {
						index,
						offset: delta
					};
				}
			} else {
				while (delta < 0) {
					if (!this.cachedHeight[index - 1]) {
						this.$set(this.cachedHeight, index - 1, ESTIMATED_HEIGHT);
					}
					delta += this.cachedHeight[index - 1];
					index--;
				}
				if (index < 0) {
					this.anchorItem = {
						index: 0,
						offset: 0
					};
				} else {
					this.anchorItem = {
						index,
						offset: delta
					};
				}
			}
			// 修正拖动过快导致的滚动到顶端滚动条不足的偏差
			if (this.cachedScrollY[this.firstAttachedItem] && this.cachedScrollY[this.firstAttachedItem] <= -1) {
				console.log('revising insufficient');
				this.revising = true;
				const actualScrollY = this.cachedHeight.slice(0, Math.max(0, this.anchorItem.index)).reduce((sum,
					h) => (sum += h),
					0);
				// this.mescroll.scrollTo(actualScrollY + this.anchorItem.offset)
				this.mescroll.scrollTop = actualScrollY + this.anchorItem.offset;
				this.lastScrollTop = this.mescroll.scrollTop;
				if (this.mescroll.scrollTop === 0) {
					this.anchorItem = {
						index: 0,
						offset: 0
					};
				}
				this.calItemScrollY();
				this.revising = false;
			}
		},
		// 计算每一个 item 的 translateY 的高度
		async calItemScrollY() {
			await this.$nextTick();
			// 修正 vue diff 算法导致 item 顺序不正确的问题
			this.$refs.items.sort((a, b) => a.index - b.index);

			const anchorDomIndex = this.$refs.items.findIndex(item => item.index === this.anchorItem.index);
			const anchorDom = this.$refs.items[anchorDomIndex];
			const anchorDomHeight = anchorDom.height;

			this.$set(this.cachedScrollY, this.anchorItem.index, this.mescroll.scrollTop - this.anchorItem
				.offset);
			this.$set(this.cachedHeight, this.anchorItem.index, anchorDomHeight);

			// 计算 anchorItem 后面的 item scrollY
			for (let i = anchorDomIndex + 1; i < this.$refs.items.length; i++) {
				const item = this.$refs.items[i];
				const height = item.height;
				this.$set(this.cachedHeight, item.index, height);
				const scrollY = this.cachedScrollY[item.index - 1] + this.cachedHeight[item.index - 1];
				this.$set(this.cachedScrollY, item.index, scrollY);
			}
			// 计算 anchorItem 前面的 item scrollY
			for (let i = anchorDomIndex - 1; i >= 0; i--) {
				const item = this.$refs.items[i];
				this.$set(this.cachedHeight, item.index, item.height);
				const scrollY = this.cachedScrollY[item.index + 1] - this.cachedHeight[item.index];
				this.$set(this.cachedScrollY, item.index, scrollY);
			}
			// 修正拖动过快导致的滚动到顶端有空余的偏差
			if (this.cachedScrollY && this.cachedScrollY[0] && this.cachedScrollY[0] > 0) {
				console.log('revising redundant');
				this.revising = true;
				const delta = this.cachedScrollY[0];
				const last = Math.min(this.lastAttachedItem, this.listData.length);
				for (let i = 0; i < last; i++) {
					this.$set(this.cachedScrollY, i, this.cachedScrollY[i] - delta);
				}
				const scrollTop = this.cachedScrollY[this.anchorItem.index - 1] ?
					this.cachedScrollY[this.anchorItem.index - 1] + this.anchorItem.offset :
					this.anchorItem.offset;
				// this.$refs.scroller.scrollTop = scrollTop;
				// this.mescroll.scrollTo(scrollTop);
				this.mescroll.scrollTop = scrollTop
				this.lastScrollTop = this.mescroll.scrollTop;
				this.revising = false;
			}
		},
		updateVisibleData() {
			const start = this.curstart = (this.firstAttachedItem = Math.max(0, this.anchorItem.index -
				BUFFER_SIZE));
			this.lastAttachedItem = this.firstAttachedItem + this.VISIBLE_COUNT + BUFFER_SIZE * 2;
			const end = this.curend = Math.min(this.lastAttachedItem, this.listData.length);

			this.visibleData = this.listData.slice(start, end);
		}
	},
	mounted() {
		this.mescroll.scrollTop = 0;
		this.lastAttachedItem = this.VISIBLE_COUNT + BUFFER_SIZE;
		this.updateVisibleData();
	}
}

export default VirMixin;
