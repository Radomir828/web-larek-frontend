import {
	IProduct,
	IBasketItem,
	IOrderForm,
	paymentMethod,
	IOrder,
	IContactForm,
} from './types/index';
import { EventEmitter } from './components/base/events';
import { Catalog } from './components/Model/CatalogModel';
import './scss/styles.scss';
import { Order } from './components/Model/OrderModel';
import { LarekApi } from './components/LarekApi';
import { API_URL, CDN_URL } from './utils/constants';
import { Page } from './components/View/Page';
import { cloneTemplate, ensureElement } from './utils/utils';
import { Card, CardPreview } from './components/View/Card';
import { Modal } from './components/View/Modal';
import { Basket, BasketItem } from './components/View/Basket';
import { ContactForm, OrderForm } from './components/View/Form';
import { Success } from './components/View/Success';

const api = new LarekApi(CDN_URL, API_URL);
const events = new EventEmitter();

// Чтобы мониторить все события, для отладки
events.onAll(({ eventName, data }) => {
	console.log(eventName, data);
});

// объекты моделей данных
const catalog = new Catalog({}, events);
const orderModel = new Order({}, events);

// Все шаблоны
const cardCatalogTemplate = ensureElement<HTMLTemplateElement>('#card-catalog');
const cardPreviewTemplate = ensureElement<HTMLTemplateElement>('#card-preview');
const basketTemplate = ensureElement<HTMLTemplateElement>('#basket');
const basketItemTemplate = ensureElement<HTMLTemplateElement>('#card-basket');
const orderFormtemplate = ensureElement<HTMLTemplateElement>('#order');
const contactFormtemplate = ensureElement<HTMLTemplateElement>('#contacts');
const successTemplate = ensureElement<HTMLTemplateElement>('#success');

const page = new Page(document.body, events);
const modal = new Modal(ensureElement<HTMLElement>('#modal-container'), events);
const basket = new Basket(cloneTemplate(basketTemplate), events);
const orderForm = new OrderForm(cloneTemplate(orderFormtemplate), events);
const contactForm = new ContactForm(cloneTemplate(contactFormtemplate), events);

// Оформили заказ -> выводим в мод.окно разметку для формы заказа
events.on('basket:order', () => {
	modal.render({
		content: orderForm.render({
			errors: [],
			valid: false,
			address: '',
		}),
	});
});

// Изменилось одно из полей формы заказа
events.on(
	/^order\..*:change/,
	(data: { field: keyof IOrderForm; value: string }) => {
		orderModel.setOrderField(data.field, data.value);
	}
);

// Изменилось одно из полей формы контактов
events.on(
	/^contacts\..*:change/,
	(data: { field: keyof IContactForm; value: string }) => {
		orderModel.setContactField(data.field, data.value);
		// orderModel.setContactField(data.field, data.value);
	}
);

// Изменилось состояние валидации формы заказа
events.on('orderFormErrors:change', (errors: Partial<IOrderForm>) => {
	const { payment, address } = errors;
	orderForm.valid = !payment && !address;
	orderForm.errors = Object.values({ address, payment })
		.filter((i) => !!i)
		.join('; ');
});

// Изменилось состояние валидации формы контактов
events.on('contactFormErrors:change', (errors: Partial<IContactForm>) => {
	const { phone, email } = errors;
	contactForm.valid = !phone && !email;
	contactForm.errors = Object.values({ email, phone })
		.filter((i) => !!i)
		.join('; ');
});

// Отправлена форма заказа -> выводим в мод.окно разметку для формы контактов
events.on('order:submit', () => {
	orderForm.resetForm();
	modal.render({
		content: contactForm.render({
			errors: [],
			valid: false,
			email: '',
			phone: '',
		}),
	});
});

// Отправлена форма контактов
events.on('contacts:submit', () => {
	contactForm.resetForm();

	api
		.orderItems({
			items: orderModel.setOrderItems(),
			total: orderModel.getBasketAmount(),
			...(orderModel.order as IOrder),
		})
		.then((data) => {
			console.log(data);
			const success = new Success(cloneTemplate(successTemplate), events);
			success.total = data.total;
			modal.render({ content: success.render({}) });
		})
		.catch((error) => {
			console.error(error);
		});
});

events.on('order-success:close', () => {
	modal.close();
	orderModel.clearBasket();
	page.counter = 0;
});

// поменялся каталог товаров на главной странице
events.on('catalog:changed', () => {
	const catalogItems = catalog
		.getCatalogItems()
		.map((item) =>
			new Card(cloneTemplate(cardCatalogTemplate), events).render(item)
		);

	page.render({
		catalog: catalogItems,
		locked: false,
	});
});

// открываем товар
events.on('card:selected', (data: { id: string }) => {
	const item: IProduct = catalog.getCatalogItem(data.id);
	catalog.setPreview(item);
});

// Изменен открытый выбранный товар
events.on('preview:changed', (item: IProduct) => {
	const modalCard = new CardPreview(cloneTemplate(cardPreviewTemplate), events);
	if (orderModel.isInBasket(item)) {
		modalCard.setButtonInactive();
	}
	modal.render({ content: modalCard.render(item) });
});

// добавляем товар в корзину
events.on('basket:addedToBasket', (data: { id: string }) => {
	const item: IProduct = catalog.getCatalogItem(data.id);
	orderModel.addToBasket(item);
	modal.close();
});

// удаляем товар из корзины
events.on('basket:removedFromBasket', (data: { id: string }) => {
	const basketItem: IBasketItem = orderModel.getBasketItem(data.id);
	orderModel.removeFromBasket(basketItem);
});

// состояние корзины поменялось
events.on('basket:changed', () => {
	page.render({ counter: orderModel.getBasket().length });
	updateBasketView();
});

// открывается корзина
events.on('basket:open', () => {
	updateBasketView();
});

// ф-ия рендеринга корзины
function updateBasketView() {
	const basketItems = orderModel.getBasket().map((basketItem, index) =>
		new BasketItem(cloneTemplate(basketItemTemplate), events).render({
			...basketItem,
			index: index + 1,
		})
	);

	modal.render({
		content: basket.render({
			basketList: basketItems,
			totalPrice: orderModel.getBasketAmount(),
		}),
	});
}

// Блокируем прокрутку страницы если открыта модалка
events.on('modal:open', () => {
	page.locked = true;
});

// ... и разблокируем
events.on('modal:close', () => {
	page.locked = false;
});

api
	.getCatalog()
	.then((items: IProduct[]) => catalog.setCatalog(items))
	.catch((err) => {
		console.error(err);
	});
