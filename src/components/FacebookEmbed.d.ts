export default class FacebookEmbed {
    constructor(params: { data: any; api: any });
    render(): HTMLElement;
    save(): { url: string };
    validate(savedData: any): boolean;
    static get toolbox(): { title: string; icon: string };
    static get isReadOnlySupported(): boolean;
}

declare global {
    interface Window {
        FB?: {
            XFBML: {
                parse(element: HTMLElement): void;
            };
        };
    }
}

