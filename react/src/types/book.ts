/**
 * Shared TypeScript types for the Books resource.
 * Mirrors the Pydantic schemas in fastapi/app/schemas/book.py.
 */

export interface Book {
  id: number;
  title: string;
  author: string;
  description: string;
  category: string;
  year: number;
  isbn?: string;
  price: number;
}

/** Paginated response envelope returned by GET /api/v1/books */
export interface BooksPage {
  items: Book[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}
