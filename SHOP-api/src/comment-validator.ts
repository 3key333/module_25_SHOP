import type { CommentCreatePayload } from '../types';

export type CommentValidator = (comment: CommentCreatePayload) => string | null;

const isBlank = (value: unknown): boolean => {
    if (value === undefined || value === null) return true;
    if (typeof value === 'string' && value.trim() === '') return true;
    return false;
};

export const validateComment: CommentValidator = (comment) => {
    if (comment === undefined || comment === null) {
        return 'Comment is absent or empty';
    }

    if (typeof comment !== 'object' || Array.isArray(comment)) {
        return 'Comment is absent or empty';
    }

    const keys: (keyof CommentCreatePayload)[] = ['name', 'email', 'body', 'productId'];

    for (const key of keys) {
        if (!(key in comment) || isBlank((comment as Record<string, unknown>)[key])) {
            return `Field ${String(key)} is absent`;
        }
    }

    if (typeof comment.name !== 'string') {
        return 'Field name has wrong type';
    }
    if (typeof comment.email !== 'string') {
        return 'Field email has wrong type';
    }
    if (typeof comment.body !== 'string') {
        return 'Field body has wrong type';
    }
    if (typeof comment.productId !== 'number' || Number.isNaN(comment.productId)) {
        return 'Field postId has wrong type';
    }

    return null;
};
