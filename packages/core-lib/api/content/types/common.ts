export type CMSValue = { elementType?: string | { [key: string]: string }};

export interface MixedValue<T> extends CMSValue {
    value: T;
}

export interface StringValue extends CMSValue {
    value: string;
}

export interface BooleanValue extends CMSValue {
    value: boolean;
}

export interface NumberValue extends CMSValue {
    value: number;
}

export interface SelectionValue<T = string> {
  value?: {
    label: T;
    selection: T;
  };
}

export interface DialogElement {
    value?: {
        elements?: {
            closeDialogButtonText?: StringValue;
            dialogKey?: StringValue;
            header?: StringValue;
            dataSourceUrl?: StringValue;
            callToAction?: CallToAction;
            showInAlternateStyle?: BooleanValue;
            hideCloseInAlternateStyle?: BooleanValue;
            hideModalCloseButton?: BooleanValue;
        }
        type: 'Dialog'
    }
}

export interface CallToAction {
    values: {
        elements: ButtonElements;
    }[];
    value?: {
        elements: ButtonElements;
    }
}

export interface ButtonElements {}