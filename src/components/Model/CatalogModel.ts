// import { IProduct } from './../../types/index';
import { IProduct } from '../../types';
import { IEvents } from '../base/events';
import { Model } from '../base/Model';

export interface ICatalog {
	setCatalog(items: IProduct[]): void;
	getCatalogItems(): IProduct[];
	getCatalogItem(id: string): IProduct;
	setPreview(item: IProduct): void;
}

export class Catalog extends Model<ICatalog> implements ICatalog {
	protected catalog: IProduct[]; // Список всех товаров
	protected total: number; // количество всех товаров в каталоге
	protected preview: string | null; // ID открытого товара или null

	setCatalog(items: IProduct[]) {
		this.catalog = items;
		this.total = this.catalog.length;
		this.emitChanges('catalog: changed', { items: this.catalog });
	}

	getCatalogItems() {
		return this.catalog;
	}

	getCatalogItem(id: string): IProduct {
		return this.catalog.find((item) => item.id === id);
	}

	setPreview(item: IProduct) {
		this.preview = item.id;
		this.emitChanges('preview: changed', { item });
	}
}
