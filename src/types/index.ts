export interface Work {
    id: number;
    externalId: string;
    title: string;
    description: string | null;
    thumbnailUrl: string | null;
    affiliateUrl: string;
    makerName: string | null;
    makerId: string | null;
    releaseDate: string | null;
    durationMinutes: number | null;
    actresses: string[];
    isPublished: boolean;
    createdAt: string;
    updatedAt: string;
    category?: Category | null;
    tags?: WorkTagWithTag[];
    metrics?: WorkMetrics | null;
}

export interface Category {
    id: number;
    slug: string;
    name: string;
    description: string | null;
}

export interface Tag {
    id: number;
    slug: string;
    name: string;
    description: string | null;
    displayOrder: number;
    _count?: {
        works: number;
    };
}

export interface WorkTagWithTag {
    workId: number;
    tagId: number;
    tag: Tag;
}

export interface WorkMetrics {
    workId: number;
    hipFocusScore: number;
    cameraFocusScore: number;
    outfitEmphasisScore: number;
    danceFitnessScore: number;
    overallPickScore: number;
}

export interface Ranking {
    id: number;
    periodType: 'weekly' | 'monthly';
    periodStart: string;
    workId: number;
    rank: number;
    clickCount: number;
    work: Work;
}

export interface PaginatedResponse<T> {
    works: T[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}
