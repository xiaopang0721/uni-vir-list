import {
	fetchData
} from '../../helper.js';
export function http() {
	return new Promise((reslove, reject) => {
		setTimeout(()=> {
			try {
				let list = fetchData()
				reslove(list)
			} catch (e) {
				reject(e)
			}
		}, 1000);
	})
}

// export function http() {
// 	return new Promise((resolute, reject)=>{
// 		//延时一秒,模拟联网
// 		setTimeout(()=> {
// 			try{
// 				//模拟分页数据
// 				let list=fetchData();
// 				resolute(list);
// 			} catch (e) {
// 				//模拟接口请求失败
// 				reject(e);
// 			}
// 		},1000)
// 	})
// }