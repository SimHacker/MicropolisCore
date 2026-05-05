export const ROOT_TYPE_LOCAL_PATH = 'local-path';
export const ROOT_TYPE_INTERCHANGE = 'interchange-manifest';
export const ROOT_TYPE_REMOTE_CATALOG = 'remote-catalog';

export interface RootTypeOption {
	value: string;
	label: string;
}

export const ROOT_TYPE_OPTIONS: RootTypeOption[] = [
	{ value: ROOT_TYPE_LOCAL_PATH, label: 'Local file or directory' },
	{ value: ROOT_TYPE_INTERCHANGE, label: 'Interchange manifest' },
	{ value: ROOT_TYPE_REMOTE_CATALOG, label: 'Remote catalog service' },
];

export const ROOT_CONTENT_TYPE_INSTALL = 'install';

export interface RootContentOption {
	value: string;
	label: string;
}

export const ROOT_CONTENT_OPTIONS: RootContentOption[] = [
	{ value: ROOT_CONTENT_TYPE_INSTALL, label: 'Install root' },
	{ value: 'people', label: 'People' },
	{ value: 'families', label: 'Families' },
	{ value: 'familyAlbums', label: 'Family albums' },
	{ value: 'houses', label: 'Houses' },
	{ value: 'neighborhoods', label: 'Neighborhoods' },
	{ value: 'objects', label: 'Objects' },
	{ value: 'skeletons', label: 'Skeletons' },
	{ value: 'skins', label: 'Skins' },
	{ value: 'skills', label: 'Skills' },
	{ value: 'animations', label: 'Animations' },
	{ value: 'textures', label: 'Textures' },
	{ value: 'iff', label: 'IFF containers' },
	{ value: 'far', label: 'FAR archives' },
	{ value: 'interchange', label: 'Interchange files' },
	{ value: 'archives', label: 'ZIP/other archives' },
	{ value: 'downloads', label: 'Downloads content' },
];

export const ROOT_CONTENT_TYPES = ROOT_CONTENT_OPTIONS.map((option) => option.value);
