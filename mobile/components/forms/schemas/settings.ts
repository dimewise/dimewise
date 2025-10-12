import type * as z from 'zod';
import type { postCategoryBody } from '@/generated/types/categories/categories.zod';

export type createCategoryData = z.infer<typeof postCategoryBody>;
