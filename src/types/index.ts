export interface Pet {
    id: string;
    name: string;
    image: string;
    selected: boolean;
}

export interface ServiceItem {
    id: string;
    name: string;
    icon: React.ReactNode;
    color: string;
    slug: string;
}

export interface Product {
    id: string;
    name: string;
    price: number;
    image: string;
    discount?: number;
}

export interface PromoParams {
    title: string;
    subtitle: string;
    code: string;
    expiry: Date;
    backgroundImage: string;
}
