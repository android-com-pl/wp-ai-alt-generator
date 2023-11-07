type ImageBlockAttrs = {
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
  [key: string]: any;
};

type ImageBlockSetAttrs = (attributes: Partial<ImageBlockAttrs>) => void;
