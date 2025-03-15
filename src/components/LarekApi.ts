import { IOrder, IProduct, IOrderResult, ILarekApi } from './../types/index';
import { Api, ApiListResponse } from './base/api';

export class LarekApi extends Api implements ILarekApi {
	readonly cdn: string;
	constructor(cdn: string, baseUrl: string, options?: RequestInit) {
		super(baseUrl, options);
		this.cdn = cdn;
	}

	getCatalog(): Promise<IProduct[]> {
		return this.get('/product/').then((data: ApiListResponse<IProduct>) =>
			data.items.map((item) => ({
				...item,
				image: this.cdn + item.image,
			}))
		);
	}

	getCatalogItem(id: string): Promise<IProduct> {
		return this.get(`/product/${id}`).then((item: IProduct) => ({
			...item,
			image: this.cdn + item.image,
		}));
	}

	orderItems(order: IOrder): Promise<IOrderResult> {
		return this.post('/order', order).then((data: IOrderResult) => data);
	}
}
