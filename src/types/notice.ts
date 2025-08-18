export type Notice = {
    id: string;
    type: string;
    number: string;
    category: string;
    title: string;
    department: string;
    date: string;
    link: string;
};

export type NoticePage = {
    content: Notice[];
    pageable: {
        pageNumber: number;
        pageSize: number;
    };
    totalElements: number;
    totalPages: number;
    first: boolean;
    last: boolean;
    numberOfElements: number;
    size: number;
    number: number;
};