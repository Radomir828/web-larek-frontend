// import { IProduct } from './../../types/index';
import { IProduct } from '../../types';
import { IEvents } from '../base/events';
import { Model } from '../base/Model';

export interface ICatalog {
	setCatalog(items: IProduct[]): void;
	getCatalogItems(): IProduct[];
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

	setPreview(item: IProduct) {
		this.preview = item.id;
		this.emitChanges('preview: changed', { item });
	}
}
