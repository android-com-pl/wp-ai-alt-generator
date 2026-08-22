import { useSelect } from '@wordpress/data';
import { store as editorStore } from '@wordpress/editor';

export default function usePostId(): number | null {
  return useSelect((select) => {
    const rawId = select(editorStore).getCurrentPostId();
    const parsedId = Number(rawId);

    return parsedId > 0 ? parsedId : null;
  }, []);
}
