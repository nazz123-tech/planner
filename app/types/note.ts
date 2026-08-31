export interface Note {
    id: string;
    title: string;
    description?: string;
    categoryId?: string;
    date: string;
    createdAt?: { seconds: number; nanoseconds: number };
}
