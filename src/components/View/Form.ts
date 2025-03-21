import { IContactForm, IOrderForm, paymentMethod } from '../../types';
import { ensureAllElements, ensureElement } from '../../utils/utils';
import { Component } from '../base/Component';
import { EventEmitter, IEvents } from '../base/events';

interface IFormState {
	valid: boolean;
	errors: string[];
}

export class Form<T> extends Component<IFormState> {
	protected _submit: HTMLButtonElement;
	protected _errors: HTMLElement;

	constructor(protected container: HTMLFormElement, protected events: IEvents) {
		super(container);

		this._submit = ensureElement<HTMLButtonElement>(
			'button[type=submit]',
			this.container
		);
		this._errors = ensureElement<HTMLElement>('.form__errors', this.container);

		this.container.addEventListener('input', (e: Event) => {
			const target = e.target as HTMLInputElement;
			const field = target.name as keyof T;
			const value = target.value;
			this.onInputChange(field, value);
		});

		this.container.addEventListener('submit', (e: Event) => {
			e.preventDefault();
			this.events.emit(`${this.container.name}:submit`);
		});
	}

	protected onInputChange(field: keyof T, value: string) {
		this.events.emit(`${this.container.name}.${String(field)}:change`, {
			field,
			value,
		});
	}

	set valid(value: boolean) {
		this._submit.disabled = !value;
	}

	set errors(value: string) {
		this.setText(this._errors, value);
	}

	resetForm() {
		this.container.reset();
	}

	render(state: Partial<T> & IFormState) {
		const { valid, errors, ...inputs } = state;
		super.render({ valid, errors });
		Object.assign(this, inputs);
		return this.container;
	}
}

export class OrderForm extends Form<IOrderForm> {
	protected paymentTypeButtons: HTMLButtonElement[];

	constructor(container: HTMLFormElement, protected events: EventEmitter) {
		super(container, events);
		this.paymentTypeButtons = ensureAllElements<HTMLButtonElement>(
			'.button_alt',
			container
		);

		this.paymentTypeButtons.map((button) => {
			button.addEventListener('click', () => {
				this.setButtonOutline(button);
				this.onInputChange('payment', button.name);
			});
		});
	}

	setButtonOutline(button: HTMLButtonElement) {
		this.paymentTypeButtons.forEach((button) => {
			button.classList.remove('button_alt-active');
		});
		button.classList.toggle('button_alt-active');
	}

	override resetForm(): void {
		super.resetForm();
		this.paymentTypeButtons.forEach((button) => {
			button.classList.remove('button_alt-active');
		});
	}
}

export class ContactForm extends Form<IContactForm> {
	constructor(container: HTMLFormElement, events: EventEmitter) {
		super(container, events);
	}
}
