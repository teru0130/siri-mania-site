/**
 * DMM Affiliate API Client
 * レート制限対応（リトライ + DBキャッシュ）
 */

import prisma from './prisma';

const DMM_API_BASE = 'https://api.dmm.com/affiliate/v3';
const CACHE_TTL_HOURS = 24;

interface DMMApiConfig {
    apiId: string;
    affiliateId: string;
}

interface DMMSearchParams {
    keyword?: string;
    genre?: string;
    sort?: string;
    hits?: number;
    offset?: number;
}

interface DMMWorkItem {
    content_id: string;
    title: string;
    URL: string;
    imageURL?: {
        large?: string;
        small?: string;
    };
    date?: string;
    maker?: {
        id: string;
        name: string;
    };
    runtime?: number;
    iteminfo?: {
        actress?: Array<{ id: string; name: string }>;
        genre?: Array<{ id: string; name: string }>;
    };
}

interface DMMApiResponse {
    result: {
        status: number;
        result_count: number;
        total_count: number;
        first_position: number;
        items: DMMWorkItem[];
    };
}

function getConfig(): DMMApiConfig {
    const apiId = process.env.DMM_API_ID;
    const affiliateId = process.env.DMM_AFFILIATE_ID;

    if (!apiId || !affiliateId) {
        throw new Error('DMM API credentials not configured');
    }

    return { apiId, affiliateId };
}

/**
 * キャッシュから取得
 */
async function getFromCache(cacheKey: string): Promise<DMMApiResponse | null> {
    try {
        const cached = await prisma.apiCache.findUnique({
            where: { cacheKey },
        });

        if (cached && cached.expiresAt > new Date()) {
            return cached.data as unknown as DMMApiResponse;
        }

        // 期限切れキャッシュを削除
        if (cached) {
            await prisma.apiCache.delete({ where: { cacheKey } });
        }

        return null;
    } catch {
        return null;
    }
}

/**
 * キャッシュに保存
 */
async function saveToCache(cacheKey: string, data: DMMApiResponse): Promise<void> {
    try {
        const expiresAt = new Date(Date.now() + CACHE_TTL_HOURS * 60 * 60 * 1000);
        await prisma.apiCache.upsert({
            where: { cacheKey },
            update: { data: data as unknown as object, expiresAt },
            create: { cacheKey, data: data as unknown as object, expiresAt },
        });
    } catch (error) {
        console.error('Failed to save cache:', error);
    }
}

/**
 * リトライ付きfetch
 */
async function fetchWithRetry(
    url: string,
    maxRetries = 3,
    delayMs = 1000
): Promise<Response> {
    let lastError: Error | null = null;

    for (let attempt = 0; attempt < maxRetries; attempt++) {
        try {
            const response = await fetch(url);

            if (response.status === 429) {
                // Rate limited - wait and retry
                await new Promise((resolve) => setTimeout(resolve, delayMs * (attempt + 1)));
                continue;
            }

            return response;
        } catch (error) {
            lastError = error as Error;
            await new Promise((resolve) => setTimeout(resolve, delayMs * (attempt + 1)));
        }
    }

    throw lastError || new Error('Failed to fetch after retries');
}

/**
 * DMM商品検索
 */
export async function searchWorks(params: DMMSearchParams): Promise<DMMApiResponse> {
    const config = getConfig();
    const cacheKey = `dmm_search_${JSON.stringify(params)}`;

    // キャッシュ確認
    const cached = await getFromCache(cacheKey);
    if (cached) {
        return cached;
    }

    const queryParams = new URLSearchParams({
        api_id: config.apiId,
        affiliate_id: config.affiliateId,
        site: 'FANZA',
        service: 'digital',
        floor: 'videoa',
        hits: String(params.hits || 20),
        offset: String(params.offset || 1),
        output: 'json',
    });

    if (params.keyword) queryParams.set('keyword', params.keyword);
    if (params.genre) queryParams.set('genre', params.genre);
    if (params.sort) queryParams.set('sort', params.sort);

    const url = `${DMM_API_BASE}/ItemList?${queryParams.toString()}`;
    const response = await fetchWithRetry(url);

    if (!response.ok) {
        throw new Error(`DMM API error: ${response.status}`);
    }

    const data = (await response.json()) as DMMApiResponse;

    // キャッシュに保存
    await saveToCache(cacheKey, data);

    return data;
}

/**
 * API結果をWorksテーブル用データに変換
 */
export function transformDMMItem(item: DMMWorkItem) {
    return {
        externalId: item.content_id,
        title: item.title,
        affiliateUrl: item.URL,
        thumbnailUrl: item.imageURL?.large || item.imageURL?.small || null,
        makerName: item.maker?.name || null,
        makerId: item.maker?.id || null,
        releaseDate: item.date ? new Date(item.date) : null,
        durationMinutes: item.runtime || null,
        actresses: item.iteminfo?.actress?.map((a) => a.name) || [],
    };
}

export type { DMMApiResponse, DMMWorkItem, DMMSearchParams };
