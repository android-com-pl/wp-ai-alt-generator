type BlockAttrs = Record<string, any>;
type SetBlockAttrs<Attrs extends BlockAttrs> = (
  attributes: Partial<Attrs>,
) => void;

type BlockProps<Name extends string, Attrs extends BlockAttrs> = {
  clientId: string;
  name: Name;
  attributes: Attrs;
  setAttributes: SetBlockAttrs<Attrs>;
  isSelected: boolean;
  [key: string]: any;
};

interface ImageBlockAttrs extends BlockAttrs {
  align: string;
  url: string;
  alt: string;
  caption: string;
  lightbox: boolean;
  title: string;
  href: string;
  rel: string;
  linkClass: string;
  id: number;
  width: string;
  height: string;
  aspectRatio: string;
  scale: string;
  linkDestination: string;
  linkTarget: string;
}

type ImageBlockProps = BlockProps<'core/image', ImageBlockAttrs>;

interface GalleryBlockAttrs extends BlockAttrs {
  allowResize: boolean;
  fixedHeight: boolean;
  imageCrop: boolean;
  linkTo: string;
  randomOrder: boolean;
  sizeSlug: string;
}

type GalleryBlockProps = BlockProps<'core/gallery', GalleryBlockAttrs>;

type WPError = { code: string; data: any; message: string };
