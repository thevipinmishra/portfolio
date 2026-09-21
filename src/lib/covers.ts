import { getImage } from 'astro:assets';
import type { ImageMetadata } from 'astro';

export type CoverSource = {
	src: string;
	srcSet: string;
};

const COVER_WIDTHS = [720, 1080, 1440, 1920];

const coverModules = import.meta.glob<{ default: ImageMetadata }>([
	'../images/covers/c1.jpeg',
	'../images/covers/c2.jpeg',
]);

async function loadCoverPhotos() {
	const entries = Object.entries(coverModules);

	if (!entries.length) return [];

	const queue = import.meta.env.DEV
		? [entries[Math.floor(Math.random() * entries.length)]!]
		: entries;

	const photos: ImageMetadata[] = [];
	for (const [, load] of queue) {
		photos.push((await load()).default);
	}
	return photos;
}

async function optimizeCover(src: ImageMetadata): Promise<CoverSource> {
	const image = await getImage({
		src,
		width: 1920,
		widths: COVER_WIDTHS,
		sizes: '100vw',
		format: 'webp',
		quality: 70,
	});

	return {
		src: image.src,
		srcSet: image.srcSet.attribute,
	};
}

export async function getCoverSources(): Promise<CoverSource[]> {
	const photos = await loadCoverPhotos();
	const sources: CoverSource[] = [];
	for (const photo of photos) {
		sources.push(await optimizeCover(photo));
	}
	return sources;
}
